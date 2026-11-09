import Image from "next/image";
import type { PublicPro } from "@/lib/featured-pros";
import { OptimizedPhoto } from "./OptimizedPhoto";
import { ProfileLinks, profileLinks } from "./ProfileLinks";

export function ProView({ pro }: { pro: PublicPro }) {
  const svg = pro.image.src.endsWith(".svg");
  return (
    <article className="pro">
      <div className="pro-media">
        {svg ? (
          <img src={pro.image.src} alt={pro.image.alt} width={pro.image.width} height={pro.image.height} />
        ) : (
          <Image
            src={pro.image.src}
            alt={pro.image.alt}
            width={pro.image.width}
            height={pro.image.height}
            priority
            sizes="(min-width: 900px) 42vw, 100vw"
          />
        )}
      </div>
      <div className="pro-copy">
        <p className="chip">{pro.placeholder ? "Placeholder" : pro.categoryLabel}</p>
        <h1>{pro.name}</h1>
        <p className="pro-line">{pro.comingSoon ? "Coming soon." : pro.line}</p>
        {pro.placeholder ? (
          <p className="placeholder-note">Placeholder. Biography, credentials, and contact are not published.</p>
        ) : null}
        <dl className="facts">
          {pro.profession ? (
            <div>
              <dt>Profession</dt>
              <dd>{pro.profession}</dd>
            </div>
          ) : null}
          {pro.school ? (
            <div>
              <dt>Education</dt>
              <dd>{pro.school}</dd>
            </div>
          ) : null}
          {pro.industry ? (
            <div>
              <dt>Industry</dt>
              <dd>{pro.industry}</dd>
            </div>
          ) : null}
          {pro.years ? (
            <div>
              <dt>Experience</dt>
              <dd>{pro.years}</dd>
            </div>
          ) : null}
          {pro.serviceAreas ? (
            <div>
              <dt>Where</dt>
              <dd>{pro.serviceAreas}</dd>
            </div>
          ) : null}
        </dl>
        {pro.photos.length > 0 ? (
          <div className="photo-gallery photo-gallery-detail">
            {pro.photos.map((photo) => (
              <figure key={photo.src}>
                <OptimizedPhoto src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
              </figure>
            ))}
          </div>
        ) : null}
        {pro.services.length > 0 ? (
          <ul className="service-tiles">
            {pro.services.map((service, index) => {
              const photo = pro.photos[index % Math.max(pro.photos.length, 1)];
              return (
                <li key={service.name} className="service-visual">
                  {photo ? <OptimizedPhoto src={photo.src} alt="" width={photo.width} height={photo.height} /> : null}
                  <strong>{service.name}</strong>
                  <span>{service.line}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="contact-row">
          <ProfileLinks links={profileLinks(pro)} />
          {pro.whatsapp ? (
            <a className="contact-btn" href={pro.whatsapp}>
              WhatsApp
            </a>
          ) : null}
          {pro.email ? (
            <a className="contact-btn" href={`mailto:${pro.email}`}>
              Email
            </a>
          ) : null}
          {pro.phoneTel ? (
            <a className="contact-btn" href={`tel:${pro.phoneTel}`}>
              {pro.phoneDisplay}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
