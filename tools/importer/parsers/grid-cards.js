/* eslint-disable */
/* global WebImporter */

// Source: <div class="grid-cards">, one row per image, one cell with a link to
// the image URL.
// Model: block fields title | subtitle | link (+ linkText) (one row each), then
// grid-card items: imageUrl.
// The live source has no config rows, so the texts visitors see on the live page
// (hard-coded in the block JS) are emitted. A newer source shape with leading
// config rows (single cell, no image) is read positionally.

const DEFAULTS = {
  title: '#YiPPeelicious',
  subtitle: 'Upload your YiPPee! moments and tag us to get featured in our website',
  link: '#',
  linkText: 'Join us',
};

const CONFIG_FIELDS = 3;

const IMAGE_URL = /scene7\.com|\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;

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

function text(document, value) {
  const trimmed = (value || '').replace(/\s+/g, ' ').trim();
  return trimmed ? document.createTextNode(trimmed) : null;
}

function link(document, href, label) {
  if (!href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label || href;
  return a;
}

function imageUrl(el) {
  const a = el?.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = el?.querySelector('img');
  if (img) return new URL(img.getAttribute('src'), el.ownerDocument.baseURI).toString();
  const value = el?.textContent.trim() || '';
  return /^https?:\/\//.test(value) ? value : '';
}

// Leading single-cell rows without an image (or image URL) are config rows.
function isConfigRow(row) {
  if (row.children.length > 1) return false;
  if (row.querySelector('picture, img')) return false;
  const a = row.querySelector('a[href]');
  if (a && IMAGE_URL.test(a.getAttribute('href'))) return false;
  const value = row.textContent.trim();
  return !(/^https?:\/\//.test(value) && IMAGE_URL.test(value));
}

export default function parse(element, { document }) {
  const rows = [...element.children];
  let configCount = 0;
  while (configCount < CONFIG_FIELDS && configCount < rows.length && isConfigRow(rows[configCount])) {
    configCount += 1;
  }
  const [titleRow, subtitleRow, linkRow] = rows.slice(0, configCount);

  const title = titleRow?.textContent.trim() || DEFAULTS.title;
  const subtitle = subtitleRow?.textContent.trim() || DEFAULTS.subtitle;
  const sourceLink = linkRow?.querySelector('a[href]');
  const href = sourceLink?.getAttribute('href') || DEFAULTS.link;
  const sourceLabel = sourceLink?.textContent.trim();
  const label = sourceLabel && sourceLabel !== href ? sourceLabel : DEFAULTS.linkText;

  const items = rows.slice(configCount).map((row) => imageUrl(row)).filter(Boolean);
  const cells = [
    [cell(document, field(document, 'title', text(document, title)))],
    [cell(document, field(document, 'subtitle', text(document, subtitle)))],
    [cell(document, field(document, 'link', link(document, href, label)))],
    ...items.map((url) => [cell(document, field(document, 'imageUrl', link(document, url)))]),
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Grid Cards', cells });
  element.replaceWith(block);
}
