/* eslint-disable */
/* global WebImporter */

/**
 * The source pages are this project's own Edge Delivery pages, loaded as
 * .plain.html: the body holds one <div> per section, and blocks are
 * <div class="block-name"> elements inside them.
 *
 * beforeTransform:
 *  - takes the page title from the rendered page head (.plain.html has no head)
 *  - turns icon spans back into :icon: notation
 *  - separates sections with <hr> so section breaks survive html2md
 */

function sourcePageUrl(originalURL) {
  const url = new URL(originalURL);
  url.pathname = url.pathname.replace(/\.plain\.html$/, '').replace(/\/index$/, '/');
  return url.toString();
}

function readSourceTitle(originalURL) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', sourcePageUrl(originalURL), false);
    xhr.send();
    if (xhr.status !== 200) return '';
    const match = xhr.responseText.match(/<title>([^<]*)<\/title>/i);
    if (!match) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = match[1];
    return txt.value.trim();
  } catch (e) {
    return '';
  }
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const { document } = payload;
  const originalURL = payload.params?.originalURL || payload.url;

  if (!document.title && originalURL) {
    const title = readSourceTitle(originalURL);
    if (title) document.title = title;
  }

  element.querySelectorAll('span.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-'));
    icon.replaceWith(document.createTextNode(name ? `:${name.substring(5)}:` : ''));
  });

  const sections = [...element.children].filter((el) => el.tagName === 'DIV');
  sections.slice(1).forEach((section) => {
    section.before(document.createElement('hr'));
  });
}
