const EDS_ORIGIN = 'https://main--sunfeast-yippee--ankitraj4899.aem.live';

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Forward request to Adobe EDS origin
    const upstreamUrl = new URL(url.pathname + url.search, EDS_ORIGIN);
    const originResponse = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: request.headers,
    });

    const contentType = originResponse.headers.get('content-type') || '';

    // Only rewrite HTML pages
    if (!contentType.includes('text/html')) {
      return originResponse;
    }

    // 2. Generate Schema graph for this URL
    const schema = generateBaseSchema(url);
    const jsonLdScript = `\n<script id="schema-graph" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;

    // 3. Inject into <head> using HTMLRewriter (zero buffering, streaming performance)
    return new HTMLRewriter()
      .on('head', {
        element(head) {
          head.append(jsonLdScript, { html: true });
        },
      })
      .transform(originResponse);
  },
};
