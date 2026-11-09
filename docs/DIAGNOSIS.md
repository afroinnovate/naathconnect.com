# Diagnosis: naathconnect.com is down

Checked 2026-11-09 (about 16:42 UTC) from this workspace. The checks were read-only. Nothing here changed the registrar, DNS, GitHub Pages settings, hosting, or billing. The production branch `main` was not updated.

## What is wrong

This is not a TLS problem. The name is not in the .com registry, so there is no address record for a certificate to fail on.

| Check | Result |
| --- | --- |
| Verisign RDAP `https://rdap.verisign.com/com/v1/domain/naathconnect.com` | HTTP 404, empty body |
| Google DNS (`dns.google`) A and NS for `naathconnect.com` | Status 3, NXDOMAIN. Authority is the `com` SOA at Verisign |
| Cloudflare DNS (`cloudflare-dns.com`) A for `naathconnect.com` | Status 3, NXDOMAIN |
| `www.naathconnect.com` | NXDOMAIN as well |

A 404 from the .com RDAP means the registry has no domain object. The name is not in an active registration. It may be available to register again. This check does not reserve it. Someone else can register it first. Only Tango, or a person he authorizes at a registrar he controls, should register it, after he confirms the current price and availability in that registrar’s cart.

## What is still there

The code and the GitHub Pages configuration survived. The public hostname did not.

- Repository: `afroinnovate/naathconnect.com`, public, default branch `main`.
- Last commit on `main`: `a2783f0` “fix services”, 2025-09-24. GitHub reports `pushed_at` 2025-09-25.
- Tags `v2025.9.1` through `v2025.9.7`, plus one rollback tag `rollback-20250920-044203`.
- GitHub Pages API: `status` built, `source.branch` `gh-pages`, `source.path` `/`, `cname` `naathconnect.com`, `https_enforced` true, `html_url` `https://naathconnect.com/`.
- `https://afroinnovate.github.io/naathconnect.com/` responds **301** to `https://naathconnect.com/`. That fallback is unusable while the apex does not resolve. Removing the custom domain in the GitHub Pages settings would stop the redirect. That is a hosting change and was **not** done.

The `gh-pages` branch still contains a `CNAME` file whose contents are `naathconnect.com`.

## How the site was built

Static HTML, CSS, and JavaScript. No application framework, no `package.json`, no bundler, and no code that reads environment variables.

Pages that were on `main`: `index.html`, `about.html`, `services.html`, `partners.html`, `contact.html`, `404.html`. Styling is custom CSS (`legacy/assets/css`). There is a Lottie animation, a service worker (`legacy/assets/js/sw.js`, cache name `naathconnect-v1`), and brand files `official-logo.png` and `fav2.png`.

`robots.txt` pointed at `https://naathconnect.com/sitemap.xml`. `sitemap.xml` lists the five public HTML pages with `lastmod` 2025-09-19.

`_headers` sets a few security headers in the Netlify / Cloudflare Pages file format. GitHub Pages does not apply that file. There is no `netlify.toml`, no `vercel.json`, no `wrangler.toml`, and no Cloudflare or Vercel project in the repo. Hosting of the public site was GitHub Pages only.

`.well-known/security.txt` was empty.

The old pages described a money-transfer and professional-services site, named a Dahabshiil partnership, and hardcoded WhatsApp and `tel:` links for named people. Those claims and numbers were **not** copied into the revamp. They remain in `legacy/` for Tango to confirm or retire. This diagnosis does not repeat the numbers.

## How it was deployed

Three GitHub Actions workflows:

1. `.github/workflows/deploy.yml` — on push to `main`, and on manual dispatch. It checked out the repo and used `JamesIves/github-pages-deploy-action` to force-push the folder `.` to the `gh-pages` branch. A clean step deleted and recreated that branch. The root `CNAME` file is what told GitHub Pages to serve `naathconnect.com`.
2. `.github/workflows/release.yml` — on push to `main`, created a calendar version tag `vYYYY.M.N` and a GitHub Release. Release notes still described money transfers.
3. `.github/workflows/rollback.yml` — manual. It checked out a tag and force-pushed that tree to `gh-pages`.

No preview environment, no server, and no database were part of that setup. Local development was `python -m http.server`.

## Why the new site cannot stay on GitHub Pages alone

The revamp needs accounts, an admin approval queue, a directory, events, view counts, and reactions. GitHub Pages only serves files. It cannot run the Next.js server or Postgres.

Recommended production shape, **not created by this PR**:

- **Next.js** (App Router) on **Vercel’s free tier**, which runs a Node server and can attach a custom domain later.
- **Supabase free tier** for Postgres, Auth, and row-level security. Schema is in `supabase/migrations/001_init.sql`.
- The local preview uses **Node’s built-in SQLite** (`node:sqlite`) so the branch can be reviewed with no new account, no secrets, and no change to production config. Leave `NEXT_PUBLIC_SUPABASE_URL` empty for that mode. See `.env.example`.

Supabase and Vercel both publish a free tier that can hold a small directory. The caps change. Tango should read the current limits before relying on them. This PR does not create either account and does not put a card on file.

GitHub Pages can stay as a historical host until he decides. It cannot be the host for this app. The deploy workflow on this branch refuses to run so a merge does not copy the Next.js source onto `gh-pages`.

## What has to happen before the public site can load

1. **Tango registers `naathconnect.com`** (or confirms a different name) at a registrar he controls and pays the annual fee. Nobody on this branch can or should do that.
2. **Tango chooses the host** and logs in. Suggested: a Supabase project and a Vercel project, both on the free tier, under an account he owns.
3. **Tango applies the SQL migration**, creates his auth user, and promotes that row to `role = 'admin'` and `status = 'approved'` (the statement is at the top of the migration). He sets `VIEW_SIGNING_SECRET` in the host and the same value in `naath_private.secrets`.
4. **Tango points DNS** at the new host only after the app is deployed to a project he approved. The old GitHub Pages custom domain should not be the target of that DNS unless he is intentionally putting the static site back.
5. **Tango says the production deploy is allowed.** Until then this branch stays a pull request. It is not merged and it is not deployed to `naathconnect.com`.
6. Replace placeholder directory rows, Gatbel’s placeholder photos and biography, and the placeholder contact block before asking search engines to index anything. The preview sends `noindex`.

## What this pull request changes, and what it does not

Changes:

- Writes this diagnosis.
- Moves the old static site to `legacy/` so it is still in the repo.
- Adds the Next.js preview: consulting copy, directory, onboarding, events, reactions, admin review, and consultation sections that an admin can extend from approved professionals.
- Freezes the automatic GitHub Pages deploy and the automatic release workflow on this branch.

Does not:

- Register or renew the domain.
- Change DNS records.
- Change GitHub Pages settings (the 301 from `github.io` to the apex is unchanged).
- Create a Vercel or Supabase project, or any paid account.
- Merge to `main` or deploy to the production domain.
- Invent testimonials, client counts, phone numbers, emails, or a street address.

There is no preview URL. A throwaway deploy would need a new host account or a change to the production Pages site. Both are out of bounds.

## Open questions for Tango

1. **Domain.** Re-register `naathconnect.com`, or use another name? Who is the registrant and which registrar? The name is not reserved by this work.
2. **GitHub Pages.** Leave the custom domain attached (so `github.io` keeps redirecting at the dead apex), or remove it so the old static URL works again on `github.io`? Removing it is a hosting change and was not done.
3. **Host.** Approve Supabase + Vercel on the free tier, or name another host? Who logs in, and is a card allowed on the account even if the tier is free?
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
