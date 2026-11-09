import type { GalleryImage } from "@/lib/types";

export function Photo({ image, sizes, className }: { image: GalleryImage; sizes: string; className?: string }) {
  const img = (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      className={className}
      decoding="async"
    />
  );
  if (!image.webpSrcSet) return img;
  return (
    <picture>
      <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
