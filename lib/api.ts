import { supabase } from './supabase';
import { ToneProfile, BioAnalysisResult } from './prompts';
import { ProfileOptimiseResult } from '../app/(tabs)/optimise';

export interface ToneProfileData {
  communication_style: string;
  humor_level: string;
  energy_level: string;
  intent?: string;
  sample_phrase?: string | null;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ── Tone Profile ──────────────────────────────────────────────────────────────

export async function getToneProfile(): Promise<ToneProfileData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('tone_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

export async function saveToneProfile(profile: ToneProfileData): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('tone_profiles')
    .upsert({ user_id: user.id, ...profile, updated_at: new Date().toISOString() });

  if (error) throw error;
}

// ── Usage ─────────────────────────────────────────────────────────────────────

export async function getTodayUsage(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const today = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00Z`);

  if (error) return 0;
  return count ?? 0;
}

// ── AI Features (via Edge Function) ──────────────────────────────────────────

async function callGenerateFunction(payload: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.functions.invoke('generate', {
    body: payload,
  });

  if (error) {
    if (error.message?.includes('429') || (data as any)?.error?.includes('limit')) {
      throw new Error('LIMIT_REACHED');
    }
    throw new Error(error.message || 'AI request failed');
  }

  if ((data as any)?.error?.includes('limit')) {
    throw new Error('LIMIT_REACHED');
  }

  return data;
}

export async function analyseBio(bio: string): Promise<BioAnalysisResult> {
  const data = await callGenerateFunction({ feature: 'bio_analyse', bio });
  try {
    return JSON.parse(data.result) as BioAnalysisResult;
  } catch {
    return { hooks: [], interests: [], tone: 'casual' };
  }
}

export async function generateOpeners(
  toneProfile: ToneProfile,
  matchBio: string,
  hooks: string[]
): Promise<string[]> {
  const data = await callGenerateFunction({ feature: 'opener', toneProfile, matchBio, hooks });
  return data.result.split('\n').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
}

export async function getReplyFromThread(
  toneProfile: ToneProfile,
  conversationThread: string
): Promise<string[]> {
  const data = await callGenerateFunction({ feature: 'coach', toneProfile, conversationThread });
  return parseReplies(data.result);
}

export async function getReplyFromScreenshot(
  toneProfile: ToneProfile,
  imageBase64: string,
  optionalNote?: string
): Promise<string[]> {
  const data = await callGenerateFunction({
    feature: 'coach_screenshot',
    toneProfile,
    imageBase64,
    optionalNote,
  });
  return parseReplies(data.result);
}

export async function optimiseProfile(
  currentBio: string,
  platform: string,
  intentNote?: string
): Promise<ProfileOptimiseResult> {
  const toneProfile = await getToneProfile();
  const data = await callGenerateFunction({
    feature: 'profile_optimise',
    toneProfile,
    currentBio,
    platform,
    intentNote,
  });
  // Parse structured response
  try {
    return JSON.parse(data.result) as ProfileOptimiseResult;
  } catch {
    return {
      rewrittenBio: data.result,
      alternativeHooks: [],
      whyItWorks: '',
    };
  }
}

export async function generatePickupLines(
  context: string | undefined,
  toneMode: string
): Promise<string[]> {
  const toneProfile = await getToneProfile();
  const data = await callGenerateFunction({
    feature: 'pickup',
    toneProfile,
    context,
    toneMode,
  });
  return data.result.split('\n').map((s: string) => s.trim()).filter(Boolean).slice(0, 5);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const REPLY_LABELS = ['Warm', 'Playful', 'Bold'];

function parseReplies(raw: string): string[] {
  return raw
    .split('\n')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export { REPLY_LABELS };
