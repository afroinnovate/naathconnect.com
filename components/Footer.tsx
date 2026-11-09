import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          Naath Connect LLC, an Iowa limited liability company. Owner: Tango Tew. Phone, email, and street address are
          placeholders until Tango publishes them.
        </p>
        <p>
          <Link href="/contact">Contact</Link> · <Link href="/about">About</Link>
        </p>
      </div>
    </footer>
  );
}
