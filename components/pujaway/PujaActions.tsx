"use client";

import { Bookmark, Copy, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./PujaActions.module.css";

const SAVED_PUJAS_KEY = "pujaway:saved-pujas:v1";

type SavedPujasPayload = {
  version: 1;
  slugs: string[];
};

export type PujaActionsProps = {
  slug: string;
  title: string;
  description?: string;
  canonicalUrl: string;
  ratingAverage?: number;
  ratingCount?: number;
  className?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function readSavedSlugs() {
  const raw = window.localStorage.getItem(SAVED_PUJAS_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as Partial<SavedPujasPayload>;
  if (parsed.version !== 1 || !Array.isArray(parsed.slugs)) return [];
  return parsed.slugs.filter((value): value is string => typeof value === "string");
}

function writeSavedSlugs(slugs: string[]) {
  const payload: SavedPujasPayload = { version: 1, slugs: [...new Set(slugs)] };
  window.localStorage.setItem(SAVED_PUJAS_KEY, JSON.stringify(payload));
}

function legacyCopy(value: string) {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}

export function PujaActions({
  slug,
  title,
  description,
  canonicalUrl,
  ratingAverage,
  ratingCount,
  className
}: PujaActionsProps) {
  const [saved, setSaved] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    function syncSavedState() {
      try {
        setSaved(readSavedSlugs().includes(slug));
        setStorageAvailable(true);
      } catch {
        setStorageAvailable(false);
      }
    }

    syncSavedState();
    window.addEventListener("storage", syncSavedState);
    return () => window.removeEventListener("storage", syncSavedState);
  }, [slug]);

  function toggleSaved() {
    try {
      const current = readSavedSlugs();
      const nextSaved = !current.includes(slug);
      const next = nextSaved ? [...current, slug] : current.filter((savedSlug) => savedSlug !== slug);
      writeSavedSlugs(next);
      setSaved(nextSaved);
      setStorageAvailable(true);
      setStatus(nextSaved ? `${title} was added to your list.` : `${title} was removed from your list.`);
    } catch {
      setStorageAvailable(false);
      setStatus("Saved Pujas are unavailable because this browser blocked local storage.");
    }
  }

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(canonicalUrl);
      } else if (!legacyCopy(canonicalUrl)) {
        throw new Error("Copy command was unavailable");
      }
      setStatus("Link copied to your clipboard.");
    } catch {
      setStatus("The link could not be copied. You can copy it from the address bar instead.");
    }
  }

  async function sharePuja() {
    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title, text: description || `Explore ${title} on PujaWay.`, url: canonicalUrl });
      setStatus("Share completed.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("Sharing was unavailable. Use one of the sharing links or copy the page link.");
    }
  }

  const encodedUrl = encodeURIComponent(canonicalUrl);
  const encodedMessage = encodeURIComponent(`${title} — ${canonicalUrl}`);
  const hasRating = Number.isFinite(ratingAverage) && Number.isFinite(ratingCount) && (ratingCount ?? 0) > 0;

  return (
    <section className={joinClassNames(styles.actions, className)} aria-label="Save, share and rating">
      <div className={styles.actionGroup}>
        <h2>Share this puja</h2>
        <button type="button" className={styles.primaryAction} onClick={sharePuja}>
          <Share2 aria-hidden="true" />
          Share
        </button>
        <div className={styles.socialLinks} aria-label="Share using another service">
          <a
            href={`https://wa.me/?text=${encodedMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
          >
            <span aria-hidden="true">W</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <span aria-hidden="true">f</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
          >
            <span aria-hidden="true">X</span>
          </a>
          <button type="button" onClick={copyLink} aria-label="Copy page link">
            <Copy aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.actionGroup}>
        <h2>Add to my list</h2>
        <button
          type="button"
          className={joinClassNames(styles.saveButton, saved ? styles.saved : undefined)}
          aria-pressed={saved}
          disabled={!storageAvailable}
          onClick={toggleSaved}
        >
          <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved to my list" : "Save this puja"}
        </button>
        <p>{storageAvailable ? "Save for quick access on this device." : "Local saving is unavailable in this browser."}</p>
      </div>

      <div className={styles.ratingGroup}>
        <h2>Puja rating</h2>
        {hasRating ? (
          <>
            <p className={styles.ratingValue}>
              <Star aria-hidden="true" fill="currentColor" />
              <strong>{ratingAverage?.toFixed(1)}</strong><span>/5</span>
            </p>
            <p>Based on {new Intl.NumberFormat("en-IN").format(ratingCount ?? 0)} reviews.</p>
          </>
        ) : (
          <p className={styles.noRating}>No rating available yet.</p>
        )}
      </div>

      <p className={styles.status} role="status" aria-live="polite">{status}</p>
    </section>
  );
}
