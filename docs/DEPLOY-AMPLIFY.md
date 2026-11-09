# Deploy the preview on AWS Amplify

Tango chose Amplify Hosting for this Next.js app and the Supabase free tier for the database and logins. DNS stays in his Cloudflare account. This file is the checklist. It does not create the Amplify app, the Supabase project, or any DNS record.

The branch is `cursor/site-diagnosis-revamp-bb61`. Pull request: https://github.com/afroinnovate/naathconnect.com/pull/10

`amplify.yml` builds with Node 22, `npm ci`, and `npm run build`. Artifacts come from `.next` so Amplify treats the app as SSR (WEB_COMPUTE), not as a static export. Do not set `output: 'export'` in `next.config.ts`.

## What was checked against Amplify

Amplify Hosting compute supports Next.js 12 through 15, including the App Router, server-side rendering, middleware, image optimization, and environment variables. It does not support Edge API routes or Edge middleware. Source: [Amplify support for Next.js](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html).

| Piece in this repo | Amplify | What we did |
| --- | --- | --- |
| Server actions in `app/actions.ts` | Part of the Next.js 15 App Router on Amplify compute | Left on the Node server. No `runtime = "edge"`. |
| `middleware.ts` | Middleware is supported. Edge middleware is not | `export const runtime = "nodejs"` so Next 15.5 keeps it off the edge bundle |
| Supabase cookies | Needs a Node server that can read and set cookies | `@supabase/ssr` uses `cookies()` from `next/headers` in server code, and `NextRequest` / `NextResponse` in middleware. Cookies are set on the Amplify host, not on `supabase.co` |
| Edge runtime | Unsupported | No route, layout, or action sets `runtime = "edge"` |
| `node:sqlite` demo | Not a serverless runtime | The demo loads that builtin through a computed `require`, so the production bundle does not contain `require("node:sqlite")`. On Amplify (`AWS_APP_ID` or `AWS_BRANCH`) demo mode is off and Supabase is required |

Also unused, and listed as unsupported by Amplify, so they are not a problem here: on-demand ISR, Next.js streaming, and `unstable_after`. Pages use normal `<img>` tags, not `next/image`.

Node 18 and older cannot build an Amplify SSR app. The build spec installs Node 22, which Amplify compute will then match at runtime.

## Environment variables

Set these in the Amplify console for this branch before the first build: App settings → Environment variables. `NEXT_PUBLIC_*` values are copied into the browser bundle at build time. Changing them later requires a new build.

Do not set `DEMO_SESSION_SECRET`, `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, or `DEMO_PROFESSIONAL_PASSWORD` on Amplify. Do not put the Supabase service-role key in any variable, and never in a `NEXT_PUBLIC_` name.

| Name | Required on Amplify | Where the value comes from |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase dashboard → Project Settings → Data API → Project URL. It looks like `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Same page → Project API keys → `anon` `public`. This key is meant for the browser. It is not the `service_role` key |
| `VIEW_SIGNING_SECRET` | Yes | A long random string Tango generates (for example `openssl rand -hex 32`). The same string is inserted into the database as `naath_private.secrets` where `name` is `view_hmac`. The app and the database must match or public view counts stay at the previous total |

`AWS_APP_ID`, `AWS_BRANCH`, and `AWS_COMMIT_ID` are set by Amplify itself. Do not add them by hand.

## Create the Supabase free project

Tango does this in his own Supabase account. This repository does not call the Supabase API.

1. Sign in at [supabase.com](https://supabase.com) and create a project on the Free plan. Free allows two active projects, a 500 MB database, and 50,000 monthly active users. A free project pauses after a week with no activity. Pausing takes the directory and logins down until someone resumes it in the dashboard.
2. Wait until the project status is healthy.
3. Open the SQL editor. Paste the full text of `supabase/migrations/001_init.sql` and run it once. That creates the tables, row-level security, and the view-count function.
4. Generate the view secret and store it in both places:

```sql
insert into naath_private.secrets (name, value)
values ('view_hmac', 'paste-the-same-string-as-VIEW_SIGNING_SECRET')
on conflict (name) do update set value = excluded.value;
```

5. Copy the project URL and the anon key into the Amplify environment variables above.
6. Authentication → Sign In / Providers → Email. For the first admin, either turn off “Confirm email” until he has signed in once, or leave it on and confirm the user from Authentication → Users. Turn confirmations back on if he wants them after that.
7. Create the admin user from the app’s `/onboarding` page on the Amplify URL, or from Authentication → Users → Add user, using his real email and a password he chooses. Then promote that row. Replace the email in this statement. Do not promote `placeholder-admin@example.invalid`. That address exists only in the local demo.

```sql
update public.profiles
set role = 'admin',
    status = 'approved',
    full_name = 'Tango Tew',
    reviewed_at = now()
where email = 'tango-real-email@example.com';
```

If the profile row is missing, the signup trigger did not run. Check that `001_init.sql` finished, then sign up again. The promote statement only updates a row that already exists.

## Supabase Auth URLs for the Amplify preview

Amplify assigns the URL after the app is connected. Do not invent the app id. The shape is:

`https://<sanitized-branch>.<app-id>.amplifyapp.com`

This branch is `cursor/site-diagnosis-revamp-bb61`. Amplify has to sanitize the slash in that name. Copy the URL from the Amplify console (Hosting → the branch) after the first successful build.

In Supabase → Authentication → URL configuration:

- Site URL: that exact `https://….amplifyapp.com` URL
- Redirect URLs, one per line:
  - `https://<the-exact-branch-host>.amplifyapp.com/**`
  - `https://*.amplifyapp.com/**` so a later branch preview can sign in without another edit
  - `http://localhost:3000/**` for local `npm run dev` against this same project

The app sets its own session cookies on the Amplify host. The Supabase project URL stays `https://<project-ref>.supabase.co`. Those are different hosts on purpose. Do not put the Supabase URL in the Site URL field.

Save the URL settings before trying to log in on the preview. If email confirmation is on, the message link uses the Site URL.

## Connect Amplify (when Tango does it)

He does this in the AWS console. Nothing here calls Amplify.

1. Amplify → Create new app → Host web app → GitHub → `afroinnovate/naathconnect.com`.
2. Branch: `cursor/site-diagnosis-revamp-bb61`. Amplify should detect `amplify.yml`. The service role / platform for this app must be Hosting compute (SSR), not a static-only site.
3. Add the three environment variables before the first build.
4. Start the build. When it is green, open the `amplifyapp.com` URL and sign in with the promoted admin. The amber “preview only” banner should be gone, because that banner is the local SQLite demo.
5. Submit a test application, approve it, and delete that test row in the SQL editor when finished.

A failed build that mentions `node:sqlite` means an old commit was built. This branch does not static-link that module.

## Later: Cloudflare DNS for the real domain

Do not do this while reviewing the Amplify preview. The apex currently has no A or AAAA record, and `www` is not in the zone. Leave it that way until the `amplifyapp.com` preview is accepted.

When Tango says the public name can move:

1. In Amplify, add the custom domains `naathconnect.com` and `www.naathconnect.com`. Amplify shows the certificate check and the exact CNAME target. Copy that target. Do not guess a CloudFront hostname.
2. In Cloudflare DNS for `naathconnect.com`, add only the records Amplify lists. They are CNAMEs. Set each record to **DNS only** (grey cloud), not Proxied. An orange-cloud proxy hides the name from Amplify’s certificate check and can loop redirects.
3. Cloudflare flattens a CNAME at the apex, so the apex record can be a CNAME. If Amplify asks for `www` and the apex separately, add both, both grey-cloud.
4. Do not add GitHub Pages A records (`185.199.108.153` and the three addresses next to it). Those would publish the old static site.
5. Wait until `https://naathconnect.com` serves this app. Then add `https://naathconnect.com/**` and `https://www.naathconnect.com/**` to the Supabase redirect URLs, and set the Site URL to the public name he wants people to see.
6. In GitHub, remove the Pages custom domain `naathconnect.com`, and turn Pages off if `afroinnovate.github.io` should not keep serving the old files or redirecting to the apex.
7. Merging pull request 10 is a separate approval. The Pages workflow on this branch still refuses to publish `gh-pages`.
