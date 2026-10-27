/* eslint-disable */
/* global WebImporter */

// Source: <div class="footer-block">: a logo row (link to the logo URL), link
// column rows, and a bottom row with "ITC Portal" and the © text. The logo alt
// text and the social links are hard-coded in the block on the source.
// Model: block fields logoUrl | logoAltLabel | copyright | socials (one row each,
// in this order), then footer-column items: links.

const DEFAULT_LOGO = 'https://s7ap1.scene7.com/is/image/itcportalprod/Yippee-itc-logo-updated-5?fmt=webp-alpha';
const DEFAULT_LOGO_ALT = 'Sunfeast YiPPee! & ITC Logo';
const DEFAULT_COPYRIGHT = [
  ['ITC Portal', 'https://www.itcportal.com'],
  ['© 2026 YiPPee!. All Rights Reserved.'],
];
const DEFAULT_SOCIALS = [
  ['Instagram', 'https://www.instagram.com/sunfeast_yippee/'],
  ['Facebook', 'https://www.facebook.com/SunfeastYiPPee/'],
  ['YouTube', 'https://www.youtube.com/@SunfeastYiPPee'],
  ['X', 'https://twitter.com/SunfeastYiPPee'],
];
const SOCIAL_HOST = /(^|\.)(instagram\.com|facebook\.com|fb\.com|fb\.me|youtube\.com|youtu\.be|twitter\.com|x\.com)$/i;

function field(document, name, ...nodes) {
  const content = nodes.filter(Boolean);
  if (!content.length) return null;
  const frag = document.createDocumentFragment();
  frag.append(document.createComment(` field:${name} `), ...content);
  return frag;
}

function cell(document, ...fields) {
  const parts = fields.filter(Boolean);
  if (!parts.length) return '';
  const frag = document.createDocumentFragment();
  frag.append(...parts);
  return frag;
}

function link(document, href) {
  if (!href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  return a;
}

function text(document, value) {
  return value ? document.createTextNode(value) : null;
}

// one paragraph per entry: [text, href] is a link, [text] plain text
function paragraphs(document, entries) {
  return entries.map(([label, href]) => {
    const p = document.createElement('p');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      p.append(a);
    } else {
      p.textContent = label;
    }
    return p;
  });
}

function isSocialRow(document, row) {
  const anchors = [...row.querySelectorAll('a[href]')];
  return anchors.length > 0 && anchors.every((a) => {
    try {
      return SOCIAL_HOST.test(new URL(a.getAttribute('href'), document.baseURI).hostname);
    } catch (e) {
      return false;
    }
  });
}

// one paragraph per link: neighbouring links with the same href would
// otherwise be merged into a single link by html2md
function links(document, row) {
  const anchors = [...row.querySelectorAll('a[href]')];
  if (!anchors.length) {
    const content = row.textContent.trim();
    if (!content) return [];
    const p = document.createElement('p');
    p.textContent = content;
    return [p];
  }
  return anchors.map((a) => {
    const p = document.createElement('p');
    const copy = document.createElement('a');
    copy.href = a.getAttribute('href');
    copy.textContent = a.textContent.trim();
    p.append(copy);
    return p;
  });
}

export default function parse(element, { document }) {
  let logoUrl = '';
  let logoAlt = '';
  let bottomRow = null;
  let socialRow = null;
  const columns = [];

  [...element.children].forEach((row) => {
    const rowText = row.textContent.trim();
    const img = row.querySelector('img');
    const a = row.querySelector('a[href]');
    if (!logoUrl && (img || /scene7\.com|logo/i.test(a?.getAttribute('href') || ''))) {
      logoUrl = img ? new URL(img.getAttribute('src'), document.baseURI).toString() : a.getAttribute('href');
      logoAlt = img?.getAttribute('alt') || '';
    } else if (rowText.includes('©')) {
      bottomRow = row;
    } else if (!socialRow && isSocialRow(document, row)) {
      socialRow = row;
    } else if (rowText) {
      columns.push(row);
    }
  });

  const copyright = bottomRow ? links(document, bottomRow) : paragraphs(document, DEFAULT_COPYRIGHT);
  const socials = socialRow ? links(document, socialRow) : paragraphs(document, DEFAULT_SOCIALS);

  const cells = [
    [cell(document, field(document, 'logoUrl', link(document, logoUrl || DEFAULT_LOGO)))],
    [cell(document, field(document, 'logoAltLabel', text(document, logoAlt || DEFAULT_LOGO_ALT)))],
    [cell(document, field(document, 'copyright', ...copyright))],
    [cell(document, field(document, 'socials', ...socials))],
    ...columns.map((row) => [cell(document, field(document, 'links', ...links(document, row)))]),
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Footer Block', cells });
  element.replaceWith(block);
}
