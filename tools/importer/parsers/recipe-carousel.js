/* eslint-disable */
/* global WebImporter */

// Source: <div class="recipe-carousel">, one row per category:
// cell 1 = category name, cell 2 = paragraphs with recipe image links.
// Model: recipe-category item = category | recipes (richtext).

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
  const cells = [...element.children].map((row) => {
    const [categoryCell, recipesCell] = row.children;
    const category = categoryCell?.textContent.trim();
    return [
      cell(document, field(document, 'category', category ? document.createTextNode(category) : null)),
      cell(document, field(document, 'recipes', ...richtext(document, recipesCell))),
    ];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Recipe Carousel', cells });
  element.replaceWith(block);
}
