/* eslint-disable */
/* global WebImporter */

// Source: <div class="sunfeast-yippee-products">, one row per category:
// cell 1 = category name, cell 2 = range heading, sub heading and the product
// pictures. The page title, breadcrumb and button labels are hard-coded in the
// block on the source.
// Model: block fields title | homeLabel | currentLabel | buyNowLabel (one row
// each), then per category a product-category item (categoryName | content_text)
// followed by one product item per picture (image | productName).

const DEFAULTS = [
  ['title', 'Sunfeast Yippee Products'],
  ['homeLabel', 'Home Page >'],
  ['currentLabel', 'Product Listing'],
  ['buyNowLabel', 'Buy Now'],
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

function text(document, value) {
  const trimmed = (value || '').trim();
  return trimmed ? document.createTextNode(trimmed) : null;
}

function image(document, source) {
  if (!source || !source.getAttribute('src')) return null;
  const img = document.createElement('img');
  const url = new URL(source.getAttribute('src'), document.baseURI);
  url.search = '';
  img.src = url.toString();
  if (source.alt) img.alt = source.alt;
  return img;
}

// headings and text of the category cell, without the product pictures
function headings(document, el) {
  if (!el) return [];
  return [...el.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
    .filter((node) => !node.querySelector('picture, img') && node.textContent.trim())
    .map((node) => {
      const copy = document.createElement(node.tagName.toLowerCase());
      copy.innerHTML = node.innerHTML;
      return copy;
    });
}

export default function parse(element, { document }) {
  const cells = DEFAULTS.map(([name, value]) => [cell(document, field(document, name, text(document, value)))]);

  [...element.children].forEach((row) => {
    const [nameCell, contentCell] = row.children;
    if (!nameCell) return;
    const content = contentCell || nameCell;
    cells.push([
      cell(document, field(document, 'categoryName', text(document, contentCell ? nameCell.textContent : ''))),
      cell(document, field(document, 'content_text', ...headings(document, content))),
    ]);
    content.querySelectorAll('img').forEach((img) => {
      cells.push([
        cell(document, field(document, 'image', image(document, img))),
        '',
      ]);
    });
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Sunfeast Yippee Products', cells });
  element.replaceWith(block);
}
