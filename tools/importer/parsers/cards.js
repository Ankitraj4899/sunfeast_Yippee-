/* eslint-disable */
/* global WebImporter */

// Source: <div class="cards">, one row per card, one cell with a picture.
// Model: cards = heading, tabOneLabel, tabTwoLabel, firstTabCount, viewAllLabel,
// viewLessLabel (one row each), then card items = image (+ imageAlt) | text.
// The live source has no config rows, so the texts visitors see on the live page
// (hard-coded in the block JS) are emitted. The live cards have no text, so the
// text cell stays empty.

const CONFIG = [
  ['heading', "YiPPee!'s Noodle Range"],
  ['tabOneLabel', 'Instant Noodles'],
  ['tabTwoLabel', 'Cup Noodles'],
  ['firstTabCount', '4'],
  ['viewAllLabel', 'View All'],
  ['viewLessLabel', 'View Less'],
];

const IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;

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
  const trimmed = (value || '').trim();
  return trimmed ? document.createTextNode(trimmed) : null;
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
  const value = el.textContent.trim();
  if (!value) return [];
  const p = document.createElement('p');
  p.textContent = value;
  return [p];
}

// Leading single-cell rows without an image are config rows (newer source shape).
function isConfigRow(row) {
  if (row.children.length !== 1) return false;
  if (row.querySelector('picture, img')) return false;
  const a = row.querySelector('a[href]');
  return !(a && IMAGE_URL.test(a.getAttribute('href')));
}

export default function parse(element, { document }) {
  const rows = [...element.children];
  let configCount = 0;
  while (configCount < CONFIG.length && configCount < rows.length && isConfigRow(rows[configCount])) {
    configCount += 1;
  }

  const configCells = CONFIG.map(([name, fallback], index) => {
    const source = index < configCount ? rows[index].textContent : '';
    return [cell(document, field(document, name, text(document, source || fallback)))];
  });

  const itemCells = rows.slice(configCount).map((row) => {
    const [imageCell, textCell] = row.children;
    return [
      cell(document, field(document, 'image', image(document, imageCell))),
      cell(document, field(document, 'text', ...richtext(document, textCell))),
    ];
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'Cards',
    cells: [...configCells, ...itemCells],
  });
  element.replaceWith(block);
}
