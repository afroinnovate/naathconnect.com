"use client";

import { useState } from "react";
import type { GalleryImage } from "@/lib/types";

export function PhotoGallery({ images, label }: { images: GalleryImage[]; label: string }) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return <p className="quiet">No photos yet.</p>;
  const current = images[Math.min(index, images.length - 1)];
  const shift = (delta: number) => setIndex((value) => (value + delta + images.length) % images.length);

  return (
    <div
      className="gallery"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") shift(1);
        if (event.key === "ArrowLeft") shift(-1);
      }}
    >
      <div className="gallery-stage">
        <img src={current.src} alt={current.alt} />
        <p className="gallery-caption">{current.caption}</p>
        {images.length > 1 ? (
          <div className="gallery-controls">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous photo">
              Previous
            </button>
            <span>
              {index + 1} of {images.length}
            </span>
            <button type="button" onClick={() => shift(1)} aria-label="Next photo">
              Next
            </button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <ul className="thumbs">
          {images.map((image, imageIndex) => (
            <li key={image.src}>
              <button
                type="button"
                aria-current={imageIndex === index}
                aria-label={`Show photo ${imageIndex + 1}: ${image.caption}`}
                onClick={() => setIndex(imageIndex)}
              >
                <img src={image.src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
