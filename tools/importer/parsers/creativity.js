/* eslint-disable */
/* global WebImporter */

// Source: <div class="creativity">, one row per item:
// cell 1 = link to the thumbnail URL, cell 2 = video URL as plain text.
// Model: container "creativity" with block fields heading, subtitle, viewAllLabel,
// viewLessLabel (one row each, first), then one row per creativity-item = imageUrl | video.
// The source has no config rows; the texts the block shows today are emitted instead.

const CONFIG_FIELDS = [
  ['heading', 'Get Creative With Us'],
  ['subtitle', 'Take a look at our DIY Videos and upcycle waste'],
  ['viewAllLabel', 'View All'],
  ['viewLessLabel', 'View Less'],
];

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

function url(el) {
  const a = el?.querySelector('a[href]');
  if (a) return a.getAttribute('href');
  const img = el?.querySelector('img');
  if (img) return img.getAttribute('src');
  const text = el?.textContent.trim() || '';
  return /^https?:\/\//.test(text) ? text : '';
}

function text(document, value) {
  if (!value) return null;
  const p = document.createElement('p');
  p.textContent = value;
  return p;
}

// config rows (if a source ever has them): single cell, plain text, no media or URL
function isConfigRow(row) {
  if (row.children.length !== 1) return false;
  const c = row.firstElementChild;
  if (c.querySelector('picture, img, a[href]')) return false;
  return !/^https?:\/\//.test(c.textContent.trim());
}

export default function parse(element, { document }) {
  const rows = [...element.children];
  let configCount = 0;
  while (configCount < CONFIG_FIELDS.length && configCount < rows.length
    && isConfigRow(rows[configCount])) {
    configCount += 1;
  }

  const configCells = CONFIG_FIELDS.map(([name, fallback], i) => {
    const value = (i < configCount ? rows[i].textContent.trim() : '') || fallback;
    return [cell(document, field(document, name, text(document, value)))];
  });

  const itemCells = rows.slice(configCount).map((row) => {
    const [imageCell, videoCell] = row.children;
    return [
      cell(document, field(document, 'imageUrl', link(document, url(imageCell)))),
      cell(document, field(document, 'video', link(document, url(videoCell)))),
    ];
  });

  const cells = [...configCells, ...itemCells];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Creativity', cells });
  element.replaceWith(block);
}
