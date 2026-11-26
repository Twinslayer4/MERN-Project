import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createApplication, listApplications } from './api.mjs';
import { Button, Field } from './FormControls';
import { exampleApplications } from './suggestionExamples';
import { WorkspaceHeading } from './WorkspaceHeading';

const STATUSES = [
  { id: 'applied', label: 'Applied', nextStep: 'Check application progress' },
  { id: 'interviewing', label: 'Interviewing', nextStep: 'Prepare for your next interview' },
  { id: 'offer', label: 'Offer', nextStep: 'Review your offer and next steps' },
  { id: 'rejected', label: 'Rejected' },
];

function applicationError(error) {
  if (error.status === 401) return 'Your session expired. Sign in again to continue.';
  if (error.status === 404) return 'Applications are unavailable on this server.';
  return error.message;
}

function AddApplicationForm({ styles, colors, dark, onClose, onSave }) {
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState('applied');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  function close() {
    if (!pending.current) onClose();
  }

  async function submit() {
    if (pending.current) return;
    const application = { company: company.trim(), jobTitle: jobTitle.trim(), status };
    if (!application.company || !application.jobTitle) {
      setError('Enter a company and job title.');
      return;
    }

    pending.current = true;
    setSaving(true);
    setError('');
    Keyboard.dismiss();
    try {
      await onSave(application);
      onClose();
    } catch (err) {
      setError(applicationError(err));
      setSaving(false);
      pending.current = false;
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={close}
      statusBarTranslucent navigationBarTranslucent>
      <SafeAreaProvider style={styles.safe}>
        {Platform.OS === 'android' && <StatusBar style={dark ? 'light' : 'dark'} />}
        <SafeAreaView accessibilityViewIsModal style={styles.safe}>
          <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.workspacePage}>
                <WorkspaceHeading styles={styles} title="Add application" />
                <View style={styles.card}>
                  <Field styles={styles} colors={colors} label="Company" value={company}
                    onChangeText={value => { setCompany(value); setError(''); }}
                    maxLength={200} editable={!saving} autoCapitalize="words" />
                  <Field styles={styles} colors={colors} label="Job title" value={jobTitle}
                    onChangeText={value => { setJobTitle(value); setError(''); }}
                    maxLength={200} editable={!saving} autoCapitalize="words" />
                  <View>
                    <Text style={styles.label}>Status</Text>
                    <View accessibilityRole="radiogroup" style={styles.overviewChoices}>
                      {STATUSES.map(({ id, label }) => (
                        <Pressable key={id} accessibilityRole="radio" accessibilityState={{ checked: id === status, disabled: saving }}
                          onPress={() => setStatus(id)} disabled={saving}
                          style={({ pressed }) => [
                            styles.overviewChoice, (status === id || pressed) && styles.overviewChoiceSelected,
                          ]}>
                          <Text style={styles.overviewChoiceLabel}>{label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
                </View>
                <Button styles={styles} title={saving ? 'Saving…' : 'Save application'} disabled={saving} onPress={submit} />
                <Button styles={styles} title="Cancel" secondary disabled={saving} onPress={close} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function Metrics({ styles, items }) {
  return (
    <View style={styles.overviewMetrics}>
      {items.map(([label, count]) => (
        <View key={label} style={styles.overviewMetric}>
          <Text style={styles.overviewCount}>{count}</Text>
          <Text style={styles.bodyText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function NextSteps({ styles, applications }) {
  return (
    <View style={styles.overviewSection}>
      <View style={styles.overviewSectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Your next steps</Text>
        <Text style={styles.bodyText}>{applications.length} active</Text>
      </View>
      {applications.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.overviewCompany}>No active applications yet</Text>
          <Text style={styles.bodyText}>Add an application to start tracking your next steps.</Text>
        </View>
      ) : applications.slice(0, 4).map(application => {
        const stage = STATUSES.find(({ id }) => id === application.status);
        const company = application.company.trim() || 'Unknown company';
        return (
          <View key={application._id} style={[styles.card, styles.overviewApplication]}>
            <View style={styles.overviewApplicationHeader}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.overviewInitial}>
                <Text style={styles.overviewCompany}>{company[0].toUpperCase()}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.overviewCompany}>{company}</Text>
                <Text style={styles.bodyText}>{application.jobTitle}</Text>
              </View>
            </View>
            <View style={styles.overviewNextStep}>
              {stage && (
                <Text style={[styles.overviewStatus,
                  stage.id === 'interviewing' && styles.overviewInterviewing,
                  stage.id === 'offer' && styles.overviewOffer]}>
                  {stage.label}
                </Text>
              )}
              <Text style={styles.bodyText}>{stage?.nextStep ?? 'Review application'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function HomeScreen({ styles, colors, firstName, session, demo, created, dark, active }) {
  const userId = session?.user._id;
  const token = session?.token;
  const [applications, setApplications] = useState(demo ? exampleApplications : null);
  const [loading, setLoading] = useState(!demo);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!active || demo || !userId || !token) return;
    let current = true;
    setLoading(true);
    setLoadError('');
    listApplications(userId, token).then(items => {
      if (current) setApplications(items);
    }).catch(err => {
      if (current) setLoadError(applicationError(err));
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [active, demo, userId, token, retry]);

  async function saveApplication(input) {
    const item = demo
      ? { ...input, _id: `sample-${Date.now()}` }
      : await createApplication(userId, token, input);
    setApplications(items => [item, ...(items ?? []).filter(application => application._id !== item._id)]);
    setNotice(demo ? 'Application added for this preview.' : 'Application added.');
  }

  const name = typeof firstName === 'string' ? firstName.trim() : '';
  const interviewing = applications?.filter(({ status }) => status === 'interviewing').length;
  const offers = applications?.filter(({ status }) => status === 'offer').length;
  const applied = applications?.filter(({ status }) => status === 'applied').length;
  const activeApplications = applications?.filter(({ status }) => status !== 'rejected');

  return (
    <View style={styles.workspacePage}>
      <WorkspaceHeading styles={styles} title={name ? `Good to see you, ${name}.` : 'Good to see you.'}
        description="Here’s what’s happening with your job search." />
      {created && <Text accessibilityLiveRegion="polite" style={styles.link}>Your account is ready.</Text>}
      {demo && <Text style={styles.bodyText}>Viewing sample applications</Text>}
      <Button styles={styles} title="+ Add application" disabled={loading || !!loadError} onPress={() => {
        setNotice('');
        setAdding(true);
      }} />
      {!!notice && <Text accessibilityLiveRegion="polite" style={styles.link}>{notice}</Text>}
      {loading && !applications && (
        <View accessibilityLiveRegion="polite" style={styles.overviewLoading}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.bodyText}>Loading applications…</Text>
        </View>
      )}
      {!!loadError && (
        <View style={styles.card}>
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{loadError}</Text>
          <Button styles={styles} title="Retry loading applications" onPress={() => setRetry(value => value + 1)} secondary />
        </View>
      )}
      {applications && (
        <>
          <View style={styles.overviewSummary}>
            <Metrics styles={styles} items={[
              ['Applications', applications.length], ['Interviewing', interviewing], ['Offers', offers],
            ]} />
          </View>
          <NextSteps styles={styles} applications={activeApplications} />
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Application progress</Text>
            <Metrics styles={styles} items={[['Applied', applied], ['Interviewing', interviewing], ['Offers', offers]]} />
          </View>
        </>
      )}
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Upcoming interviews</Text>
        <Text style={styles.bodyText}>Scheduled interviews will appear here when calendar support is connected.</Text>
      </View>
      {adding && <AddApplicationForm styles={styles} colors={colors} dark={dark}
        onClose={() => setAdding(false)} onSave={saveApplication} />}
    </View>
  );
}
