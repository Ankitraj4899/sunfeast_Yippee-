const EDS_HOST = 'main--sunfeast-yippee--ankitraj4899.aem.live';

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

function extractProductImagesFromHtml(html, origin) {
  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  const extracted = [];
  imgMatches.forEach((m) => {
    let src = m[1];
    if (src && !src.startsWith('data:')) {
      if (src.startsWith('./')) {
        src = `${origin}/${src.replace('./', '')}`;
      } else if (src.startsWith('/')) {
        src = `${origin}${src}`;
      }
      extracted.push(src);
    }
  });
  return extracted;
}

function isProductListingPage(url, html) {
  const path = url.pathname.toLowerCase();
  return (
    path.includes('product-listing')
    || path.includes('products')
    || html.includes('sunfeast-yippee-products')
    || html.includes('product-listing')
  );
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

function generateProductListingSchema(url, html, { title, description } = {}) {
  const { origin } = url;
  const pageUrl = url.href.split('#')[0];
  const images = extractProductImagesFromHtml(html, origin);

  // Helper to find relevant image or fallback
  const findImage = (keyword, fallbackIndex) => {
    const match = images.find((src) => src.toLowerCase().includes(keyword));
    return match || images[fallbackIndex] || `${origin}/yippee1.png`;
  };

  // Define product cards categorized by sections
  const sections = [
    {
      category: 'Noodles',
      rangeHeading: 'Explore Our Noodles Range',
      subHeading: 'Instant Noodles',
      products: [
        {
          name: 'Magic Masala Noodles',
          slug: 'magic-masala-noodles',
          image: findImage('magic', 0),
          desc: 'Sunfeast YiPPee! Magic Masala Instant Noodles with unique round block, non-sticky long noodles and signature masala blend.',
        },
        {
          name: 'Mood Masala Noodles',
          slug: 'mood-masala-noodles',
          image: findImage('mood', 1),
          desc: 'Sunfeast YiPPee! Mood Masala Instant Noodles with two masala mix sachets to customize your spice according to your mood.',
        },
        {
          name: 'Magic Millet Noodles',
          slug: 'magic-millet-noodles',
          image: findImage('millet', 2),
          desc: 'Sunfeast YiPPee! Magic Millets Noodles crafted with the goodness of multi-millets and signature spices.',
        },
        {
          name: 'Power Up Atta Noodles',
          slug: 'power-up-atta-noodles',
          image: findImage('atta', 3),
          desc: 'Sunfeast YiPPee! Power Up Atta Noodles made with whole wheat flour (atta) and real vegetable goodness.',
        },
      ],
    },
    {
      category: 'Pasta',
      rangeHeading: 'Explore Our Pasta Range',
      subHeading: 'Tricolor Pasta',
      products: [
        {
          name: 'Tricolor Pasta Creamy Corn',
          slug: 'tricolor-pasta-creamy-corn',
          image: findImage('creamy', 4),
          desc: 'Sunfeast YiPPee! Tricolor Pasta Creamy Corn made with 100% suji (semolina) and delectable creamy corn sauce maker.',
        },
        {
          name: 'Tricolor Pasta Treat Masala',
          slug: 'tricolor-pasta-treat-masala',
          image: findImage('treat', 5),
          desc: 'Sunfeast YiPPee! Tricolor Pasta Treat Masala loaded with lip-smacking Indian spices and multi-color pasta fun.',
        },
        {
          name: 'Tricolor Pasta Tomato Cheese',
          slug: 'tricolor-pasta-tomato-cheese',
          image: findImage('tomato', 6),
          desc: 'Sunfeast YiPPee! Tricolor Pasta Tomato Cheese offering a cheesy tang with rich tomato goodness.',
        },
      ],
    },
    {
      category: 'Korean Noodles',
      rangeHeading: 'Explore Our Korean Noodles Range',
      subHeading: 'Fiery Hot',
      products: [
        {
          name: 'Korean Fiery Hot Noodles',
          slug: 'korean-fiery-hot-noodles',
          image: findImage('korean', 7),
          desc: 'Sunfeast YiPPee! Korean Fiery Hot Noodles featuring thick, chewy noodles drenched in an intense, sizzling spicy broth.',
        },
      ],
    },
  ];

  const allProductEntities = [];
  const allListItems = [];
  let globalPos = 1;

  sections.forEach((sec) => {
    sec.products.forEach((p) => {
      const fullTitle = `Sunfeast YiPPee! ${p.name}`;
      const productEntity = {
        '@type': 'Product',
        '@id': `${origin}/#product-${p.slug}`,
        name: fullTitle,
        description: p.desc,
        image: p.image,
        category: `${sec.category} > ${sec.subHeading}`,
        brand: {
          '@type': 'Brand',
          name: 'Sunfeast YiPPee!',
          logo: `${origin}/yippee1.png`,
        },
        manufacturer: {
          '@type': 'Organization',
          name: 'ITC Limited',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: pageUrl,
          seller: {
            '@type': 'Organization',
            name: 'ITC Store',
          },
        },
      };

      allProductEntities.push(productEntity);

      allListItems.push({
        '@type': 'ListItem',
        position: globalPos,
        item: {
          '@id': productEntity['@id'],
          name: fullTitle,
          image: p.image,
        },
      });
      globalPos += 1;
    });
  });

  const collectionPage = {
    '@type': 'CollectionPage',
    '@id': `${pageUrl}#collectionpage`,
    url: pageUrl,
    name: title || 'Sunfeast YiPPee! Products - Noodles, Pasta & Korean Noodles',
    description:
      description
      || 'Explore the full range of Sunfeast YiPPee! Instant Noodles, Tricolor Pasta, and Korean Fiery Hot Noodles.',
    inLanguage: 'en',
    isPartOf: {
      '@id': `${origin}/#website`,
    },
    about: {
      '@id': `${origin}/#organization`,
    },
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${pageUrl}#product-catalog`,
      name: 'Sunfeast YiPPee! Products Catalog',
      numberOfItems: allProductEntities.length,
      itemListElement: allListItems,
    },
  };

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home Page',
        item: `${origin}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Product Listing',
        item: pageUrl,
      },
    ],
  };

  const sectionItemLists = sections.map((sec) => {
    const slug = sec.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      '@type': 'ItemList',
      '@id': `${pageUrl}#section-${slug}-list`,
      name: `${sec.rangeHeading} - ${sec.subHeading}`,
      numberOfItems: sec.products.length,
      itemListElement: sec.products.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@id': `${origin}/#product-${p.slug}`,
          name: `Sunfeast YiPPee! ${p.name}`,
          image: p.image,
        },
      })),
    };
  });

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
      collectionPage,
      breadcrumbList,
      ...sectionItemLists,
      ...allProductEntities,
    ],
  };
}

// Cloudflare Worker / Edge Worker fetch handler
async function handleRequest(requestOrEvent, env = {}) {
  const req = requestOrEvent.request || requestOrEvent;
  const edsHost = env.EDS_HOST || EDS_HOST;
  const url = new URL(req.url);

  const upstreamHeaders = new Headers(req.headers);
  upstreamHeaders.set('host', edsHost);
  upstreamHeaders.delete('accept-encoding');

  const upstreamUrl = new URL(url.pathname + url.search, `https://${edsHost}`);

  const originResponse = await fetch(upstreamUrl.toString(), {
    method: req.method,
    headers: upstreamHeaders,
    redirect: 'follow',
  });

  const contentType = originResponse.headers.get('content-type') || '';

  if (!contentType.includes('text/html') || url.pathname.endsWith('.plain.html')) {
    return originResponse;
  }

  let html;
  const encoding = (originResponse.headers.get('content-encoding') || '').toLowerCase();
  if (encoding.includes('gzip') && typeof DecompressionStream !== 'undefined') {
    const decompressed = originResponse.body.pipeThrough(new DecompressionStream('gzip'));
    html = await new Response(decompressed).text();
  } else if (encoding.includes('deflate') && typeof DecompressionStream !== 'undefined') {
    const decompressed = originResponse.body.pipeThrough(new DecompressionStream('deflate'));
    html = await new Response(decompressed).text();
  } else {
    html = await originResponse.text();
  }

  const metadata = extractPageMetadata(html);

  const schema = isProductListingPage(url, html)
    ? generateProductListingSchema(url, html, metadata)
    : generateBaseSchema(url, metadata);

  const jsonLdScript = `\n<script id="schema-graph" type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>\n`;

  if (html.includes('id="schema-graph"')) {
    html = html.replace(/<script[^>]*id=["']schema-graph["'][^>]*>[\s\S]*?<\/script>/i, jsonLdScript.trim());
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `${jsonLdScript}</head>`);
  } else {
    html = `${jsonLdScript}${html}`;
  }

  const responseHeaders = new Headers(originResponse.headers);
  responseHeaders.delete('content-length');
  responseHeaders.delete('content-encoding');

  return new Response(html, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  },
};