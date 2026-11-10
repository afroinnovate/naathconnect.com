"use client";

import { useActionState, useState } from "react";
import { createAccountAction, googleSignInAction, signInAction } from "@/app/actions";

export function LoginForm({
  next,
  demo,
  googleEnabled,
  initialMode,
  googleError,
}: {
  next: string;
  demo: boolean;
  googleEnabled: boolean;
  initialMode: "sign-in" | "create";
  googleError: boolean;
}) {
  const [mode, setMode] = useState<"sign-in" | "create">(initialMode);
  const [signInState, signIn, signingIn] = useActionState(signInAction, { error: "" });
  const [createState, createAccount, creating] = useActionState(createAccountAction, { error: "", message: "" });

  return (
    <div className="stack">
      <div className="auth-toggle" role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === "sign-in"} onClick={() => setMode("sign-in")}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === "create"} onClick={() => setMode("create")}>
          Create account
        </button>
      </div>
      {mode === "sign-in" ? (
        <form className="stack" action={signIn}>
          <input type="hidden" name="next" value={next} />
          {signInState.error ? (
            <p className="alert" role="alert">
              {signInState.error}
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
          <button type="submit" disabled={signingIn}>
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
          <p>
            <button type="button" className="text-link" onClick={() => setMode("create")}>
              Create account
            </button>
          </p>
        </form>
      ) : createState.message ? (
        <p className="notice" role="status">
          {createState.message}
        </p>
      ) : (
        <form className="stack" action={createAccount}>
          {createState.error ? (
            <p className="alert" role="alert">
              {createState.error}
            </p>
          ) : null}
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <button type="submit" disabled={creating}>
            {creating ? "Creating account…" : "Create account"}
          </button>
          <p>
            <button type="button" className="text-link" onClick={() => setMode("sign-in")}>
              Already have an account? Sign in
            </button>
          </p>
        </form>
      )}
      {googleEnabled ? (
        <form action={googleSignInAction}>
          <button type="submit" className="button-secondary">
            Continue with Google
          </button>
          {googleError ? <p className="alert">Google sign-in is not available yet.</p> : null}
        </form>
      ) : null}
      {demo && mode === "sign-in" ? (
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
    </div>
  );
}
