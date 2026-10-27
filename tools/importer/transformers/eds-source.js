/* eslint-disable */
/* global WebImporter */

/**
 * The source pages are this project's own Edge Delivery pages, loaded as
 * .plain.html: the body holds one <div> per section, and blocks are
 * <div class="block-name"> elements inside them. .plain.html has no <head>,
 * so page metadata is read from the rendered page.
 *
 * beforeTransform:
 *  - turns icon spans back into :icon: notation
 *  - separates sections with <hr> so section breaks survive html2md
 * afterTransform:
 *  - appends the page Metadata block: Title, Description, image, category,
 *    duration, cooktime (the fields of the page model)
 */

// default description of the project template; not real page content
const PLACEHOLDER_DESCRIPTION = 'Use this template repository as the starting point for new AEM projects.';

function sourcePageUrl(originalURL) {
  const url = new URL(originalURL);
  url.pathname = url.pathname.replace(/\.plain\.html$/, '').replace(/\/index$/, '/');
  return url.toString();
}

function readSourceHead(originalURL) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', sourcePageUrl(originalURL), false);
    xhr.send();
    if (xhr.status !== 200) return null;
    return new DOMParser().parseFromString(xhr.responseText, 'text/html');
  } catch (e) {
    return null;
  }
}

function meta(doc, name) {
  const el = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return el ? (el.getAttribute('content') || '').trim() : '';
}

// media file name without query, e.g. media_123.jpg
function mediaName(src) {
  try {
    return new URL(src, 'https://x/').pathname.split('/').pop();
  } catch (e) {
    return '';
  }
}

function buildMetadata(element, document, source) {
  const cells = {};
  const title = source.querySelector('title')?.textContent.trim();
  if (title) cells.Title = title;

  const description = meta(source, 'description');
  if (description && description !== PLACEHOLDER_DESCRIPTION) cells.Description = description;

  // og:image is only real metadata when it is not just the page's first content image
  const ogImage = meta(source, 'og:image');
  if (ogImage && !/default-meta-image/.test(ogImage)) {
    const name = mediaName(ogImage);
    const inContent = [...element.querySelectorAll('img')].some((img) => mediaName(img.getAttribute('src') || '') === name);
    if (!inContent) {
      const url = new URL(ogImage);
      url.search = '';
      const img = document.createElement('img');
      img.src = url.toString();
      cells.image = img;
    }
  }

  // md2jcr maps these rows to page properties by exact (case-sensitive) field name
  const category = meta(source, 'category');
  if (category) cells.category = category;
  const duration = meta(source, 'duration');
  if (duration) cells.duration = duration;
  const cooktime = meta(source, 'cooktime') || meta(source, 'cook-time');
  if (cooktime) cells.cooktime = cooktime;

  if (!Object.keys(cells).length) return null;
  return WebImporter.Blocks.createBlock(document, { name: 'Metadata', cells });
}

export default function transform(hookName, element, payload) {
  const { document } = payload;
  const originalURL = payload.params?.originalURL || payload.url;

  if (hookName === 'beforeTransform') {
    element.querySelectorAll('span.icon').forEach((icon) => {
      const name = [...icon.classList].find((c) => c.startsWith('icon-'));
      icon.replaceWith(document.createTextNode(name ? `:${name.substring(5)}:` : ''));
    });

    const sections = [...element.children].filter((el) => el.tagName === 'DIV');
    sections.slice(1).forEach((section) => {
      section.before(document.createElement('hr'));
    });
  }

  if (hookName === 'afterTransform' && originalURL) {
    const source = readSourceHead(originalURL);
    const metadata = source ? buildMetadata(element, document, source) : null;
    if (metadata) {
      element.append(document.createElement('hr'), metadata);
    }
  }
}
