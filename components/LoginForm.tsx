"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/actions";

export function LoginForm({ next, demo }: { next: string; demo: boolean }) {
  const [state, action, pending] = useActionState(signInAction, { error: "" });
  return (
    <form className="stack" action={action}>
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <p className="alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required minLength={8} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {demo ? (
        <aside className="demo-box">
          <h2>Demo sign-in (placeholders)</h2>
          <p>These accounts exist only in the local preview database. The inboxes are not real.</p>
          <ul>
            <li>Admin: placeholder-admin@example.invalid / placeholder-admin-password</li>
            <li>Approved professional: placeholder-pro-one@example.invalid / placeholder-professional-password</li>
            <li>Pending applicant: placeholder-applicant@example.invalid / placeholder-professional-password</li>
          </ul>
        </aside>
      ) : null}
    </form>
  );
}
