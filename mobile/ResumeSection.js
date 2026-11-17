import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { ApiError, deleteResume, listResumes, uploadResume } from './api.mjs';

const PDF_TYPE = 'application/pdf';
const MAX_SIZE = 5 * 1024 * 1024;

function formatDetails({ size, createdAt }) {
  const sizeLabel = size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
  const date = new Date(createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  return `${sizeLabel} · ${date}`;
}

export function ResumeSection({ styles, colors, session, demo, disabled }) {
  const userId = session?.user._id;
  const token = session?.token;
  const [resumes, setResumes] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const unavailable = disabled || demo || resumes === null || !!action;

  useEffect(() => {
    if (!userId || !token) return;
    let active = true;
    listResumes(userId, token).then(files => {
      if (active) setResumes(files);
    }).catch(err => {
      if (active) setLoadError(err.message);
    });
    return () => { active = false; };
  }, [userId, token, attempt]);

  async function chooseResume() {
    if (unavailable) return;
    setAction('choosing');
    setMessage('');
    setError('');
    let file;
    try {
      const picked = await DocumentPicker.getDocumentAsync({ type: PDF_TYPE, copyToCacheDirectory: true });
      if (picked.canceled) return;
      const asset = picked.assets[0];
      file = new File(asset.uri);
      if (!/\.pdf$/i.test(asset.name)) {
        setError('Choose a file with a .pdf extension.');
        return;
      }
      if ((asset.size ?? file.size) > MAX_SIZE) {
        setError('Choose a PDF that is 5 MB or smaller.');
        return;
      }
      if (!file.exists || file.size === 0) {
        setError('This PDF is empty or could not be read. Choose another file.');
        return;
      }

      setAction('uploading');
      const resume = await uploadResume(userId, token, asset.name, file);
      setResumes(current => current.some(item => item._id === resume._id) ? current : [resume, ...current]);
      setMessage('Resume saved to your account.');
    } catch (err) {
      if (err.status === 401) {
        setError('Your session expired. Sign in again to upload a resume.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not open the selected file. Please try again.');
      }
    } finally {
      try {
        if (file?.exists) file.delete();
      } catch {
        // The picker uses the app cache, which the OS can clear.
      }
      setAction(null);
    }
  }

  async function removeResume(resume) {
    setAction(resume._id);
    setError('');
    setMessage('');
    try {
      await deleteResume(userId, token, resume._id);
      setResumes(current => current.filter(item => item._id !== resume._id));
      setMessage('Resume removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setAction(null);
    }
  }

  function confirmRemove(resume) {
    Alert.alert('Remove resume?', `${resume.name} will be removed from your account.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeResume(resume) },
    ]);
  }

  const uploadLabel = action === 'uploading' ? 'Uploading…' : action === 'choosing' ? 'Choosing file…' : 'Upload a PDF';

  return (
    <View style={styles.card}>
      <View style={styles.resumeHeading}>
        <Text accessibilityRole="header" style={styles.formTitle}>Resumes</Text>
        <Text style={styles.bodyText}>PDF files · Up to 5 MB each</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: unavailable, busy: action === 'uploading' }}
        disabled={unavailable} onPress={chooseResume}
        style={({ pressed }) => [styles.button, (pressed || unavailable) && styles.busy]}>
        <Text style={styles.buttonLabel}>{uploadLabel}</Text>
      </Pressable>
      {demo ? (
        <Text style={styles.bodyText}>Connect to the Nextstep API and sign in to upload a resume.</Text>
      ) : loadError ? (
        <View style={styles.resumeState}>
          <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
          <Pressable accessibilityRole="button" disabled={disabled} style={styles.resumeAction}
            onPress={() => { setLoadError(''); setAttempt(current => current + 1); }}>
            <Text style={styles.link}>Retry loading</Text>
          </Pressable>
        </View>
      ) : resumes === null ? (
        <View accessibilityLiveRegion="polite" style={styles.resumeLoading}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.bodyText}>Loading resumes…</Text>
        </View>
      ) : resumes.length ? (
        <View>
          {resumes.map(resume => (
            <View key={resume._id} style={styles.resumeRow}>
              <View accessible={false} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden
                style={styles.resumeType}><Text style={styles.resumeTypeLabel}>PDF</Text></View>
              <View style={styles.column}>
                <Text style={styles.resumeName}>{resume.name}</Text>
                <Text style={styles.bodyText}>{formatDetails(resume)}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${resume.name}`}
                accessibilityState={{ disabled: unavailable }} disabled={unavailable}
                onPress={() => confirmRemove(resume)} style={styles.resumeAction}>
                <Text style={[styles.link, unavailable && styles.busy]}>{action === resume._id ? 'Removing…' : 'Remove'}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.bodyText}>No resumes uploaded yet.</Text>
      )}
      {!!message && <Text accessibilityLiveRegion="polite" style={styles.link}>{message}</Text>}
      {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    </View>
  );
}
