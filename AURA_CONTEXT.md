# Aura AI Context — Development Reference

**Last Updated:** Apr 2, 2026  
**Status:** MVP Complete — iOS dating coach app  
**Platform:** React Native (Expo) + iOS

---

## Stack

### Frontend
- **Expo (React Native)** — Cross-platform iOS/Android
- **TypeScript** — Type safety
- **React Navigation** — Screen navigation
- **Expo Router** — Deep linking + web preview

### Backend
- **Supabase** (Auth, Postgres, Edge Functions)
  - Project ID: `lndnxhswouzfhljyvhxw`
  - URL: `https://lndnxhswouzfhljyvhxw.supabase.co`

### Third-Party APIs
- **OpenAI GPT-4o Vision** — Analyze screenshots
- **Anthropic Claude Haiku** — Generate replies
- **Apple Sign-In** — iOS auth

---

## What is Aura?

**Aura** = AI dating coach in your pocket

Users can:
1. Take screenshots of matches' messages/bios
2. Get AI-generated replies (Warm/Playful/Bold tones)
3. Optimize profile with bio rewrites
4. Generate pickup lines
5. Get daily tips + confidence boosts

---

## Current State

### ✅ What Works
- **Onboarding flow** — 5-step setup quiz (age, goals, style, preference, interests)
- **Home dashboard** — Score card, feature cards, daily tip
- **Chat Reply feature** — Screenshot upload → GPT-4o OCR → Claude replies
- **Bio Analyser** — Extract hook + generate opener
- **Profile Optimiser** — Bio rewrite for Hinge/Tinder/Bumble/Feeld
- **Pickup Lines** — Generate Funny/Smooth/Bold lines
- **Usage gating** — 10 replies/day limit (tracked in DB)
- **Edge function** — All 6 features in single edge function

### ⚠️ Known Issues
1. **Not yet on App Store**
   - Status: Built and tested locally
   - Issue: Needs Apple review + developer account
   - Workaround: Test via Expo Go app

2. **Push notifications** — Not implemented
   - Status: Not needed for MVP
   - Feature: Send daily tips + matches

3. **Analytics** — No usage tracking yet
   - Status: Database logging implemented
   - Feature: Dashboard not built

---

## Critical Files

### Screens
- **Splash** — `app/splash.tsx` — Intro animation
- **Onboarding** — `app/onboarding/[step].tsx` — 5-step quiz
- **Home** — `app/home.tsx` — Main dashboard
- **Chat Reply** — `app/(features)/chat-reply.tsx` — Screenshot upload
- **Bio Analyser** — `app/(features)/bio-analyser.tsx` — Profile optimization
- **Profile Optimiser** — `app/(features)/profile-optimiser.tsx` — Bio rewrite
- **Pickup Lines** — `app/(features)/pickup-lines.tsx` — Line generation
- **Profile** — `app/profile.tsx` — User settings

### API
- **Edge Function** — `supabase/functions/generate/index.ts` — All 6 features
  - Takes: `{ feature, screenshot_base64, profile_data, tone }`
  - Returns: `{ reply, lines, bio, hook }`

### Database Tables
- `tone_profiles` — User tone preferences + intent
- `usage_logs` — Track feature usage (replies/day limit)
- `user_profiles` — User preferences from onboarding

---

## Feature Details

### Chat Reply
- User uploads screenshot of message/bio
- GPT-4o Vision extracts text + context
- Claude Haiku generates replies in 3 tones:
  - **Warm**: Genuine, kind, authentic
  - **Playful**: Flirty, fun, witty
  - **Bold**: Confident, direct, forward
- Each tone shows multiple options
- Usage: 1 reply per use, 10/day limit

### Bio Analyser
- Upload profile bio screenshot
- Extract key hook (USP)
- Generate opening line for each platform
- Platforms: Hinge, Tinder, Bumble, Feeld

### Profile Optimiser
- Rewrite entire bio
- Optimize for selected platform
- Keep original tone but improve engagement
- Return: new bio + tips for improvement

### Pickup Lines
- Generate 5 lines in selected tone
- Modes: Funny, Smooth, Bold
- Regenerate button for more

---

## Environment Variables (Supabase Secrets)

```
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
```

---

## Quick Commands

```bash
# Local dev
npm run start

# Build for iOS
npx eas build --platform ios

# Test via Expo Go
npx expo start

# Push to git
git push
```

---

## Next Steps
- [ ] Submit to Apple App Store
- [ ] Implement push notifications
- [ ] Add analytics dashboard
- [ ] Build Android APK
- [ ] Implement in-app purchases (premium features)
- [ ] Add messaging/chat with AI coach
