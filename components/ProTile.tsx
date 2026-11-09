import Image from "next/image";
import Link from "next/link";
import type { PublicPro } from "@/lib/featured-pros";
import { ProfileLinks, profileLinks } from "./ProfileLinks";

export function ProTile({ pro }: { pro: PublicPro }) {
  const svg = pro.image.src.endsWith(".svg");
  const links = profileLinks(pro);
  return (
    <article className="tile">
      <Link href={`/pros/${pro.slug}`} className="tile-link">
        <span className="tile-media">
          {svg ? (
            <img src={pro.image.src} alt="" width={pro.image.width} height={pro.image.height} />
          ) : (
            <Image
              src={pro.image.src}
              alt=""
              width={pro.image.width}
              height={pro.image.height}
              sizes="(min-width: 900px) 30vw, 100vw"
            />
          )}
        </span>
        <span className="chip">{pro.categoryLabel}</span>
        <strong>{pro.name}</strong>
        <span className="tile-line">{pro.line}</span>
        {pro.location ? <span className="tile-where">{pro.location}</span> : pro.serviceAreas ? <span className="tile-where">{pro.serviceAreas}</span> : null}
      </Link>
      <ProfileLinks links={links} icons />
    </article>
  );
}
