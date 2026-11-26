import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { dayKey, formatDay, formatTime, monthWeeks, moveMonth, upcomingInterviews } from './calendar.mjs';
import { Button } from './FormControls';
import { InterviewForm } from './InterviewForm';
import { WorkspaceHeading } from './WorkspaceHeading';

const WEEKDAYS = Array.from({ length: 7 }, (_, day) =>
  new Date(1970, 0, 4 + day, 12).toLocaleDateString(undefined, { weekday: 'short' }));

function MonthGrid({ selected, today, counts, styles, colors, onSelect }) {
  const title = selected.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const todayKey = dayKey(today);
  const selectedKey = dayKey(selected);
  return (
    <View style={styles.calendarMonth}>
      <View style={styles.calendarToolbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => onSelect(moveMonth(selected, -1))}
          style={({ pressed }) => [styles.calendarArrow, pressed && styles.calendarControlPressed]}>
          <Feather name="chevron-left" size={23} color={colors.ink} accessible={false} />
        </Pressable>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.calendarMonthTitle}>{title}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => onSelect(moveMonth(selected, 1))}
          style={({ pressed }) => [styles.calendarArrow, pressed && styles.calendarControlPressed]}>
          <Feather name="chevron-right" size={23} color={colors.ink} accessible={false} />
        </Pressable>
      </View>
      <View style={styles.calendarWeek} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {WEEKDAYS.map((weekday, index) => <Text key={index} style={styles.calendarWeekday}>{weekday}</Text>)}
      </View>
      {monthWeeks(selected).map((week, index) => (
        <View key={index} style={styles.calendarWeek}>
          {week.map((date, weekday) => {
            if (!date) return <View key={weekday} style={styles.calendarDay} />;
            const key = dayKey(date);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const count = counts.get(key) || 0;
            const label = [formatDay(date), isToday && 'Today', count && `${count} ${count === 1 ? 'interview' : 'interviews'}`]
              .filter(Boolean).join(', ');
            return (
              <Pressable key={weekday} accessibilityRole="button" accessibilityLabel={label}
                accessibilityState={{ selected: isSelected }} onPress={() => onSelect(date)}
                style={({ pressed }) => [styles.calendarDay, pressed && styles.calendarControlPressed]}>
                <View style={[styles.calendarDayFace, isToday && styles.calendarToday, isSelected && styles.calendarDaySelected]}>
                  <Text style={[styles.calendarDayText, isSelected && styles.workspaceHighlightText]}>{date.getDate()}</Text>
                </View>
                <View style={[styles.calendarDot, Boolean(count) && styles.calendarDotVisible]} />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function InterviewRow({ interview, styles, colors, showDate, onPress, disabled }) {
  const date = new Date(interview.startsAt);
  const when = showDate
    ? `${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${formatTime(date)}`
    : formatTime(date);
  const details = (
    <>
      <View style={styles.column}>
        <Text style={styles.overviewCompany}>{interview.company}</Text>
        <Text style={styles.bodyText}>{interview.role}</Text>
        <Text style={styles.bodyText}>{interview.type}</Text>
        <Text style={styles.calendarEventTime}>{when}</Text>
      </View>
      {onPress && <Feather name="chevron-right" size={19} color={colors.accent} accessible={false} />}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={`${interview.company}, ${interview.role}, ${interview.type}, ${when}`}
      accessibilityHint="Edit interview" onPress={onPress} disabled={disabled}
      style={({ pressed }) => [styles.calendarEventRow, pressed && styles.calendarControlPressed]}>
      {details}
    </Pressable>
  ) : <View style={styles.calendarHomeEvent}>{details}</View>;
}

export function CalendarScreen({ calendar, styles, colors, dark, demo }) {
  const { interviews, loading, error, refresh, save, remove } = calendar;
  const [selected, setSelected] = useState(() => new Date());
  const [draft, setDraft] = useState(null);
  const [notice, setNotice] = useState('');
  const today = new Date();
  const selectedKey = dayKey(selected);
  const counts = new Map();
  const selectedInterviews = [];
  for (const interview of interviews ?? []) {
    const key = dayKey(new Date(interview.startsAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (key === selectedKey) selectedInterviews.push(interview);
  }
  const next = upcomingInterviews(interviews ?? [], today)[0];
  const nextDate = next && new Date(next.startsAt);
  const agendaTitle = selected.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const locked = loading || !!error;

  function schedule() {
    const startsAt = new Date(selected);
    startsAt.setHours(9, 0, 0, 0);
    setNotice('');
    setDraft({ startsAt: startsAt.toISOString() });
  }

  return (
    <View style={styles.workspacePage}>
      <View style={[styles.calendarInset, styles.calendarSection]}>
        <View style={styles.calendarTitleRow}>
          <WorkspaceHeading styles={styles} title="Calendar" />
          <Pressable accessibilityRole="button" onPress={() => setSelected(new Date())}
            style={({ pressed }) => [styles.calendarTodayButton, pressed && styles.calendarControlPressed]}>
            <Text style={styles.link}>Today</Text>
          </Pressable>
        </View>
        {demo && <Text style={styles.bodyText}>Sample interviews stay in this preview.</Text>}
        <Button styles={styles} title="+ Schedule interview" onPress={schedule} disabled={locked} />
        {!!notice && <Text accessibilityLiveRegion="polite" style={styles.link}>{notice}</Text>}
      </View>
      <MonthGrid selected={selected} today={today} counts={counts} styles={styles} colors={colors} onSelect={setSelected} />
      <View style={[styles.calendarInset, styles.calendarSection]}>
        <View style={styles.calendarAgendaHeading}>
          <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.sectionTitle}>{agendaTitle}</Text>
          {interviews !== null && <Text style={styles.bodyText}>
            {selectedInterviews.length} {selectedInterviews.length === 1 ? 'interview' : 'interviews'}
          </Text>}
        </View>
        {error ? (
          <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
            <Button styles={styles} title="Retry loading interviews" onPress={refresh} secondary />
          </View>
        ) : loading && interviews === null ? (
          <View accessibilityLiveRegion="polite" style={styles.overviewLoading}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.bodyText}>Loading interviews…</Text>
          </View>
        ) : selectedInterviews.length ? (
          <View style={styles.calendarEvents}>
            {selectedInterviews.map(interview => (
              <InterviewRow key={interview._id} interview={interview} styles={styles} colors={colors} disabled={locked}
                onPress={() => { setNotice(''); setDraft(interview); }} />
            ))}
          </View>
        ) : (
          <View style={styles.card}><Text style={styles.bodyText}>No interviews scheduled for this day.</Text></View>
        )}
        {nextDate && dayKey(nextDate) !== selectedKey && (
          <Pressable accessibilityRole="button" onPress={() => setSelected(nextDate)}
            style={({ pressed }) => [styles.calendarJump, pressed && styles.calendarControlPressed]}>
            <Text style={[styles.column, styles.link]}>
              Next interview · {nextDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </Text>
            <Feather name="arrow-right" size={17} color={colors.accent} accessible={false} />
          </Pressable>
        )}
      </View>
      {draft && <InterviewForm initial={draft} styles={styles} colors={colors} dark={dark} onClose={() => setDraft(null)}
        onSave={async (values, id) => {
          const interview = await save(values, id);
          setSelected(new Date(interview.startsAt));
          setNotice(id ? 'Interview updated.' : 'Interview scheduled.');
        }}
        onRemove={async id => {
          await remove(id);
          setNotice('Interview removed.');
        }} />}
    </View>
  );
}
