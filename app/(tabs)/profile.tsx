import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { getToneProfile, getTodayUsage, signOut } from '../../lib/api';
import { ToneProfileData } from '../../lib/api';
import { COPY } from '../../constants/copy';

const STYLE_LABELS: Record<string, string> = {
  casual: 'Casual 😊', confident: 'Confident 💪', witty: 'Witty 🧠', chill: 'Chill 😎',
};
const HUMOR_LABELS: Record<string, string> = {
  dry: 'Dry 🏜️', playful: 'Playful 😜', none: 'Minimal 🎯',
};
const ENERGY_LABELS: Record<string, string> = {
  high: 'High energy ⚡', medium: 'Balanced ⚖️', low: 'Low-key 🌙',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ToneProfileData | null>(null);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, u] = await Promise.all([getToneProfile(), getTodayUsage()]);
      setProfile(p);
      setUsage(u);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color="#7C3AED" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{COPY.profile.title}</Text>

        {/* Usage */}
        <View style={styles.usageCard}>
          <Text style={styles.cardLabel}>{COPY.profile.usageTitle}</Text>
          <View style={styles.usageBar}>
            <View style={[styles.usageFill, { width: `${Math.min((usage / 10) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.usageText}>{usage}/10 {COPY.profile.usageOf}</Text>
        </View>

        {/* Tone Profile */}
        {profile ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{COPY.profile.toneTitle}</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>{COPY.profile.styleLabel}</Text>
              <Text style={styles.profileValue}>{STYLE_LABELS[profile.communication_style] ?? profile.communication_style}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>{COPY.profile.humorLabel}</Text>
              <Text style={styles.profileValue}>{HUMOR_LABELS[profile.humor_level] ?? profile.humor_level}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileKey}>{COPY.profile.energyLabel}</Text>
              <Text style={styles.profileValue}>{ENERGY_LABELS[profile.energy_level] ?? profile.energy_level}</Text>
            </View>
            {profile.sample_phrase && (
              <View style={styles.samplePhraseBox}>
                <Text style={styles.samplePhraseLabel}>{COPY.profile.sampleLabel}</Text>
                <Text style={styles.samplePhraseText}>"{profile.sample_phrase}"</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.editButtonText}>{COPY.profile.editButton}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.setupCard}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.setupText}>Set up your tone profile →</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Links */}
        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Linking.openURL('https://aura-ai-legal-96mzs3x9f-oltaflock-ai.vercel.app#privacy')}
          >
            <Text style={styles.linkText}>{COPY.profile.privacyPolicy}</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          <View style={[styles.linkRow, { borderTopWidth: 1, borderTopColor: '#1A1A1A' }]}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL('https://aura-ai-legal-96mzs3x9f-oltaflock-ai.vercel.app#terms')}
            >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
            </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutButton, signingOut && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? COPY.profile.signingOut : COPY.profile.signOut}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingTop: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  usageCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    marginBottom: 16,
  },
  usageBar: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  usageText: { color: '#888', fontSize: 13 },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  profileKey: { color: '#888', fontSize: 14 },
  profileValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  samplePhraseBox: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  samplePhraseLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
  samplePhraseText: { color: '#C4B5FD', fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  editButton: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  editButtonText: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  setupCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  setupText: { color: '#C4B5FD', fontSize: 15, fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  linksSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 20,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkText: { color: '#FFF', fontSize: 15 },
  linkArrow: { color: '#666', fontSize: 16 },
  signOutButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A1A1A',
    marginBottom: 40,
  },
  buttonDisabled: { opacity: 0.5 },
  signOutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
