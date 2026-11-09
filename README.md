# Naath Connect

Preview of the Naath Connect LLC site. The public domain `naathconnect.com` does not resolve. Read [docs/DIAGNOSIS.md](docs/DIAGNOSIS.md) before any registrar, DNS, hosting, or production deploy step. This branch does not go live on its own.

Naath Connect LLC is an Iowa limited liability company owned by Tango Tew. It connects the community with local professional services. Its own practice leads with technology consulting, written for small business owners, community leaders, contractors, and truckers.

## Stack

The old site was static HTML on GitHub Pages. That host cannot run accounts, approvals, or a database.

- **App:** Next.js (App Router) on Node 22.
- **Production data, when Tango approves it:** Supabase Postgres, Auth, and row-level security. Migration: `supabase/migrations/001_init.sql`. Hosting recommendation is in [docs/DIAGNOSIS.md](docs/DIAGNOSIS.md): Vercel Pro with DNS left in Cloudflare, not Vercel Hobby. Neither project is created here.
- **This preview:** Node’s built-in SQLite, so review needs no new account and no secrets. Leave the Supabase variables empty.

## Run the preview

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The amber banner means you are on placeholder data.

Demo sign-in (not real inboxes):

| Who | Email | Password |
| --- | --- | --- |
| Admin (Tango’s preview seat) | `placeholder-admin@example.invalid` | `placeholder-admin-password` |
| Approved professional | `placeholder-pro-one@example.invalid` | `placeholder-professional-password` |
| Pending applicant | `placeholder-applicant@example.invalid` | `placeholder-professional-password` |

Copy `.env.example` to `.env.local` only when a Supabase project exists. Do not commit secrets.

```bash
npm test
npm run typecheck
```

## What is in the preview

- Technology consultation, with Tango’s photo, and the service list in plain language. Technical terms sit on the small “Under the hood” line.
- Medical consultation for Dr. Gatbel ChamJock. Photos, biography, specialty, credentials, and contact are placeholders until he approves them.
- Directory applications that stay pending until an admin approves them.
- Events from approved professionals, also pending until approval, then a feed on the home page.
- Views (once per browser per day, not counted for the organizer) and like / heart reactions (approved accounts, one of each).
- An admin page to approve or reject people and events, and to feature an approved professional on a consultation section.

## Adding Gatbel’s photos

1. Put files in `public/images/gatbel/` (for example `gown.jpg`).
2. Edit the `gatbelGallery` array in `lib/consultations.ts`.
3. Replace the placeholder biography, specialty, credentials, and contact with text he has approved.
4. Set `placeholder: false` only after that OK.

Do not scrape social media.

## Adding another consultation section

House profiles live in `lib/consultations.ts`. An approved directory professional can join a section without a code change: on the admin page, open “Consultation listing”, set a category slug such as `medical` or a new one, and feature them. They appear only after their application is approved.

## Old site

The previous static site is in `legacy/`. The GitHub Pages deploy workflow on this branch refuses to publish, so a merge does not copy this app onto `gh-pages`.
