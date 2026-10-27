/* eslint-disable */
/* global WebImporter */

// Source: <div class="carousel">, one row per slide:
// cell 1 = picture wrapped in a video link, cell 2 = <h2> + <p>.
// Model: carousel-item = media_image (+ media_imageAlt) and media_video in one
// cell | content_text. AEM cannot wrap an image in a link, so the video link is
// placed next to the image; the carousel block handles both shapes.

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
    const [mediaCell, textCell] = row.children;
    const video = mediaCell?.querySelector('a[href]')?.getAttribute('href');
    return [
      cell(
        document,
        field(document, 'media_image', image(document, mediaCell)),
        field(document, 'media_video', link(document, video)),
      ),
      cell(document, field(document, 'content_text', ...richtext(document, textCell))),
    ];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Carousel', cells });
  element.replaceWith(block);
}
