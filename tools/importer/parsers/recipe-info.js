/* eslint-disable */
/* global WebImporter */

// Source: <div class="recipe-info">, one row with one cell per item
// (<p><strong>Prep Time</strong></p><p>10 mins</p>, Cook Time, Serves, Difficulty).
// Model: container, one recipe-info-item per item = text (richtext).

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
  // every non-empty cell, whether authored as one row of cells or one row per item
  const items = [...element.children]
    .flatMap((row) => [...row.children])
    .filter((c) => c.textContent.trim());
  const cells = items.map((item) => [
    cell(document, field(document, 'text', ...richtext(document, item))),
  ]);
  const block = WebImporter.Blocks.createBlock(document, { name: 'Recipe Info', cells });
  element.replaceWith(block);
}
