import { moveInstrumentation, moveCellInstrumentation } from '../../scripts/scripts.js';

function createSparkleIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'sparkle-icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#000000');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z"/>';
  return svg;
}

function resolveProductName(altText, imgSrc, catName, subHeading, idx) {
  if (altText && !altText.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
    return altText.replace(/\s+/g, ' ').trim();
  }
  const lowerSrc = (imgSrc || '').toLowerCase();
  if (/magic[-_]?masala/i.test(lowerSrc)) return 'Magic Masala Noodles';
  if (/mood[-_]?masala/i.test(lowerSrc)) return 'Mood Masala Noodles';
  if (/millet/i.test(lowerSrc)) return 'Magic Millet Noodles';
  if (/atta|power[-_]?up/i.test(lowerSrc)) return 'Power Up Atta Noodles';
  if (/creamy[-_]?corn/i.test(lowerSrc)) return 'Tricolor Pasta Creamy Corn';
  if (/masala/i.test(lowerSrc) && /pasta/i.test(catName)) return 'Tricolor Pasta Treat Masala';
  if (/tomato/i.test(lowerSrc) && /pasta/i.test(catName)) return 'Tricolor Pasta Tomato Cheese';
  if (/fiery|korean/i.test(lowerSrc)) return 'Korean Fiery Hot Noodles';

  if (/noodle/i.test(catName)) {
    const noodleNames = [
      'Magic Masala Noodles',
      'Mood Masala Noodles',
      'Magic Millet Noodles',
      'Power Up Atta Noodles',
    ];
    if (noodleNames[idx]) return noodleNames[idx];
  } else if (/pasta/i.test(catName)) {
    const pastaNames = [
      'Tricolor Pasta Creamy Corn',
      'Tricolor Pasta Treat Masala',
      'Tricolor Pasta Tomato Cheese',
    ];
    if (pastaNames[idx]) return pastaNames[idx];
  } else if (/korean/i.test(catName)) {
    return 'Korean Fiery Hot Noodles';
  }

  return `${subHeading || catName} Product ${idx + 1}`;
}

function openBuyNowModal(productName) {
  const query = encodeURIComponent(`sunfeast yippee ${productName}`);
  const partnersRow1 = [
    {
      name: 'Blinkit',
      url: `https://blinkit.com/s/?q=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#fecb00"/>
        <text x="35" y="41" font-family="Arial, sans-serif" font-weight="900" font-size="13" text-anchor="middle">
          <tspan fill="#000">blink</tspan><tspan fill="#0c831f">it</tspan>
        </text>
      </svg>`,
    },
    {
      name: 'Zepto',
      url: `https://www.zeptonow.com/search?q=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#3b0066"/>
        <text x="35" y="42" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="#ff3269" text-anchor="middle">zepto</text>
      </svg>`,
    },
    {
      name: 'BigBasket',
      url: `https://www.bigbasket.com/ps/?q=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#88c425"/>
        <text x="35" y="45" font-family="Arial, sans-serif" font-weight="900" font-size="28" text-anchor="middle">
          <tspan fill="#d8232a">b</tspan><tspan fill="#222222">b</tspan>
        </text>
      </svg>`,
    },
    {
      name: 'Swiggy',
      url: `https://www.swiggy.com/instamart/search?query=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#fc8019"/>
        <path fill="#ffffff" d="M35 14c-5.5 0-10 4.5-10 10 0 7.5 8.7 15.6 9.5 16.3.3.3.7.3 1 0 .8-.7 9.5-8.8 9.5-16.3 0-5.5-4.5-10-10-10zm0 4.5c1.8 0 3.3 1.4 3.3 3.2 0 1.9-1.5 3.5-3.3 3.5s-3.3-1.6-3.3-3.5c0-1.8 1.5-3.2 3.3-3.2z"/>
        <text x="35" y="52" font-family="Arial, sans-serif" font-weight="900" font-size="7.5" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">SWIGGY</text>
      </svg>`,
    },
  ];

  const partnersRow2 = [
    {
      name: 'Amazon',
      url: `https://www.amazon.in/s?k=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#ffffff"/>
        <text x="35" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#111111" text-anchor="middle">a</text>
        <path d="M23 44c6 4.5 18 4.5 24 0" fill="none" stroke="#ff9900" stroke-width="3" stroke-linecap="round"/>
        <path d="M46 42.5l2 2.5-3.5 1" fill="#ff9900"/>
      </svg>`,
    },
    {
      name: 'Flipkart',
      url: `https://www.flipkart.com/search?q=${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#0084ff"/>
        <path d="M23 27h24l-3 23H26z" fill="#ffe11b"/>
        <path d="M30 27v-5c0-2.8 2.2-5 5-5s5 2.2 5 5v5" fill="none" stroke="#ffe11b" stroke-width="2.5"/>
        <path d="M36.5 33h-3v14h-3V33h-2v-3h2v-2c0-2.2 1.5-4 4-4h2v3h-1.5c-1 0-1.5.5-1.5 1.5v1.5h3z" fill="#0084ff"/>
      </svg>`,
    },
    {
      name: 'JioMart',
      url: `https://www.jiomart.com/search/${query}`,
      svg: `<svg viewBox="0 0 70 70" width="68" height="68">
        <circle cx="35" cy="35" r="35" fill="#d71921"/>
        <path d="M24 28h22l-2.5 19H26.5z" fill="#ffffff"/>
        <path d="M30 28v-4c0-2.5 2-4.5 5-4.5s5 2 5 4.5v4" fill="none" stroke="#ffffff" stroke-width="2.5"/>
        <text x="35" y="41" font-family="Arial, sans-serif" font-weight="900" font-size="11" fill="#d71921" text-anchor="middle">Jio</text>
      </svg>`,
    },
  ];

  const overlay = document.createElement('div');
  overlay.className = 'yippee-buy-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `Buy ${productName}`);

  const modal = document.createElement('div');
  modal.className = 'yippee-buy-modal';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'yippee-buy-modal-close';
  closeBtn.setAttribute('aria-label', 'Close modal');
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  const title = document.createElement('h2');
  title.className = 'yippee-buy-modal-title';
  title.textContent = 'Buy Now';

  const partnersWrap = document.createElement('div');
  partnersWrap.className = 'yippee-buy-modal-partners';

  const renderRow = (partners) => {
    const row = document.createElement('div');
    row.className = 'yippee-partners-row';
    partners.forEach((partner) => {
      const a = document.createElement('a');
      a.className = 'yippee-partner-item';
      a.href = partner.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', `Buy on ${partner.name}`);
      a.title = partner.name;
      a.innerHTML = partner.svg;
      row.append(a);
    });
    return row;
  };

  partnersWrap.append(renderRow(partnersRow1), renderRow(partnersRow2));

  const footer = document.createElement('p');
  footer.className = 'yippee-buy-modal-footer';
  footer.textContent = 'This product is now available at your nearby stores';

  modal.append(closeBtn, title, partnersWrap, footer);
  overlay.append(modal);
  document.body.append(overlay);
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    document.body.style.overflow = '';
    overlay.remove();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  };

  closeBtn.addEventListener('click', () => {
    closeModal();
    window.removeEventListener('keydown', onKeyDown);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      window.removeEventListener('keydown', onKeyDown);
    }
  });

  window.addEventListener('keydown', onKeyDown);
}

// Block-level fields, in model order: one leading row (one cell) each.
const CONFIG_FIELDS = ['title', 'homeLabel', 'currentLabel', 'buyNowLabel'];

const DEFAULT_TEXTS = {
  title: 'Sunfeast Yippee Products',
  homeLabel: 'Home Page >',
  currentLabel: 'Product Listing',
  buyNowLabel: 'Buy Now',
};

const hasImage = (el) => !!el?.querySelector('picture, img');

/**
 * Splits the rows into block-level field cells and item rows. Content authored
 * before the block had fields (the live site) has no field rows.
 */
function readRows(block) {
  const rows = [...block.children].filter((row) => row.children.length > 0);
  const config = {};
  let count = 0;
  while (count < CONFIG_FIELDS.length && count < rows.length
    && rows[count].children.length === 1 && !hasImage(rows[count])) {
    config[CONFIG_FIELDS[count]] = rows[count].firstElementChild;
    count += 1;
  }
  return { config, itemRows: rows.slice(count) };
}

function readHeadings(contentCol, catName) {
  let rangeHeading = '';
  let subHeading = '';
  const textNodes = [...(contentCol?.querySelectorAll('h1, h2, h3, h4, h5, h6, p') || [])].filter(
    (el) => !el.querySelector('picture, img') && el.textContent.trim().length > 0,
  );
  textNodes.forEach((node) => {
    const text = node.textContent.trim();
    if (!rangeHeading && (/explore/i.test(text) || /range/i.test(text))) {
      rangeHeading = text;
    } else if (!subHeading && text !== rangeHeading) {
      subHeading = text;
    }
  });
  return { rangeHeading: rangeHeading || `Explore Our ${catName} Range`, subHeading };
}

function toProduct(pic, cat, idx, row = null, nameCell = null) {
  const parentLink = pic.closest('a');
  const nextLink = pic.parentElement?.nextElementSibling?.querySelector('a')
    || pic.parentElement?.querySelector('a');
  const targetLink = parentLink?.href || nextLink?.href || 'https://itcstore.in/';

  const img = pic.tagName.toLowerCase() === 'img' ? pic : pic.querySelector('img');
  const altText = img?.alt?.trim() || '';
  const imgSrc = img?.currentSrc || img?.src || '';
  const absoluteImageUrl = imgSrc ? new URL(imgSrc, window.location.href).href : '';
  const authoredName = nameCell?.textContent.trim();

  return {
    picture: pic,
    name: authoredName || resolveProductName(altText, imgSrc, cat.name, cat.subHeading, idx),
    imageUrl: absoluteImageUrl,
    link: targetLink,
    row,
  };
}

/**
 * Category items (name | headings) followed by Product items (image | name).
 * Older content keeps the product pictures inside the category's headings cell.
 */
function readCategories(itemRows) {
  const categories = [];
  itemRows.forEach((row) => {
    const cols = [...row.children];
    if (hasImage(cols[0])) {
      // Product item: belongs to the category above it
      if (!categories.length) {
        categories.push({
          name: 'Products', rangeHeading: 'Explore Our Products Range', subHeading: '', products: [],
        });
      }
      const cat = categories[categories.length - 1];
      const pic = cols[0].querySelector('picture') || cols[0].querySelector('img');
      cat.products.push(toProduct(pic, cat, cat.products.length, row, cols[1]));
      return;
    }

    const catName = cols[0]?.textContent?.trim() || 'Products';
    const contentCol = cols[1] || cols[0];
    const cat = {
      name: catName,
      ...readHeadings(contentCol, catName),
      products: [],
      row,
      nameCell: cols[0],
      contentCol,
    };
    const pictures = [...contentCol.querySelectorAll('picture')];
    if (pictures.length === 0) pictures.push(...contentCol.querySelectorAll('img'));
    pictures.forEach((pic) => cat.products.push(toProduct(pic, cat, cat.products.length)));
    categories.push(cat);
  });
  return categories;
}

export default function decorate(block) {
  const { config, itemRows } = readRows(block);
  const texts = {};
  Object.keys(DEFAULT_TEXTS).forEach((name) => {
    texts[name] = config[name]?.textContent.trim() || DEFAULT_TEXTS[name];
  });
  const categories = readCategories(itemRows);

  block.textContent = '';

  // Breadcrumb
  const breadcrumb = document.createElement('nav');
  breadcrumb.className = 'product-breadcrumb';
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  const homeCrumb = document.createElement('a');
  homeCrumb.href = '/';
  homeCrumb.className = 'breadcrumb-pill';
  homeCrumb.textContent = texts.homeLabel;
  const currentCrumb = document.createElement('span');
  currentCrumb.className = 'breadcrumb-pill active';
  currentCrumb.textContent = texts.currentLabel;
  moveCellInstrumentation(config.homeLabel, homeCrumb);
  moveCellInstrumentation(config.currentLabel, currentCrumb);
  breadcrumb.append(homeCrumb, currentCrumb);

  // Main Page Title
  const mainTitle = document.createElement('h1');
  mainTitle.className = 'product-main-title';
  mainTitle.textContent = texts.title;
  moveCellInstrumentation(config.title, mainTitle);

  // Category Quick Scroll Navigation
  const tabList = document.createElement('nav');
  tabList.className = 'product-tabs';
  tabList.setAttribute('aria-label', 'Product Category Navigation');

  // Container holding all visible sections
  const sectionsContainer = document.createElement('div');
  sectionsContainer.className = 'product-sections';

  const tabButtons = [];
  const sectionElements = [];

  categories.forEach((cat, index) => {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sectionId = `section-${slug}`;
    const isFirst = index === 0;

    // Quick Jump Button
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = `product-tab${isFirst ? ' active' : ''}`;
    tabBtn.setAttribute('aria-label', `Scroll to ${cat.name}`);
    tabBtn.dataset.target = sectionId;
    tabBtn.textContent = cat.name;
    // older one-cell rows hold everything in one cell; only split cells move
    const splitCells = cat.contentCol !== cat.nameCell;
    if (cat.nameCell && splitCells) moveCellInstrumentation(cat.nameCell, tabBtn);
    tabButtons.push(tabBtn);
    tabList.append(tabBtn);

    // Visible Section (All 3 rendered on single page)
    const section = document.createElement('section');
    section.className = 'product-category-section';
    section.id = sectionId;
    if (cat.row) moveInstrumentation(cat.row, section);

    // Range Heading with sparkles
    const headingWrap = document.createElement('div');
    headingWrap.className = 'category-heading-wrap';

    const leftSparkle = createSparkleIcon();
    const rightSparkle = createSparkleIcon();

    const rangeTitle = document.createElement('h2');
    rangeTitle.className = 'category-range-title';
    rangeTitle.textContent = cat.rangeHeading;
    if (cat.contentCol && splitCells) moveCellInstrumentation(cat.contentCol, rangeTitle);

    headingWrap.append(leftSparkle, rangeTitle, rightSparkle);
    section.append(headingWrap);

    // Larger Product Cards Grid
    const grid = document.createElement('div');
    grid.className = 'product-cards-grid';

    cat.products.forEach((prod) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      if (prod.row) moveInstrumentation(prod.row, card);

      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-card-image';
      // move the authored picture (keeps its editor instrumentation)
      imgWrap.append(prod.picture);

      const buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'product-buy-now-btn';
      buyBtn.textContent = texts.buyNowLabel;
      buyBtn.setAttribute('aria-label', `Buy Now ${prod.name}`);

      buyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openBuyNowModal(prod.name);
      });

      card.addEventListener('click', () => {
        openBuyNowModal(prod.name);
      });

      card.append(imgWrap, buyBtn);
      grid.append(card);
    });

    section.append(grid);
    sectionElements.push(section);
    sectionsContainer.append(section);

    // Smooth scroll on button click
    tabBtn.addEventListener('click', () => {
      tabButtons.forEach((btn) => btn.classList.remove('active'));
      tabBtn.classList.add('active');

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10,
      ) || 70;
      const targetY = section.getBoundingClientRect().top + window.pageYOffset - (navHeight + 20);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

  // ScrollSpy: Automatically highlight active button on scroll
  if ('IntersectionObserver' in window && sectionElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeId = entry.target.id;
            tabButtons.forEach((btn) => {
              btn.classList.toggle('active', btn.dataset.target === activeId);
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      },
    );

    sectionElements.forEach((sec) => observer.observe(sec));
  }

  // 1. Breadcrumb Wrap
  const breadcrumbWrap = document.createElement('div');
  breadcrumbWrap.className = 'product-breadcrumb-wrap';
  breadcrumbWrap.append(breadcrumb);

  // 2. Banner Wrap
  const bannerWrap = document.createElement('div');
  bannerWrap.className = 'product-banner-wrap';
  bannerWrap.append(mainTitle);

  // 3. Content Wrap
  const contentWrap = document.createElement('div');
  contentWrap.className = 'product-content-wrap';
  contentWrap.append(tabList, sectionsContainer);

  block.append(breadcrumbWrap, bannerWrap, contentWrap);
}
