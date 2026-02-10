function generateVisitorId() {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function getVisitorId() {
  if (typeof window !== 'undefined' && window.posthog?.get_distinct_id) {
    const id = window.posthog.get_distinct_id();
    if (id) {
      const clean = String(id).replace(/[^a-f0-9]/gi, '').substring(0, 8);
      return { display: clean || generateVisitorId().substring(0, 8), hash: id };
    }
  }
  const random = generateVisitorId();
  return { display: random.substring(0, 8), hash: random };
}

function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
  } catch {
    return 'Unknown';
  }
}

function getExpDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getCrewId() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${mm}${dd}`;
}

function hashVisitorId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const chr = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0');
  return hex.substring(0, 6);
}

function getRank() {
  const ref = document.referrer;
  if (!ref || ref === '' || ref.includes('google.')) {
    return 'Captain';
  }
  try {
    if (new URL(ref).origin === window.location.origin) return 'Captain';
  } catch {}
  return '1st Lt.';
}

function getOS() {
  const ua = navigator.userAgent;
  if (/Macintosh|Mac OS X/.test(ua)) return 'Macintosh';
  if (/Windows NT/.test(ua)) return 'NT Kernel';
  if (/Linux/.test(ua)) return 'Penguin';
  return 'Spaceship';
}

function getRating() {
  const ref = document.referrer;
  if (ref && ref.includes('github.')) {
    return 'Commercial';
  }
  return 'Private';
}

const adjectives = [
  'strict', 'restless', 'vivid', 'gentle', 'fierce',
  'silent', 'hollow', 'bright', 'frozen', 'drifting',
  'lucid', 'wicked', 'tender', 'bold', 'faint',
  'rapid', 'cryptic', 'lunar', 'solar', 'phantom'
];

const nouns = [
  'scientist', 'architect', 'pilgrim', 'wanderer', 'cartographer',
  'composer', 'navigator', 'alchemist', 'sentinel', 'artificer',
  'observer', 'machinist', 'botanist', 'fabulist', 'clockmaker',
  'sculptor', 'theorist', 'drifter', 'inventor', 'curator'
];

function getOrganization() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return { display: `${adj} ${noun}`, adj, noun };
}

function buildCardData() {
  const { display: idDisplay, hash: visitorIdHash } = getVisitorId();
  const idDisplayPadded = idDisplay.length >= 8 ? idDisplay.substring(0, 8) : idDisplay.padEnd(8, '0');
  const timezone = getTimezone();
  const exp = getExpDate();
  const crewId = getCrewId();
  const callsign = hashVisitorId(visitorIdHash);
  const rank = getRank();
  const os = getOS();
  const rating = getRating();
  const org = getOrganization();
  const organization = org.display;

  const idSource = typeof window !== 'undefined' && window.posthog?.get_distinct_id
    ? 'posthog.get_distinct_id()'
    : 'fallback: random hex';
  const timezoneRaw = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone ?? 'N/A';
  const rankRaw = document.referrer;
  const ratingRaw = document.referrer;
  const osRaw = navigator.userAgent;

  console.log('[viruus card] non-user-editable fields:', {
    ID: { source: idSource, raw: visitorIdHash, display: idDisplayPadded },
    TIMEZONE: { source: 'Intl.DateTimeFormat().resolvedOptions().timeZone', raw: timezoneRaw, display: timezone },
    'EXP. DATE': { source: 'new Date() + 14 days', raw: exp, display: exp },
    'CREW ID': { source: 'MMDD from current date', raw: crewId, display: crewId },
    CALLSIGN: { source: 'hash of visitor ID (djb2)', raw: visitorIdHash, display: callsign },
    RANK: { source: 'document.referrer (Captain if empty/google/same-origin, else 1st Lt.)', raw: rankRaw ?? '(empty)', display: rank },
    OS: { source: 'navigator.userAgent', raw: osRaw, display: os },
    RATING: { source: 'document.referrer (Commercial if github, else Private)', raw: ratingRaw ?? '(empty)', display: rating },
    ORGANIZATION: { source: 'random adjective + noun from lists', raw: { adj: org.adj, noun: org.noun }, display: organization }
  });

  return {
    id: idDisplayPadded,
    timezone,
    exp,
    crewId,
    callsign,
    rank,
    os,
    rating,
    organization
  };
}

export { buildCardData };
