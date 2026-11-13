/**
 * Public service list. Headlines stay in plain language.
 * Technical terms belong only in `hood` ("Under the hood").
 * tests/services.test.ts locks that split.
 */
export type ServiceOffer = {
  id: string;
  name: string;
  title: string;
  body: string;
  hood: string;
};

/** Generic icon names for each service slideshow. No photos of people. */
export const serviceSlideIcons: Record<string, readonly string[]> = {
  "solution-engineering": ["compass", "layers", "puzzle", "bulb"],
  "forward-deployed": ["rocket", "code", "wrench", "check"],
  "ai-assistants": ["cpu", "chat", "bolt", "bell"],
  websites: ["globe", "layout", "monitor", "search"],
  "reliable-systems": ["server", "shield", "pulse", "cloud"],
  payments: ["card", "lock", "key", "shield"],
  receipts: ["file", "folder", "calendar", "archive"],
  "software-consulting": ["terminal", "branch", "book", "chat"],
};

export function getService(id: string): ServiceOffer | undefined {
  return serviceOffers.find((service) => service.id === id);
}

/** Service pages stay at this path. Professional cards link to /pros/<slug>. */
export function servicePath(id: string): string {
  return `/services/${id}`;
}

export const serviceOffers: ServiceOffer[] = [
  {
    id: "solution-engineering",
    name: "Solution Engineering",
    title: "You tell us the problem, we design the fix.",
    body: "We listen, map out what is slowing you down, and design the right technology solution before anything gets built.",
    hood: "System design — the plan for the fix, written down before the build.",
  },
  {
    id: "forward-deployed",
    name: "Forward-Deployed Engineering",
    title: "From raw idea to working solution.",
    body: "We work side by side with you to turn your idea into a real tool, using technology and AI, and keep improving it until it solves the problem.",
    hood: "Hands-on software engineering that stays with you after the first version.",
  },
  {
    id: "ai-assistants",
    name: "AI Assistants & Automation",
    title: "Staff that never sleeps.",
    body: "AI that answers calls, sends alerts, and handles the repetitive tasks so you can focus on the work only you can do. Two jobs we can scope: a phone receptionist, and load alerts for truckers.",
    hood: "AI assistants and agents — models, APIs, and automation tied to one real task.",
  },
  {
    id: "websites",
    name: "Websites & Online Presence",
    title: "Get found, look professional.",
    body: "A free website plus hosting for contractors, community groups, and trucking businesses. We handle the domain and the tech for you.",
    hood: "Remix, React, TypeScript, and Tailwind. What “free” includes is confirmed before a site starts.",
  },
  {
    id: "reliable-systems",
    name: "Reliable, Scalable Systems",
    title: "Built to stay up and grow with you.",
    body: "Your systems keep running, stay secure, and handle more customers without breaking.",
    hood: "Kubernetes, GitOps, CI/CD, infrastructure as code, and observability.",
  },
  {
    id: "payments",
    name: "Payments & Secure Sign-in for communities",
    title: "Collect contributions safely.",
    body: "Dues, donations, and fees need a trustworthy place to land, and the right people need a way to sign in. We set that up so it is not stuck in one person’s phone.",
    hood: "A payment gateway and secure sign-in for a community group. No payment company is connected on this preview.",
  },
  {
    id: "receipts",
    name: "Receipts & Year-End Records for NGOs",
    title: "Tax season without the shoebox.",
    body: "Save receipts through the year so an NGO is not hunting for them at filing time. This keeps the records together. It is not tax advice, and it does not file the return.",
    hood: "Receipt saving gathered for year-end tax filing.",
  },
  {
    id: "software-consulting",
    name: "Software Consulting",
    title: "A tech partner in your corner.",
    body: "You do not have to become a technologist to make a good decision. We explain the options in plain language and help you build the right thing — or skip the wrong one.",
    hood: "Software engineering consulting, from a second opinion to a build.",
  },
];
