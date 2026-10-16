import { getMetadata } from './aem.js';

const registeredEntities = [];
let schemaGraphInitialized = false;

export function setJsonLd(data, id = 'schema-graph') {
  let script = document.head.querySelector(`script#${id}[type="application/ld+json"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    const nonceScript = document.head.querySelector('script[nonce]');
    if (nonceScript) {
      script.setAttribute('nonce', nonceScript.getAttribute('nonce'));
    }
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

function getBaseGraph(doc = document) {
  const { origin } = window.location;
  const canonicalEl = doc.querySelector('link[rel="canonical"]');
  const url = canonicalEl ? canonicalEl.href : window.location.href;
  const title = getMetadata('og:title')
    || doc.querySelector('main h1')?.textContent?.trim()
    || doc.title
    || 'Sunfeast YiPPee!';
  const description = getMetadata('description')
    || getMetadata('og:description')
    || '';

  const organization = {
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
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: 'Sunfeast YiPPee!',
    publisher: {
      '@id': `${origin}/#organization`,
    },
  };

  const webpage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en',
    isPartOf: {
      '@id': `${origin}/#website`,
    },
    about: {
      '@id': `${origin}/#organization`,
    },
  };

  const navElements = [];
  const navLinks = doc.querySelectorAll('header nav .nav-sections a');
  navLinks.forEach((link, idx) => {
    const linkName = link.textContent.trim();
    const linkUrl = link.href;
    if (linkName && linkUrl) {
      const slug = encodeURIComponent(linkName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      navElements.push({
        '@type': 'SiteNavigationElement',
        '@id': `${origin}/#nav-${slug || idx + 1}`,
        position: idx + 1,
        name: linkName,
        url: linkUrl,
      });
    }
  });

  return [organization, website, webpage, ...navElements];
}

export function updateSchemaGraph(doc = document) {
  const baseEntities = getBaseGraph(doc);

  const seenIds = new Set();
  const graph = [];

  [...baseEntities, ...registeredEntities].forEach((entity) => {
    if (!entity) return;
    const entityId = entity['@id'] || `${entity['@type']}-${entity.name || ''}`;
    if (!seenIds.has(entityId)) {
      seenIds.add(entityId);
      graph.push(entity);
    }
  });

  const schema = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  setJsonLd(schema, 'schema-graph');
  schemaGraphInitialized = true;
}

export function addSchemaEntities(entities) {
  const list = Array.isArray(entities) ? entities : [entities];
  list.forEach((entity) => {
    if (entity && typeof entity === 'object') {
      registeredEntities.push(entity);
    }
  });

  if (schemaGraphInitialized || document.readyState === 'complete' || document.readyState === 'interactive') {
    updateSchemaGraph(document);
  }
}

export function buildPageSchema(doc = document) {
  updateSchemaGraph(doc);
}

export default buildPageSchema;
