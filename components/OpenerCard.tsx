import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Clipboard, Animated } from 'react-native';
import { COPY } from '../constants/copy';

interface OpenerCardProps {
  text: string;
  index: number;
}

export function OpenerCard({ text, index }: OpenerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleCopy} activeOpacity={0.7}>
      <Text style={styles.text}>{text}</Text>
      <Text style={styles.hint}>
        {copied ? COPY.bioAnalyser.copySuccess : COPY.bioAnalyser.tapToCopy}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    marginBottom: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  hint: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
  },
});
