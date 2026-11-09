import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ session }: { session: SessionUser | null }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <img src="/brand/official-logo.png" alt="Naath Connect" />
      </Link>
      <div className="nav-links">
        <NavLinks signedIn={Boolean(session)} admin={session?.role === "admin"} />
        <ThemeToggle />
      </div>
    </header>
  );
}
