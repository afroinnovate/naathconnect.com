import type { GalleryImage } from "./types";

const PATH_OK = /^\/images\/[a-z0-9/_-]+\.(?:jpg|jpeg|png|webp|svg)$/i;

export function sanitizeGallery(images: GalleryImage[]): GalleryImage[] {
  const clean: GalleryImage[] = [];
  for (const image of images) {
    const src = image.src.trim();
    if (!PATH_OK.test(src)) continue;
    const alt = image.alt.trim().slice(0, 240);
    const caption = image.caption.trim().slice(0, 240);
    if (!alt || !caption) continue;
    clean.push({ src, alt, caption });
    if (clean.length === 8) break;
  }
  return clean;
}

export function parseGalleryLines(raw: string): { images: GalleryImage[]; rejected: number } {
  const images: GalleryImage[] = [];
  let rejected = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [src = "", alt = "", caption = ""] = trimmed.split("|").map((part) => part.trim());
    const next = sanitizeGallery([
      {
        src,
        alt: alt || "Photo supplied for this consultation profile.",
        caption: caption || alt || "Consultation photo",
      },
    ]);
    if (next.length === 0) {
      rejected += 1;
      continue;
    }
    images.push(next[0]);
  }
  return { images: images.slice(0, 8), rejected };
}

export function galleryToLines(images: GalleryImage[]): string {
  return images.map((image) => `${image.src} | ${image.alt} | ${image.caption}`).join("\n");
}
