import { useEffect, useState } from 'react';
import { deleteInterview, listInterviews, saveInterview } from './api.mjs';
import { orderInterviews } from './calendar.mjs';
import { exampleApplications } from './suggestionExamples';

function sampleInterviews() {
  return exampleApplications.slice(0, 2).map((application, index) => {
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + index * 3 + 1);
    startsAt.setHours(10 + index * 4, 30, 0, 0);
    return {
      _id: application._id, company: application.company, role: application.jobTitle,
      type: index === 0 ? 'Technical interview' : 'Recruiter screen', startsAt: startsAt.toISOString(),
    };
  });
}

export function useInterviews(session, demo) {
  const userId = session?.user._id;
  const token = session?.token;
  const [interviews, setInterviews] = useState(() => demo ? sampleInterviews() : null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!demo);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (demo || !userId || !token) return;
    let current = true;
    setLoading(true);
    setError('');
    listInterviews(userId, token).then(items => {
      if (current) setInterviews(items);
    }).catch(err => {
      if (current) setError(err.status === 404 ? 'This server does not have interview scheduling yet.' : err.message);
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [userId, token, demo, attempt]);

  function refresh() {
    if (!demo && !loading) setAttempt(value => value + 1);
  }

  async function save(body, id) {
    const interview = demo
      ? { ...body, _id: id || `preview-${Date.now()}` }
      : await saveInterview(userId, token, body, id);
    setInterviews(items => orderInterviews([...(items ?? []).filter(item => item._id !== interview._id), interview]));
    return interview;
  }

  async function remove(id) {
    if (!demo) await deleteInterview(userId, token, id);
    setInterviews(items => items.filter(item => item._id !== id));
  }

  return { interviews, loading, error, refresh, save, remove };
}
