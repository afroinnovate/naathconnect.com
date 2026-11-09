# How changes ship

Every change is a short-lived branch and a pull request into `main`. The pull request’s Amplify preview is the place to look at the work. There is no separate dev site. Merging to `main` is what updates production.

This file describes that flow. It does not turn on branch protection, Amplify previews, DNS, or billing.

## The flow

1. Branch off the latest `main`. Keep the branch short.
2. Open a pull request into `main`.
3. GitHub Actions runs the CI checks named below. They have to pass.
4. Amplify builds a preview for that pull request. The URL looks like `https://pr-<number>.d3r9dhrzrtpx2p.amplifyapp.com`. Open it and click through the change.
5. Someone reviews the pull request.
6. Merge to `main`. Amplify’s build of `main` is the production deploy.
7. Delete the branch. Amplify deletes the preview when the pull request closes.

The Amplify app is `naathconnect` (`d3r9dhrzrtpx2p`, `us-east-2`). Pull request #10 merged the first preview into `main` before the redesign. This pull request carries the redesign, the unindexed launch, and these CI checks, and it targets `main`. Production updates when Amplify is connected to `main` and this pull request merges. Connecting that branch is done in the Amplify console, not in this repository.

GitHub Pages is not part of this flow. `.github/workflows/deploy.yml` is removed, and `.github/workflows/rollback.yml` refuses to run, so neither can publish `gh-pages`. The release workflow is manual and does not deploy the site.

## Checks on every pull request and on main

Workflow: `.github/workflows/ci.yml`, name `CI`. It runs on pull requests to `main` and on pushes to `main`.

| Check on the pull request | What it runs |
| --- | --- |
| `CI / install` | `npm ci` on Node 22 |
| `CI / lint` | `npm run lint` (ESLint) |
| `CI / typecheck` | `npm run typecheck` |
| `CI / unit tests` | `npm test` |
| `CI / build` | `npm run build` |

Unit tests are already in `tests/`. They cover approvals, view dedupe, reactions, the service headlines, the consultation placeholders, gallery paths, event times, and the rule that Amplify does not fall through to SQLite.

The workflow runs on pull requests into `main` and on pushes to `main`. It does not run while a pull request targets another branch.

## Amplify pull request previews

Tango turns this on in the Amplify console. Nothing in this repository calls Amplify.

1. Open Amplify in `us-east-2`, app `naathconnect` (`d3r9dhrzrtpx2p`).
2. Connect the `main` branch if it is not connected yet, with auto-build on. That branch is production. A push to `main`, including a merge, builds production.
3. App settings → Previews → enable pull request previews for the `main` branch. Amplify then builds each pull request that targets `main`.
4. Put these environment variables on the `main` branch so previews inherit them. Do not give previews a different database unless you later choose Supabase branching.

| Name | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project `tzjuxxoeoeiawszomylj` → Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → `anon` `public` key. Not the `service_role` key |
| `VIEW_SIGNING_SECRET` | The same string stored in `naath_private.secrets` where `name` is `view_hmac` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Public origin for `metadataBase`. On Amplify `main`, empty defaults to `https://naathconnect.com`. `www.naathconnect.com` redirects to the apex |
| `ALLOW_INDEXING` | Leave unset. `robots.txt`, the robots meta tag, and `X-Robots-Tag` stay `noindex` until this is the exact string `true` |

Do not set `DEMO_SESSION_SECRET`, `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, or `DEMO_PROFESSIONAL_PASSWORD` on Amplify. `AWS_APP_ID` or `AWS_BRANCH` turns demo mode off.

`NEXT_PUBLIC_*` values are baked in at build time. Changing them means a new Amplify build.

5. In Supabase → Authentication → URL configuration, add this redirect URL so every preview of this app can finish login:

`https://*.d3r9dhrzrtpx2p.amplifyapp.com/**`

Also keep the current branch preview if it is still in use:

`https://cursor-site-diagnosis-revamp-bb61.d3r9dhrzrtpx2p.amplifyapp.com/**`

And local work:

`http://localhost:3000/**`

When the public name is ready, add `https://naathconnect.com/**` and `https://www.naathconnect.com/**`. Do not change Cloudflare DNS as part of turning previews on.

## One Supabase database

Project `tzjuxxoeoeiawszomylj` is the only database. Pull request previews and production both talk to it.

That is the right cost for now, and it has a real risk. A form submitted on a preview URL writes a real row. Approving or rejecting on a preview changes the same directory and the same events that production shows. A preview cannot be treated as a sandbox.

What keeps that tolerable:

- The app does not run SQL migrations during a build. Schema changes stay a reviewed SQL script, applied by hand in the Supabase SQL editor, not by a preview.
- The local SQLite seed, including `placeholder-admin@example.invalid`, is not loaded into Supabase.
- Test on a preview with an obvious address such as `preview-test@example.invalid`, then delete that row.
- Do not point a preview at a migration that drops or rewrites tables.

Supabase database branching is the isolated alternative. It is not on the Free plan. It needs the Pro plan at $25 a month, and each preview branch is about $0.01344 per hour on the default Micro size (about $0.32 per day, about $10 if a branch is left up for a month). Branch compute is outside the spend cap, so a forgotten branch keeps billing. Supabase’s own price list: [supabase.com/pricing](https://supabase.com/pricing) and [branching usage](https://supabase.com/docs/guides/platform/manage-your-usage/branching).

Recommendation: keep the single free project until real applications are in it. Then, if preview writes become a problem, move to Pro and turn on short-lived branches that die when the pull request closes. Do not turn that on as part of this change.

## Branch protection for main

These settings are not applied. Tango runs the command below only after he wants `main` locked, and after the five checks have shown up on a pull request into `main` at least once. GitHub will not require a check it has never seen.

The settings:

- Pull request required before merging.
- One approving review.
- Stale reviews dismissed when new commits are pushed.
- The five checks above are required, and the branch must be up to date with `main`.
- Force pushes are off.
- Deleting `main` is off.
- Review conversations must be resolved.
- Administrators are included, so an admin cannot skip the checks. Change `enforce_admins` to `false` first if Tango wants an emergency bypass.

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/afroinnovate/naathconnect.com/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "CI / install"},
      {"context": "CI / lint"},
      {"context": "CI / typecheck"},
      {"context": "CI / unit tests"},
      {"context": "CI / build"}
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF
```

If GitHub answers that `checks` is not accepted, send the same five strings in `required_status_checks.contexts` instead. The names must match the Checks tab exactly. If the tab shows a different string, use that string.

This repository is public, so classic branch protection is available. The command changes repository settings. It was not run from this pull request.

## What it costs

Prices below are the vendors’ public rates as of 2026-11-09. Confirm them before relying on a bill. Nothing here turns on a paid product.

**Amplify Hosting** ([aws.amazon.com/amplify/pricing](https://aws.amazon.com/amplify/pricing/)). No monthly minimum. The standard build machine is $0.01 per minute, with 1,000 build minutes a month at no cost. A preview is another build of the same app, so it spends those minutes. Hosting the preview counts toward the same app: 5 GB stored and 15 GB served at no cost, then $0.023 per GB-month and $0.15 per GB. Server-rendered requests are $0.30 per million after 500,000 a month, and request duration is $0.20 per GB-hour after 100 GB-hours. A quiet community site with a handful of pull requests stays inside the free allowances. The optional firewall is $15 per app per month and is not required for this flow.

**GitHub Actions.** This repository is public. Standard GitHub-hosted runners on public repositories are free, including these five jobs ([GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). If the repository is made private, the `afroinnovate` organization plan matters. GitHub Free for organizations includes $12 of Actions compute a month, which is about 2,000 minutes on a standard Linux runner at $0.006 a minute. GitHub Team includes $18, about 3,000 minutes. One run of this workflow is well under that for a normal month of small pull requests. Larger runners are billed even on public repositories. This workflow uses the standard `ubuntu-latest` runner.

**Supabase.** The free project is $0 and is the shared database above. Branching is not included. Pro is $25 a month, plus about $0.01344 per hour for each preview branch. That is the isolated option, not the one to start with.
