// Sentry crash reporting — lightweight wrapper
// Install: npx expo install @sentry/react-native
// Then run: npx sentry-wizard -i reactNative

// DSN goes in .env as EXPO_PUBLIC_SENTRY_DSN
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let Sentry: any = null;

async function getSentry() {
  if (Sentry) return Sentry;
  try {
    Sentry = await import('@sentry/react-native');
    return Sentry;
  } catch {
    return null;
  }
}

export async function initSentry() {
  if (!SENTRY_DSN) return;
  const s = await getSentry();
  if (!s) return;
  s.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    environment: __DEV__ ? 'development' : 'production',
  });
}

export async function captureError(error: Error, context?: Record<string, unknown>) {
  try {
    const s = await getSentry();
    if (!s) return;
    s.withScope((scope: any) => {
      if (context) scope.setExtras(context);
      s.captureException(error);
    });
  } catch {}
}

export async function setUserContext(userId: string, email?: string) {
  try {
    const s = await getSentry();
    if (!s) return;
    s.setUser({ id: userId, email });
  } catch {}
}

export async function clearUserContext() {
  try {
    const s = await getSentry();
    if (!s) return;
    s.setUser(null);
  } catch {}
}
