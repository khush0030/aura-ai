import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COPY } from '../constants/copy';

interface UsageBannerProps {
  used: number;
  limit?: number;
}

export function UsageBanner({ used, limit = 10 }: UsageBannerProps) {
  const remaining = limit - used;
  const isNearLimit = remaining <= 3;
  const isAtLimit = remaining <= 0;

  if (used === 0) return null;

  return (
    <View style={[styles.banner, isAtLimit && styles.bannerLimit, isNearLimit && !isAtLimit && styles.bannerWarn]}>
      <Text style={[styles.text, isAtLimit && styles.textLimit]}>
        {isAtLimit
          ? COPY.common.limitReached
          : `${used}/${limit} ${COPY.profile.usageOf}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
  },
  bannerWarn: {
    borderColor: '#F59E0B',
    backgroundColor: '#1C1500',
  },
  bannerLimit: {
    borderColor: '#EF4444',
    backgroundColor: '#1C0000',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
  textLimit: {
    color: '#EF4444',
  },
});
