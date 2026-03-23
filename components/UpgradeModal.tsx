import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';

interface UpgradeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function UpgradeModal({ visible, onDismiss }: UpgradeModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleJoinWaitlist = () => {
    if (!email.trim()) return;
    // In v1.1 this will hook into RevenueCat / waitlist API
    setSubmitted(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} onPress={onDismiss} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.emoji}>⚡</Text>
          <Text style={styles.title}>Go Pro</Text>
          <Text style={styles.subtitle}>
            You've hit your 10 free replies today.{'\n'}
            Upgrade to Pro for unlimited access.
          </Text>

          <View style={styles.pricingCard}>
            <Text style={styles.priceLabel}>Aura AI Pro</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>$4.99</Text>
              <Text style={styles.pricePer}>/month</Text>
            </View>
            <Text style={styles.competitorNote}>Rizz AI charges $9.99–$14.99. We don't.</Text>
            <View style={styles.featureList}>
              {['Unlimited replies', 'All 4 features', 'Priority AI responses', 'Cancel anytime'].map((f) => (
                <Text key={f} style={styles.feature}>✓  {f}</Text>
              ))}
            </View>
          </View>

          {submitted ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ You're on the list! We'll notify you when Pro launches.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.waitlistLabel}>Join the Pro waitlist</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.ctaButton, !email.trim() && styles.ctaDisabled]}
                onPress={handleJoinWaitlist}
                disabled={!email.trim()}
              >
                <Text style={styles.ctaText}>Notify me when Pro launches</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: '#111', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 48,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#333', borderRadius: 2,
    alignSelf: 'center', marginBottom: 24,
  },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  pricingCard: {
    backgroundColor: '#1A1A1A', borderRadius: 16, borderWidth: 1, borderColor: '#7C3AED',
    padding: 18, marginBottom: 24,
  },
  priceLabel: { color: '#C4B5FD', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  price: { color: '#FFF', fontSize: 36, fontWeight: '800' },
  pricePer: { color: '#888', fontSize: 16, marginBottom: 6, marginLeft: 4 },
  competitorNote: { color: '#666', fontSize: 12, marginBottom: 14 },
  featureList: { gap: 6 },
  feature: { color: '#C4B5FD', fontSize: 14 },
  waitlistLabel: { color: '#888', fontSize: 13, marginBottom: 10 },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 15, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginBottom: 12,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  dismissButton: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { color: '#555', fontSize: 14 },
  successBox: {
    backgroundColor: '#0F2A1A', borderRadius: 12, borderWidth: 1, borderColor: '#22C55E',
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  successText: { color: '#22C55E', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
