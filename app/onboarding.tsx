import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { saveToneProfile } from '../lib/api';
import { COPY } from '../constants/copy';
import {
  COMMUNICATION_STYLES,
  HUMOR_LEVELS,
  ENERGY_LEVELS,
  INTENTS,
  ToneOption,
} from '../constants/toneOptions';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [humorLevel, setHumorLevel] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [intent, setIntent] = useState('');
  const [samplePhrase, setSamplePhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = () => {
    if (step === 1) return !!communicationStyle;
    if (step === 2) return !!humorLevel;
    if (step === 3) return !!energyLevel;
    if (step === 4) return !!intent;
    return true;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveToneProfile({
        communication_style: communicationStyle,
        humor_level: humorLevel,
        energy_level: energyLevel,
        intent: intent,
        sample_phrase: samplePhrase || null,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || COPY.common.error);
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (
    options: ToneOption[],
    selected: string,
    onSelect: (val: string) => void
  ) => (
    <View style={styles.optionsContainer}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.optionCard, selected === opt.value && styles.optionCardSelected]}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionEmoji}>{opt.emoji}</Text>
          <Text style={[styles.optionLabel, selected === opt.value && styles.optionLabelSelected]}>
            {opt.label}
          </Text>
          <Text style={styles.optionDesc}>{opt.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={styles.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i + 1 <= step && styles.progressDotActive]}
            />
          ))}
        </View>

        <Text style={styles.title}>
          {step === 1 && COPY.onboarding.step1Title}
          {step === 2 && COPY.onboarding.step2Title}
          {step === 3 && COPY.onboarding.step3Title}
          {step === 4 && 'What are you looking for?'}
          {step === 5 && COPY.onboarding.step4Title}
        </Text>
        {step === 5 && (
          <Text style={styles.subtitle}>{COPY.onboarding.step4Subtitle}</Text>
        )}

        {step === 1 && renderOptions(COMMUNICATION_STYLES, communicationStyle, setCommunicationStyle)}
        {step === 2 && renderOptions(HUMOR_LEVELS, humorLevel, setHumorLevel)}
        {step === 3 && renderOptions(ENERGY_LEVELS, energyLevel, setEnergyLevel)}
        {step === 4 && renderOptions(INTENTS, intent, setIntent)}
        {step === 5 && (
          <TextInput
            style={styles.sampleInput}
            placeholder={COPY.onboarding.step4Placeholder}
            placeholderTextColor="#555"
            value={samplePhrase}
            onChangeText={setSamplePhrase}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.nextButton, (!canProceed() || loading) && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading
              ? COPY.onboarding.saving
              : step === TOTAL_STEPS
            ? COPY.onboarding.finishButton
            : COPY.onboarding.nextButton}
          </Text>
        </TouchableOpacity>

        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 28, paddingTop: 48 },
  progressRow: { flexDirection: 'row', marginBottom: 40, gap: 8 },
  progressDot: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: '#2A2A2A',
  },
  progressDotActive: { backgroundColor: '#7C3AED' },
  title: { color: '#FFF', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24 },
  optionsContainer: { marginTop: 24, gap: 12 },
  optionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionCardSelected: { borderColor: '#7C3AED', backgroundColor: '#1E1030' },
  optionEmoji: { fontSize: 24 },
  optionLabel: { color: '#FFF', fontSize: 16, fontWeight: '600', flex: 1 },
  optionLabelSelected: { color: '#C4B5FD' },
  optionDesc: { color: '#666', fontSize: 13 },
  sampleInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFF',
    fontSize: 15,
    padding: 16,
    marginTop: 24,
    minHeight: 120,
  },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 12 },
  nextButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  backButton: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  backButtonText: { color: '#666', fontSize: 14 },
});
