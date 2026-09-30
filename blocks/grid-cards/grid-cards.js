export default function decorate(block) {
  block.classList.add('grid-cards');

  const rows = [...block.children];

  let customTitle = null;
  let customSubtitle = null;
  let customCtaText = null;
  let customCtaLink = null;
  const items = [];

  rows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 0) return;

    const pic = row.querySelector('picture');
    const img = row.querySelector('img');
    const link = row.querySelector('a');
    const text = row.textContent.trim();

    let imgSrc = '';
    let itemLink = '';

    if (pic) {
      const foundImg = pic.querySelector('img');
      imgSrc = foundImg ? (foundImg.currentSrc || foundImg.src) : '';
    } else if (img) {
      imgSrc = img.currentSrc || img.src;
    } else if (link && (link.href.includes('scene7.com') || link.href.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i))) {
      imgSrc = link.href;
      itemLink = link.href;
    } else if (text.startsWith('http://') || text.startsWith('https://')) {
      if (text.includes('scene7.com') || text.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) {
        imgSrc = text;
      } else {
        customCtaLink = text;
      }
    } else if (cols.length === 1) {
      if (text.startsWith('#') || text.toLowerCase().includes('yippeelicious')) {
        customTitle = text.replace(/^[✧*#\s]+|[✧*#\s]+$/g, '').trim();
      } else if (text.toLowerCase().includes('upload') || text.toLowerCase().includes('moments') || text.toLowerCase().includes('tag us')) {
        customSubtitle = text;
      } else if (text.toLowerCase().includes('join')) {
        customCtaText = text;
      }
    }

    if (link && !imgSrc && link.href) {
      customCtaLink = link.href;
      if (!customCtaText) customCtaText = link.textContent.trim();
    }

    if (imgSrc || pic || img) {
      items.push({
        picElement: pic || (img ? img.parentElement : null),
        imgSrc: imgSrc || (img ? img.src : ''),
        link: itemLink || (link ? link.href : ''),
      });
    }
  });

  block.textContent = '';

  const container = document.createElement('div');
  container.classList.add('grid-cards-container');

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
  titleText.textContent = customTitle ? `#${customTitle}` : '#YiPPeelicious';

  const rightStar = document.createElement('span');
  rightStar.classList.add('grid-cards-star');
  rightStar.textContent = '✧';
  rightStar.setAttribute('aria-hidden', 'true');

  heading.append(leftStar, titleText, rightStar);

  const subtitle = document.createElement('p');
  subtitle.classList.add('grid-cards-subtitle');
  subtitle.textContent = customSubtitle || 'Upload your YiPPee! moments and tag us to get featured in our website';

  headerWrapper.append(heading, subtitle);
  container.append(headerWrapper);

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

  if (items.length <= 8) {
    items.forEach((item, index) => {
      const colIdx = index % numCols;
      const rowIdx = Math.floor(index / numCols);
      const variant = (cardVariants[colIdx] && cardVariants[colIdx][rowIdx]) || (index % 2 === 0 ? 'card-short' : 'card-tall');

      const card = document.createElement('div');
      card.classList.add('grid-cards-card', variant);

      if (item.picElement) {
        card.append(item.picElement.cloneNode(true));
      } else if (item.imgSrc) {
        const image = document.createElement('img');
        image.src = item.imgSrc;
        image.alt = `YiPPeelicious moment ${index + 1}`;
        image.loading = 'lazy';
        card.append(image);
      }

      columns[colIdx].append(card);
    });
  } else {
    items.forEach((item, index) => {
      const colIdx = index % numCols;
      const card = document.createElement('div');
      const variant = index % 2 === 0 ? 'card-short' : 'card-tall';
      card.classList.add('grid-cards-card', variant);

      if (item.picElement) {
        card.append(item.picElement.cloneNode(true));
      } else if (item.imgSrc) {
        const image = document.createElement('img');
        image.src = item.imgSrc;
        image.alt = `YiPPeelicious moment ${index + 1}`;
        image.loading = 'lazy';
        card.append(image);
      }

      columns[colIdx].append(card);
    });
  }

  columns.forEach((col) => grid.append(col));
  container.append(grid);

  const ctaWrapper = document.createElement('div');
  ctaWrapper.classList.add('grid-cards-cta-wrapper');

  const ctaBtn = document.createElement('a');
  ctaBtn.classList.add('grid-cards-btn');
  ctaBtn.textContent = customCtaText || 'Join us';
  ctaBtn.href = customCtaLink || '#';
  ctaBtn.setAttribute('aria-label', customCtaText || 'Join us');

  ctaWrapper.append(ctaBtn);
  container.append(ctaWrapper);

  block.append(container);
}
