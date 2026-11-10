# Fridgy web

The Next.js web application for Fridgy. It uses the App Router, TypeScript, and pnpm.

## Requirements

- Node.js 22.18 or newer
- pnpm 10.6.5

## Development

```bash
pnpm install
cp .env.example .env.local
# Fill in the Supabase and OpenAI values in .env.local.
pnpm dev
```

Open `http://localhost:3000`.

## Supabase authentication

Set the following in `.env.local` and in the Vercel project's environment variables:

| Variable | Where to find it | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Supabase client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | Server-only account deletion |
| `OPENAI_API_KEY` | OpenAI Platform → API keys | Server-only recipe generation and receipt scanning |

Never prefix the service role key with `NEXT_PUBLIC_` or expose it in browser code.
Keep `OPENAI_API_KEY` server-only as well. Apply the migrations in `supabase/migrations/` in filename order. `202611090004_households_and_demo_data.sql` adds household switching, recipes shared with household members and removable sample data.
`202611100001_daily_recipe_ideas.sql` adds the daily dashboard recipe cache. It allows one AI attempt per user, active household and Warsaw calendar day; failed attempts are not retried that day.

Run [`../supabase/migrations/202610140001_initial_schema.sql`](../supabase/migrations/202610140001_initial_schema.sql) in the Supabase SQL Editor before opening the dashboard. It creates the tables, RLS policies, receipt and cooking transactions, and a trigger that creates the first household for every new user. After migration `202611090004`, new accounts receive five sample products, three shopping items and three sample recipes. When adding another household, the user chooses whether to add sample products and shopping items; the default is an empty start. Migration `004` also adds sample recipes for existing users. Keep migrations in source control; do not run them twice manually.

In Supabase Dashboard:

1. In **Authentication → URL Configuration**, set the local Site URL to
   `http://localhost:3000` and add
   `http://localhost:3000/auth/callback` to Redirect URLs. Add the equivalent
   production URL before deployment.
2. In **Authentication → Email Templates → Magic Link**, include `{{ .Token }}`
   in the message so users receive the six-digit code used by the login form.
3. Enable the Google provider and configure its Client ID and Client Secret.
   Add the Supabase callback URL displayed on that provider page to the Google
   OAuth client.

The dashboard requires a valid Supabase session. Products, shopping items, recipes, favorites, and cooking history are shared within a household. Diet and other preferences belong to the signed-in user. Household invitations create a link for the specified email; Fridgy does not send invitation emails yet. Receipt scans analyze images, and confirmed products are added to the shared inventory without storing the receipt.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

GitHub Actions runs these checks for web changes. Production deployment through that workflow is optional: add repository variables `VERCEL_DEPLOY_ENABLED=true`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and repository secret `VERCEL_TOKEN`. If your Vercel project already deploys from Git, leave `VERCEL_DEPLOY_ENABLED` unset to avoid duplicate deployments. Configure the three Supabase variables in Vercel for either deployment method.
