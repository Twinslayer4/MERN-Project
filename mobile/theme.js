import { StyleSheet } from 'react-native';

export const palette = {
  light: {
    background: '#eef0e7', panel: '#fbfcf8', field: '#ffffff', ink: '#243b30',
    muted: '#5c6c5f', accent: '#45694e', button: '#294736', onButton: '#ffffff',
    line: '#d7ded2', tint: '#e5ebdf', ornament: '#a9ba9f', error: '#a13b37',
  },
  dark: {
    background: '#17181b', panel: '#202125', field: '#25262b', ink: '#ececef',
    muted: '#aeb0b7', accent: '#b3ca9e', button: '#b3ca9e', onButton: '#20271b',
    line: '#3a3c42', tint: '#2b3029', ornament: '#819174', error: '#f3a8a4',
  },
};

export function makeStyles(c, fonts) {
  const body = fonts ? 'DMSans_400Regular' : undefined;
  const semibold = fonts ? 'DMSans_600SemiBold' : undefined;
  const serif = fonts ? 'DMSerifDisplay_400Regular' : 'serif';
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    keyboard: { flex: 1 },
    content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 23, paddingBottom: 28 },
    header: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    mark: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: c.tint },
    markText: { color: c.accent, fontFamily: semibold, fontSize: 15 },
    wordmark: { color: c.ink, fontFamily: semibold, fontSize: 23, letterSpacing: -0.8 },
    themeButton: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: c.line, backgroundColor: c.panel },
    themeIcon: { color: c.ink, fontSize: 21 },
    hero: { paddingTop: 25, paddingBottom: 24, overflow: 'hidden' },
    orbit: { position: 'absolute', right: -48, top: 0, width: 172, height: 172, borderRadius: 86, borderWidth: 1, borderColor: c.line },
    orbitInner: { position: 'absolute', right: -22, top: 16, width: 128, height: 128, borderRadius: 64, borderWidth: 1, borderColor: c.line },
    sparkle: { position: 'absolute', right: 16, top: 21, color: c.ornament, fontSize: 24 },
    eyebrow: { color: c.accent, fontFamily: semibold, fontSize: 11, letterSpacing: 1.35, marginBottom: 9 },
    title: { color: c.ink, fontFamily: serif, fontSize: 45, lineHeight: 48, letterSpacing: -1.3 },
    italic: { color: c.accent, fontFamily: fonts ? 'DMSerifDisplay_400Regular_Italic' : 'serif', fontStyle: fonts ? 'normal' : 'italic' },
    description: { color: c.muted, fontFamily: body, fontSize: 15, lineHeight: 23, marginTop: 12 },
    card: { padding: 20, backgroundColor: c.panel, borderWidth: 1, borderColor: c.line, borderRadius: 18, gap: 16 },
    formTitle: { color: c.ink, fontFamily: serif, fontSize: 28, lineHeight: 34 },
    label: { color: c.ink, fontFamily: semibold, fontSize: 13, marginBottom: 7 },
    input: { color: c.ink, backgroundColor: c.field, borderWidth: 1, borderColor: c.line, borderRadius: 9, minHeight: 50, paddingHorizontal: 12, paddingVertical: 10, fontFamily: body, fontSize: 16 },
    focused: { borderColor: c.accent },
    row: { flexDirection: 'row', gap: 10 },
    column: { flex: 1 },
    password: { position: 'relative', justifyContent: 'center' },
    passwordInput: { paddingRight: 62 },
    passwordToggle: { position: 'absolute', right: 4, minWidth: 52, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    link: { color: c.accent, fontFamily: semibold, fontSize: 14 },
    button: { minHeight: 52, justifyContent: 'center', alignItems: 'center', backgroundColor: c.button, borderRadius: 9, paddingHorizontal: 15, paddingVertical: 12 },
    buttonLabel: { color: c.onButton, fontFamily: semibold, fontSize: 16, textAlign: 'center' },
    outline: { backgroundColor: c.panel, borderWidth: 1, borderColor: c.line },
    outlineLabel: { color: c.accent },
    busy: { opacity: 0.55 },
    switch: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
    bodyText: { color: c.muted, fontFamily: body, fontSize: 14, lineHeight: 20 },
    error: { color: c.error, fontFamily: body, fontSize: 14, lineHeight: 20 },
    footer: { marginTop: 18, textAlign: 'center', color: c.muted, fontFamily: body, fontSize: 12, lineHeight: 18 },
    preview: { marginTop: 14 },
    profile: { gap: 14 },
    profileHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatar: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: c.tint },
    initials: { color: c.accent, fontFamily: serif, fontSize: 23 },
    detail: { borderTopWidth: 1, borderColor: c.line, paddingTop: 12 },
    value: { color: c.ink, fontFamily: body, fontSize: 16 },
    note: { backgroundColor: c.tint, borderRadius: 14, padding: 16, gap: 5 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  });
}
