interface Env {
  ANALYTICS: AnalyticsEngineDataset;
}

const SEARCH_ENGINES = [
  'google.', 'bing.com', 'duckduckgo.com', 'search.brave.com', 'yandex.',
  'baidu.com', 'ecosia.org', 'startpage.com', 'kagi.com', 'perplexity.ai',
  'you.com', 'neeva.com',
];

const SOCIAL = [
  't.co', 'twitter.com', 'x.com',
  'facebook.com', 'fb.com', 'l.facebook.com',
  'linkedin.com', 'lnkd.in',
  'instagram.com',
  'threads.net',
  'bsky.app',
  'mastodon.social', 'mas.to', 'hachyderm.io',
];

const DEV = [
  'github.com', 'raw.githubusercontent.com', 'gist.github.com',
  'news.ycombinator.com', 'lobste.rs',
  'reddit.com', 'old.reddit.com', 'www.reddit.com',
  'dev.to', 'medium.com', 'hashnode.com',
  'stackoverflow.com',
];

const BOTS = /bot|crawl|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|curl|wget|python|httpx|axios|node-fetch|go-http|java|ruby|perl|php/i;

const SKIP_EXTENSIONS = /\.(css|js|json|xml|txt|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|mp3|mp4|webm|pdf|zip|tar|gz)$/i;

const SKIP_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/index.xml',
  '/custom.css',
];

function categorizeReferrer(refHost: string, ownHost: string): string {
  if (!refHost) return 'direct';
  if (refHost === ownHost || refHost === `www.${ownHost}`) return 'internal';
  
  const lower = refHost.toLowerCase();
  
  for (const pattern of SEARCH_ENGINES) {
    if (lower.includes(pattern)) return 'search';
  }
  for (const pattern of SOCIAL) {
    if (lower === pattern || lower.endsWith('.' + pattern)) return 'social';
  }
  for (const pattern of DEV) {
    if (lower === pattern || lower.endsWith('.' + pattern)) return 'dev';
  }
  
  return 'other';
}

function shouldTrack(request: Request, url: URL, ua: string): boolean {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  
  if (BOTS.test(ua)) return false;
  
  if (SKIP_EXTENSIONS.test(url.pathname)) return false;
  if (SKIP_PATHS.includes(url.pathname)) return false;
  if (url.pathname.startsWith('/images/')) return false;
  if (url.pathname.startsWith('/fonts/')) return false;
  
  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html')) return false;
  
  // Skip non-trailing-slash paths (Hugo redirects these, causes double-logging)
  if (!url.pathname.endsWith('/') && !url.pathname.includes('.')) return false;
  
  return true;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';
  
  if (!shouldTrack(request, url, ua)) {
    return next();
  }
  
  const referer = request.headers.get('referer') || '';
  let refHost = '';
  let refPath = '';
  
  try {
    if (referer) {
      const refUrl = new URL(referer);
      refHost = refUrl.hostname;
      refPath = refUrl.pathname;
    }
  } catch {}
  
  const ownHost = url.hostname;
  const source = categorizeReferrer(refHost, ownHost);
  const isInternal = source === 'internal';
  
  const utmSource = url.searchParams.get('utm_source') || '';
  const utmMedium = url.searchParams.get('utm_medium') || '';
  const utmCampaign = url.searchParams.get('utm_campaign') || '';
  
  const cf = request.cf || {};
  const country = (cf as any).country || 'XX';
  
  const effectiveSource = utmSource || source;
  const fromPath = isInternal ? refPath : '';
  
  const logData = {
    event: 'pageview',
    path: url.pathname,
    source: effectiveSource,
    refHost,
    fromPath: fromPath || undefined,
    country,
    utmMedium: utmMedium || undefined,
    utmCampaign: utmCampaign || undefined,
  };
  
  console.log(JSON.stringify(logData));
  
  if (env.ANALYTICS) {
    env.ANALYTICS.writeDataPoint({
      indexes: [url.pathname],
      blobs: [
        effectiveSource,
        refHost,
        fromPath,
        country,
        utmMedium,
        utmCampaign,
      ],
      doubles: [1],
    });
  }
  
  return next();
};
