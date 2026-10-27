/* eslint-disable */
/* global WebImporter */

// Source: <div class="yippee-intro">: row 1 = <h2> heading, row 2 = description
// text (not always wrapped in <p>).
// Model: heading (+ headingType, collapsed into the heading level) | description.

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
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  let headingEl = null;
  if (heading) {
    headingEl = document.createElement(heading.tagName.toLowerCase());
    headingEl.textContent = heading.textContent.trim();
  }

  // the description is the first row that is not the heading row
  const descriptionRow = [...element.children].find((row) => !row.contains(heading));
  const description = descriptionRow?.firstElementChild || descriptionRow;

  const cells = [
    [cell(document, field(document, 'heading', headingEl))],
    [cell(document, field(document, 'description', ...richtext(document, description)))],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Yippee Intro', cells });
  element.replaceWith(block);
}
