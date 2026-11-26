import React, { useRef, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Feather from '@expo/vector-icons/Feather';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { INTERVIEW_TYPES, formatTime } from './calendar.mjs';
import { Button, Field } from './FormControls';
import { WorkspaceHeading } from './WorkspaceHeading';

function DateTimeField({ mode, value, onChange, styles, colors, dark, disabled }) {
  const choosingDate = mode === 'date';
  const label = choosingDate ? 'Date' : 'Time';
  const formatted = choosingDate
    ? value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : formatTime(value);
  const onValueChange = (_event, date) => onChange(mode, date);

  return (
    <View style={styles.calendarPickerRow}>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === 'android' ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Choose ${mode}, ${formatted}`}
          disabled={disabled} onPress={() => DateTimePickerAndroid.open({ value, mode, onValueChange })}
          style={({ pressed }) => [styles.calendarPickerButton, pressed && styles.calendarControlPressed]}>
          <Text style={styles.value}>{formatted}</Text>
          <Feather name={choosingDate ? 'calendar' : 'clock'} size={17} color={colors.accent} accessible={false} />
        </Pressable>
      ) : (
        <DateTimePicker value={value} mode={mode} display="compact" themeVariant={dark ? 'dark' : 'light'}
          onValueChange={onValueChange} disabled={disabled} accessibilityLabel={label} />
      )}
    </View>
  );
}

export function InterviewForm({ initial, styles, colors, dark, onSave, onRemove, onClose }) {
  const { _id } = initial;
  const editing = Boolean(_id);
  const [company, setCompany] = useState(initial.company ?? '');
  const [role, setRole] = useState(initial.role ?? '');
  const [type, setType] = useState(initial.type ?? 'Technical interview');
  const [startsAt, setStartsAt] = useState(() => new Date(initial.startsAt));
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  function changeDate(mode, value) {
    setStartsAt(previous => {
      const next = new Date(previous);
      if (mode === 'date') next.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
      else next.setHours(value.getHours(), value.getMinutes(), 0, 0);
      return next;
    });
  }

  async function submit(action, operation) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(action);
    setError('');
    Keyboard.dismiss();
    try {
      await operation();
      onClose();
    } catch (err) {
      setError(err.status === 401 ? 'Your session expired. Sign in again to continue.' : err.message);
      setPending('');
      inFlight.current = false;
    }
  }

  function save() {
    const values = { company: company.trim(), role: role.trim(), type, startsAt: startsAt.toISOString() };
    if (!values.company || !values.role) {
      setError('Enter a company and role.');
      return;
    }
    submit('saving', () => onSave(values, _id));
  }

  function confirmRemove() {
    Alert.alert('Remove interview?', 'This interview will be removed from your calendar.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => submit('removing', () => onRemove(_id)) },
    ]);
  }

  const busy = Boolean(pending);
  const dismiss = () => { if (!inFlight.current) onClose(); };
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={dismiss}
      statusBarTranslucent navigationBarTranslucent>
      <SafeAreaProvider style={styles.safe}>
        {Platform.OS === 'android' && <StatusBar style={dark ? 'light' : 'dark'} />}
        <SafeAreaView accessibilityViewIsModal style={styles.safe}>
          <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.workspacePage}>
                <WorkspaceHeading styles={styles} title={editing ? 'Edit interview' : 'Schedule interview'} />
                <View style={styles.card}>
                  <Field styles={styles} colors={colors} label="Company" value={company} maxLength={200}
                    editable={!busy} autoCapitalize="words" onChangeText={value => { setCompany(value); setError(''); }} />
                  <Field styles={styles} colors={colors} label="Role" value={role} maxLength={200}
                    editable={!busy} autoCapitalize="words" onChangeText={value => { setRole(value); setError(''); }} />
                  <View>
                    <Text style={styles.label}>Interview type</Text>
                    <View accessibilityRole="radiogroup" style={styles.calendarTypes}>
                      {INTERVIEW_TYPES.map(option => (
                        <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: type === option, disabled: busy }}
                          disabled={busy} onPress={() => setType(option)}
                          style={({ pressed }) => [styles.calendarType, (pressed || type === option) && styles.calendarTypeSelected]}>
                          <Text style={styles.calendarTypeLabel}>{option}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  <DateTimeField mode="date" value={startsAt} onChange={changeDate}
                    styles={styles} colors={colors} dark={dark} disabled={busy} />
                  <DateTimeField mode="time" value={startsAt} onChange={changeDate}
                    styles={styles} colors={colors} dark={dark} disabled={busy} />
                  {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
                </View>
                <Button styles={styles} title={pending === 'saving' ? 'Saving…' : 'Save interview'} disabled={busy} onPress={save} />
                <Button styles={styles} title="Cancel" secondary disabled={busy} onPress={dismiss} />
                {editing && (
                  <Pressable accessibilityRole="button" disabled={busy} onPress={confirmRemove} style={styles.calendarRemove}>
                    <Text style={styles.error}>{pending === 'removing' ? 'Removing…' : 'Remove interview'}</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
