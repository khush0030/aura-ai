import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Clipboard,
} from 'react-native';
import { generatePickupLines, getTodayUsage } from '../../lib/api';
import { Analytics } from '../../lib/analytics';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UsageBanner } from '../../components/UsageBanner';

type ToneMode = 'Funny' | 'Smooth' | 'Bold';

export default function PickupScreen() {
  const [context, setContext] = useState('');
  const [toneMode, setToneMode] = useState<ToneMode>('Smooth');
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    getTodayUsage().then(setUsage).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setLines([]);
    try {
      const result = await generatePickupLines(context.trim() || undefined, toneMode);
      setLines(result);
      setUsage((u) => u + 1);
      Analytics.pickupLinesGenerated(toneMode);
    } catch (err: any) {
      setError(err.message === 'LIMIT_REACHED'
        ? "You've hit today's limit of 10 free requests. Come back tomorrow."
        : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    Analytics.pickupLineCopied(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Pickup Lines</Text>
        <Text style={styles.subtitle}>5 personalised lines in your style. Not templates — generated for you.</Text>

        <UsageBanner used={usage} />

        {/* Tone mode */}
        <Text style={styles.fieldLabel}>Tone mode</Text>
        <View style={styles.modeRow}>
          {(['Funny', 'Smooth', 'Bold'] as ToneMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeChip, toneMode === mode && styles.modeChipActive]}
              onPress={() => setToneMode(mode)}
            >
              <Text style={[styles.modeText, toneMode === mode && styles.modeTextActive]}>
                {mode === 'Funny' ? '😂 Funny' : mode === 'Smooth' ? '😏 Smooth' : '🔥 Bold'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Optional context */}
        <Text style={styles.fieldLabel}>Their bio or a topic (optional)</Text>
        <TextInput
          style={styles.contextInput}
          placeholder="e.g. She's into film noir and has a rescue dog named Biscuit..."
          placeholderTextColor="#555"
          value={context}
          onChangeText={setContext}
          multiline
          textAlignVertical="top"
          editable={!loading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.primaryButtonText}>Generate 5 lines</Text>}
        </TouchableOpacity>

        {loading && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} lines={2} />
            ))}
          </>
        )}

        {lines.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{toneMode} Lines</Text>
            {lines.map((line, i) => (
              <TouchableOpacity
                key={i}
                style={styles.lineCard}
                onPress={() => handleCopy(line, i)}
                activeOpacity={0.7}
              >
                <Text style={styles.lineText}>{line}</Text>
                <Text style={styles.copyHint}>{copiedIndex === i ? 'Copied!' : 'Tap to copy'}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={() => { Analytics.pickupLinesRegenerated(); handleGenerate(); }}
              disabled={loading}
            >
              <Text style={styles.regenerateText}>↻  Regenerate</Text>
            </TouchableOpacity>
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
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeChip: {
    flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    paddingVertical: 12, alignItems: 'center',
  },
  modeChipActive: { borderColor: '#7C3AED', backgroundColor: '#1E1030' },
  modeText: { color: '#888', fontSize: 13, fontWeight: '500' },
  modeTextActive: { color: '#C4B5FD', fontWeight: '700' },
  contextInput: {
    backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 15, padding: 16, marginBottom: 16, minHeight: 100, textAlignVertical: 'top',
  },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  sectionTitle: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  lineCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A', padding: 16, marginBottom: 12,
  },
  lineText: { color: '#FFF', fontSize: 16, lineHeight: 24, marginBottom: 8 },
  copyHint: { color: '#7C3AED', fontSize: 12, fontWeight: '600' },
  regenerateButton: {
    borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4, marginBottom: 40,
  },
  regenerateText: { color: '#888', fontSize: 15 },
});
