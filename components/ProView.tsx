import Image from "next/image";
import type { PublicPro } from "@/lib/featured-pros";
import { serviceOffers, servicePath, serviceSlideIcons } from "@/lib/services";
import { ProfileLinks, profileLinks } from "./ProfileLinks";
import { ServiceIcon } from "./ServiceIcon";
import { ServiceSlideshow } from "./ServiceSlideshow";

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

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
        {pro.credentialBadges && pro.credentialBadges.length > 0 ? (
          <ul className="credential-row">
            {pro.credentialBadges.map((badge) => (
              <li key={badge} className="credential">
                {badge}
              </li>
            ))}
          </ul>
        ) : null}
        {pro.placeholder ? (
          <p className="placeholder-note">Placeholder. Biography, credentials, and contact are not published.</p>
        ) : null}
        {pro.experience && pro.experience.length > 0 ? (
          <section className="profile-section">
            <h2>Experience</h2>
            <ol>
              {pro.experience.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {pro.titles && pro.titles.length > 0 ? (
          <section className="profile-section">
            <h2>Titles and Credentials</h2>
            <ol>
              {pro.titles.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {pro.bio ? <p className="hero-line">{pro.bio}</p> : null}
        {pro.notice ? <p className="profile-note">{pro.notice}</p> : null}
        <dl className="facts">
          {pro.profession && !pro.experience ? (
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
          {pro.founder ? (
            <div>
              <dt>Founder</dt>
              <dd>{pro.founder}</dd>
            </div>
          ) : null}
          {pro.location && !pro.placeholder ? (
            <div>
              <dt>Address</dt>
              <dd>
                <a href={mapsSearchUrl(pro.location)} target="_blank" rel="noreferrer">
                  {pro.location}
                </a>
              </dd>
            </div>
          ) : null}
          {pro.serviceAreas ? (
            <div>
              <dt>Where</dt>
              <dd>{pro.serviceAreas}</dd>
            </div>
          ) : null}
        </dl>
        {pro.services.some((service) => service.icon) ? (
          <section className="profile-section">
            <h2>Services</h2>
            <ul className="shop-services">
              {pro.services.map((service) => (
                <li key={service.name}>
                  <span className="shop-icon">
                    <ServiceIcon name={service.icon ?? ""} />
                  </span>
                  <strong>{service.name}</strong>
                  <span>{service.line}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : pro.services.length > 0 ? (
          <div className="service-board">
            {pro.services.map((service, index) => {
              const offer = serviceOffers.find((item) => item.name === service.name);
              return (
                <ServiceSlideshow
                  key={service.name}
                  name={service.name}
                  tagline={service.line}
                  slides={service.slides ?? serviceSlideIcons[offer?.id ?? ""] ?? ["layers", "code", "check"]}
                  order={index}
                  href={offer ? servicePath(offer.id) : undefined}
                />
              );
            })}
          </div>
        ) : null}
        <div className="contact-row">
          <ProfileLinks links={profileLinks(pro)} />
          {pro.phone ? (
            <a className="contact-btn" href={pro.phone.href}>
              {pro.phone.label}
            </a>
          ) : null}
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
        </div>
      </div>
    </article>
  );
}
