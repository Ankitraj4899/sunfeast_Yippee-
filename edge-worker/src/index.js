const EDS_HOST = 'main--sunfeast-yippee--ankitraj4899.aem.live';
const BACKEND_NAME = 'eds_origin';

function extractPageMetadata(html) {
  const ogTitleMatch = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);

  const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)
    || html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);

  const rawTitle = ogTitleMatch?.[1] || titleMatch?.[1] || h1Match?.[1] || 'Sunfeast YiPPee!';
  const rawDesc = descMatch?.[1] || '';

  return {
    title: rawTitle
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim(),
    description: rawDesc
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim(),
  };
}

function generateBaseSchema(url, { title, description } = {}) {
  const { origin } = url;

  const webPageEntity = {
    '@type': 'WebPage',
    '@id': `${url.href}#webpage`,
    url: url.href,
    name: title || 'Sunfeast YiPPee!',
    inLanguage: 'en',
    isPartOf: {
      '@id': `${origin}/#website`,
    },
    about: {
      '@id': `${origin}/#organization`,
    },
  };

  if (description) {
    webPageEntity.description = description;
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'Sunfeast YiPPee!',
        url: `${origin}/`,
        logo: {
          '@type': 'ImageObject',
          '@id': `${origin}/#logo`,
          url: `${origin}/yippee1.png`,
          caption: 'Sunfeast YiPPee!',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: 'Sunfeast YiPPee!',
        publisher: {
          '@id': `${origin}/#organization`,
        },
      },
      webPageEntity,
    ],
  };
}

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);

  const upstreamHeaders = new Headers(req.headers);
  upstreamHeaders.set('host', EDS_HOST);

  const upstreamUrl = new URL(url.pathname + url.search, `https://${EDS_HOST}`);

  const originResponse = await fetch(upstreamUrl.toString(), {
    backend: BACKEND_NAME,
    method: req.method,
    headers: upstreamHeaders,
  });

  const contentType = originResponse.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    return originResponse;
  }

  let html = await originResponse.text();

  const metadata = extractPageMetadata(html);

  const schema = generateBaseSchema(url, metadata);
  const jsonLdScript = `\n<script id="schema-graph" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${jsonLdScript}</head>`);
  } else {
    html = `${jsonLdScript}${html}`;
  }

  const responseHeaders = new Headers(originResponse.headers);
  responseHeaders.delete('content-length');

  return new Response(html, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });
}

addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));
