import type { ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="slide-icon">
      {children}
    </svg>
  );
}

const icons: Record<string, ReactNode> = {
  compass: (
    <Frame>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11z" {...stroke} />
    </Frame>
  ),
  layers: (
    <Frame>
      <path d="m12 3 8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" {...stroke} />
    </Frame>
  ),
  puzzle: (
    <Frame>
      <path d="M8 4h3a2 2 0 1 1 0 4h1v2h2a2 2 0 1 1 0 4h-2v2H8v-3H6a2 2 0 1 1 0-4h2z" {...stroke} />
    </Frame>
  ),
  bulb: (
    <Frame>
      <path d="M9 18h6M10 21h4M8 14a4.5 4.5 0 1 1 8 0c0 1.6-1 2.4-1.6 3.2-.3.4-.4.8-.4 1.3h-4c0-.5-.1-.9-.4-1.3C9 16.4 8 15.6 8 14z" {...stroke} />
    </Frame>
  ),
  rocket: (
    <Frame>
      <path d="M14 10 5 19M14.5 5.5c2.5 0 4 1.5 4 4L15 13l-4-4zM9 15l-2 2 1 3 3-1 1-2" {...stroke} />
    </Frame>
  ),
  code: (
    <Frame>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4" {...stroke} />
    </Frame>
  ),
  wrench: (
    <Frame>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.1L4 16.3 7.7 20l5.7-5.7a3.5 3.5 0 0 0 4.1-4.8L15 12l-3-3z" {...stroke} />
    </Frame>
  ),
  check: (
    <Frame>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="m8.5 12.2 2.3 2.3 4.7-5" {...stroke} />
    </Frame>
  ),
  cpu: (
    <Frame>
      <rect x="7" y="7" width="10" height="10" rx="1.5" {...stroke} />
      <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" {...stroke} />
    </Frame>
  ),
  chat: (
    <Frame>
      <path d="M6 16.5 4 20l4.2-1.4A8 8 0 1 0 6 16.5z" {...stroke} />
    </Frame>
  ),
  bolt: (
    <Frame>
      <path d="M13 3 5 14h6l-1 7 8-11h-6z" {...stroke} />
    </Frame>
  ),
  bell: (
    <Frame>
      <path d="M6 16h12l-1.2-2.2A6 6 0 0 1 16 9a4 4 0 0 0-8 0 6 6 0 0 1-.8 4.8zM10 18a2 2 0 0 0 4 0" {...stroke} />
    </Frame>
  ),
  globe: (
    <Frame>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M4 12h16M12 4c2.2 2.4 3.2 5 3.2 8s-1 5.6-3.2 8c-2.2-2.4-3.2-5-3.2-8s1-5.6 3.2-8z" {...stroke} />
    </Frame>
  ),
  layout: (
    <Frame>
      <rect x="4" y="4" width="16" height="16" rx="2" {...stroke} />
      <path d="M4 9h16M10 9v11" {...stroke} />
    </Frame>
  ),
  monitor: (
    <Frame>
      <rect x="3" y="4" width="18" height="12" rx="2" {...stroke} />
      <path d="M8 20h8M12 16v4" {...stroke} />
    </Frame>
  ),
  search: (
    <Frame>
      <circle cx="11" cy="11" r="6" {...stroke} />
      <path d="m16 16 4 4" {...stroke} />
    </Frame>
  ),
  server: (
    <Frame>
      <rect x="4" y="4" width="16" height="6" rx="1.5" {...stroke} />
      <rect x="4" y="14" width="16" height="6" rx="1.5" {...stroke} />
      <path d="M8 7h.01M8 17h.01" {...stroke} />
    </Frame>
  ),
  shield: (
    <Frame>
      <path d="M12 3 5 6v6c0 4 2.8 6.6 7 8 4.2-1.4 7-4 7-8V6z" {...stroke} />
    </Frame>
  ),
  pulse: (
    <Frame>
      <path d="M3 12h4l2-5 4 10 2-5h6" {...stroke} />
    </Frame>
  ),
  cloud: (
    <Frame>
      <path d="M7 18h9a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 18z" {...stroke} />
    </Frame>
  ),
  card: (
    <Frame>
      <rect x="3" y="6" width="18" height="12" rx="2" {...stroke} />
      <path d="M3 10h18" {...stroke} />
    </Frame>
  ),
  lock: (
    <Frame>
      <rect x="6" y="11" width="12" height="9" rx="2" {...stroke} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke} />
    </Frame>
  ),
  key: (
    <Frame>
      <circle cx="8" cy="14" r="3.2" {...stroke} />
      <path d="M11 14h9l-2 2M17 14v2" {...stroke} />
    </Frame>
  ),
  file: (
    <Frame>
      <path d="M7 3h7l4 4v14H7z" {...stroke} />
      <path d="M14 3v5h5M9 13h6M9 17h6" {...stroke} />
    </Frame>
  ),
  folder: (
    <Frame>
      <path d="M3 7h6l2 2h10v10H3z" {...stroke} />
    </Frame>
  ),
  calendar: (
    <Frame>
      <rect x="4" y="5" width="16" height="15" rx="2" {...stroke} />
      <path d="M8 3v4M16 3v4M4 10h16" {...stroke} />
    </Frame>
  ),
  archive: (
    <Frame>
      <path d="M4 7h16v12H4zM3 4h18v3H3zM10 12h4" {...stroke} />
    </Frame>
  ),
  terminal: (
    <Frame>
      <rect x="3" y="4" width="18" height="16" rx="2" {...stroke} />
      <path d="m7 9 3 3-3 3M12 15h5" {...stroke} />
    </Frame>
  ),
  branch: (
    <Frame>
      <circle cx="6" cy="6" r="2" {...stroke} />
      <circle cx="6" cy="18" r="2" {...stroke} />
      <circle cx="18" cy="10" r="2" {...stroke} />
      <path d="M6 8v8M8 6h4a4 4 0 0 1 4 4" {...stroke} />
    </Frame>
  ),
  heart: (
    <Frame>
      <path d="M12 19s-6.5-4.2-6.5-8.2A3.4 3.4 0 0 1 12 8a3.4 3.4 0 0 1 6.5 2.8C18.5 14.8 12 19 12 19z" {...stroke} />
    </Frame>
  ),
  book: (
    <Frame>
      <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3zM5 4v16" {...stroke} />
    </Frame>
  ),
  refund: (
    <Frame>
      <path d="M4 10.5 12 4l8 6.5V20H4z" {...stroke} />
      <path d="M10 20v-6h4v6" {...stroke} />
    </Frame>
  ),
};

export function ServiceIcon({ name }: { name: string }) {
  return icons[name] ?? null;
}
