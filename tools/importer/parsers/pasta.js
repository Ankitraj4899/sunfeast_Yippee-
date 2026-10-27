/* eslint-disable */
/* global WebImporter */

// Source: <div class="pasta">, one row per item, one cell with a picture.
// Model: pasta-item = image (+ imageAlt).

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

export default function parse(element, { document }) {
  const cells = [...element.children].map((row) => [
    cell(document, field(document, 'image', image(document, row))),
  ]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'Pasta', cells });
  element.replaceWith(block);
}
