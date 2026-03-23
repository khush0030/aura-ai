import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { signIn } from '../../lib/api';
import { COPY } from '../../constants/copy';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.message || COPY.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    Alert.alert('Coming Soon', 'Sign in with Apple will be available in the App Store build.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>✦ Aura AI</Text>
        <Text style={styles.title}>{COPY.auth.loginTitle}</Text>
        <Text style={styles.subtitle}>{COPY.auth.loginSubtitle}</Text>

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
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotRow}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? COPY.auth.loggingIn : COPY.auth.loginButton}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign in with Apple */}
        <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
          <Text style={styles.appleButtonText}> Sign in with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} disabled={loading} style={styles.switchRow}>
          <Text style={styles.switchText}>{COPY.auth.switchToSignup}</Text>
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
    backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#2A2A2A',
    color: '#FFF', fontSize: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
  },
  forgotRow: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#7C3AED', fontSize: 13 },
  button: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#555', fontSize: 13, marginHorizontal: 12 },
  appleButton: {
    backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginBottom: 24,
  },
  appleButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
  switchRow: { alignItems: 'center' },
  switchText: { color: '#7C3AED', fontSize: 14 },
});
