"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
import styles from "./PujaGallery.module.css";

export type PujaGalleryImage = {
  url: string;
  alt?: string | null;
  publicId?: string;
};

export type PujaGalleryProps = {
  title: string;
  images: readonly PujaGalleryImage[];
  priority?: boolean;
  className?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function EmptyPhoto({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={compact ? styles.compactFallback : styles.fallback} role="img" aria-label={`No photo available for ${title}`}>
      <ImageIcon aria-hidden="true" />
      {compact ? null : <span>Photos coming soon</span>}
    </div>
  );
}

export function PujaGallery({ title, images, priority = false, className }: PujaGalleryProps) {
  const validImages = images.filter((image) => image.url.trim().length > 0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Record<string, true>>({});
  const safeIndex = selectedIndex < validImages.length ? selectedIndex : 0;
  const selectedImage = validImages[safeIndex];

  function markFailed(url: string) {
    setFailedUrls((current) => (current[url] ? current : { ...current, [url]: true }));
  }

  if (!selectedImage) {
    return (
      <section className={joinClassNames(styles.gallery, className)} aria-label={`${title} photo gallery`}>
        <div className={styles.heroFrame}>
          <EmptyPhoto title={title} />
        </div>
      </section>
    );
  }

  return (
    <section className={joinClassNames(styles.gallery, className)} aria-label={`${title} photo gallery`}>
      <div className={styles.heroFrame}>
        {failedUrls[selectedImage.url] ? (
          <EmptyPhoto title={title} />
        ) : (
          <Image
            key={selectedImage.url}
            src={selectedImage.url}
            alt={selectedImage.alt?.trim() || `${title} Durga Puja`}
            fill
            priority={priority}
            sizes="(max-width: 980px) calc(100vw - 36px), (max-width: 1320px) 48vw, 590px"
            className={styles.heroImage}
            onError={() => markFailed(selectedImage.url)}
          />
        )}
      </div>

      {validImages.length > 1 ? (
        <div className={styles.thumbnails} aria-label="Choose a gallery photo">
          {validImages.map((image, index) => {
            const selected = index === safeIndex;
            const imageKey = image.publicId || `${image.url}-${index}`;
            return (
              <button
                key={imageKey}
                type="button"
                className={styles.thumbnailButton}
                aria-label={`Show photo ${index + 1} of ${validImages.length}`}
                aria-pressed={selected}
                aria-current={selected ? "true" : undefined}
                onClick={() => setSelectedIndex(index)}
              >
                {failedUrls[image.url] ? (
                  <EmptyPhoto title={title} compact />
                ) : (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="112px"
                    className={styles.thumbnailImage}
                    onError={() => markFailed(image.url)}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className={styles.announcement} aria-live="polite">
        Showing photo {safeIndex + 1} of {validImages.length}.
      </p>
    </section>
  );
}
