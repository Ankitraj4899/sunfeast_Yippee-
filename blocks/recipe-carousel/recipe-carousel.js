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

  // 1. Header
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

  // 2. Category Tabs
  const nav = document.createElement('div');
  nav.className = 'recipe-categories-nav';

  // 3. Recipes Section
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

    const menu = document.createElement('div');
    menu.className = 'recipe-card-menu';
    menu.innerHTML = '<span></span><span></span><span></span>';

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
