export type CommunicationStyle = 'casual' | 'confident' | 'witty' | 'chill';
export type HumorLevel = 'dry' | 'playful' | 'none';
export type EnergyLevel = 'high' | 'medium' | 'low';

export interface ToneOption {
  value: string;
  label: string;
  description: string;
  emoji: string;
}

export const COMMUNICATION_STYLES: ToneOption[] = [
  { value: 'casual', label: 'Casual', description: 'Relaxed, everyday language', emoji: '😊' },
  { value: 'confident', label: 'Confident', description: 'Direct, self-assured', emoji: '💪' },
  { value: 'witty', label: 'Witty', description: 'Clever, quick with wordplay', emoji: '🧠' },
  { value: 'chill', label: 'Chill', description: 'Low-key, go-with-the-flow', emoji: '😎' },
];

export const HUMOR_LEVELS: ToneOption[] = [
  { value: 'dry', label: 'Dry', description: 'Deadpan, understated', emoji: '🏜️' },
  { value: 'playful', label: 'Playful', description: 'Light, fun, teasing', emoji: '😜' },
  { value: 'none', label: 'Minimal', description: "Keep it mostly serious", emoji: '🎯' },
];

export const ENERGY_LEVELS: ToneOption[] = [
  { value: 'high', label: 'High energy', description: 'Enthusiastic, expressive', emoji: '⚡' },
  { value: 'medium', label: 'Balanced', description: 'Normal, measured', emoji: '⚖️' },
  { value: 'low', label: 'Low-key', description: 'Calm, understated', emoji: '🌙' },
];
