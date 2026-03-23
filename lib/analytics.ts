import PostHog from 'posthog-react-native';

// PostHog project API key — set in .env as EXPO_PUBLIC_POSTHOG_KEY
const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? 'phc_placeholder';
const POSTHOG_HOST = 'https://app.posthog.com';

let client: PostHog | null = null;

export function getAnalytics(): PostHog {
  if (!client) {
    client = new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST });
  }
  return client;
}

// ── Event Helpers ─────────────────────────────────────────────────────────────

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  try {
    getAnalytics().capture(event, properties);
  } catch {}
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  try {
    getAnalytics().identify(userId, traits);
  } catch {}
}

export function resetAnalytics() {
  try {
    getAnalytics().reset();
  } catch {}
}

// ── Typed Event Catalogue ────────────────────────────────────────────────────

export const Analytics = {
  // Onboarding
  onboardingStarted: () => trackEvent('onboarding_started'),
  onboardingCompleted: (style: string, humor: string, energy: string, intent: string) =>
    trackEvent('onboarding_completed', { style, humor, energy, intent }),

  // Auth
  signUp: () => trackEvent('sign_up'),
  logIn: () => trackEvent('log_in'),
  logOut: () => trackEvent('log_out'),

  // Bio Analyser
  bioAnalysed: (hooksFound: number) =>
    trackEvent('bio_analysed', { hooks_found: hooksFound }),
  openersGenerated: () => trackEvent('openers_generated'),
  openerCopied: (index: number) =>
    trackEvent('opener_copied', { position: index }),

  // Chat Reply
  replyFromThread: () => trackEvent('reply_from_thread'),
  replyFromScreenshot: () => trackEvent('reply_from_screenshot'),
  replyCopied: (label: string) => trackEvent('reply_copied', { label }),

  // Profile Optimiser
  profileOptimised: (platform: string) =>
    trackEvent('profile_optimised', { platform }),
  optimisedBioCopied: () => trackEvent('optimised_bio_copied'),

  // Pickup Lines
  pickupLinesGenerated: (toneMode: string) =>
    trackEvent('pickup_lines_generated', { tone_mode: toneMode }),
  pickupLineCopied: (index: number) =>
    trackEvent('pickup_line_copied', { position: index }),
  pickupLinesRegenerated: () => trackEvent('pickup_lines_regenerated'),

  // Upgrade
  limitHit: (feature: string) => trackEvent('limit_hit', { feature }),
  upgradeModalSeen: () => trackEvent('upgrade_modal_seen'),
  waitlistJoined: () => trackEvent('waitlist_joined'),
  upgradeDismissed: () => trackEvent('upgrade_dismissed'),
};
