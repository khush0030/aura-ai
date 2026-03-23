import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
