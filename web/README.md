# Fridgy web

The Next.js web application for Fridgy. It uses the App Router, TypeScript, and pnpm.

## Requirements

- Node.js 20.9 or newer
- pnpm 10.6.5

## Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Supabase authentication

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in
`.env.local`.

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

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```
