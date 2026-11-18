const cheerio = require('cheerio');

const UA = 'JobTrackerStudentProject/1.0';

function toText(html) {
  const once = cheerio.load(html || '').text();
  return cheerio.load(once).text().trim();
}

module.exports = async function greenhouseJob(rawUrl) {
  const url = new URL(rawUrl);
  if (!/(^|\.)greenhouse\.io$/.test(url.hostname)) return null;
  const match = url.pathname.match(/^\/([^/]+)\/jobs\/(\d+)/);
  if (!match) return null;
  const board = match[1];
  const id = match[2];
  const api = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs/${id}`;
  const res = await fetch(api, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    jobTitle: data.title || '',
    company: data.company_name || board,
    location: (data.location && data.location.name) || '',
    description: toText(data.content).slice(0, 5000)
  };
};
