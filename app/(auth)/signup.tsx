import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { signUp } from '../../lib/api';
import { Analytics } from '../../lib/analytics';
import { COPY } from '../../constants/copy';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password);
      Analytics.signUp();
      router.replace('/onboarding');
    } catch (err: any) {
      setError(err.message || COPY.common.error);
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
        <Text style={styles.logo}>✦ Aura AI</Text>
        <Text style={styles.title}>{COPY.auth.signupTitle}</Text>
        <Text style={styles.subtitle}>{COPY.auth.signupSubtitle}</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder={COPY.auth.emailPlaceholder}
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder={COPY.auth.passwordPlaceholder}
          placeholderTextColor="#555"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? COPY.auth.signingUp : COPY.auth.signupButton}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
          <Text style={styles.switchText}>{COPY.auth.switchToLogin}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { color: '#7C3AED', fontSize: 22, fontWeight: '800', marginBottom: 32, textAlign: 'center' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 15, marginBottom: 32 },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 16 },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#7C3AED', fontSize: 14, textAlign: 'center' },
});
