import Image from "next/image";
import Link from "next/link";
import type { OrganizationProfile, PublicPro, ServiceTile } from "@/lib/featured-pros";
import { profileOverview } from "@/lib/profile-overview";
import { serviceOffers, servicePath, serviceSlideIcons } from "@/lib/services";
import { ProfileLinks, profileLinks } from "./ProfileLinks";
import { ServiceIcon } from "./ServiceIcon";
import { ServiceSlideshow } from "./ServiceSlideshow";

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function helpGroups(services: ServiceTile[]): { name: string; items: ServiceTile[] }[] {
  const groups: { name: string; items: ServiceTile[] }[] = [];
  for (const service of services) {
    const name = service.group ?? "Services";
    const found = groups.find((group) => group.name === name);
    if (found) found.items.push(service);
    else groups.push({ name, items: [service] });
  }
  return groups;
}

function HelpGroups({ services }: { services: ServiceTile[] }) {
  return (
    <section className="profile-section">
      <h2>How he can help</h2>
      {helpGroups(services).map((group) => (
        <div key={group.name} className="help-group">
          <h3>{group.name}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.line}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function Services({ pro, groupedHelp }: { pro: PublicPro; groupedHelp: boolean }) {
  if (groupedHelp) return <HelpGroups services={pro.services} />;
  if (pro.services.some((service) => service.icon)) {
    return (
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
    );
  }
  if (pro.services.length === 0) return null;
  return (
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
  );
}

function hasFacts(pro: PublicPro, hideProfession: boolean): boolean {
  const showProfession = Boolean(pro.profession) && !pro.experience && !hideProfession;
  const showAddress = Boolean(pro.location) && !pro.placeholder;
  return Boolean(
    showProfession ||
      pro.school ||
      pro.industry ||
      pro.years ||
      pro.founder ||
      showAddress ||
      pro.serviceAreas ||
      pro.offersRemote ||
      pro.records?.length ||
      pro.reference,
  );
}

function Facts({ pro, hideProfession }: { pro: PublicPro; hideProfession: boolean }) {
  const showProfession = Boolean(pro.profession) && !pro.experience && !hideProfession;
  const showAddress = Boolean(pro.location) && !pro.placeholder;
  if (!hasFacts(pro, hideProfession)) return null;
  return (
    <dl className="facts">
      {showProfession ? (
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
      {showAddress ? (
        <div>
          <dt>Address</dt>
          <dd>
            <a href={mapsSearchUrl(pro.location!)} target="_blank" rel="noreferrer">
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
      {pro.offersRemote ? (
        <div>
          <dt>Remote</dt>
          <dd>Remote services available</dd>
        </div>
      ) : null}
      {pro.records?.map((record) => (
        <div key={record.label}>
          <dt>{record.label}</dt>
          <dd>{record.value}</dd>
        </div>
      ))}
      {pro.reference ? (
        <div>
          <dt>{pro.reference.label}</dt>
          <dd>
            <Link href={pro.reference.href}>{pro.reference.text}</Link>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

function OrganizationSection({ organization }: { organization: OrganizationProfile }) {
  return (
    <section className="org-profile profile-section">
      <h2>{organization.heading}</h2>
      {organization.mission ? <blockquote className="mission">{organization.mission}</blockquote> : null}
      {organization.summary ? <p>{organization.summary}</p> : null}
      {organization.groups.map((group) => (
        <div key={group.name} className="help-group">
          <h3>{group.name}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.line}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function ProView({ pro }: { pro: PublicPro }) {
  const svg = pro.image.src.endsWith(".svg");
  const groupedHelp = pro.services.length > 0 && pro.services.every((service) => Boolean(service.group) && !service.icon);
  const { overview, restBio, restStatements } = profileOverview(pro);
  const hideProfession = overview === pro.profession;
  const panelId = `full-bio-${pro.slug}`;
  const hasFullBio = Boolean(
    restBio || restStatements.length || pro.experience?.length || pro.titles?.length || hasFacts(pro, hideProfession),
  );
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
            style={
              pro.image.position || pro.image.fit
                ? {
                    objectPosition: pro.image.position,
                    ...(pro.image.fit === "contain" || pro.image.position
                      ? { objectFit: "contain" as const, height: "auto" }
                      : {}),
                  }
                : undefined
            }
          />
        )}
      </div>
      <div className="pro-copy">
        {pro.wordmark ? (
          <Image
            className="wordmark"
            src={pro.wordmark.src}
            alt={pro.wordmark.alt}
            width={pro.wordmark.width}
            height={pro.wordmark.height}
          />
        ) : null}
        <p className="chip">{pro.placeholder ? "Placeholder" : pro.categoryLabel}</p>
        <h1>{pro.name}</h1>
        <p className="pro-line">{pro.comingSoon ? "Coming soon." : pro.line}</p>
        {pro.mission ? <blockquote className="mission">{pro.mission}</blockquote> : null}
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
        {pro.notice ? <p className="profile-note">{pro.notice}</p> : null}
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
        {overview ? <p className="hero-line profile-overview">{overview}</p> : null}
        <Services pro={pro} groupedHelp={groupedHelp} />
        {hasFullBio ? (
          <details className="full-bio">
            <summary className="contact-btn bio-toggle" aria-controls={panelId}>
              <span className="bio-label">
                <span className="bio-more">Read full bio</span>
                <span className="bio-less">Show less</span>
              </span>
            </summary>
            <div className="full-bio-panel" id={panelId}>
              {restBio ? <p className="hero-line">{restBio}</p> : null}
              {restStatements.map((statement) => (
                <p key={statement} className="hero-line">
                  {statement}
                </p>
              ))}
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
              <Facts pro={pro} hideProfession={hideProfession} />
            </div>
          </details>
        ) : null}
      </div>
      {pro.organization ? <OrganizationSection organization={pro.organization} /> : null}
    </article>
  );
}
