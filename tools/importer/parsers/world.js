/* eslint-disable */
/* global WebImporter */

// Source: <div class="world">, one row per card:
// cell 1 = link to the image URL, cell 2 = <h2> + <p>.
// Model: block fields title | subtitle | link (+ linkText) (one row each), then
// world-card items: imageUrl | text.
// The live source has no config rows, so the texts visitors see on the live page
// (hard-coded in the block JS) are emitted. A newer source shape with leading
// config rows (single cell, no image) is read positionally.

const DEFAULTS = {
  title: 'Take A Look At The Better World',
  subtitle: 'Learn how we are driving a change through the',
  link: 'https://www.sunfeastyippee.com/better-world',
  linkText: 'YiPPee! Better World',
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

function richtext(document, el) {
  if (!el) return [];
  const hasBlocks = el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol');
  if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
  const value = el.textContent.trim();
  if (!value) return [];
  const p = document.createElement('p');
  p.textContent = value;
  return [p];
}

function imageUrl(el) {
  const a = el?.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = el?.querySelector('img');
  if (img) return img.getAttribute('src');
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

  const cards = rows.slice(configCount).filter((row) => row.children.length > 0);
  const cells = [
    [cell(document, field(document, 'title', text(document, title)))],
    [cell(document, field(document, 'subtitle', text(document, subtitle)))],
    [cell(document, field(document, 'link', link(document, href, label)))],
    ...cards.map((row) => {
      const [imageCell, textCell] = row.children;
      return [
        cell(document, field(document, 'imageUrl', link(document, imageUrl(imageCell)))),
        cell(document, field(document, 'text', ...richtext(document, textCell))),
      ];
    }),
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'World', cells });
  element.replaceWith(block);
}
