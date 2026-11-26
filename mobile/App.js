import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, TextInput, View, useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic } from '@expo-google-fonts/dm-serif-display';
import { authenticate, getProfile, hasApi } from './api.mjs';
import { ResumeSection } from './ResumeSection';
import { SuggestionsScreen } from './SuggestionsScreen';
import { WorkspaceHeading } from './WorkspaceHeading';
import { makeStyles, palette } from './theme';

const SESSION_KEY = 'nextstep.mobile.session';
const SAMPLE_USER = {
  firstName: 'Jamie', lastName: 'Demo', login: 'jamie.demo', email: 'jamie@example.com',
};
const WORKSPACE_TABS = [['profile', 'Profile'], ['resumes', 'Resumes'], ['suggestions', 'Suggestions']];

function Button({ styles, title, onPress, secondary, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.outline, (pressed || disabled) && styles.busy]}>
      <Text style={[styles.buttonLabel, secondary && styles.outlineLabel]}>{title}</Text>
    </Pressable>
  );
}

function Hero({ styles, label, title, accent, description }) {
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.orbit} />
      <View pointerEvents="none" style={styles.orbitInner} />
      <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.sparkle}>✳</Text>
      <Text style={styles.eyebrow}>{label}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {title}{'\n'}<Text style={styles.italic}>{accent}</Text>
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

function Field({ colors, styles, label, password, ...props }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={password && styles.password}>
        <TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted}
          secureTextEntry={password && !showPassword}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={[styles.input, focused && styles.focused, password && styles.passwordInput]} />
        {password && (
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
            <Text style={styles.link}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function AuthScreen({ mode, changeMode, colors, styles, onSession, onPreview, initialError }) {
  const registering = mode === 'register';
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', login: '', password: '' });
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const field = (key, label, props = {}) => (
    <Field colors={colors} styles={styles} label={label} value={form[key]} editable={!busy}
      onChangeText={value => setForm(current => ({ ...current, [key]: value }))} {...props} />
  );

  async function submit() {
    if (busy) return;
    setError('');
    const { password } = form;
    const login = form.login.trim();
    if (!login || !password) return setError('Enter a username and password.');
    const { firstName, lastName, email } = form;
    if (registering && (!firstName.trim() || !lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return setError('Enter your first name, last name, and a valid email address.');
    }
    Keyboard.dismiss();
    setBusy(true);
    try {
      const body = registering
        ? { login, password, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() }
        : { login, password };
      const session = await authenticate(mode, body);
      await onSession(session, registering);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Hero styles={styles} label={registering ? 'MAKE A START' : 'WELCOME BACK'}
        title={registering ? 'Your next move.' : 'Your next chapter.'}
        accent={registering ? 'Starts here.' : 'All in one place.'}
        description={registering ? 'Make a little room for your job search.' : 'A little clarity for every step of your job search.'} />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.formTitle}>{registering ? 'Create an account' : 'Sign in'}</Text>
        {registering && (
          <View style={styles.row}>
            <View style={styles.column}>{field('firstName', 'First name', { autoComplete: 'given-name', placeholder: 'Jamie' })}</View>
            <View style={styles.column}>{field('lastName', 'Last name', { autoComplete: 'family-name', placeholder: 'Rivera' })}</View>
          </View>
        )}
        {field('login', 'Username', { autoComplete: 'username', autoCapitalize: 'none', autoCorrect: false, placeholder: 'Your username' })}
        {registering && field('email', 'Email', { autoComplete: 'email', autoCapitalize: 'none', keyboardType: 'email-address', placeholder: 'you@example.com' })}
        {field('password', 'Password', { password: true, autoComplete: registering ? 'new-password' : 'current-password', autoCapitalize: 'none', placeholder: 'Your password' })}
        {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
        <Button styles={styles} disabled={busy} onPress={submit}
          title={busy ? (registering ? 'Creating account…' : 'Signing in…') : (registering ? 'Create account  ↗' : 'Sign in  ↗')} />
        <Pressable disabled={busy} accessibilityRole="button" style={styles.switch}
          onPress={() => changeMode(registering ? 'login' : 'register')}>
          <Text style={styles.link}>{registering ? 'Already have an account? Sign in' : 'New to Nextstep? Create an account'}</Text>
        </Pressable>
      </View>
      {!hasApi && (
        <View style={styles.preview}>
          <Button secondary styles={styles} title="Preview sample profile  ↗" onPress={onPreview} />
          <Text style={styles.footer}>The sample profile is available while the account service is offline.</Text>
        </View>
      )}
    </>
  );
}

function Profile({ styles, user, demo, created, notice, busy, onRefresh, onSignOut }) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.login || 'Nextstep member';
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  return (
    <View style={styles.workspacePage}>
      <WorkspaceHeading styles={styles} title="Profile" description={demo ? 'You’re viewing a sample account.' : undefined} />
      {created && <Text accessibilityLiveRegion="polite" style={styles.link}>Your account is ready.</Text>}
      <View style={styles.card}>
        <View style={styles.profileHead}>
          <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>
          <View style={styles.column}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>{displayName}</Text>
          </View>
        </View>
        {[[ 'Username', user.login ], [ 'Email', user.email ]].map(([label, value]) => (
          <View key={label} style={styles.detail}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value || '—'}</Text>
          </View>
        ))}
      </View>
      {!!notice && <Text accessibilityLiveRegion="polite" style={styles.bodyText}>{notice}</Text>}
      {!demo && <Button secondary styles={styles} disabled={busy} title="Refresh profile" onPress={onRefresh} />}
      <Button secondary styles={styles} disabled={busy} title={demo ? 'Back to sign in' : 'Sign out'} onPress={onSignOut} />
    </View>
  );
}

function AppHeader({ styles, dark, onToggleTheme, workspace }) {
  return (
    <View style={[styles.content, styles.headerContent]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={[styles.mark, workspace && styles.workspaceMark]}>
            <Text style={[styles.markText, workspace && styles.workspaceHighlightText]}>n↗</Text>
          </View>
          <View style={styles.brandName}>
            <Text style={[styles.wordmark, workspace && styles.workspaceWordmark]}>nextstep</Text>
            {workspace && <Text style={styles.workspaceSubtitle}>Career workspace</Text>}
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={[styles.themeButton, workspace && styles.workspaceThemeButton]} onPress={onToggleTheme}>
          <Text style={[styles.themeIcon, workspace && styles.workspaceWordmark]}>{dark ? '☀' : '☾'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function WorkspacePanel({ styles, active, children }) {
  return (
    <ScrollView style={!active && styles.hidden} accessibilityElementsHidden={!active}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'} keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

function Workspace({ styles, colors, session, demo, dark, onToggleTheme, ...profileProps }) {
  const [tab, setTab] = useState('profile');

  return (
    <>
      <SafeAreaView edges={['top']} style={styles.workspaceChrome}>
        <AppHeader styles={styles} dark={dark} onToggleTheme={onToggleTheme} workspace />
        <View style={[styles.content, styles.workspaceNav]}>
          <View accessibilityRole="tablist" style={styles.workspaceTabs}>
            {WORKSPACE_TABS.map(([id, label]) => {
              const selected = tab === id;
              return (
                <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected }}
                  onPress={() => setTab(id)} style={({ pressed }) => [
                    styles.workspaceTab, pressed && styles.workspaceTabPressed, selected && styles.workspaceTabSelected,
                  ]}>
                  <Text style={[styles.workspaceTabLabel, selected && styles.workspaceHighlightText]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
      <WorkspacePanel styles={styles} active={tab === 'profile'}>
        <Profile {...profileProps} styles={styles} demo={demo} user={demo ? SAMPLE_USER : session.user} />
      </WorkspacePanel>
      <WorkspacePanel styles={styles} active={tab === 'resumes'}>
        <ResumeSection styles={styles} colors={colors} session={session} demo={demo} disabled={profileProps.busy} />
      </WorkspacePanel>
      <WorkspacePanel styles={styles} active={tab === 'suggestions'}>
        <SuggestionsScreen styles={styles} colors={colors} session={session} demo={demo} active={tab === 'suggestions'}
          onOpenResumes={() => setTab('resumes')} />
      </WorkspacePanel>
    </>
  );
}

function Nextstep() {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(null);
  const dark = (theme || systemTheme) === 'dark';
  const colors = palette[dark ? 'dark' : 'light'];
  const [fontsLoaded] = useFonts({ DMSans_400Regular, DMSans_600SemiBold, DMSerifDisplay_400Regular, DMSerifDisplay_400Regular_Italic });
  const styles = useMemo(() => makeStyles(colors, fontsLoaded), [colors, fontsLoaded]);
  const [mode, setMode] = useState('login');
  const [session, setSession] = useState(null);
  const [demo, setDemo] = useState(false);
  const [created, setCreated] = useState(false);
  const [restoring, setRestoring] = useState(hasApi);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!hasApi) return;
    let active = true;
    async function restore() {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (!stored) return;
        const { userId, token } = JSON.parse(stored);
        if (typeof userId !== 'string' || typeof token !== 'string') return;
        const user = await getProfile(userId, token);
        if (active) setSession({ token, user });
      } catch (err) {
        if (err.status === 401 || err.status === 404) {
          await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
          if (active) setNotice('Please sign in again to continue.');
        } else if (active) {
          setNotice('Could not restore your session. Sign in to reconnect.');
        }
      } finally {
        if (active) setRestoring(false);
      }
    }
    restore();
    return () => { active = false; };
  }, []);

  async function startSession(nextSession, newlyCreated) {
    let storageNotice = '';
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ userId: nextSession.user._id, token: nextSession.token }));
    } catch {
      storageNotice = 'Your sign-in could only be saved for this visit.';
    }
    setNotice(storageNotice);
    setCreated(newlyCreated);
    setSession(nextSession);
  }

  async function signOut() {
    if (demo) {
      setDemo(false);
      setMode('login');
      return;
    }
    setBusy(true);
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      setSession(null);
      setMode('login');
      setCreated(false);
      setNotice('');
    } catch {
      setNotice('Could not clear the saved session. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setBusy(true);
    setNotice('');
    try {
      const user = await getProfile(session.user._id, session.token);
      setSession({ token: session.token, user });
    } catch (err) {
      if (err.status === 401 || err.status === 404) await signOut();
      else setNotice(err.message);
    } finally {
      setBusy(false);
    }
  }

  const inWorkspace = Boolean(session || demo);
  const toggleTheme = () => setTheme(dark ? 'light' : 'dark');
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safe}>
      <StatusBar style={dark || inWorkspace ? 'light' : 'dark'} />
      {restoring ? (
        <View style={styles.loading}><ActivityIndicator color={colors.accent} /><Text style={styles.bodyText}>Opening Nextstep…</Text></View>
      ) : (
        <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {inWorkspace ? (
            <Workspace key={session?.user._id || 'demo'} styles={styles} colors={colors}
              session={session} demo={demo} created={created} dark={dark} onToggleTheme={toggleTheme}
              notice={notice} busy={busy} onRefresh={refresh} onSignOut={signOut} />
          ) : (
            <>
              <SafeAreaView edges={['top']}>
                <AppHeader styles={styles} dark={dark} onToggleTheme={toggleTheme} />
              </SafeAreaView>
              <ScrollView key={mode} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
                <AuthScreen mode={mode} changeMode={value => { setMode(value); setNotice(''); }} colors={colors} styles={styles}
                  onSession={startSession} onPreview={() => setDemo(true)} initialError={notice} />
              </ScrollView>
            </>
          )}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return <SafeAreaProvider><Nextstep /></SafeAreaProvider>;
}
