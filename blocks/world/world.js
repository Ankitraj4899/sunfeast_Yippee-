import { moveInstrumentation, moveCellInstrumentation } from '../../scripts/scripts.js';

const DEFAULT_TITLE = 'Take A Look At The Better World';
const DEFAULT_SUBTITLE = 'Learn how we are driving a change through the';
const DEFAULT_SUBTITLE_HTML = 'Learn how we are driving a change through<br class="mobile-break"> the';
const DEFAULT_CTA_HREF = 'https://www.sunfeastyippee.com/better-world';
const DEFAULT_CTA_LABEL = 'YiPPee! Better World';

// block-level field groups, in model order: title | subtitle | link (+ linkText)
const CONFIG_FIELDS = 3;

const IMAGE_URL = /scene7\.com|\.(jpe?g|gif|png|webp|svg|avif)(\?.*)?$/i;

const normalize = (text) => (text || '').replace(/\s+/g, ' ').trim();

/**
 * A config row has a single cell, no image and no link to an image URL.
 * Item rows (world-card) have an image URL cell and a text cell.
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

function createSparkle(position) {
  const sparkle = document.createElement('span');
  sparkle.classList.add('world-sparkle', position);
  sparkle.setAttribute('aria-hidden', 'true');
  sparkle.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="#fdb913">
      <path d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0 Z"/>
    </svg>
  `;
  return sparkle;
}

function extractCardText(contentCol) {
  let cardTitleText = '';
  let cardDescText = '';
  if (!contentCol) return { cardTitleText, cardDescText };

  const existingHeading = contentCol.querySelector('h1, h2, h3, h4, h5, h6, strong');
  const paragraphs = [...contentCol.querySelectorAll('p')];

  if (existingHeading) {
    cardTitleText = existingHeading.textContent.trim();
    const descParagraphs = paragraphs.filter(
      (p) => p !== existingHeading && !p.contains(existingHeading),
    );
    if (descParagraphs.length > 0) {
      cardDescText = descParagraphs.map((p) => p.textContent.trim()).join(' ');
    } else {
      const clone = contentCol.cloneNode(true);
      const h = clone.querySelector('h1, h2, h3, h4, h5, h6, strong');
      if (h) h.remove();
      cardDescText = clone.textContent.trim();
    }
  } else if (paragraphs.length >= 2) {
    cardTitleText = paragraphs[0].textContent.trim();
    cardDescText = paragraphs.slice(1).map((p) => p.textContent.trim()).join(' ');
  } else if (paragraphs.length === 1) {
    const text = paragraphs[0].innerHTML;
    if (text.includes('<br>')) {
      const parts = text.split(/<br\s*\/?>/i);
      cardTitleText = parts[0].replace(/<[^>]*>/g, '').trim();
      cardDescText = parts.slice(1).join(' ').replace(/<[^>]*>/g, '').trim();
    } else {
      const rawLines = paragraphs[0].textContent.trim().split(/\n+/);
      if (rawLines.length > 1) {
        cardTitleText = rawLines[0].trim();
        cardDescText = rawLines.slice(1).join(' ').trim();
      } else {
        cardTitleText = paragraphs[0].textContent.trim();
      }
    }
  } else {
    const rawLines = contentCol.textContent.trim().split(/\n+/);
    cardTitleText = rawLines[0] ? rawLines[0].trim() : '';
    cardDescText = rawLines.slice(1).join(' ').trim();
  }
  return { cardTitleText, cardDescText };
}

function buildCard(row) {
  const [imageCol, contentCol] = [...row.children];

  const card = document.createElement('div');
  card.classList.add('world-card');
  moveInstrumentation(row, card);

  const { cardTitleText, cardDescText } = extractCardText(contentCol);

  // Image
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('world-card-image');

  if (imageCol) {
    const picture = imageCol.querySelector('picture');
    const img = imageCol.querySelector('img');
    const link = imageCol.querySelector('a');
    const rawText = imageCol.textContent.trim();

    const createImg = (src) => {
      const newImg = document.createElement('img');
      newImg.classList.add('world-card-img');
      newImg.src = src;
      newImg.alt = cardTitleText || 'Better World Initiative';
      newImg.loading = 'lazy';
      moveCellInstrumentation(imageCol, newImg);
      return newImg;
    };

    if (picture) {
      picture.classList.add('world-card-picture');
      const pImg = picture.querySelector('img');
      if (pImg) pImg.classList.add('world-card-img');
      imageWrapper.append(picture);
    } else if (img) {
      img.classList.add('world-card-img');
      imageWrapper.append(img);
    } else if (link && link.href) {
      imageWrapper.append(createImg(link.href));
    } else if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
      imageWrapper.append(createImg(rawText));
    } else {
      moveCellInstrumentation(imageCol, imageWrapper);
    }
  }

  // Content (title + description)
  const bodyWrapper = document.createElement('div');
  bodyWrapper.classList.add('world-card-body');
  if (contentCol) moveCellInstrumentation(contentCol, bodyWrapper);

  if (cardTitleText) {
    const cardTitle = document.createElement('h3');
    cardTitle.classList.add('world-card-title');
    cardTitle.textContent = cardTitleText;
    bodyWrapper.append(cardTitle);
  }

  if (cardDescText) {
    const cardDesc = document.createElement('p');
    cardDesc.classList.add('world-card-desc');
    cardDesc.textContent = cardDescText;
    bodyWrapper.append(cardDesc);
  }

  card.append(imageWrapper, bodyWrapper);
  return card;
}

export default function decorate(block) {
  block.classList.add('world');

  const { config, items } = splitRows(block);
  const [titleRow, subtitleRow, linkRow] = config;
  const titleCell = cellOf(titleRow);
  const subtitleCell = cellOf(subtitleRow);
  const linkCell = cellOf(linkRow);

  // 1. Top section heading with left & right stars
  const headingWrapper = document.createElement('div');
  headingWrapper.classList.add('world-header');

  const heading = document.createElement('h2');
  heading.classList.add('world-title');

  const leftStar = document.createElement('span');
  leftStar.classList.add('world-heading-star');
  leftStar.textContent = '✧';
  leftStar.setAttribute('aria-hidden', 'true');

  const titleText = document.createElement('span');
  titleText.classList.add('world-title-text');
  titleText.textContent = normalize(titleCell?.textContent) || DEFAULT_TITLE;
  moveCellInstrumentation(titleCell, titleText);

  const rightStar = document.createElement('span');
  rightStar.classList.add('world-heading-star');
  rightStar.textContent = '✧';
  rightStar.setAttribute('aria-hidden', 'true');

  heading.append(leftStar, titleText, rightStar);
  headingWrapper.append(heading);

  // 2. Cards grid
  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('world-cards');
  items
    .filter((row) => row.children.length > 0)
    .forEach((row) => cardsContainer.append(buildCard(row)));

  // 3. Bottom CTA section
  const footerSection = document.createElement('div');
  footerSection.classList.add('world-footer');

  const subtitleWrapper = document.createElement('div');
  subtitleWrapper.classList.add('world-subtitle-wrapper');

  const subtitle = document.createElement('p');
  subtitle.classList.add('world-subtitle');
  const subtitleText = normalize(subtitleCell?.textContent);
  if (!subtitleText || subtitleText === DEFAULT_SUBTITLE) {
    subtitle.innerHTML = DEFAULT_SUBTITLE_HTML;
  } else {
    subtitle.textContent = subtitleText;
  }
  moveCellInstrumentation(subtitleCell, subtitle);

  subtitleWrapper.append(
    createSparkle('sparkle-bottom-left'),
    subtitle,
    createSparkle('sparkle-top-right'),
  );

  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('world-cta-wrapper');

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

  const ctaButton = document.createElement('a');
  ctaButton.classList.add('world-btn');
  ctaButton.href = ctaHref;
  ctaButton.textContent = ctaLabel;
  ctaButton.title = ctaLabel;
  moveCellInstrumentation(linkCell, ctaButton);

  buttonWrapper.append(ctaButton);
  footerSection.append(subtitleWrapper, buttonWrapper);

  block.replaceChildren(headingWrapper, cardsContainer, footerSection);
}
