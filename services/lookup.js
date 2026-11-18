const cheerio = require('cheerio');
const dns = require('dns').promises;
const net = require('net');

const UA = 'JobTrackerStudentProject/1.0';

function isPrivate(ip) {
  if (net.isIPv6(ip)) {
    return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254);
}

async function assertPublicUrl(raw) {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http and https links are allowed');
  }
  const addrs = await dns.lookup(url.hostname, { all: true });
  if (addrs.some((a) => isPrivate(a.address))) {
    throw new Error('That address is not allowed');
  }
  return url;
}

async function safeFetch(raw) {
  let url = await assertPublicUrl(raw);
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000)
    });
    const next = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && next) {
      url = await assertPublicUrl(new URL(next, url).href);
      continue;
    }
    if (!res.ok) throw new Error(`Site returned ${res.status}`);
    return res.text();
  }
  throw new Error('Too many redirects');
}

async function importJob(rawUrl) {
  const gh = await require('./greenhouse')(rawUrl); if (gh) return gh;
  const html = await safeFetch(rawUrl);
  const $ = cheerio.load(html);
  let job = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).contents().text());
      const items = Array.isArray(data) ? data : data['@graph'] || [data];
      const found = items.find((x) => x['@type'] === 'JobPosting');
      if (found) job = found;
    } catch (e) {
      return;
    }
  });
  if (job) {
    return {
      jobTitle: job.title || '',
      company: (job.hiringOrganization && job.hiringOrganization.name) || '',
      description: cheerio.load(job.description || '').text().trim().slice(0, 5000)
    };
  }
  return {
    jobTitle: $('meta[property="og:title"]').attr('content') || $('title').text().trim(),
    company: $('meta[property="og:site_name"]').attr('content') || '',
    description: ($('meta[property="og:description"]').attr('content') || '').slice(0, 5000)
  };
}

async function companyInfo(name) {
  const title = encodeURIComponent(name.trim().replace(/\s+/g, '_'));
  const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type === 'disambiguation') return null;
  return {
    name: data.title,
    description: data.extract,
    source: data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page
  };
}

module.exports = { importJob, companyInfo };
