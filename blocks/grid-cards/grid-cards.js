import { moveInstrumentation, moveCellInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_TITLE = '#YiPPeelicious';
const DEFAULT_SUBTITLE = 'Upload your YiPPee! moments and tag us to get featured in our website';
const DEFAULT_CTA_LABEL = 'Join us';
const DEFAULT_CTA_HREF = '#';

// block-level field groups, in model order: title | subtitle | link (+ linkText)
const CONFIG_FIELDS = 3;

const IMAGE_URL = /scene7\.com|\.(jpe?g|gif|png|webp|svg|avif)(\?.*)?$/i;

const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();

/**
 * A config row has a single cell, no image and no link to an image URL.
 * Item rows (grid-card) hold an image (picture or link to the image URL).
 */
function isConfigRow(row) {
  if (row.children.length > 1) return false;
  if (row.querySelector('picture, img')) return false;
  const links = [...row.querySelectorAll('a[href]')];
  if (links.some((a) => IMAGE_URL.test(a.getAttribute('href')))) return false;
  const text = row.textContent.trim();
  return !(/^https?:\/\//.test(text) && IMAGE_URL.test(text));
}

function splitRows(block) {
  const rows = [...block.children];
  const config = [];
  while (config.length < CONFIG_FIELDS && rows.length && isConfigRow(rows[0])) {
    config.push(rows.shift());
  }
  return { config, items: rows };
}

const cellOf = (row) => (row ? row.firstElementChild || row : null);

function formatTitle(text) {
  const title = normalize(text).replace(/^[✧*\s]+|[✧*\s]+$/g, '');
  if (!title || title === '#') return DEFAULT_TITLE;
  return title.startsWith('#') ? title : `#${title}`;
}

function buildCard(row, index, variant) {
  const card = document.createElement('div');
  card.classList.add('grid-cards-card', variant);
  moveInstrumentation(row, card);

  const cell = cellOf(row);
  const picture = row.querySelector('picture');
  const img = row.querySelector('img');
  const link = row.querySelector('a[href]');
  const text = row.textContent.trim();

  let imgSrc = '';
  if (link && IMAGE_URL.test(link.href)) imgSrc = link.href;
  else if (/^https?:\/\//.test(text) && IMAGE_URL.test(text)) imgSrc = text;

  if (picture) {
    // move the authored picture (keeps its own instrumentation)
    card.append(picture);
  } else if (img) {
    card.append(img);
  } else if (imgSrc) {
    const image = document.createElement('img');
    image.src = imgSrc;
    image.alt = `YiPPeelicious moment ${index + 1}`;
    image.loading = 'lazy';
    moveCellInstrumentation(cell, image);
    card.append(image);
  } else {
    moveCellInstrumentation(cell, card);
  }
  return card;
}

export default function decorate(block) {
  block.classList.add('grid-cards');

  const { config, items } = splitRows(block);
  const [titleRow, subtitleRow, linkRow] = config;
  const titleCell = cellOf(titleRow);
  const subtitleCell = cellOf(subtitleRow);
  const linkCell = cellOf(linkRow);

  const container = document.createElement('div');
  container.classList.add('grid-cards-container');

  // Header
  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('grid-cards-header');

  const heading = document.createElement('h2');
  heading.classList.add('grid-cards-title');

  const leftStar = document.createElement('span');
  leftStar.classList.add('grid-cards-star');
  leftStar.textContent = '✧';
  leftStar.setAttribute('aria-hidden', 'true');

  const titleText = document.createElement('span');
  titleText.classList.add('grid-cards-title-text');
  titleText.textContent = formatTitle(titleCell?.textContent);
  moveCellInstrumentation(titleCell, titleText);

  const rightStar = document.createElement('span');
  rightStar.classList.add('grid-cards-star');
  rightStar.textContent = '✧';
  rightStar.setAttribute('aria-hidden', 'true');

  heading.append(leftStar, titleText, rightStar);

  const subtitle = document.createElement('p');
  subtitle.classList.add('grid-cards-subtitle');
  subtitle.textContent = normalize(subtitleCell?.textContent) || DEFAULT_SUBTITLE;
  moveCellInstrumentation(subtitleCell, subtitle);

  headerWrapper.append(heading, subtitle);
  container.append(headerWrapper);

  // Masonry grid: 4 columns, items distributed round-robin
  const grid = document.createElement('div');
  grid.classList.add('grid-cards-grid');

  const numCols = 4;
  const columns = Array.from({ length: numCols }, () => {
    const col = document.createElement('div');
    col.classList.add('grid-cards-col');
    return col;
  });

  const cardVariants = [
    ['card-short', 'card-tall'],
    ['card-tall', 'card-short'],
    ['card-short', 'card-tall'],
    ['card-tall', 'card-short'],
  ];

  const itemRows = items.filter((row) => row.children.length > 0);
  itemRows.forEach((row, index) => {
    const colIdx = index % numCols;
    const rowIdx = Math.floor(index / numCols);
    const fallback = index % 2 === 0 ? 'card-short' : 'card-tall';
    const variant = itemRows.length <= 8
      ? (cardVariants[colIdx]?.[rowIdx] || fallback)
      : fallback;
    columns[colIdx].append(buildCard(row, index, variant));
  });

  columns.forEach((col) => grid.append(col));
  container.append(grid);

  // CTA
  let ctaHref = DEFAULT_CTA_HREF;
  let ctaLabel = '';
  if (linkCell) {
    const authoredLink = linkCell.querySelector('a[href]');
    const text = normalize(linkCell.textContent);
    if (authoredLink) {
      ctaHref = authoredLink.getAttribute('href') || DEFAULT_CTA_HREF;
      const label = normalize(authoredLink.textContent);
      // a link without linkText renders its URL as text: use the default label then
      if (label && label !== ctaHref && label !== authoredLink.href) ctaLabel = label;
    } else if (/^(https?:\/\/|\/|#)/.test(text)) {
      ctaHref = text;
    } else {
      ctaLabel = text;
    }
  }
  ctaLabel = ctaLabel || DEFAULT_CTA_LABEL;

  const ctaWrapper = document.createElement('div');
  ctaWrapper.classList.add('grid-cards-cta-wrapper');

  const ctaBtn = document.createElement('a');
  ctaBtn.classList.add('grid-cards-btn');
  ctaBtn.textContent = ctaLabel;
  ctaBtn.href = ctaHref;
  ctaBtn.setAttribute('aria-label', ctaLabel);
  moveCellInstrumentation(linkCell, ctaBtn);

  ctaWrapper.append(ctaBtn);
  container.append(ctaWrapper);

  block.replaceChildren(container);
}
