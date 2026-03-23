# Aura AI — Full Setup Guide

End-to-end instructions from zero to TestFlight.

---

## Prerequisites

- Node.js 18+
- EAS CLI (`npm install -g eas-cli`)
- Supabase CLI (`npm install -g supabase`)
- Apple Developer account (for TestFlight/App Store)
- Accounts: Supabase, Anthropic, OpenAI, PostHog, Sentry

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/khush0030/aura-ai.git
cd aura-ai
npm install
```

---

## Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy **Project URL** and **Anon Key** from Settings → API
3. Run DB migrations in SQL Editor:

```sql
create table public.tone_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  communication_style text,
  humor_level text,
  energy_level text,
  intent text,
  sample_phrase text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null,
  created_at timestamptz default now()
);

alter table public.tone_profiles enable row level security;
alter table public.usage_logs enable row level security;

create policy "Users manage own tone profile" on public.tone_profiles
  for all using (auth.uid() = user_id);

create policy "Users manage own usage logs" on public.usage_logs
  for all using (auth.uid() = user_id);

create index usage_logs_user_date on public.usage_logs(user_id, created_at);
```

4. Add edge function secrets in **Settings → Edge Functions**:
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`

---

## Step 3 — Environment Variables

```bash
cp .env.example .env
```

Fill in `.env` (never commit this file):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_POSTHOG_KEY=phc_your_key
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io
```

---

## Step 4 — Deploy Edge Function

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy generate
```

---

## Step 5 — Run Locally

```bash
npx expo start
```

---

## Step 6 — TestFlight Build

```bash
eas login
eas build --platform ios --profile preview
eas submit --platform ios --latest
```

---

## Step 7 — App Store Submission

1. Complete App Store Connect listing (see `APP_STORE_LISTING.md`)
2. Upload screenshots (6.7 inch, 1290x2796px)
3. Upload app icon (1024x1024px PNG, no alpha)
4. Set age rating to **17+**
5. Add Privacy Policy URL and Terms URL
6. Add demo account credentials **directly in App Store Connect reviewer notes** — never in code
7. Build and submit:

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

---

## Key URLs

| Resource | URL |
|---|---|
| GitHub | https://github.com/khush0030/aura-ai |
| Privacy Policy | https://aura-ai-legal-96mzs3x9f-oltaflock-ai.vercel.app#privacy |
| Terms of Service | https://aura-ai-legal-96mzs3x9f-oltaflock-ai.vercel.app#terms |
