import "server-only";

import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import type { Location } from "@/types/location";

const configuredApiUrl = process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
const API_URL = (configuredApiUrl || "http://localhost:5000/api").replace(/\/+$/, "");
const PUBLIC_REQUEST_TIMEOUT_MS = 10_000;

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export class PujaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "PujaApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(PUBLIC_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: timeoutSignal,
    });
  } catch (cause) {
    unstable_rethrow(cause);

    if (timeoutSignal.aborted) {
      throw new PujaApiError("The Puja service took too long to respond.", 504, { cause });
    }

    throw new PujaApiError("Unable to reach the Puja service.", 0, { cause });
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // Preserve the HTTP status below when an upstream proxy returns non-JSON.
  }

  if (!response.ok || !payload?.success) {
    throw new PujaApiError(payload?.message || "Unable to load Puja information.", response.status);
  }

  return payload.data;
}

export async function getFeaturedPujas(
  preferredSlugs: readonly string[],
): Promise<Location[]> {
  const locations = await request<Location[]>("/locations?featured=true");
  if (!Array.isArray(locations)) {
    throw new PujaApiError("The Puja service returned an invalid locations list.", 502);
  }

  const preferredOrder = new Map(preferredSlugs.map((slug, index) => [slug, index]));
  const seenSlugs = new Set<string>();

  return locations
    .filter((location) => {
      if (
        !location?.active ||
        location.featured !== true ||
        typeof location.slug !== "string" ||
        !location.slug.trim()
      ) {
        return false;
      }
      if (seenSlugs.has(location.slug)) return false;
      seenSlugs.add(location.slug);
      return true;
    })
    .sort((left, right) => {
      const leftPriority = preferredOrder.get(left.slug) ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = preferredOrder.get(right.slug) ?? Number.MAX_SAFE_INTEGER;
      return leftPriority - rightPriority;
    });
}

export const getPujaBySlug = cache(async (slug: string): Promise<Location | null> => {
  try {
    return await request<Location>(`/locations/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof PujaApiError && error.status === 404) return null;
    throw error;
  }
});

export async function getRelatedPujas(puja: Location, limit = 3): Promise<Location[]> {
  const [lng, lat] = puja.location.coordinates;
  const nearbyPath = `/locations/nearby?lat=${lat}&lng=${lng}&limit=${Math.max(limit + 3, 6)}`;
  let related: Location[] = [];

  try {
    const nearby = await request<Location[]>(nearbyPath);
    related = nearby.filter((item) => item.active && item.slug !== puja.slug).slice(0, limit);
  } catch {
    // Nearby content is supplementary. Still try the same-region fallback below.
  }

  if (related.length >= limit) return related;

  try {
    const regional = await request<Location[]>(`/locations?region=${puja.region}`);
    const seen = new Set([puja.slug, ...related.map((item) => item.slug)]);
    for (const item of regional) {
      if (!item.active || seen.has(item.slug)) continue;
      related.push(item);
      seen.add(item.slug);
      if (related.length === limit) break;
    }
  } catch {
    // Keep any valid nearby records if the fallback request fails.
  }

  return related;
}
