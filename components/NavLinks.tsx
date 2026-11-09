"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/events", label: "Events" },
  { href: "/onboarding", label: "Apply" },
];

export function NavLinks({ signedIn, admin }: { signedIn: boolean; admin: boolean }) {
  const pathname = usePathname();
  const items = [
    ...links,
    signedIn ? { href: "/account", label: "Account" } : { href: "/login", label: "Log in" },
    ...(admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <nav className="nav-links" aria-label="Primary">
      {items.map((item) => {
        const current = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
