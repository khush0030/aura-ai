import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

export default function BuildingAuraScreen() {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Dot pulse animation
    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    dotAnim.start();

    // Navigate to home after 1.5s
    const timer = setTimeout(() => {
      dotAnim.stop();
      router.replace('/(tabs)/home');
    }, 1500);

    return () => {
      clearTimeout(timer);
      dotAnim.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.logo}>✦</Text>
        <Text style={styles.title}>Building your Aura</Text>
        <View style={styles.dotsRow}>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>●</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>●</Animated.Text>
        </View>
        <Text style={styles.subtitle}>Personalising everything to your voice</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center' },
  logo: { fontSize: 64, color: '#7C3AED', marginBottom: 24 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '700', marginBottom: 20 },
  dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dot: { color: '#7C3AED', fontSize: 18 },
  subtitle: { color: '#666', fontSize: 15 },
});
