import type { Metadata } from "next";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata: Metadata = { title: "Apply" };

export default function OnboardingPage() {
  return (
    <section className="section split">
      <div>
        <p className="kicker">Professional onboarding</p>
        <h1>Apply to the community directory</h1>
        <p className="lede">
          Community professionals use this form. The submission stays pending until Tango, as admin, approves it. It
          does not appear in the public directory before then. Approved professionals can then sign in and add events,
          which also wait for approval.
        </p>
      </div>
      <OnboardingForm />
    </section>
  );
}
