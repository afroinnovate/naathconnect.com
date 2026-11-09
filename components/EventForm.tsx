"use client";

import { useActionState } from "react";
import { createEventAction } from "@/app/actions";

export function EventForm() {
  const [state, action, pending] = useActionState(createEventAction, { error: "" });
  return (
    <form className="stack" action={action}>
      {state.error ? (
        <p className="alert" role="alert">
          {state.error}
        </p>
      ) : null}
      <label>
        Event title
        <input name="title" required maxLength={120} />
      </label>
      <label>
        Short summary
        <input name="summary" required maxLength={280} />
      </label>
      <label>
        Details
        <textarea name="body" required minLength={10} maxLength={4000} />
      </label>
      <label>
        When it starts (Central time)
        <input name="startsAt" type="datetime-local" required />
      </label>
      <label>
        Where people should picture it
        <input name="locationLabel" required maxLength={160} placeholder="Placeholder venue — not a street address" />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Submit for approval"}
      </button>
    </form>
  );
}
