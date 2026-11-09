/** Serves the AVIF when the browser accepts it, then WebP. `src` is the WebP path. */
export function OptimizedPhoto({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const avif = src.replace(/\.webp$/i, ".avif");
  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      <img src={src} alt={alt} width={width} height={height} />
    </picture>
  );
}
