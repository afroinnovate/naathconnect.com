import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { isDemoMode, safeNextPath } from "@/lib/config";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="section split">
      <div>
        <p className="kicker">Account</p>
        <h1>Log in</h1>
        <p>Approved professionals manage events here. Applicants can sign in to see whether they are still pending.</p>
        <p>
          New professional? <Link href="/onboarding">Apply to the directory</Link>.
        </p>
      </div>
      <LoginForm next={safeNextPath(next)} demo={isDemoMode()} />
    </section>
  );
}
