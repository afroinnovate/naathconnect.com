import Link from "next/link";
import { SITE_EMAIL, SITE_WHATSAPP } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          {" · "}
          <a href={SITE_WHATSAPP}>WhatsApp</a>
        </p>
        <p>
          <Link href="/contact">Contact</Link>
          {" · "}
          <Link href="/directory">Directory</Link>
        </p>
        <p>Website by Naath Connect</p>
      </div>
    </footer>
  );
}
