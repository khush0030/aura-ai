// Renamed from index.tsx — Bio Analyser is now its own tab screen
// Copy of the Bio Analyser logic, accessible from Home tile
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { analyseBio, generateOpeners, getToneProfile, getTodayUsage } from '../../lib/api';
import { Analytics } from '../../lib/analytics';
import { BioAnalysisResult } from '../../lib/prompts';
import { OpenerCard } from '../../components/OpenerCard';
import { HookChip } from '../../components/HookChip';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UsageBanner } from '../../components/UsageBanner';
import { COPY } from '../../constants/copy';

export default function BioScreen() {
  const [bio, setBio] = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<BioAnalysisResult | null>(null);
  const [openers, setOpeners] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    getTodayUsage().then(setUsage).catch(() => {});
  }, []);

  const handleAnalyse = async () => {
    if (!bio.trim()) return;
    setAnalysing(true);
    setError(null);
    setAnalysis(null);
    setOpeners([]);
    try {
      const result = await analyseBio(bio.trim());
      setAnalysis(result);
      setUsage((u) => u + 1);
      Analytics.bioAnalysed(result.hooks.length);
    } catch (err: any) {
      setError(err.message === 'LIMIT_REACHED' ? COPY.common.limitReached : COPY.common.error);
    } finally {
      setAnalysing(false); }
  };

  const handleGenerateOpeners = async () => {
    if (!analysis) return;
    const toneProfile = await getToneProfile();
    if (!toneProfile) { setError(COPY.common.noToneProfile); return; }
    setGenerating(true);
    setError(null);
    setOpeners([]);
    try {
      const result = await generateOpeners(toneProfile, bio, analysis.hooks);
      setOpeners(result);
      setUsage((u) => u + 1);
      Analytics.openersGenerated();
    } catch (err: any) {
      setError(err.message === 'LIMIT_REACHED' ? COPY.common.limitReached : COPY.common.error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{COPY.bioAnalyser.title}</Text>
        <Text style={styles.subtitle}>{COPY.bioAnalyser.subtitle}</Text>
        <UsageBanner used={usage} />
        <TextInput
          style={styles.bioInput}
          placeholder={COPY.bioAnalyser.bioInputPlaceholder}
          placeholderTextColor="#555"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!analysing && !generating}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={[styles.primaryButton, (!bio.trim() || analysing) && styles.buttonDisabled]}
          onPress={handleAnalyse}
          disabled={!bio.trim() || analysing}
        >
          {analysing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{COPY.bioAnalyser.analyseButton}</Text>}
        </TouchableOpacity>
        {analysing && <><LoadingSkeleton lines={1} /><LoadingSkeleton lines={2} /></>}
        {analysis && analysis.hooks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{COPY.bioAnalyser.hooksTitle}</Text>
            <View style={styles.hooksRow}>
              {analysis.hooks.map((hook, i) => <HookChip key={i} label={hook} />)}
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, generating && styles.buttonDisabled]}
              onPress={handleGenerateOpeners}
              disabled={generating}
            >
              {generating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>{COPY.bioAnalyser.generateButton}</Text>}
            </TouchableOpacity>
          </View>
        )}
        {generating && <><LoadingSkeleton lines={3} /><LoadingSkeleton lines={2} /><LoadingSkeleton lines={3} /></>}
        {openers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{COPY.bioAnalyser.openersTitle}</Text>
            {openers.map((opener, i) => <OpenerCard key={i} text={opener} index={i} />)}
          </View>
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
  bioInput: {
    backgroundColor: '#1A1A1A', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 15, padding: 16, marginBottom: 14, minHeight: 140,
  },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  section: { marginTop: 8 },
  sectionTitle: { color: '#C4B5FD', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  hooksRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
});
