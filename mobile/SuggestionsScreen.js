import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { generateSuggestions, hasSuggestionsApi, listApplications, listResumes } from './api.mjs';
import { exampleApplications, exampleResume, getExampleSuggestions } from './suggestionExamples';
import { WorkspaceHeading } from './WorkspaceHeading';

function Selector({ styles, label, title, detail, disabled, onPress }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ disabled }}
        accessibilityLabel={`${label}, ${title}`}
        disabled={disabled} onPress={onPress}
        style={({ pressed }) => [styles.suggestionSelector, pressed && styles.suggestionSelected]}>
        <View style={styles.column}>
          <Text style={styles.suggestionChoiceTitle}>{title}</Text>
          {detail && <Text style={styles.bodyText}>{detail}</Text>}
        </View>
        {!disabled && (
          <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.suggestionChevron}>›</Text>
        )}
      </Pressable>
    </View>
  );
}

function Picker({ styles, mode, items, selectedResume, selectedApplications, onSelect, onClose }) {
  if (!mode) return null;
  const choosingResume = mode === 'resume';
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={styles.safe}>
        <SafeAreaView accessibilityViewIsModal style={styles.suggestionSheet}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {choosingResume ? 'Choose a resume' : 'Choose applications'}
          </Text>
          {!choosingResume && (
            <Text style={styles.bodyText}>Choose any saved roles that have a job description.</Text>
          )}
          <FlatList
            style={styles.suggestionList}
            data={items}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.suggestionChoices}
            renderItem={({ item }) => {
              const checked = choosingResume ? selectedResume === item._id : selectedApplications.includes(item._id);
              const disabled = !choosingResume && !item.hasJobDescription;
              return (
                <Pressable accessibilityRole={choosingResume ? 'radio' : 'checkbox'}
                  accessibilityState={{ checked, disabled }}
                  disabled={disabled} onPress={() => onSelect(item._id)}
                  style={({ pressed }) => [styles.suggestionSelector, (checked || pressed) && styles.suggestionSelected]}>
                  <View style={styles.column}>
                    <Text style={styles.suggestionChoiceTitle}>
                      {choosingResume ? item.name : item.jobTitle}
                    </Text>
                    {!choosingResume && (
                      <Text style={styles.bodyText}>
                        {[item.company, disabled && 'No job description'].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                  </View>
                  {!disabled && (
                    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
                      style={[styles.suggestionCheck, choosingResume && styles.suggestionRadio, checked && styles.suggestionChecked]}>
                      {!!checked && <Text style={styles.suggestionCheckLabel}>✓</Text>}
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
          <Pressable accessibilityRole="button" onPress={onClose}
            style={({ pressed }) => [styles.button, styles.suggestionDone, pressed && styles.busy]}>
            <Text style={styles.buttonLabel}>Done</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

function Results({ styles, suggestions, applications }) {
  const count = applications.length;
  return (
    <View style={styles.suggestionResults}>
      <View style={styles.suggestionIntro} accessibilityLiveRegion="polite">
        <Text accessibilityRole="header" style={styles.sectionTitle}>Your suggestions</Text>
        <Text style={styles.bodyText}>
          {count === 1 ? `Based on the ${applications[0].jobTitle} application` : `Based on ${count} applications`}
        </Text>
      </View>
      {suggestions.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.bodyText}>No suggestions were returned. Try a different resume or set of applications.</Text>
        </View>
      )}
      {suggestions.map((suggestion, index) => (
        <View key={`${suggestion.title}-${index}`} style={styles.suggestionResult}>
          <View style={styles.suggestionIntro}>
            {suggestion.category && <Text style={styles.suggestionCategory}>{suggestion.category}</Text>}
            <Text accessibilityRole="header" style={styles.suggestionTitle}>{suggestion.title}</Text>
          </View>
          <Text style={styles.bodyText}>{suggestion.rationale}</Text>
          {suggestion.nextSteps.length > 0 && (
            <View style={styles.suggestionSteps}>
              <Text style={styles.suggestionChoiceTitle}>Next steps</Text>
              {suggestion.nextSteps.map((step, stepIndex) => (
                <View key={`${step}-${stepIndex}`} style={styles.suggestionStep}>
                  <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.link}>•</Text>
                  <Text style={[styles.column, styles.bodyText]}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function loadError(result, fallback, unavailable) {
  if (result?.status !== 'rejected') return '';
  if (result.reason?.status === 401) return 'Your session expired. Sign in again.';
  if (result.reason?.status === 404) return unavailable;
  return fallback;
}

function SuggestionWorkspace({ styles, colors, session, active, preview, onOpenResumes, onPreview }) {
  const userId = session?.user._id;
  const token = session?.token;
  const [sources, setSources] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(!preview);
  const [resumeId, setResumeId] = useState(preview ? exampleResume._id : '');
  const [applicationIds, setApplicationIds] = useState(preview ? [exampleApplications[0]._id] : []);
  const [picker, setPicker] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [result, setResult] = useState(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (preview || !active || !userId || !token) return;
    let current = true;
    setLoading(true);
    Promise.allSettled([listResumes(userId, token), listApplications(userId, token)]).then(([resumes, applications]) => {
      if (!current) return;
      setSources({ resumes, applications });
      if (resumes.status === 'fulfilled') {
        setResumeId(previous => {
          if (resumes.value.some(item => item._id === previous)) return previous;
          return resumes.value.length === 1 ? resumes.value[0]._id : '';
        });
      }
      if (applications.status === 'fulfilled') {
        const eligibleIds = new Set(applications.value.filter(item => item.hasJobDescription).map(item => item._id));
        setApplicationIds(previous => previous.filter(id => eligibleIds.has(id)));
      }
      setLoading(false);
    });
    return () => { current = false; };
  }, [active, preview, userId, token, refresh]);

  const resumes = preview ? [exampleResume] : sources?.resumes.value ?? [];
  const applications = preview ? exampleApplications : sources?.applications.value ?? [];
  const resume = resumes.find(item => item._id === resumeId);
  const chosenApplications = applications.filter(item => item.hasJobDescription && applicationIds.includes(item._id));
  const eligibleCount = applications.filter(item => item.hasJobDescription).length;
  const count = chosenApplications.length;
  const inputKey = JSON.stringify([resume?._id, ...chosenApplications.map(item => item._id).sort()]);
  const resumeError = loadError(sources?.resumes, 'Could not load your resumes.', 'Resumes aren’t available on this server.');
  const applicationError = loadError(sources?.applications, 'Could not load your applications.', 'Saved applications aren’t available on this server yet.');
  const canGenerate = Boolean(resume && count && !loading && !generating && (preview || hasSuggestionsApi));

  function select(id) {
    setResult(null);
    setGenerationError('');
    if (picker === 'resume') {
      setResumeId(id);
      setPicker(null);
    } else {
      setApplicationIds(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
    }
  }

  async function runSuggestions() {
    if (!canGenerate || inFlight.current) return;
    inFlight.current = true;
    setGenerating(true);
    setGenerationError('');
    setResult(null);
    try {
      const ids = chosenApplications.map(item => item._id);
      const suggestions = preview
        ? getExampleSuggestions(ids)
        : await generateSuggestions(userId, token, resume._id, ids);
      setResult({ inputKey, suggestions });
    } catch (err) {
      setGenerationError(err.status === 401 ? 'Your session expired. Sign in again.' : err.message);
    } finally {
      inFlight.current = false;
      setGenerating(false);
    }
  }

  const resumeTitle = resume?.name ?? 'Choose a resume';
  const applicationTitle = count === 1 ? chosenApplications[0].jobTitle : 'Choose applications';
  const applicationDetail = count === 1
    ? chosenApplications[0].company
    : chosenApplications.map(item => item.jobTitle).join(' · ');
  const showingResult = result?.inputKey === inputKey;
  const actionLabel = preview ? 'See sample suggestions' : 'Get AI suggestions';

  return (
    <>
      {!preview && !hasSuggestionsApi && (
        <View style={styles.suggestionNotice}>
          <Text style={styles.bodyText}>Live suggestions are still being connected.</Text>
          <Pressable accessibilityRole="button" onPress={onPreview} style={styles.suggestionLinkButton}>
            <Text style={styles.link}>Preview with sample data</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.card}>
        <Selector styles={styles} label="Resume" title={resumeTitle} disabled={generating || loading || !resumes.length}
          onPress={() => setPicker('resume')} />
        {resumeError && !loading && <Text accessibilityRole="alert" style={styles.error}>{resumeError}</Text>}
        {!preview && !loading && !resumeError && !resumes.length && (
          <Pressable accessibilityRole="button" onPress={onOpenResumes} style={styles.suggestionLinkButton}>
            <Text style={styles.link}>Upload a resume</Text>
          </Pressable>
        )}
        <Selector styles={styles} label="Target applications"
          title={count > 1 ? `${count} applications selected` : applicationTitle} detail={applicationDetail}
          disabled={generating || loading || !applications.length} onPress={() => setPicker('applications')} />
        {applicationError && !loading && <Text accessibilityRole="alert" style={styles.error}>{applicationError}</Text>}
        {!loading && !applicationError && !eligibleCount && (
          <Text style={styles.bodyText}>Save an application with a job description to use it here.</Text>
        )}
        {loading && (
          <View accessibilityLiveRegion="polite" style={styles.resumeLoading}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.bodyText}>Loading your resumes and applications…</Text>
          </View>
        )}
        {!loading && (resumeError || applicationError) && (
          <Pressable accessibilityRole="button" onPress={() => setRefresh(previous => previous + 1)}
            style={styles.suggestionLinkButton}>
            <Text style={styles.link}>Reload sources</Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !canGenerate, busy: generating }}
          disabled={!canGenerate} onPress={runSuggestions}
          style={({ pressed }) => [styles.button, (!canGenerate || pressed) && styles.busy]}>
          <Text style={styles.buttonLabel}>{generating ? 'Finding suggestions…' : actionLabel}</Text>
        </Pressable>
        {generationError && (
          <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{generationError}</Text>
        )}
      </View>
      {showingResult && <Results styles={styles} suggestions={result.suggestions} applications={chosenApplications} />}
      <Picker styles={styles} mode={active ? picker : null} items={picker === 'resume' ? resumes : applications}
        selectedResume={resumeId} selectedApplications={applicationIds} onSelect={select} onClose={() => setPicker(null)} />
    </>
  );
}

export function SuggestionsScreen({ styles, colors, session, demo, active, onOpenResumes }) {
  const [preview, setPreview] = useState(demo);

  return (
    <View style={styles.workspacePage}>
      <WorkspaceHeading styles={styles} title="Suggestions"
        description="Get project ideas and practical next steps based on your resume and the roles you choose." />
      {preview && (
        <View style={styles.suggestionNotice}>
          <Text style={styles.suggestionChoiceTitle}>Sample preview</Text>
          <Text style={styles.bodyText}>Try the flow with Jamie’s sample resume and applications.</Text>
          {!demo && (
            <Pressable accessibilityRole="button" style={styles.suggestionLinkButton} onPress={() => setPreview(false)}>
              <Text style={styles.link}>Back to your account</Text>
            </Pressable>
          )}
        </View>
      )}
      <SuggestionWorkspace key={preview ? 'sample' : 'account'} styles={styles} colors={colors} session={session}
        active={active} preview={preview} onOpenResumes={onOpenResumes} onPreview={() => setPreview(true)} />
    </View>
  );
}
