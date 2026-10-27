/* eslint-disable */
/* global WebImporter */

// Source: <div class="treasure-hunt">, one row with two cells:
// cell 1 = picture wrapped in a video link, cell 2 = wave picture.
// Model (simple block, one row per field group):
//   row 1 = main_image (+ main_imageAlt) and main_video
//   row 2 = wave_image (+ wave_imageAlt)
// The treasure-hunt block reads both the one-row and the two-row shape.

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

function link(document, href) {
  if (!href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  return a;
}

export default function parse(element, { document }) {
  const sourceCells = [...element.children].flatMap((row) => [...row.children]);
  const [mainCell, waveCell] = sourceCells;
  const video = mainCell?.querySelector('a[href]')?.getAttribute('href')
    || element.querySelector('a[href]')?.getAttribute('href');

  const cells = [
    [cell(
      document,
      field(document, 'main_image', image(document, mainCell)),
      field(document, 'main_video', link(document, video)),
    )],
    [cell(document, field(document, 'wave_image', image(document, waveCell)))],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Treasure Hunt', cells });
  element.replaceWith(block);
}
