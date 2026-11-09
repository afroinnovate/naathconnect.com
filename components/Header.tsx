import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { NavLinks } from "./NavLinks";

export function Header({ session }: { session: SessionUser | null }) {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <img src="/brand/official-logo.png" alt="Naath Connect" />
      </Link>
      <NavLinks signedIn={Boolean(session)} admin={session?.role === "admin"} />
    </header>
  );
}
