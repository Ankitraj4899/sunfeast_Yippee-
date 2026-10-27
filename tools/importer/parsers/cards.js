/* eslint-disable */
/* global WebImporter */

// Source: <div class="cards">, one row per card, one cell with a picture.
// Model: card item = image (+ imageAlt) | text. The live cards have no text,
// so the text cell stays empty.

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

function image(document, el) {
  const source = el?.querySelector('img');
  if (!source || !source.getAttribute('src')) return null;
  const img = document.createElement('img');
  const url = new URL(source.getAttribute('src'), document.baseURI);
  url.search = '';
  img.src = url.toString();
  if (source.alt) img.alt = source.alt;
  return img;
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

export default function parse(element, { document }) {
  const cells = [...element.children].map((row) => {
    const [imageCell, textCell] = row.children;
    return [
      cell(document, field(document, 'image', image(document, imageCell))),
      cell(document, field(document, 'text', ...richtext(document, textCell))),
    ];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards', cells });
  element.replaceWith(block);
}
