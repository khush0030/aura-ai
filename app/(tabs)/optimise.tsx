import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Clipboard,
} from 'react-native';
import { optimiseProfile, getTodayUsage } from '../../lib/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UsageBanner } from '../../components/UsageBanner';

export interface ProfileOptimiseResult {
  rewrittenBio: string;
  alternativeHooks: string[];
  whyItWorks: string;
}

const PLATFORMS = ['Hinge', 'Tinder', 'Bumble', 'Feeld', 'Other'];

export default function OptimiseScreen() {
  const [bio, setBio] = useState('');
  const [platform, setPlatform] = useState('Hinge');
  const [intentNote, setIntentNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileOptimiseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    getTodayUsage().then(setUsage).catch(() => {});
  }, []);

  const handleOptimise = async () => {
    if (!bio.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await optimiseProfile(bio.trim(), platform, intentNote.trim() || undefined);
      setResult(res);
      setUsage((u) => u + 1);
    } catch (err: any) {
      setError(err.message === 'LIMIT_REACHED'
        ? "You've hit today's limit of 10 free requests. Come back tomorrow."
        : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    Clipboard.setString(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profile Optimiser</Text>
        <Text style={styles.subtitle}>Paste your current bio — we'll rewrite it to sound like you on your best day.</Text>

        <UsageBanner used={usage} />

        {/* Platform selector */}
        <Text style={styles.fieldLabel}>Platform</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformRow}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.platformChip, platform === p && styles.platformChipActive]}
              onPress={() => setPlatform(p)}
            >
              <Text style={[styles.platformChipText, platform === p && styles.platformChipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Your current bio</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Paste your existing dating profile bio here..."
          placeholderTextColor="#555"
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />

        <Text style={styles.fieldLabel}>What are you looking for? (optional)</Text>
        <TextInput
          style={styles.shortInput}
          placeholder="e.g. something casual, a long-term thing..."
          placeholderTextColor="#555"
          value={intentNote}
          onChangeText={setIntentNote}
          editable={!loading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, (!bio.trim() || loading) && styles.buttonDisabled]}
          onPress={handleOptimise}
          disabled={!bio.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Optimise my profile</Text>}
        </TouchableOpacity>

        {loading && <><LoadingSkeleton lines={4} /><LoadingSkeleton lines={2} /><LoadingSkeleton lines={3} /></>}

        {result && (
          <>
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Rewritten Bio</Text>
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() => handleCopy(result.rewrittenBio, 'bio')}
                activeOpacity={0.7}
              >
                <Text style={styles.resultText}>{result.rewrittenBio}</Text>
                <Text style={styles.copyHint}>{copiedField === 'bio' ? 'Copied!' : 'Tap to copy'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>Alternative First Lines</Text>
              {result.alternativeHooks.map((hook, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.hookCard}
                  onPress={() => handleCopy(hook, `hook-${i}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.hookText}>{hook}</Text>
                  <Text style={styles.copyHint}>{copiedField === `hook-${i}` ? 'Copied!' : 'Tap to copy'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.whyCard}>
              <Text style={styles.whyLabel}>Why this works</Text>
              <Text style={styles.whyText}>{result.whyItWorks}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingTop: 16 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  fieldLabel: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  platformRow: { marginBottom: 20 },
  platformChip: {
    backgroundColor: '#1A1A1A', borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A',
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
  },
  platformChipActive: { borderColor: '#7C3AED', backgroundColor: '#1E1030' },
  platformChipText: { color: '#888', fontSize: 14 },
  platformChipTextActive: { color: '#C4B5FD', fontWeight: '600' },
  bioInput: {
    backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 15, padding: 16, marginBottom: 16, minHeight: 140, textAlignVertical: 'top',
  },
  shortInput: {
    backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 15, padding: 14, marginBottom: 16,
  },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  resultSection: { marginBottom: 20 },
  sectionTitle: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  resultCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', padding: 16,
  },
  resultText: { color: '#FFF', fontSize: 15, lineHeight: 24, marginBottom: 8 },
  hookCard: {
    backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    padding: 14, marginBottom: 10,
  },
  hookText: { color: '#FFF', fontSize: 15, lineHeight: 22, marginBottom: 6 },
  copyHint: { color: '#7C3AED', fontSize: 12, fontWeight: '600' },
  whyCard: {
    backgroundColor: '#1A1A2A', borderRadius: 14, borderWidth: 1, borderColor: '#3730A3',
    padding: 16, marginBottom: 40,
  },
  whyLabel: { color: '#818CF8', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  whyText: { color: '#C7D2FE', fontSize: 14, lineHeight: 22 },
});
