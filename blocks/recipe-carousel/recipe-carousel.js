const DEFAULT_ICONS = {
  appetizers: '/Appetizers.webp',
  breakfast: '/breakfast.webp',
  snacks: '/Snacks.webp',
  'fancy meal': '/Fancy-Meal.webp',
  'fancy-meal': '/Fancy-Meal.webp',
  fancy: '/Fancy-Meal.webp',
  pasta: '/Lunch-1.webp',
  lunch: '/Lunch-1.webp',
};

const SAMPLE_TITLES = {
  Appetizers: [
    'Bruschetta Bites Recipe...',
    'Crispy Rings Recipe with...',
    'Zucchini Bites Recipe with...',
    'Scotch Eggs with Noodles Recipe',
    'Noodles Lollipop Recipe',
  ],
  Breakfast: [
    'Noodles Chilla Recipe...',
    'Masala Omelette Recipe with...',
    'Veggie Loaded Bowl Recipe',
    'Cheesy Noodles Toast Recipe',
    'Quick Noodle Upma Recipe',
  ],
  Snacks: [
    'YiPPee Pockets Recipe...',
    'Noodle Cutlets Recipe with...',
    'Crispy Spring Rolls Recipe',
    'Noodle Bhel Puri Recipe',
    'Cheese Stuffed Balls Recipe',
  ],
  'Fancy Meal': [
    'Noodles in Tamarind Sauce...',
    'Sizzling Szechuan Recipe',
    'Creamy Noodle Casserole',
    'Stir Fry Exotic Noodles',
    'Paneer Tikka Platter',
  ],
  Pasta: [
    'Creamy Tomato Pasta Recipe...',
    'Cheesy Macaroni Delight',
    'Spicy Masala Pasta Recipe',
    'Herb & Garlic Pasta Recipe',
    'Veggie Delight Pasta Recipe',
  ],
};

const COOKING_TIMES = ['15 Mins', '10 Mins', '10 Mins', '15 Mins', '20 Mins'];

function getTitle(text, category, index) {
  if (text && !text.includes('http') && !text.includes('/') && text.trim().length > 2) {
    return text.trim();
  }

  if (SAMPLE_TITLES[category] && SAMPLE_TITLES[category][index]) {
    return SAMPLE_TITLES[category][index];
  }

  return `${category} Recipe ${index + 1}`;
}

function createPdfBlob(title) {
  const cleanTitle = (title || 'YiPPee Recipe').replace(/[^\w\s-]/g, '').trim() || 'Recipe';
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (${cleanTitle}) /Creator (Sunfeast YiPPee!) /Producer (Sunfeast YiPPee! Recipes) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 190 >>
stream
BT
/F1 22 Tf
50 780 Td
(Sunfeast YiPPee! Recipe) Tj
/F1 16 Tf
0 -40 Td
(${cleanTitle}) Tj
/F1 12 Tf
0 -30 Td
(Delicious noodles and pasta recipe by Sunfeast YiPPee!) Tj
0 -20 Td
(Visit https://sunfeastyippee.com for more exciting recipes.) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000109 00000 n 
0000000155 00000 n 
0000000214 00000 n 
0000000335 00000 n 
0000000575 00000 n 
trailer
<< /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
653
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

function downloadRecipePdf(recipe) {
  const blob = createPdfBlob(recipe.title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `${(recipe.title || 'yippee_recipe').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')}.pdf`;
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getShareUrl(recipe) {
  const slug = (recipe.title || 'recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://sunfeastyippee.com/recipes/${slug}`;
}

function closeAllCardPopups() {
  document.querySelectorAll('.recipe-card-popup').forEach((popup) => {
    popup.remove();
  });
}

function openShareModal(recipe) {
  closeAllCardPopups();
  const existingModal = document.querySelector('.recipe-share-modal-backdrop');
  if (existingModal) existingModal.remove();

  const shareUrl = getShareUrl(recipe);
  const recipeTitle = recipe.title || 'Sunfeast YiPPee! Recipe';

  const backdrop = document.createElement('div');
  backdrop.className = 'recipe-share-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'recipe-share-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'recipe-share-title');

  modal.innerHTML = `
    <div class="recipe-share-modal-header">
      <h3 id="recipe-share-title" class="recipe-share-modal-title">Share</h3>
      <button type="button" class="recipe-share-modal-close" aria-label="Close share modal">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="recipe-share-modal-body">
      <div class="recipe-share-social-grid">
        <button type="button" class="recipe-share-social-btn recipe-share-fb" aria-label="Share on Facebook">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </span>
          <span class="recipe-share-label">Facebook</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-tw" aria-label="Share on Twitter">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </span>
          <span class="recipe-share-label">Twitter</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-li" aria-label="Share on LinkedIn">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </span>
          <span class="recipe-share-label">LinkedIn</span>
        </button>
        <button type="button" class="recipe-share-social-btn recipe-share-mail" aria-label="Share via Email">
          <span class="recipe-share-circle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          <span class="recipe-share-label">Mail</span>
        </button>
      </div>
      <div class="recipe-share-copy-row">
        <input type="text" class="recipe-share-url-input" readonly value="${shareUrl}" aria-label="Share URL" />
        <button type="button" class="recipe-share-copy-btn">Copy</button>
      </div>
    </div>
  `;

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      backdrop.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };

  const closeModal = () => {
    backdrop.remove();
    document.removeEventListener('keydown', handleEsc);
  };

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  const closeBtn = modal.querySelector('.recipe-share-modal-close');
  closeBtn.addEventListener('click', closeModal);

  const fbBtn = modal.querySelector('.recipe-share-fb');
  fbBtn.addEventListener('click', () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const twBtn = modal.querySelector('.recipe-share-tw');
  twBtn.addEventListener('click', () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipeTitle)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const liBtn = modal.querySelector('.recipe-share-li');
  liBtn.addEventListener('click', () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  });

  const mailBtn = modal.querySelector('.recipe-share-mail');
  mailBtn.addEventListener('click', () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodeURIComponent(`Check out this recipe: ${shareUrl}`)}`;
  });

  const copyBtn = modal.querySelector('.recipe-share-copy-btn');
  const input = modal.querySelector('.recipe-share-url-input');

  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        input.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
      });
    } else {
      input.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    }
  });

  document.addEventListener('keydown', handleEsc);
  backdrop.append(modal);
  document.body.append(backdrop);
}

function toggleCardPopup(card, recipe, event) {
  event.stopPropagation();
  const existing = card.querySelector('.recipe-card-popup');
  if (existing) {
    existing.remove();
    return;
  }

  closeAllCardPopups();

  const popup = document.createElement('div');
  popup.className = 'recipe-card-popup';
  popup.setAttribute('role', 'menu');
  popup.setAttribute('aria-label', 'Recipe options');

  popup.innerHTML = `
    <div class="recipe-popup-row recipe-popup-header-row">
      <button type="button" class="recipe-popup-btn recipe-popup-share-btn">
        <svg class="recipe-popup-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 8.5V4.5L21.5 11L14 17.5V13.5C9 13.5 5.5 15.5 3 19C4 13.5 7.5 8.5 14 8.5Z"/>
        </svg>
        <span>Share</span>
      </button>
      <button type="button" class="recipe-popup-close-btn" aria-label="Close menu">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="recipe-popup-row">
      <button type="button" class="recipe-popup-btn recipe-popup-download-btn">
        <svg class="recipe-popup-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Download</span>
      </button>
    </div>
  `;

  popup.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const closeBtn = popup.querySelector('.recipe-popup-close-btn');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.remove();
  });

  const shareBtn = popup.querySelector('.recipe-popup-share-btn');
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openShareModal(recipe);
  });

  const downloadBtn = popup.querySelector('.recipe-popup-download-btn');
  downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllCardPopups();
    downloadRecipePdf(recipe);
  });

  card.append(popup);
}

if (!window.recipePopupListenerAttached) {
  document.addEventListener('click', () => {
    closeAllCardPopups();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCardPopups();
    }
  });
  window.recipePopupListenerAttached = true;
}

export default function decorate(block) {
  const rows = [...block.children];
  const categoriesData = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 0) return;

    const categoryName = cells[0].textContent.trim() || 'Appetizers';
    const key = categoryName.toLowerCase().trim();
    const categoryIcon = DEFAULT_ICONS[key] || '/Appetizers.webp';

    const items = [];
    const contentCell = cells[1] || cells[0];

    if (contentCell) {
      const links = [...contentCell.querySelectorAll('a')];
      const images = [...contentCell.querySelectorAll('img')];

      if (links.length > 0) {
        links.forEach((link, idx) => {
          const imageUrl = link.href;
          if (!imageUrl) return;

          items.push({
            imageUrl,
            title: getTitle(link.textContent, categoryName, idx),
            duration: COOKING_TIMES[idx % COOKING_TIMES.length],
          });
        });
      } else if (images.length > 0) {
        images.forEach((img, idx) => {
          if (!img.src) return;

          items.push({
            imageUrl: img.src,
            title: getTitle(img.alt, categoryName, idx),
            duration: COOKING_TIMES[idx % COOKING_TIMES.length],
          });
        });
      }
    }

    if (items.length === 0) {
      const defaultUrls = [
        'https://s7ap1.scene7.com/is/image/itcportalprod/01_Yippee-Noodles-in-Tamarind-Sauce-1?fmt=webp-alpha&wid=270&fit=fit,1',
        'https://s7ap1.scene7.com/is/image/itcportalprod/6.-Chilla-Thumbnail-Noodles?fmt=webp-alpha&wid=270&fit=fit,1',
        'https://s7ap1.scene7.com/is/image/itcportalprod/YiPPee%20Pockets-1?fmt=webp-alpha&wid=270&fit=fit,1',
      ];

      defaultUrls.forEach((imgUrl, idx) => {
        items.push({
          imageUrl: imgUrl,
          title: getTitle('', categoryName, idx),
          duration: COOKING_TIMES[idx % COOKING_TIMES.length],
        });
      });
    }

    categoriesData.push({
      category: categoryName,
      icon: categoryIcon,
      recipes: items,
    });
  });

  if (categoriesData.length === 0) {
    const list = ['Appetizers', 'Breakfast', 'Snacks', 'Fancy Meal', 'Pasta'];
    list.forEach((cat) => {
      const key = cat.toLowerCase();
      categoriesData.push({
        category: cat,
        icon: DEFAULT_ICONS[key] || '/Appetizers.webp',
        recipes: [
          {
            imageUrl: 'https://s7ap1.scene7.com/is/image/itcportalprod/01_Yippee-Noodles-in-Tamarind-Sauce-1?fmt=webp-alpha&wid=270&fit=fit,1',
            title: 'Bruschetta Bites Recipe...',
            duration: '15 Mins',
          },
          {
            imageUrl: 'https://s7ap1.scene7.com/is/image/itcportalprod/6.-Chilla-Thumbnail-Noodles?fmt=webp-alpha&wid=270&fit=fit,1',
            title: 'Crispy Rings Recipe with...',
            duration: '10 Mins',
          },
          {
            imageUrl: 'https://s7ap1.scene7.com/is/image/itcportalprod/YiPPee%20Pockets-1?fmt=webp-alpha&wid=270&fit=fit,1',
            title: 'Zucchini Bites Recipe with...',
            duration: '10 Mins',
          },
        ],
      });
    });
  }

  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'recipe-carousel-container';

  const header = document.createElement('div');
  header.className = 'recipe-carousel-header';

  const wave = document.createElement('div');
  wave.className = 'recipe-top-wave';

  const heading = document.createElement('h2');
  heading.className = 'recipe-main-title';
  heading.innerHTML = '<span class="title-sparkle">✧</span> YiPPee! With a Twist! <span class="title-sparkle">✧</span>';

  const subtitle = document.createElement('p');
  subtitle.className = 'recipe-main-subtitle';
  subtitle.textContent = 'Explore all the new and exciting ways you can make your YiPPee! Noodles and Pasta';

  header.append(wave, heading, subtitle);

  const nav = document.createElement('div');
  nav.className = 'recipe-categories-nav';

  const section = document.createElement('div');
  section.className = 'recipe-cards-section';

  const sectionTitle = document.createElement('h3');
  sectionTitle.className = 'recipe-section-title';
  sectionTitle.textContent = 'Recipes';

  const carousel = document.createElement('div');
  carousel.className = 'recipe-carousel-stage';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'recipe-arrow recipe-arrow-prev';
  prevBtn.type = 'button';
  prevBtn.textContent = '‹';
  prevBtn.setAttribute('aria-label', 'Previous');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'recipe-arrow recipe-arrow-next';
  nextBtn.type = 'button';
  nextBtn.textContent = '›';
  nextBtn.setAttribute('aria-label', 'Next');

  const viewport = document.createElement('div');
  viewport.className = 'recipe-viewport';

  const track = document.createElement('div');
  track.className = 'recipe-track';

  viewport.append(track);
  carousel.append(prevBtn, viewport, nextBtn);

  const pagination = document.createElement('div');
  pagination.className = 'recipe-dots';

  const viewAllBtn = document.createElement('button');
  viewAllBtn.className = 'recipe-view-all';
  viewAllBtn.type = 'button';
  viewAllBtn.textContent = 'View all';

  section.append(sectionTitle, carousel, pagination, viewAllBtn);
  container.append(header, nav, section);
  block.append(container);

  let activeCatIndex = 0;
  let currentIndex = 0;
  let isViewAll = false;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const isTablet = () => window.matchMedia('(max-width: 900px)').matches;

  const getCardsPerView = () => {
    if (isMobile()) return 1;
    if (isTablet()) return 2;
    return 3;
  };

  const getActiveRecipes = () => categoriesData[activeCatIndex]?.recipes || [];

  const getMaxIndex = () => Math.max(0, getActiveRecipes().length - getCardsPerView());

  const updatePagination = () => {
    if (isViewAll) return;
    const perView = getCardsPerView();
    const activePage = Math.floor(currentIndex / perView);

    [...pagination.children].forEach((dot, idx) => {
      dot.classList.toggle('active', idx === activePage);
    });
  };

  const updateTrack = () => {
    if (isViewAll) {
      track.style.transform = 'none';
      return;
    }

    const firstCard = track.querySelector('.recipe-card');
    if (!firstCard) return;

    const { width } = firstCard.getBoundingClientRect();
    let gap = 32;
    if (isMobile()) {
      gap = 0;
    } else if (isTablet()) {
      gap = 20;
    }
    const offset = currentIndex * (width + gap);

    track.style.transform = `translateX(-${offset}px)`;

    const maxIdx = getMaxIndex();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIdx;

    prevBtn.classList.toggle('disabled', prevBtn.disabled);
    nextBtn.classList.toggle('disabled', nextBtn.disabled);

    updatePagination();
  };

  const handleDotClick = (i) => {
    const perView = getCardsPerView();
    currentIndex = Math.min(i * perView, getMaxIndex());
    updateTrack();
  };

  const createPagination = () => {
    pagination.innerHTML = '';
    if (isViewAll) return;

    const recipes = getActiveRecipes();
    const perView = getCardsPerView();
    const pages = Math.ceil(recipes.length / perView);

    if (pages <= 1) {
      pagination.style.display = 'none';
      return;
    }

    pagination.style.display = 'flex';

    for (let i = 0; i < pages; i += 1) {
      const dot = document.createElement('button');
      dot.className = 'recipe-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);

      if (i === 0) dot.classList.add('active');

      dot.addEventListener('click', () => handleDotClick(i));

      pagination.append(dot);
    }
  };

  const createCard = (recipe) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'recipe-card-menu';
    menu.setAttribute('aria-label', `Menu for ${recipe.title}`);
    menu.innerHTML = '<span></span><span></span><span></span>';

    menu.addEventListener('click', (e) => {
      toggleCardPopup(card, recipe, e);
    });

    const imageWrap = document.createElement('div');
    imageWrap.className = 'recipe-card-image-wrap';

    const img = document.createElement('img');
    img.className = 'recipe-card-img';
    img.src = recipe.imageUrl;
    img.alt = recipe.title;

    imageWrap.append(img);

    const footer = document.createElement('div');
    footer.className = 'recipe-card-footer';

    const title = document.createElement('div');
    title.className = 'recipe-card-title';
    title.textContent = recipe.title;

    const timeWrap = document.createElement('div');
    timeWrap.className = 'recipe-card-time';

    const badge = document.createElement('div');
    badge.className = 'recipe-card-badge';

    const parts = recipe.duration.split(' ');
    const num = parts[0] || '15';
    const unit = parts[1] || 'Mins';

    badge.innerHTML = `<span class="badge-number">${num}</span>`;

    const unitEl = document.createElement('span');
    unitEl.className = 'badge-unit';
    unitEl.textContent = unit;

    timeWrap.append(badge, unitEl);
    footer.append(title, timeWrap);
    card.append(menu, imageWrap, footer);

    return card;
  };

  const renderCards = () => {
    track.innerHTML = '';
    const recipes = getActiveRecipes();

    recipes.forEach((recipe) => {
      track.append(createCard(recipe));
    });

    createPagination();
    updateTrack();
  };

  const renderTabs = () => {
    nav.innerHTML = '';

    categoriesData.forEach((catData, idx) => {
      const tab = document.createElement('button');
      tab.className = 'recipe-category-tab';
      tab.type = 'button';
      if (idx === activeCatIndex) tab.classList.add('active');

      const iconWrap = document.createElement('div');
      iconWrap.className = 'recipe-category-icon-wrap';

      const icon = document.createElement('img');
      icon.className = 'recipe-category-icon';
      icon.src = catData.icon;
      icon.alt = catData.category;

      iconWrap.append(icon);

      const label = document.createElement('span');
      label.className = 'recipe-category-name';
      label.textContent = catData.category;

      const line = document.createElement('span');
      line.className = 'recipe-category-indicator';

      tab.append(iconWrap, label, line);

      tab.addEventListener('click', () => {
        if (activeCatIndex === idx) return;

        activeCatIndex = idx;
        currentIndex = 0;

        [...nav.children].forEach((t, i) => {
          t.classList.toggle('active', i === activeCatIndex);
        });

        renderCards();
      });

      nav.append(tab);
    });
  };

  prevBtn.addEventListener('click', () => {
    if (isViewAll) return;
    const step = getCardsPerView();
    currentIndex = Math.max(0, currentIndex - step);
    updateTrack();
  });

  nextBtn.addEventListener('click', () => {
    if (isViewAll) return;
    const step = getCardsPerView();
    currentIndex = Math.min(getMaxIndex(), currentIndex + step);
    updateTrack();
  });

  viewAllBtn.addEventListener('click', () => {
    isViewAll = !isViewAll;
    block.classList.toggle('is-view-all', isViewAll);

    if (isViewAll) {
      track.style.transform = 'none';
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      pagination.style.display = 'none';
      viewAllBtn.textContent = 'View less';
    } else {
      prevBtn.style.display = '';
      nextBtn.style.display = '';
      pagination.style.display = '';
      viewAllBtn.textContent = 'View all';
      currentIndex = 0;
      createPagination();
      updateTrack();
    }
  });

  window.addEventListener('resize', () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    createPagination();
    updateTrack();
  });

  renderTabs();
  renderCards();
}
