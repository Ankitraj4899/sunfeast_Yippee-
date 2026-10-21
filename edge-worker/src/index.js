const EDS_HOST = 'main--sunfeast-yippee--ankitraj4899.aem.live';
const BACKEND_NAME = 'eds_origin';

function generateBaseSchema(url) {
  const { origin } = url;
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
      {
        '@type': 'WebPage',
        '@id': `${url.href}#webpage`,
        url: url.href,
        name: 'Sunfeast YiPPee!',
        isPartOf: {
          '@id': `${origin}/#website`,
        },
        about: {
          '@id': `${origin}/#organization`,
        },
      },
    ],
  };
}

async function handleRequest(event) {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Prepare upstream request headers
  const upstreamHeaders = new Headers(req.headers);
  upstreamHeaders.set('host', EDS_HOST);

  // Construct target URL on Adobe EDS
  const upstreamUrl = new URL(url.pathname + url.search, `https://${EDS_HOST}`);

  // 2. Fetch from Adobe EDS origin backend defined in fastly.toml
  const originResponse = await fetch(upstreamUrl.toString(), {
    backend: BACKEND_NAME,
    method: req.method,
    headers: upstreamHeaders,
  });

  const contentType = originResponse.headers.get('content-type') || '';

  // Stream non-HTML responses (CSS, JS, images, fonts) directly
  if (!contentType.includes('text/html')) {
    return originResponse;
  }

  // 3. Generate Schema.org JSON-LD for this URL
  const schema = generateBaseSchema(url);
  const jsonLdScript = `\n<script id="schema-graph" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;

  // 4. Inject JSON-LD before </head>
  let html = await originResponse.text();
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${jsonLdScript}</head>`);
  } else {
    html = `${jsonLdScript}${html}`;
  }

  // 5. Construct response preserving original headers
  const responseHeaders = new Headers(originResponse.headers);
  responseHeaders.delete('content-length');

  return new Response(html, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });
}

// Fastly Compute fetch event listener
// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => event.respondWith(handleRequest(event)));
