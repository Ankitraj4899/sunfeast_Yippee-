export default function decorate(block) {
  block.classList.add('world');

  // Extract author rows
  const rows = [...block.children];

  let customHeading = null;
  let customCtaText = null;
  let customCtaLink = null;
  const cardRows = [];

  rows.forEach((row) => {
    const cols = [...row.children];
    // Check if single-column row contains heading or custom CTA
    if (cols.length === 1) {
      const text = row.textContent.trim();
      const link = row.querySelector('a');
      if (link && (link.textContent.toLowerCase().includes('better world') || link.href)) {
        customCtaLink = link;
      } else if (text.toLowerCase().includes('learn how')) {
        customCtaText = text;
      } else if (
        text.toLowerCase().includes('better world')
        || text.toLowerCase().includes('take a look')
      ) {
        customHeading = text;
      }
    } else if (cols.length >= 2) {
      cardRows.push(row);
    }
  });

  // If no rows were categorized as cards, treat all rows as cards
  const finalCardRows = cardRows.length > 0 ? cardRows : rows;

  // Clear existing DOM
  block.textContent = '';

  // 1. Top Section Heading with Left & Right Sparkles
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
  titleText.textContent = customHeading || 'Take A Look At The Better World';

  const rightStar = document.createElement('span');
  rightStar.classList.add('world-heading-star');
  rightStar.textContent = '✧';
  rightStar.setAttribute('aria-hidden', 'true');

  heading.append(leftStar, titleText, rightStar);
  headingWrapper.append(heading);
  block.append(headingWrapper);

  // 2. Cards Grid
  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('world-cards');

  finalCardRows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 0) return;

    const imageCol = cols[0];
    const contentCol = cols[1];

    if (!imageCol && !contentCol) return;

    const card = document.createElement('div');
    card.classList.add('world-card');

    // Extract title & description text first so image can use title as alt text
    let cardTitleText = '';
    let cardDescText = '';

    if (contentCol) {
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
    }

    // Handle Image
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('world-card-image');

    if (imageCol) {
      const picture = imageCol.querySelector('picture');
      const img = imageCol.querySelector('img');
      const link = imageCol.querySelector('a');
      const rawText = imageCol.textContent.trim();

      if (picture) {
        imageWrapper.append(picture);
      } else if (img) {
        imageWrapper.append(img);
      } else if (link && link.href) {
        const newImg = document.createElement('img');
        newImg.src = link.href;
        newImg.alt = cardTitleText || 'Better World Initiative';
        newImg.loading = 'lazy';
        imageWrapper.append(newImg);
      } else if (rawText.startsWith('http://') || rawText.startsWith('https://')) {
        const newImg = document.createElement('img');
        newImg.src = rawText;
        newImg.alt = cardTitleText || 'Better World Initiative';
        newImg.loading = 'lazy';
        imageWrapper.append(newImg);
      }
    }

    // Handle Content (Title + Description)
    const bodyWrapper = document.createElement('div');
    bodyWrapper.classList.add('world-card-body');

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
    cardsContainer.append(card);
  });

  block.append(cardsContainer);

  // 3. Bottom CTA Section
  const footerSection = document.createElement('div');
  footerSection.classList.add('world-footer');

  // Decorative text with sparkles
  const subtitleWrapper = document.createElement('div');
  subtitleWrapper.classList.add('world-subtitle-wrapper');

  // Left sparkle SVG
  const sparkleLeft = document.createElement('span');
  sparkleLeft.classList.add('world-sparkle', 'sparkle-bottom-left');
  sparkleLeft.setAttribute('aria-hidden', 'true');
  sparkleLeft.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="#fdb913">
      <path d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0 Z"/>
    </svg>
  `;

  const subtitle = document.createElement('p');
  subtitle.classList.add('world-subtitle');
  if (customCtaText) {
    subtitle.textContent = customCtaText;
  } else {
    subtitle.innerHTML = 'Learn how we are driving a change through<br class="mobile-break"> the';
  }

  // Right sparkle SVG
  const sparkleRight = document.createElement('span');
  sparkleRight.classList.add('world-sparkle', 'sparkle-top-right');
  sparkleRight.setAttribute('aria-hidden', 'true');
  sparkleRight.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="#fdb913">
      <path d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0 Z"/>
    </svg>
  `;

  subtitleWrapper.append(sparkleLeft, subtitle, sparkleRight);

  // Red Pill Button
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('world-cta-wrapper');

  const ctaButton = document.createElement('a');
  ctaButton.classList.add('world-btn');
  ctaButton.href = customCtaLink
    ? customCtaLink.href
    : 'https://www.sunfeastyippee.com/better-world';
  ctaButton.textContent = customCtaLink
    ? customCtaLink.textContent.trim()
    : 'YiPPee! Better World';
  ctaButton.title = 'YiPPee! Better World';

  buttonWrapper.append(ctaButton);
  footerSection.append(subtitleWrapper, buttonWrapper);
  block.append(footerSection);
}
