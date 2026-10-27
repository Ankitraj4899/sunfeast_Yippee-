/* eslint-disable */
/* global WebImporter */

// Source: <div class="creativity">, one row per item:
// cell 1 = link to the thumbnail URL, cell 2 = video URL as plain text.
// Model: creativity-item = imageUrl | video.

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

export default function parse(element, { document }) {
  const cells = [...element.children].map((row) => {
    const [imageCell, videoCell] = row.children;
    return [
      cell(document, field(document, 'imageUrl', link(document, url(imageCell)))),
      cell(document, field(document, 'video', link(document, url(videoCell)))),
    ];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Creativity', cells });
  element.replaceWith(block);
}
