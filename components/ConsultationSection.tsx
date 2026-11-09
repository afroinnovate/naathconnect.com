import type { ConsultationProfile } from "@/lib/types";
import { Photo } from "./Photo";
import { PhotoGallery } from "./PhotoGallery";
import { ServiceList } from "./ServiceList";

export function ConsultationSection({
  category,
  label,
  profiles,
  showServices,
}: {
  category: string;
  label: string;
  profiles: ConsultationProfile[];
  showServices?: boolean;
}) {
  return (
    <section className="section" id={category} aria-labelledby={`${category}-title`}>
      <p className="kicker">{label}</p>
      <h2 id={`${category}-title`} className="sr-only">
        {label}
      </h2>
      {profiles.map((profile) =>
        profile.layout === "feature" ? (
          <FeatureProfile key={profile.id} profile={profile} />
        ) : (
          <StandardProfile key={profile.id} profile={profile} />
        ),
      )}
      {showServices ? <ServiceList /> : null}
    </section>
  );
}

function FeatureProfile({ profile }: { profile: ConsultationProfile }) {
  return (
    <div className="tech-layout">
      {profile.portrait ? (
        <figure className="portrait-frame">
          <Photo image={profile.portrait} sizes="(min-width: 800px) 380px, 100vw" />
          <figcaption>
            <p className="pull">{profile.pullQuote}</p>
            <p className="quiet">
              {profile.name} — {profile.roleLine}
            </p>
          </figcaption>
        </figure>
      ) : null}
      <div>
        <h2>{profile.headline}</h2>
        <p className="lede">{profile.summary}</p>
        {profile.principles.length > 0 ? (
          <ul className="principles">
            {profile.principles.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <p className="personal">The personal lines above are his. The work you get is practical.</p>
      </div>
    </div>
  );
}

function StandardProfile({ profile }: { profile: ConsultationProfile }) {
  return (
    <article className="profile-layout">
      <PhotoGallery images={profile.gallery} label={`${profile.name} photos`} />
      <div>
        {profile.placeholder ? (
          <p className="consent">
            Placeholder profile. The photos, biography, specialty, credentials, and contact are not final. Dr. Gatbel
            ChamJock has not approved this section. Nothing here was taken from social media. Tango will supply the
            photos and get Gatbel’s OK before this is treated as his profile.
          </p>
        ) : null}
        <h2>{profile.name}</h2>
        <p className="quiet">{profile.roleLine}</p>
        <p>{profile.headline}</p>
        <p>{profile.summary}</p>
        <ul className="meta-list">
          {profile.specialty ? (
            <li>
              <span>Specialty</span>
              {profile.specialty}
            </li>
          ) : null}
          {profile.credentials ? (
            <li>
              <span>Credentials</span>
              {profile.credentials}
            </li>
          ) : null}
          {profile.contactNote ? (
            <li>
              <span>Contact</span>
              {profile.contactNote}
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}
