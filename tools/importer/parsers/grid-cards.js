/* eslint-disable */
/* global WebImporter */

// Source: <div class="grid-cards">, one row per image, one cell with a link to
// the image URL.
// Model: block fields title | subtitle | link (+ linkText) — empty on the live
// page, so the block falls back to its defaults — then grid-card items: imageUrl.

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

function imageUrl(el) {
  const a = el?.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = el?.querySelector('img');
  if (img) return new URL(img.getAttribute('src'), el.ownerDocument.baseURI).toString();
  const text = el?.textContent.trim() || '';
  return /^https?:\/\//.test(text) ? text : '';
}

export default function parse(element, { document }) {
  const items = [...element.children].map((row) => imageUrl(row)).filter(Boolean);
  const cells = [
    [''], // title
    [''], // subtitle
    [''], // link
    ...items.map((href) => [cell(document, field(document, 'imageUrl', link(document, href)))]),
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Grid Cards', cells });
  element.replaceWith(block);
}
