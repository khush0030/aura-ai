import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { getToneProfile, getTodayUsage } from '../../lib/api';
import { ToneProfileData } from '../../lib/api';

const STYLE_AURA: Record<string, string> = {
  casual: 'Casual & Warm',
  confident: 'Confident & Direct',
  witty: 'Witty & Sharp',
  chill: 'Chill & Effortless',
};

const FEATURE_TILES = [
  {
    id: 'reply',
    emoji: '💬',
    title: 'Chat Reply',
    description: 'Upload a screenshot, get 3 perfect replies',
    route: '/(tabs)/coach',
  },
  {
    id: 'bio',
    emoji: '✨',
    title: 'Bio Analyser',
    description: 'Extract hooks from their profile, generate openers',
    route: '/(tabs)/bio',
  },
  {
    id: 'optimise',
    emoji: '✍️',
    title: 'Profile Optimiser',
    description: 'Rewrite your bio to match your vibe',
    route: '/(tabs)/optimise',
  },
  {
    id: 'pickup',
    emoji: '⚡',
    title: 'Pickup Lines',
    description: 'Generate 5 personalised, non-generic openers',
    route: '/(tabs)/pickup',
  },
];

export default function HomeScreen() {
  const [profile, setProfile] = useState<ToneProfileData | null>(null);
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, u] = await Promise.all([getToneProfile(), getTodayUsage()]);
      setProfile(p);
      setUsage(u);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>✦ Aura AI</Text>
          {!loading && (
            <TouchableOpacity
              style={styles.auraBadge}
              onPress={() => router.push('/onboarding')}
              activeOpacity={0.7}
            >
              <Text style={styles.auraBadgeText}>
                {profile
                  ? `Your Aura: ${STYLE_AURA[profile.communication_style] ?? profile.communication_style}`
                  : 'Set your tone →'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Usage indicator */}
        {!loading && (
          <View style={styles.usageRow}>
            <Text style={styles.usageText}>
              {10 - usage > 0
                ? `${10 - usage} free replies remaining today`
                : "Today's free limit reached"}
            </Text>
            {10 - usage <= 0 && (
              <TouchableOpacity>
                <Text style={styles.upgradeLink}>Upgrade →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Feature tiles */}
        <View style={styles.tilesGrid}>
          {FEATURE_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.tile}
              onPress={() => router.push(tile.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
              <Text style={styles.tileTitle}>{tile.title}</Text>
              <Text style={styles.tileDesc}>{tile.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingTop: 16 },
  header: { marginBottom: 20 },
  logo: { color: '#7C3AED', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  auraBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1030',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  auraBadgeText: { color: '#C4B5FD', fontSize: 13, fontWeight: '600' },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },
  usageText: { color: '#888', fontSize: 13 },
  upgradeLink: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  tilesGrid: { gap: 14 },
  tile: {
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 20,
  },
  tileEmoji: { fontSize: 32, marginBottom: 12 },
  tileTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  tileDesc: { color: '#666', fontSize: 14, lineHeight: 20 },
});
