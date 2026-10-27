/* eslint-disable */
/* global WebImporter */

// Source: <div class="footer-block">: a logo row (link to the logo URL), link
// column rows, and a bottom row with "ITC Portal" and the © text.
// Model: block fields logoUrl | copyright, then footer-column items: links.
// The footer-block code tells rows apart by their content, so order is free.

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

// one paragraph per link: neighbouring links with the same href would
// otherwise be merged into a single link by html2md
function links(document, row) {
  const anchors = [...row.querySelectorAll('a[href]')];
  if (!anchors.length) {
    const text = row.textContent.trim();
    if (!text) return [];
    const p = document.createElement('p');
    p.textContent = text;
    return [p];
  }
  return anchors.map((a) => {
    const p = document.createElement('p');
    const copy = document.createElement('a');
    copy.href = a.getAttribute('href');
    copy.textContent = a.textContent.trim();
    p.append(copy);
    return p;
  });
}

export default function parse(element, { document }) {
  let logoUrl = '';
  let bottomRow = null;
  const columns = [];

  [...element.children].forEach((row) => {
    const text = row.textContent.trim();
    const img = row.querySelector('img');
    const a = row.querySelector('a[href]');
    if (!logoUrl && (img || /scene7\.com|logo/i.test(a?.getAttribute('href') || ''))) {
      logoUrl = img ? new URL(img.getAttribute('src'), document.baseURI).toString() : a.getAttribute('href');
    } else if (text.includes('©')) {
      bottomRow = row;
    } else if (text) {
      columns.push(row);
    }
  });

  const cells = [
    [cell(document, field(document, 'logoUrl', link(document, logoUrl)))],
    [cell(document, field(document, 'copyright', ...(bottomRow ? links(document, bottomRow) : [])))],
    ...columns.map((row) => [cell(document, field(document, 'links', ...links(document, row)))]),
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Footer Block', cells });
  element.replaceWith(block);
}
