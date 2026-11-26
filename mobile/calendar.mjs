export const INTERVIEW_TYPES = [
  'Recruiter screen', 'Technical interview', 'Behavioral interview', 'On-site interview', 'Final interview',
];

export function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function moveMonth(date, offset) {
  const month = new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12).getDate();
  month.setDate(Math.min(date.getDate(), lastDay));
  return month;
}

export function monthWeeks(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const offset = new Date(year, month, 1, 12).getDay();
  const length = new Date(year, month + 1, 0, 12).getDate();

  return Array.from({ length: Math.ceil((offset + length) / 7) }, (_, week) => (
    Array.from({ length: 7 }, (_, weekday) => {
      const day = week * 7 + weekday - offset + 1;
      return day < 1 || day > length ? null : new Date(year, month, day, 12);
    })
  ));
}

export function formatDay(date) {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(date) {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function orderInterviews(interviews) {
  return [...interviews].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export function upcomingInterviews(interviews, now = new Date()) {
  return interviews.filter(interview => Date.parse(interview.startsAt) >= now.getTime());
}
