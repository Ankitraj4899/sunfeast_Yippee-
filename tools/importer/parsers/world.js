/* eslint-disable */
/* global WebImporter */

// Source: <div class="world">, one row per card:
// cell 1 = link to the image URL, cell 2 = <h2> + <p>.
// Model: block fields title | subtitle | link (+ linkText) — empty on the live
// page, so the block falls back to its defaults — then world-card items:
// imageUrl | text.

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

function richtext(document, el) {
  if (!el) return [];
  const hasBlocks = el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol');
  if (hasBlocks) return [...el.childNodes].map((n) => n.cloneNode(true));
  const text = el.textContent.trim();
  if (!text) return [];
  const p = document.createElement('p');
  p.textContent = text;
  return [p];
}

function imageUrl(el) {
  const a = el?.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = el?.querySelector('img');
  if (img) return img.getAttribute('src');
  const text = el?.textContent.trim() || '';
  return /^https?:\/\//.test(text) ? text : '';
}

export default function parse(element, { document }) {
  const cards = [...element.children].filter((row) => row.children.length >= 2);
  const cells = [
    [''], // title
    [''], // subtitle
    [''], // link
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
