import type { PublicPro } from "@/lib/featured-pros";
import { RESUME_URL } from "@/lib/site";

export type ProfileLink = { href: string; label: string; globe?: boolean };

export function profileLinks(pro: PublicPro): ProfileLink[] {
  const links: ProfileLink[] = [];
  if (pro.website) {
    links.push({
      href: pro.website,
      label: pro.websiteLabel || (pro.website === RESUME_URL ? "Resume" : "Website"),
      globe: true,
    });
  }
  if (pro.github) links.push({ href: pro.github, label: "GitHub" });
  if (pro.linkedin) links.push({ href: pro.linkedin, label: "LinkedIn" });
  return links;
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="btn-globe">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 12h16M12 4c2.2 2.4 3.2 5 3.2 8s-1 5.6-3.2 8c-2.2-2.4-3.2-5-3.2-8s1-5.6 3.2-8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ProfileLinks({ links, icons = false }: { links: ProfileLink[]; icons?: boolean }) {
  if (links.length === 0) return null;
  const items = links.map((link) => (
    <a key={link.href} className={icons ? "icon-btn" : "contact-btn"} href={link.href} target="_blank" rel="noreferrer">
      {icons ? <LinkIcon label={link.label} globe={link.globe} /> : link.globe ? <GlobeIcon /> : null}
      {icons ? <span className="sr-only">{link.label}</span> : link.label}
    </a>
  ));
  if (!icons) return <>{items}</>;
  return <div className="tile-links">{items}</div>;
}

function LinkIcon({ label, globe = false }: { label: string; globe?: boolean }) {
  if (globe) return <GlobeIcon />;
  if (label === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.34 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2z"
        />
      </svg>
    );
  }
  if (label === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.5 9H4V20h2.5V9zM5.25 4A1.75 1.75 0 1 0 5.26 7.5 1.75 1.75 0 0 0 5.25 4zM20 20h-2.5v-5.6c0-1.55-.56-2.6-1.96-2.6-1.07 0-1.7.72-1.98 1.41-.1.25-.13.6-.13.95V20H11V9h2.4v1.51c.36-.55 1.25-1.66 3.05-1.66 2.23 0 3.55 1.46 3.55 4.6V20z"
        />
      </svg>
    );
  }
  return null;
}
