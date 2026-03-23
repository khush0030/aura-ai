import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View style={styles.sentBox}>
            <Text style={styles.sentText}>✓ Reset link sent! Check your email.</Text>
          </View>
        ) : (
          <>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, (!email.trim() || loading) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={!email.trim() || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  backButton: { marginBottom: 32 },
  backText: { color: '#7C3AED', fontSize: 15 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 15, marginBottom: 32, lineHeight: 22 },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 16 },
  input: {
    backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
  },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  sentBox: {
    backgroundColor: '#0F2A1A', borderRadius: 12, borderWidth: 1, borderColor: '#22C55E',
    padding: 18, alignItems: 'center',
  },
  sentText: { color: '#22C55E', fontSize: 15, fontWeight: '600' },
});
