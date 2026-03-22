import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(20);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.logoMark}>✦</Text>
        <Text style={styles.logoText}>Aura AI</Text>
        <Text style={styles.tagline}>Your personal dating coach</Text>
      </Animated.View>

      <View style={styles.ctas}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Better messages. Sounds like you.{'\n'}Not like AI.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 28,
  },
  hero: { alignItems: 'center', marginTop: 60 },
  logoMark: { fontSize: 56, color: '#7C3AED', marginBottom: 12 },
  logoText: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', letterSpacing: -1, marginBottom: 14 },
  tagline: { color: '#888', fontSize: 18, textAlign: 'center' },
  ctas: { width: '100%', gap: 12 },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  footer: { color: '#444', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
