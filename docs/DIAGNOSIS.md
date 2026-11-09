# Diagnosis: naathconnect.com

Checked from this workspace. The checks were read-only. Nothing here changed the registrar, DNS, GitHub Pages settings, hosting, or billing. The production branch `main` was not updated, and this pull request was not merged.

## Current status

The domain is registered. The website is still down because the Cloudflare zone has no website records.

Tango registered `naathconnect.com` on Cloudflare Registrar on 2026-11-09. He reports that auto-renew is on. A read-only Verisign RDAP lookup at about 18:01 UTC the same day confirms:

| Field | Value |
| --- | --- |
| Registrar | Cloudflare, Inc. |
| Registration | 2026-11-09T17:00:24Z |
| Expiration | 2027-11-09T17:00:24Z |
| Registry status | `client transfer prohibited` (a normal registrar lock, not an outage) |
| Nameservers | `dorthy.ns.cloudflare.com`, `sri.ns.cloudflare.com` |

DNS is delegated to his Cloudflare account. Google DNS returns **NOERROR with no A or AAAA answer** for `naathconnect.com` (the name exists; nothing is published at it). `www.naathconnect.com` is **NXDOMAIN** (that name is not in the zone). No hosting is attached. This matches what Tango reported: DNS is in Cloudflare, and no records or hosting are set up yet.

An earlier read-only check the same day, about 16:42 UTC, still saw a Verisign RDAP 404 and NXDOMAIN from Google and Cloudflare DNS. That was before the 17:00 UTC registration. It is kept here so the timeline is clear. It is no longer the current state.

## What is still unfinished

The code and the old GitHub Pages configuration are unchanged by the registration.

- Repository: `afroinnovate/naathconnect.com`, public, default branch `main`.
- Last commit on `main`: `a2783f0` “fix services”, 2025-09-24. GitHub reports `pushed_at` 2025-09-25.
- Tags `v2025.9.1` through `v2025.9.7`, plus one rollback tag `rollback-20250920-044203`.
- GitHub Pages API: `status` built, `source.branch` `gh-pages`, `source.path` `/`, `cname` `naathconnect.com`, `https_enforced` true, `html_url` `https://naathconnect.com/`.
- `https://afroinnovate.github.io/naathconnect.com/` responds **301** to `https://naathconnect.com/`. That redirect is a GitHub Pages setting. It was not removed. Once the apex has DNS, that `github.io` URL will send people to whatever the apex points at. Until then it sends them to a name with no address record.

The `gh-pages` branch still contains a `CNAME` file whose contents are `naathconnect.com`. Do not add GitHub Pages’ A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) in Cloudflare. Those would publish the old static site.

## How the site was built

Static HTML, CSS, and JavaScript. No application framework, no `package.json`, no bundler, and no code that reads environment variables.

Pages that were on `main`: `index.html`, `about.html`, `services.html`, `partners.html`, `contact.html`, `404.html`. Styling is custom CSS (`legacy/assets/css`). There is a Lottie animation, a service worker (`legacy/assets/js/sw.js`, cache name `naathconnect-v1`), and brand files `official-logo.png` and `fav2.png`.

`robots.txt` pointed at `https://naathconnect.com/sitemap.xml`. `sitemap.xml` lists the five public HTML pages with `lastmod` 2025-09-19.

`_headers` sets a few security headers in the Netlify / Cloudflare Pages file format. GitHub Pages does not apply that file. There is no `netlify.toml`, no `vercel.json`, no `wrangler.toml`, and no Cloudflare Workers or Vercel project in the repo. Hosting of the public site was GitHub Pages only.

`.well-known/security.txt` was empty.

The old pages described a money-transfer and professional-services site, named a Dahabshiil partnership, and hardcoded WhatsApp and `tel:` links for named people. Those claims and numbers were **not** copied into the revamp. They remain in `legacy/` for Tango to confirm or retire. This diagnosis does not repeat the numbers.

## How it was deployed

Three GitHub Actions workflows:

1. `.github/workflows/deploy.yml` — on push to `main`, and on manual dispatch. It checked out the repo and used `JamesIves/github-pages-deploy-action` to force-push the folder `.` to the `gh-pages` branch. A clean step deleted and recreated that branch. The root `CNAME` file is what told GitHub Pages to serve `naathconnect.com`.
2. `.github/workflows/release.yml` — on push to `main`, created a calendar version tag `vYYYY.M.N` and a GitHub Release. Release notes still described money transfers.
3. `.github/workflows/rollback.yml` — manual. It checked out a tag and force-pushed that tree to `gh-pages`.

No preview environment, no server, and no database were part of that setup. Local development was `python -m http.server`.

On this branch, the automatic Pages deploy and the automatic release are frozen. Running the deploy workflow exits before it touches `gh-pages`. Rollback now requires the confirmation string `TANGO-APPROVED`. None of those workflows were run.

## Why GitHub Pages cannot host the revamp

The revamp needs accounts, an admin approval queue, a directory, events, view counts, and reactions. GitHub Pages only serves files. It cannot run the Next.js server or Postgres.

The app is Next.js (App Router). Production data is Supabase (Postgres, Auth, row-level security). The migration is `supabase/migrations/001_init.sql`.

Local review uses Node’s built-in SQLite (`node:sqlite`) when `NEXT_PUBLIC_SUPABASE_URL` is empty. That fallback is a laptop convenience. It is not a hosting option. `node:sqlite` is a Node API. Vercel serverless functions and Cloudflare Workers do not provide it. A deploy with the Supabase variables empty will try to open SQLite and fail. Production must set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `VIEW_SIGNING_SECRET`.

## Recommended hosting plan

Compare the two options Tango asked about, then the recommendation. Prices and limits below are from the vendors’ public pages as of 2026-11-09. They change. He should re-read them before putting a card on file. This pull request does not create an account, add a DNS record, or start a deploy.

Sources:

- Vercel Hobby terms: [Terms of Service, section 4](https://vercel.com/legal/terms) and [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- Vercel prices: [vercel.com/pricing](https://vercel.com/pricing) (Hobby $0, Pro $20/month)
- Workers prices and limits: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) and [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- OpenNext on Workers: [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare) and [Cloudflare’s OpenNext guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/)
- Supabase: [supabase.com/pricing](https://supabase.com/pricing)

### (a) Vercel Hobby + Supabase free, DNS stays in Cloudflare

**Cost.** Vercel Hobby is $0. Supabase Free is $0 (500 MB database, 50,000 monthly active users, 5 GB egress, 2 active projects). The domain is already paid through 2027-11-09. Dollar cost of this pair is $0 plus the domain he already bought.

**Effort.** Lowest of the two, for this repository. The app is already a Node Next.js app. Vercel runs `next build` without an adapter. He would import the GitHub repo, set three environment variables, and add the DNS records Vercel shows into the Cloudflare zone he already controls.

**Limits that rule Hobby out for this company.**

- Vercel’s terms say the Hobby plan is for personal or non-commercial use only. Vercel may disable a Hobby project at its discretion.
- The fair-use page defines commercial use as a deployment for the financial gain of anyone involved. The examples include advertising the sale of a product or service, taking payment, and being paid to build or host the site. Asking for donations is listed there as commercial use.
- Naath Connect LLC is a business. This site advertises consulting, websites, and payment work for customers. That is commercial use of Hobby even before a payment form exists. Hobby is the wrong plan. The plan that matches the terms is **Vercel Pro at $20/month**, with the same Supabase project and the same Cloudflare DNS records.

Other Hobby limits, if it were eligible: fair-use guidance is about 100 GB fast data transfer, 1 million function invocations, and 4 CPU-hours a month. Exceeding a hard Hobby limit pauses the feature until the window resets. There is no invoice. Pro bills overages.

**Supabase Free limits that apply to either option.** The database pauses after one week without activity. A quiet week takes the directory and login down until someone resumes the project in the Supabase dashboard. There are no backups on Free. Two active free projects. Those caps are fine for a first directory. They are a poor fit if the public site must stay up through a quiet week. Supabase Pro starts at $25/month and does not pause. That upgrade can wait until the pause actually hurts, as long as Tango knows a pause is possible.

**SQLite.** Do not turn on the local SQLite fallback in either host. Set the Supabase variables before the first production deploy.

### (b) Cloudflare Workers via OpenNext + Supabase

**Cost.** Workers Free is $0 and includes 100,000 requests per day. Workers Paid is a $5/month minimum, then 10 million requests a month included and about $0.30 per extra million. Supabase Free is the same $0 project as in (a). DNS and the registrar are already in this Cloudflare account, so there is no second DNS vendor. The domain renewal is separate and already set.

**Effort.** Higher, and it is a port, not a settings change. This repo has no `wrangler.toml` and no OpenNext config. Someone has to add `@opennextjs/cloudflare`, build with that adapter, and prove server actions, Supabase cookie auth, and the admin forms on Workers. Cloudflare’s own OpenNext guide currently says **vinext is the recommended path for a new Next.js app on Workers**, and that OpenNext is for keeping an existing OpenNext app. This app is neither, so choosing OpenNext means adopting an adapter Cloudflare is steering new apps away from. Node.js middleware from Next.js 15.2 is listed as not yet supported on that adapter. This app has a `middleware.ts`. That has to be proven, not assumed.

**Limits.**

- Workers Free allows **10 ms of CPU per request**. Waiting on Supabase is network time, not CPU, but rendering this app still has to fit in 10 ms. That is tight for a Next.js server render. The paid plan’s default is 30 seconds of CPU, up to 5 minutes.
- OpenNext’s docs still describe a compressed Worker size limit of **3 MiB on Free and 10 MiB on Paid**, and a deploy that exceeds it fails. Cloudflare’s account limits table also lists a 64 MiB worker size. Those two pages do not say the same thing. This pull request did not deploy, so it does not know which ceiling this bundle would hit. Assume the Free plan can reject the upload until someone measures a real build in Tango’s account.
- Workers Free allows 50 subrequests per invocation. A page that talks to Supabase several times can fit. The CPU and size limits are the ones that bite first.
- The same Supabase Free pause and the same SQLite ban as in (a).

Workers does not have Vercel’s “personal use only” rule. A business site is allowed on Workers Free or Paid. Free is still a bad fit for this app because of CPU and bundle size.

### Recommendation

**Use Vercel Pro ($20/month) + Supabase Free, and leave DNS in Cloudflare.** Do not use Vercel Hobby.

Hobby is the cheaper Vercel checkbox and the smaller engineering job, and it is the one the terms do not allow for this LLC. Pro is the same engineering job with a plan that permits a commercial site. The app does not need an adapter. Tango adds the records Vercel displays into the Cloudflare zone he already runs. No nameserver change.

Workers Paid ($5/month) + Supabase Free is the better bill if he wants the app, DNS, and registrar in one Cloudflare account, and only after a separate compatibility spike proves OpenNext (or vinext) can run this app, including middleware and server actions, inside the paid Worker limits. That spike is not in this pull request. Workers Free is not the launch plan.

Stay on Supabase Free for the first launch. Budget a move to Supabase Pro ($25/month) if a one-week pause takes the public site down, or if he wants backups.

The local SQLite database stays on developer machines. It is not deployed.

### Go-live steps Tango must approve

Nobody does these until he says so, in order. This pull request does not do any of them.

1. **He picks the plan in writing.** Recommended: Vercel Pro + Supabase Free + DNS records in his existing Cloudflare zone. Alternative: Workers Paid + an OpenNext or vinext port + Supabase Free, only after a spike he has seen work. Hobby is not a choice for this site.
2. **He creates the Supabase project** in an account he owns. He pastes `supabase/migrations/001_init.sql` into the SQL editor. He sets `naath_private.secrets` name `view_hmac` to a long random string, and keeps that same string for `VIEW_SIGNING_SECRET`.
3. **He creates his login** with his real email (email confirmation on or off, his choice) and runs the promote statement at the top of the migration so that row is `role = 'admin'` and `status = 'approved'`.
4. **He creates the app host himself.** For the recommendation: a Vercel team on **Pro** (card required, $20/month), import `afroinnovate/naathconnect.com`, and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `VIEW_SIGNING_SECRET`. Leave the SQLite demo variables unset. For the Workers alternative: he installs the adapter on a branch he approves, then deploys with Wrangler to Workers Paid.
5. **He deploys the commit he names** and opens the host’s `*.vercel.app` (or `*.workers.dev`) URL while it is still not the public domain. He signs in as the admin, approves a test professional, and confirms the directory is Supabase and not the demo SQLite file. He deletes that test row when he is done.
6. **He attaches the domain on the host**, then copies the records that host shows. In Cloudflare DNS he adds only those records. For Vercel, start with proxy **DNS only** (grey cloud) unless Vercel’s current domain screen says otherwise. An orange-cloud proxy with the wrong SSL mode causes redirect loops. He does not add GitHub Pages A records.
7. **He adds `www`** the same way (Vercel will show a CNAME). Today `www` does not exist in the zone. He chooses whether `www` redirects to the apex or the apex redirects to `www`, and he sets that on the host, not by guessing records.
8. **After `https://naathconnect.com` serves the new app**, he removes the custom domain `naathconnect.com` from GitHub Pages, and he turns Pages off for this repository if he does not want the old static site reachable at `afroinnovate.github.io`. Both are GitHub settings. They were not changed here.
9. **He approves a merge separately from DNS.** Merging updates `main`. It does not, on this branch, publish `gh-pages`. It still should wait for his explicit OK.
10. **He replaces placeholders** (contact details, Gatbel’s photos and wording, demo directory rows) and only then asks for `noindex` to be removed. The preview sends `noindex` on purpose.

## What this pull request changes, and what it does not

Changes:

- Writes this diagnosis, including the registration and the hosting recommendation.
- Moves the old static site to `legacy/` so it is still in the repo.
- Adds the Next.js preview: consulting copy, directory, onboarding, events, reactions, admin review, and consultation sections that an admin can extend from approved professionals.
- Freezes the automatic GitHub Pages deploy and the automatic release workflow on this branch.

Does not:

- Touch the Cloudflare registrar, auto-renew, or the zone. No DNS records were added.
- Change GitHub Pages settings (the 301 from `github.io` to the apex is unchanged).
- Create a Vercel, Cloudflare Workers, or Supabase project, or put a card on file.
- Deploy, or merge to `main`.
- Invent testimonials, client counts, phone numbers, emails, or a street address.

There is no preview URL. A throwaway deploy would need a new host account or a change to DNS or to the production Pages site.

## Open questions for Tango

1. **Domain.** Answered. Cloudflare Registrar, expires 2027-11-09, auto-renew on as he reported, DNS in his Cloudflare account, no records yet. Confirm the Cloudflare account email that should own the zone long term.
2. **GitHub Pages.** After the new host is live, remove the custom domain and turn Pages off, or leave `github.io` serving the old static files? Nothing was changed.
3. **Host.** Approve the recommendation (Vercel Pro + Supabase Free + Cloudflare DNS), or pay for a Workers port first? Hobby is not recommended. A card is required for Vercel Pro ($20/month) or Workers Paid ($5/month). Supabase Free needs no card until he chooses Pro.
4. **Admin email.** Which real email should be promoted to admin after Supabase Auth is on? The preview admin is `placeholder-admin@example.invalid` and is not a mailbox.
5. **Sign-in.** Email and password, or a magic link? The preview uses a password so it can be reviewed without an email provider.
6. **Contact block.** What phone, email, mailing address, and hours should the live site publish? All of those are placeholders now.
7. **Logo.** The existing mark is in use. Its tagline still says “Secure. Fast. Affordable. Reliable.” from the earlier positioning. Keep it, or commission a new one?
8. **Old claims.** Should the Dahabshiil partnership, money-transfer positioning, or the other named providers from `legacy/` return, and on what terms? They are not on the new pages.
9. **Free websites.** What does “free” include, for how long, and who pays the registrar when Naath “handles the domain”?
10. **Payments.** Which processor, and is Naath the merchant of record or the community group? Nothing is connected on this preview.
11. **Receipts.** Is this a product to build, or a service Naath performs? Any tax-preparer credential to disclose? The page says it does not file returns and is not tax advice.
12. **Events.** Is America/Chicago the right clock, because the company is an Iowa LLC?
13. **Reactions.** They require an approved account, one like and one heart per person. Views are once per browser per day, organizers are not counted, and a signed proof is required before Supabase will count a view. Is that the rule you want, or should visitors react without an account?
14. **Edits after approval.** A professional cannot rewrite a listing after it is approved. Should a later edit go back to pending?
15. **Dr. Gatbel ChamJock.** Confirm the spelling (the old site used “Chamjock”). Please supply photos, including the medical gown shot, and his OK. Biography, specialty, credentials, and contact are unpublished placeholders. Drop files in `public/images/gatbel/` and point `lib/consultations.ts` at them. Do not publish the section as his profile before he agrees. Nothing was scraped from Facebook.
16. **More consultation sections.** An admin can feature an approved directory professional into `technology`, `medical`, or a new category slug without a code change. Are there other house sections to add the same way before launch?
17. **Indexing.** The preview is `noindex`. When should that come off, and only after placeholders are gone?
18. **Supabase pause.** Is a possible one-week inactivity pause acceptable at launch, or should the first project be Supabase Pro ($25/month) so the database does not sleep?
