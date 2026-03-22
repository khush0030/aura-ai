import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Clipboard,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { getReplyFromThread, getReplyFromScreenshot, getToneProfile, getTodayUsage, REPLY_LABELS } from '../../lib/api';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { UsageBanner } from '../../components/UsageBanner';
import { COPY } from '../../constants/copy';

export default function CoachScreen() {
  const [thread, setThread] = useState('');
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [readingScreenshot, setReadingScreenshot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    getTodayUsage().then(setUsage).catch(() => {});
  }, []);

  const handleGetReplies = async () => {
    if (!thread.trim()) {
      setError(COPY.coach.noConversation);
      return;
    }
    const toneProfile = await getToneProfile();
    if (!toneProfile) {
      setError(COPY.common.noToneProfile);
      return;
    }
    setLoading(true);
    setError(null);
    setReplies([]);
    try {
      const result = await getReplyFromThread(toneProfile, thread.trim());
      setReplies(result);
      setUsage((u) => u + 1);
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        setError(COPY.common.limitReached);
      } else {
        setError(COPY.common.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload a screenshot.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets[0]) return;

    const toneProfile = await getToneProfile();
    if (!toneProfile) {
      setError(COPY.common.noToneProfile);
      return;
    }

    setReadingScreenshot(true);
    setError(null);
    setReplies([]);
    try {
      const imageUri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const suggestions = await getReplyFromScreenshot(toneProfile, base64);
      setReplies(suggestions);
      setUsage((u) => u + 1);
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        setError(COPY.common.limitReached);
      } else {
        setError(COPY.common.error);
      }
    } finally {
      setReadingScreenshot(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{COPY.coach.title}</Text>
        <Text style={styles.subtitle}>{COPY.coach.subtitle}</Text>

        <UsageBanner used={usage} />

        {/* Screenshot upload button */}
        <TouchableOpacity
          style={[styles.screenshotButton, readingScreenshot && styles.buttonDisabled]}
          onPress={handleUploadScreenshot}
          disabled={readingScreenshot || loading}
          activeOpacity={0.7}
        >
          {readingScreenshot ? (
            <ActivityIndicator color="#7C3AED" size="small" />
          ) : (
            <Text style={styles.screenshotButtonText}>📷  {COPY.coach.uploadScreenshot}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or paste text</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.threadInput}
          placeholder={COPY.coach.threadPlaceholder}
          placeholderTextColor="#444"
          value={thread}
          onChangeText={setThread}
          multiline
          textAlignVertical="top"
          editable={!loading && !readingScreenshot}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, (!thread.trim() || loading) && styles.buttonDisabled]}
          onPress={handleGetReplies}
          disabled={!thread.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{COPY.coach.getRepliesButton}</Text>
          )}
        </TouchableOpacity>

        {(loading || readingScreenshot) && (
          <>
            <LoadingSkeleton lines={2} />
            <LoadingSkeleton lines={2} />
            <LoadingSkeleton lines={2} />
          </>
        )}

        {replies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{COPY.coach.repliesTitle}</Text>
            {replies.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={styles.replyCard}
                onPress={() => handleCopy(reply, i)}
                activeOpacity={0.7}
              >
                <View style={styles.replyLabelRow}>
                  <Text style={styles.replyLabel}>{REPLY_LABELS[i] ?? ''}</Text>
                </View>
                <Text style={styles.replyText}>{reply}</Text>
                <Text style={styles.replyHint}>
                  {copiedIndex === i ? COPY.bioAnalyser.copySuccess : COPY.coach.tapToCopy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { padding: 20, paddingTop: 16 },
  title: { color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  screenshotButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  screenshotButtonText: { color: '#C4B5FD', fontSize: 15, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A2A' },
  dividerText: { color: '#555', fontSize: 12, marginHorizontal: 12 },
  threadInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFF',
    fontSize: 14,
    padding: 16,
    marginBottom: 14,
    minHeight: 180,
    lineHeight: 22,
  },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  section: { marginTop: 8 },
  sectionTitle: { color: '#C4B5FD', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  replyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    padding: 16,
    marginBottom: 12,
  },
  replyLabelRow: { marginBottom: 8 },
  replyLabel: { color: '#7C3AED', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  replyText: { color: '#FFF', fontSize: 16, lineHeight: 24, marginBottom: 8 },
  replyHint: { color: '#555', fontSize: 12 },
});
