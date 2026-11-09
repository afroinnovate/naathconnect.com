import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <h1>That page is not here</h1>
      <p>
        <Link href="/">Back to the home page</Link>
      </p>
    </section>
  );
}
