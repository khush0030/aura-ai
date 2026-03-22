# Aura AI — Claude Code Instructions

You are the sole engineer on Aura AI, an iOS dating conversation assistant built with Expo + React Native. The founder is a solo non-technical builder. Your job is to ship a working, App Store-ready app in 4 weeks. You write the code, debug errors, design the data schema, and engineer the AI prompts. Operate with zero hand-holding — read the context, make smart decisions, and build.

## What We're Building

Aura AI helps users craft personalised, context-aware dating messages that sound like them — not generic AI slop.

Three core features for v1:
1. **Tone Profile** — onboarding quiz that captures the user's communication style
2. **Bio Analyser** — paste a match's profile bio, extract conversation hooks, generate personalised openers
3. **Conversation Coach** — paste a full chat thread, get 3 contextually aware reply suggestions

**What we are NOT building in v1:** payments/paywall, humor mode selector, screenshot OCR, social login, Android build. Do not add scope. If something isn't in the three features above, ask before building it.

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Expo + React Native (managed workflow) | iOS only for v1 |
| Backend | Supabase | Auth, Postgres DB, Edge Functions |
| AI Engine | Claude Haiku 3.5 (claude-haiku-4-5) | Fastest + cheapest. Use for all AI calls |
| API Proxy | Supabase Edge Function | NEVER call Anthropic API directly from the app |
| Build | Expo EAS | For TestFlight and App Store builds |
| Navigation | Expo Router | File-based routing |
| State | React Context + useState | No Redux — keep it simple |

## Project Structure

```
aura-ai/
├── app/                    # Expo Router screens
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── index.tsx       # Bio Analyser + Opener Generator (Home)
│   │   ├── coach.tsx       # Conversation Coach
│   │   └── profile.tsx     # Tone Profile + settings
│   └── onboarding.tsx      # First-time tone quiz
├── components/             # Reusable UI components
│   ├── OpenerCard.tsx
│   ├── HookChip.tsx
│   ├── LoadingSkeleton.tsx
│   └── UsageBanner.tsx
├── lib/
│   ├── supabase.ts         # Supabase client init
│   ├── api.ts              # All calls to our Supabase Edge Functions
│   └── prompts.ts          # All Claude prompt templates (source of truth)
├── supabase/
│   └── functions/
│       └── generate/       # Edge function: receives requests, calls Claude API
│           └── index.ts
├── constants/
│   └── toneOptions.ts      # Tone quiz questions + answer options
├── .env                    # API keys — NEVER commit this
└── CLAUDE.md               # This file
```

## Database Schema

Run these migrations in Supabase SQL editor on Day 1:

```sql
-- User tone profiles
create table public.tone_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  communication_style text,  -- 'casual' | 'confident' | 'witty' | 'chill'
  humor_level text,          -- 'dry' | 'playful' | 'none'
  energy_level text,         -- 'high' | 'medium' | 'low'
  sample_phrase text,        -- optional free-text the user types themselves
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usage tracking (for daily limit enforcement)
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  feature text not null,     -- 'opener' | 'coach' | 'bio_analyse'
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.tone_profiles enable row level security;
alter table public.usage_logs enable row level security;

create policy "Users manage own tone profile"
  on public.tone_profiles for all
  using (auth.uid() = user_id);

create policy "Users manage own usage logs"
  on public.usage_logs for all
  using (auth.uid() = user_id);
```

## Environment Variables

```
# .env — never commit, never log, never expose in app bundle
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key  # Only used in Supabase Edge Function
```

The ANTHROPIC_API_KEY lives ONLY in Supabase Edge Function secrets. It must never appear in the Expo app bundle.

## AI Prompt Architecture

All prompt templates live in `lib/prompts.ts`. This is our competitive moat — treat prompt quality with the same rigour as code quality.

```typescript
export function buildOpenerPrompt(toneProfile: ToneProfile, matchBio: string, hooks: string[]): string {
  return `You are a dating message assistant helping someone craft opening messages that sound like them.
Never generate sexual, explicit, or offensive content under any circumstances.

USER'S COMMUNICATION STYLE:
- Style: ${toneProfile.communication_style}
- Humor: ${toneProfile.humor_level}
- Energy: ${toneProfile.energy_level}
${toneProfile.sample_phrase ? `- Example of how they write: "${toneProfile.sample_phrase}"` : ''}

THEIR MATCH'S BIO:
${matchBio}

CONVERSATION HOOKS IDENTIFIED:
${hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Generate exactly 3 opening messages. Rules:
- Each must reference something specific from the bio or hooks — no generic openers
- Match the user's communication style exactly — if they're dry and witty, be dry and witty
- Keep each under 2 sentences
- Sound like a real human, not an AI
- Do not start any message with "Hey" or "Hi"
- Do not number them or add labels
Output only the 3 messages, one per line, nothing else.`;
}

export function buildBioAnalysisPrompt(bio: string): string {
  return `Analyse this dating profile bio and extract the most useful conversation hooks.
Never generate sexual, explicit, or offensive content under any circumstances.

BIO:
${bio}

Return a JSON object with this exact shape:
{
  "hooks": ["hook1", "hook2", "hook3"],
  "interests": ["interest1", "interest2"],
  "tone": "casual|adventurous|intellectual|humorous|professional"
}

Rules for hooks:
- Each hook must be a specific, talkable detail from the bio (not generic like "likes travel")
- Good hook example: "Did a solo trip to Japan in their 20s"
- Bad hook example: "Likes travelling"
- Maximum 3 hooks
- If the bio is too short or vague, return fewer hooks
Return only valid JSON. No markdown, no explanation.`;
}

export function buildCoachPrompt(toneProfile: ToneProfile, conversationThread: string): string {
  return `You are a dating conversation coach. Help craft the next reply in this conversation.
Never generate sexual, explicit, or offensive content under any circumstances.

USER'S COMMUNICATION STYLE:
- Style: ${toneProfile.communication_style}
- Humor: ${toneProfile.humor_level}
- Energy: ${toneProfile.energy_level}
${toneProfile.sample_phrase ? `- How they naturally write: "${toneProfile.sample_phrase}"` : ''}

CONVERSATION SO FAR:
${conversationThread}

Generate exactly 3 possible next replies. Rules:
- Continue the natural flow of the conversation — read the energy and match it
- Each reply should feel like a different strategic angle: one warm, one playful, one that moves the conversation forward
- Sound exactly like the user's communication style
- Keep each reply under 3 sentences
- Do not use emojis unless the conversation already has them
- Do not number them or add labels
Output only the 3 replies, one per line, nothing else.`;
}
```

## How to Operate

### Before writing any code
1. Check the file structure above — does the file you need already exist?
2. Check `lib/prompts.ts` — does a prompt template already exist for this feature?
3. Check the DB schema — do the tables you need exist? If not, write the migration SQL first.

### When building a new screen
Follow this order every time:
1. DB migration (if new data is needed)
2. Edge function update (if new AI call is needed)
3. `lib/api.ts` function (typed wrapper around the edge function call)
4. Screen component (calls the api.ts function, never calls Supabase or Claude directly)
5. Register in Expo Router (add to `app/` directory)

### Usage limit enforcement
The daily limit (10 requests/day free) is enforced in the Supabase Edge Function, not the client.
The edge function must:
1. Verify the user's JWT
2. Count today's usage from `usage_logs` for that user + feature
3. Reject with a 429 if over limit
4. Log the new usage on success

## Code Style Rules

- **TypeScript everywhere** — no `.js` files, strict mode on
- **No inline styles** — use `StyleSheet.create()` for all React Native styles
- **No hardcoded strings** — UI copy goes in a `constants/copy.ts` file
- **No direct Supabase calls in components** — all data access goes through `lib/api.ts`
- **No Claude API calls in components or api.ts** — all AI calls go through the Supabase Edge Function
- **Error handling on every async call** — always have a try/catch, always set an error state
- **Loading states are not optional** — every action that hits the network needs a loading boolean

## App Store Compliance (Non-Negotiable)

- Privacy Policy URL must be present in App Store Connect AND linkable in-app (Profile tab)
- Age rating must be set to 17+
- The app must work end-to-end with the demo account provided in reviewer notes
- Claude must never produce explicit or sexual content — system prompt must explicitly forbid it
- Do not reference Tinder, Hinge, Bumble, or any competitor by name in App Store screenshots or description
- Add this line to EVERY Claude system prompt: `Never generate sexual, explicit, or offensive content under any circumstances.`

## What NOT to Do

- Do not add libraries without asking — every new dep is a risk in a 4-week build
- Do not refactor working code unless it's blocking a new feature
- Do not add v1.1 features (payments, humor modes, OCR) — stay in scope
- Do not expose the Anthropic API key in the client bundle under any circumstances
- Do not skip loading states or error handling to ship faster — it will cause App Store rejection

## Bottom Line

You are a senior mobile engineer working for a solo founder on a tight deadline. Write clean, typed, working code. Keep scope tight. Ask before going off-plan. The goal is a live App Store listing in 4 weeks — every decision should serve that goal. Ship fast. Stay in scope. Don't cut corners on the AI prompts — that's the product.
