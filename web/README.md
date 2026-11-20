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

The dashboard requires a valid Supabase session. New accounts create their first household during onboarding. Products, shopping items, recipes, favorites, and cooking history are shared within a household. Diet and other preferences belong to the signed-in user. Household invitations create a link for the specified email; Fridgy does not send invitation emails yet. Receipt scans analyze images, and confirmed products are added to the shared inventory without storing the receipt.

## Subscription UI

The public pricing page is `/cennik`; plan management is at
`/dashboard/ustawienia?tab=billing`. Prices, limits, trial length and the usage
warning threshold live in `lib/subscription.ts`. Trial access lasts 14 days,
requires no card and ends on Free unless Premium is purchased. Each household
has its own subscription and shared allowances, managed by its owner.

This is presentation only: `SubscriptionProvider` currently uses the Free
snapshot with unknown usage, and does not save subscription changes or enforce
limits. Supply a server-owned `SubscriptionView` and an `onAction` handler when
connecting Stripe. Until then, billing actions show the normal error state
without claiming a successful payment or plan change. Payment details and
invoices are displayed only for owners; backend authorization must also enforce
this when billing is connected.

In development, `/dev/subscriptions` previews all subscription states, usage
warnings, empty history, monthly/annual billing and owner/member views without
an account. This route returns 404 outside development. It never changes data.

Downgrading keeps recipes, inventory, shopping lists and existing members'
access. Above the Free limits, new recipes or members require available space
or Premium. Monthly allowances reset on the billing cycle date, including for
annual subscriptions; unused allowance does not roll over. The Free AI allowance
does not reset. The billing service must supply the actual reset and access-end
timestamps, including for short months and leap years.

## Public contact and legal details

Copy the public business variables from `.env.example` into `.env.local` for
development and into your hosting environment for deployment. The examples are
placeholders: replace them with the actual provider's details before publishing.
`lib/site-config.ts` is the single source read by the contact page, privacy policy
and terms. It reads environment values on the server and validates email and date
formats. No `NEXT_PUBLIC_` prefix is needed.

| Variable | Used for |
| --- | --- |
| `CONTACT_EMAIL` | Email shown on contact and legal pages, including their email links |
| `LEGAL_ENTITY_NAME` | Full legal name of the provider and data controller |
| `LEGAL_ENTITY_ADDRESS` | Postal address for correspondence |
| `CONTACT_PHONE` | Optional phone number |
| `LEGAL_TAX_ID` | Optional tax identifier, such as NIP |
| `LEGAL_REGISTER_ID` | Optional register entry, such as KRS |
| `LEGAL_UPDATED_AT` | Document update date in `YYYY-MM-DD` format |
| `LEGAL_PROCESSORS` | Names of the actual infrastructure, AI and payment providers |

To change the email after launch, update `CONTACT_EMAIL` in your hosting settings
and redeploy. You do not need a code change. All references on these pages use the
new value. Optional empty details are omitted. In local development without an
email, legal pages link to the contact form.

The legal copy is available in all five app languages. Review the final provider
details, processor arrangements, applicable markets and legal wording before
publication. Allergy preferences can reveal health data; the current settings
flow does not record separate explicit consent, so that flow needs review against
GDPR Article 9 before collecting such data in production. Editing policy text
does not add a consent mechanism or connect the subscription/contact backends.

## Marketing pages and media

The public pages share `components/marketing/public-shell.tsx` and the styles in
`app/marketing.css`. The landing page uses the Magic UI Typing Animation component
with a static accessible heading and support for reduced motion. The product
preview is an illustration using sample groceries, rather than a customer account
or a claim about customer results.

The product demo uses the [Magic UI Safari](https://magicui.design/docs/components/safari)
frame with responsive HTML content. Steps advance every 5 seconds by default;
the active step has a progress bar. Pause or select a step for manual viewing.
Reduced motion disables autoplay and the progress animation.

Hero cards enter in sequence and gently drift once, settling within five seconds.
The final CTA animates once as it enters the viewport and stays visible without
JavaScript. Both animations respect reduced motion.

The walkthrough in `components/marketing/product-walkthrough.tsx` uses enlarged
HTML interface cards: receipt review, inventory updates and recipe matching.
Checkmarks, rows and a decorative cursor animate during playback. Pausing or
selecting a step shows its completed state. Reduced motion shows static cards.
The earlier generated photo concept is archived in `docs/assets/demo-photos/`
and is not loaded by the landing page. The hero keeps its original visuals.

The public navbar uses [Aceternity Liquid Glass](https://ui.aceternity.com/components/liquid-glass)
from `components/ui/liquid-glass.tsx`. Chromium uses refraction; Safari and Firefox
use frosted glass. Reduced transparency uses an opaque surface.

The main conversion goal is a free account. The page shows receipt → inventory →
recipe, with one short explanation per step. The plan comparison keeps its prices
and limits in `lib/subscription.ts`. Copy follows the
[Copywriting skill](https://skills.sh/coreyhaines31/marketingskills/copywriting).

### Assets to prepare

1. **Main product demo, 20–30 seconds, 16:9.** Record the real web app with a sample
   household. Show adding a receipt, reviewing products, picking an ingredient to
   use first, and opening a matching recipe. Use readable screen text, small zooms
   around clicks and clear cuts when skipping a wait. End on the free-account CTA.
2. **Cover image, 1920 × 1080 WebP.** Take a clean frame showing the inventory and
   the matching recipe. Keep important content away from the outer edges.
3. **Captions, WebVTT.** Add Polish captions if the video has speech. The illustrated
   preview already follows the visitor's selected language. The first recorded
   video and caption slot are Polish; localize the recording for other campaigns.
4. **Two vertical ads, 12–18 seconds, 9:16.** First angle: spinach waiting in the
   fridge → choose it in Fridgy → a recipe. Second angle: groceries → receipt scan
   → organised inventory. Put the benefit in the first frame and the signup CTA
   in the final frame. Keep the UI large enough to read on a phone.
5. **Optional kitchen footage, 2–3 seconds per shot.** Opening the fridge, putting
   groceries on the counter, or serving the final meal. Use your own footage or
   create these short inserts with [Higgsfield](https://higgsfield.ai/). Record the
   actual app screens yourself so the interface and feature behaviour stay exact.

Example prompt for a kitchen insert:

> Close-up of a hand opening a refrigerator in a bright, lived-in home kitchen.
> Fresh spinach and cream are visible. Natural window light, gentle handheld
> movement, vertical 9:16 framing, realistic food and hands. Keep the frame free
> of logos, captions and app screens. Duration: 3 seconds.

### Replacing the illustrated demo with a recording

Put the files in `public/marketing/`, then set the paths in
`lib/marketing-media.ts`:

```ts
export const MARKETING_MEDIA = {
  demoVideo: "/marketing/fridgy-demo.mp4",
  demoPoster: "/marketing/fridgy-demo.webp",
  demoCaptions: "/marketing/fridgy-demo.pl.vtt",
};
```

The demo area then uses a native video player with controls. While `demoVideo` is
empty, visitors see an automatic three-step preview and can pause it or select a step. The preview does not upload receipts or call AI. Aim for a compressed
video of a few MB and a small WebP poster. Check the full video on a phone before
using it in ads.

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

GitHub Actions runs these checks for web changes. Production deployment through that workflow is optional: add repository variables `VERCEL_DEPLOY_ENABLED=true`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and repository secret `VERCEL_TOKEN`. If your Vercel project already deploys from Git, leave `VERCEL_DEPLOY_ENABLED` unset to avoid duplicate deployments. Configure the three Supabase variables in Vercel for either deployment method.
