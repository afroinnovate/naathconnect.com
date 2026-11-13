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
        <span className="chip-row">
          <span className="chip">{pro.categoryLabel}</span>
          {pro.serviceTypes.map((type) => (
            <span key={type} className="chip chip-type">
              {type}
            </span>
          ))}
        </span>
        {pro.credentialBadges && pro.credentialBadges.length > 0 ? (
          <span className="credential-row">
            {pro.credentialBadges.map((badge) => (
              <span key={badge} className="credential">
                {badge}
              </span>
            ))}
          </span>
        ) : null}
        <strong>{pro.name}</strong>
        <span className="tile-line">{pro.line}</span>
        {pro.serviceSummary ? <span className="tile-line">{pro.serviceSummary}</span> : null}
        {pro.location ? <span className="tile-where">{pro.location}</span> : pro.serviceAreas ? <span className="tile-where">{pro.serviceAreas}</span> : null}
        {pro.offersRemote ? <span className="tile-where">Remote services available</span> : null}
      </Link>
      {pro.phone ? (
        <a className="tile-phone" href={pro.phone.href}>
          {pro.phone.label}
        </a>
      ) : null}
      <ProfileLinks links={links} icons />
    </article>
  );
}
