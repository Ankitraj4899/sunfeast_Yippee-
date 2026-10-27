/* eslint-disable */
/* global WebImporter */

// Source: <div class="yippee-intro">: row 1 = <h2> heading, row 2 = description
// text (not always wrapped in <p>).
// Model: heading (+ headingType, collapsed into the heading level) | description |
// subheading. The live source has no subheading row, so the text visitors see on
// the live page (hard-coded in the block JS) is emitted.

const DEFAULT_SUBHEADING = 'Sunfeast Yippee – Quick & Tasty Instant Noodles & Pasta';

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

  // the description is the first row that is not the heading row; a newer
  // source shape may carry the subheading in the row after it
  const rows = [...element.children];
  const descriptionIndex = rows.findIndex((row) => !row.contains(heading));
  const descriptionRow = rows[descriptionIndex];
  const description = descriptionRow?.firstElementChild || descriptionRow;
  const subheadingRow = descriptionIndex >= 0 ? rows[descriptionIndex + 1] : null;
  const subheading = subheadingRow?.textContent.trim() || DEFAULT_SUBHEADING;

  const cells = [
    [cell(document, field(document, 'heading', headingEl))],
    [cell(document, field(document, 'description', ...richtext(document, description)))],
    [cell(document, field(document, 'subheading', text(document, subheading)))],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Yippee Intro', cells });
  element.replaceWith(block);
}
