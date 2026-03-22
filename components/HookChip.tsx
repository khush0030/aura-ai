import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HookChipProps {
  label: string;
}

export function HookChip({ label }: HookChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '500',
  },
});
