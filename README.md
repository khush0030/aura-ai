# ✦ Aura AI

**Personalised AI dating conversation coach — iOS app**

Aura AI helps users craft messages that sound like *them* — not generic AI slop. It learns your communication style during onboarding and uses that profile to generate replies, openers, and profile copy on your best day.

---

## Features

| Feature | What it does |
|---|---|
| **Chat Reply** | Upload a chat screenshot → GPT-4o reads the conversation → Claude generates 3 replies (Warm / Playful / Bold) |
| **Bio Analyser** | Paste a match's bio → extract conversation hooks → generate 3 personalised openers |
| **Profile Optimiser** | Paste your bio → get a rewritten version + 3 alternative hooks + "why it works" |
| **Pickup Lines** | Generate 5 personalised lines in Funny / Smooth / Bold mode |

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Expo + React Native (managed workflow, iOS first) |
| Navigation | Expo Router (file-based) |
| Backend / Auth / DB | Supabase |
| AI — Text | Claude Haiku 3.5 (`claude-haiku-4-5`) |
| AI — Vision (OCR) | GPT-4o Vision (reads chat screenshots) |
| API Proxy | Supabase Edge Function (API keys never in app bundle) |
| Build | Expo EAS (TestFlight + App Store) |

---

## Project Structure

```
aura-ai/
├── app/
│   ├── splash.tsx              # Landing screen (Get Started / Log In)
│   ├── onboarding.tsx          # 5-step tone profile quiz
│   ├── (auth)/                 # Login + Signup screens
│   └── (tabs)/
│       ├── home.tsx            # Dashboard with 4 feature tiles
│       ├── coach.tsx           # Chat Reply (screenshot + text)
│       ├── bio.tsx             # Bio Analyser + Opener Generator
│       ├── optimise.tsx        # Profile Optimiser
│       ├── pickup.tsx          # Pickup Lines Generator
│       └── profile.tsx         # Tone profile + settings
├── components/                 # OpenerCard, HookChip, LoadingSkeleton, UsageBanner
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── api.ts                  # All edge function calls (typed)
│   └── prompts.ts              # Claude prompt templates
├── supabase/functions/generate/ # Edge function — JWT auth, usage gate, AI calls
└── constants/                  # copy.ts, toneOptions.ts
```

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/khush0030/aura-ai.git
cd aura-ai
npm install
```

### 2. Create Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then run this SQL in the SQL editor:

```sql
-- Tone profiles
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

-- Usage tracking
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.tone_profiles enable row level security;
alter table public.usage_logs enable row level security;

create policy "Users manage own tone profile" on public.tone_profiles
  for all using (auth.uid() = user_id);

create policy "Users manage own usage logs" on public.usage_logs
  for all using (auth.uid() = user_id);
```

### 3. Environment variables

Copy `.env.example` to `.env` and fill in:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Deploy the Edge Function

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy generate
```

Then add secrets in **Supabase Dashboard → Settings → Edge Functions**:
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `OPENAI_API_KEY` — from [platform.openai.com](https://platform.openai.com) (needed for screenshot OCR)

### 5. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your iPhone.

---

## App Store Compliance

- Age rating: **17+**
- Privacy Policy must be linked in-app (Profile tab) before submission
- Sign in with Apple required for App Store build
- All Claude prompts include: *"Never generate sexual, explicit, offensive, or hateful content under any circumstances."*

---

## Roadmap

**v1 (current)** — Chat Reply, Bio Analyser, Profile Optimiser, Pickup Lines, freemium (10/day)

**v1.1** — In-app payments (RevenueCat), reply history, Android build, push notifications

---

## Web Preview

https://aura-3f79ef85l-oltaflock-ai.vercel.app *(web render — for layout preview only)*
