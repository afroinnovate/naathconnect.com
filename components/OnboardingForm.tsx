"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/actions";

export function OnboardingForm() {
  const [state, action, pending] = useActionState(signUpAction, { error: "" });
  return (
    <form className="stack" action={action}>
      {state.error ? (
        <p className="alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <label>
        Your name
        <input name="fullName" required maxLength={80} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" required minLength={8} autoComplete="new-password" />
      </label>
      <label>
        Business or practice name
        <input name="businessName" required maxLength={120} />
      </label>
      <label>
        Profession or service
        <input name="profession" required maxLength={120} />
      </label>
      <label>
        Service area
        <input name="serviceArea" required maxLength={120} placeholder="City or region — to be confirmed" />
      </label>
      <label>
        What you offer the community
        <textarea name="bio" required minLength={10} maxLength={1000} />
      </label>
      <label>
        Website, if you have one
        <input name="website" type="url" placeholder="https://" />
      </label>
      <label>
        WhatsApp link, optional
        <input name="publicContact" type="url" maxLength={160} placeholder="https://wa.me/" />
      </label>
      <label className="check">
        <input type="checkbox" name="ack" value="yes" required />
        <span>I understand this application stays pending until an admin approves it, and that this preview is not the live site.</span>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
