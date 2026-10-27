import { moveCellInstrumentation } from '../../scripts/scripts.js';

// Block-level fields, in model order (one row each, before the card rows).
const CONFIG_FIELDS = [
  'heading',
  'tabOneLabel',
  'tabTwoLabel',
  'firstTabCount',
  'viewAllLabel',
  'viewLessLabel',
];

// Today's texts: used when a field is empty or its row is missing (older content).
const DEFAULTS = {
  heading: "YiPPee!'s Noodle Range",
  tabOneLabel: 'Instant Noodles',
  tabTwoLabel: 'Cup Noodles',
  firstTabCount: 4,
  viewAllLabel: 'View All',
  viewLessLabel: 'View Less',
};

const IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;

/**
 * A config row has a single cell without any image (card rows carry a picture,
 * or two cells: image | text).
 */
function isConfigRow(row) {
  if (row.hasAttribute('data-aue-resource')) return false;
  if (row.children.length !== 1) return false;
  if (row.querySelector('picture, img')) return false;
  const link = row.querySelector('a[href]');
  if (link && IMAGE_URL.test(link.getAttribute('href'))) return false;
  return true;
}

function splitRows(block) {
  const rows = [...block.children];
  let count = 0;
  while (count < CONFIG_FIELDS.length && count < rows.length && isConfigRow(rows[count])) {
    count += 1;
  }
  const config = {};
  rows.slice(0, count).forEach((row, index) => {
    config[CONFIG_FIELDS[index]] = row.firstElementChild;
  });
  return { config, items: rows.slice(count) };
}

const cellText = (cell) => (cell ? cell.textContent.trim() : '');

/** Creates a label element showing a config value, carrying the cell's instrumentation. */
function label(tag, cell, fallback) {
  const el = document.createElement(tag);
  el.textContent = cellText(cell) || fallback;
  moveCellInstrumentation(cell, el);
  return el;
}

export default function decorate(block) {
  const { config, items } = splitRows(block);

  const parsedCount = parseInt(cellText(config.firstTabCount), 10);
  const firstTabCount = Math.max(
    0,
    Number.isNaN(parsedCount) ? DEFAULTS.firstTabCount : parsedCount,
  );

  // Each authored row becomes its card once; rendering only toggles visibility.
  const cards = items.map((row) => {
    row.classList.add('noodle-card');
    // drop empty extra cells (e.g. an unused text cell) so the image keeps the full width
    [...row.children].slice(1).forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) cell.remove();
    });
    const image = row.firstElementChild?.querySelector('img');
    if (image) image.classList.add('noodle-image');
    return row;
  });

  const tabItems = [
    cards.slice(0, firstTabCount),
    cards.slice(firstTabCount),
  ];

  block.classList.add('noodle-range');

  const heading = document.createElement('h2');
  heading.classList.add('noodle-range-heading');

  const leftStar = document.createElement('span');
  leftStar.classList.add('heading-star');
  leftStar.textContent = '✧';

  const title = label('span', config.heading, DEFAULTS.heading);

  const rightStar = document.createElement('span');
  rightStar.classList.add('heading-star');
  rightStar.textContent = '✧';

  heading.append(leftStar, title, rightStar);

  const tabs = document.createElement('div');
  tabs.classList.add('noodle-tabs');

  const instantTab = label('button', config.tabOneLabel, DEFAULTS.tabOneLabel);
  instantTab.classList.add('noodle-tab', 'active');
  instantTab.type = 'button';

  const cupTab = label('button', config.tabTwoLabel, DEFAULTS.tabTwoLabel);
  cupTab.classList.add('noodle-tab');
  cupTab.type = 'button';

  const tabButtons = [instantTab, cupTab];
  tabs.append(instantTab, cupTab);

  const carousel = document.createElement('div');
  carousel.classList.add('noodle-carousel');

  const previousButton = document.createElement('button');
  previousButton.classList.add('noodle-arrow', 'noodle-prev');
  previousButton.type = 'button';
  previousButton.textContent = '‹';

  const nextButton = document.createElement('button');
  nextButton.classList.add('noodle-arrow', 'noodle-next');
  nextButton.type = 'button';
  nextButton.textContent = '›';

  const track = document.createElement('div');
  track.classList.add('noodle-track');
  track.append(...cards);

  const viewAllButton = document.createElement('button');
  viewAllButton.classList.add('view-all-button');
  viewAllButton.type = 'button';

  const viewAllLabel = label('span', config.viewAllLabel, DEFAULTS.viewAllLabel);
  viewAllLabel.classList.add('view-all-label');
  const viewLessLabel = label('span', config.viewLessLabel, DEFAULTS.viewLessLabel);
  viewLessLabel.classList.add('view-less-label');
  viewAllButton.append(viewAllLabel, viewLessLabel);

  let currentTab = 0;
  let currentIndex = 0;
  let isViewAll = false;
  let slideDirection = '';

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  const getMaxIndex = () => {
    const currentItems = tabItems[currentTab];
    return isMobile() ? currentItems.length - 1 : currentItems.length - 3;
  };

  const renderItems = () => {
    const mobile = isMobile();
    const isCup = currentTab === 1;
    const currentItems = tabItems[currentTab];

    track.classList.remove('slide-next', 'slide-prev');

    let itemsToShow;
    if (isViewAll) {
      itemsToShow = currentItems;
    } else if (mobile) {
      itemsToShow = currentItems.slice(currentIndex, currentIndex + 1);
    } else if (isCup) {
      itemsToShow = currentItems;
    } else {
      itemsToShow = currentItems.slice(currentIndex, currentIndex + 3);
    }

    cards.forEach((card) => {
      card.hidden = !itemsToShow.includes(card);
    });

    track.classList.toggle('show-all', isViewAll);
    track.classList.toggle('cup-layout', isCup);
    track.classList.toggle('mobile-layout', mobile);

    carousel.classList.toggle('cup-active', isCup);
    carousel.classList.toggle('view-all-active', isViewAll);

    const disablePrevious = isViewAll || currentIndex === 0;
    const disableNext = isViewAll || currentIndex >= getMaxIndex();

    previousButton.disabled = disablePrevious;
    nextButton.disabled = disableNext;

    previousButton.classList.toggle('disable', disablePrevious);
    nextButton.classList.toggle('disable', disableNext);

    viewAllButton.hidden = isCup;
    viewAllLabel.hidden = isViewAll;
    viewLessLabel.hidden = !isViewAll;
    viewAllButton.classList.toggle('active', isViewAll);

    if (slideDirection && !isViewAll && !isCup) {
      requestAnimationFrame(() => {
        track.classList.add(
          slideDirection === 'next' ? 'slide-next' : 'slide-prev',
        );
        slideDirection = '';
      });
    } else {
      slideDirection = '';
    }
  };

  const changeCategory = (tabIndex) => {
    slideDirection = '';
    currentTab = tabIndex;
    currentIndex = 0;
    isViewAll = false;

    tabButtons.forEach((tab, index) => {
      tab.classList.toggle('active', index === tabIndex);
    });

    renderItems();
  };

  previousButton.addEventListener('click', () => {
    if (isViewAll || currentIndex <= 0) return;

    slideDirection = 'prev';
    currentIndex -= 1;
    renderItems();
  });

  nextButton.addEventListener('click', () => {
    if (isViewAll) return;

    if (currentIndex < getMaxIndex()) {
      slideDirection = 'next';
      currentIndex += 1;
      renderItems();
    }
  });

  viewAllButton.addEventListener('click', () => {
    slideDirection = '';
    isViewAll = !isViewAll;
    currentIndex = 0;
    renderItems();
  });

  instantTab.addEventListener('click', () => changeCategory(0));
  cupTab.addEventListener('click', () => changeCategory(1));

  window.addEventListener('resize', () => {
    slideDirection = '';
    renderItems();
  });

  // Universal Editor: reveal whatever the author selects.
  block.addEventListener('aue:ui-select', (e) => {
    if (!e.detail?.selected) return;
    const { target } = e;

    const tab = target.closest('.noodle-tab');
    if (tab) {
      const tabIndex = tabButtons.indexOf(tab);
      if (tabIndex >= 0 && tabIndex !== currentTab) changeCategory(tabIndex);
      return;
    }

    if (target.closest('.view-less-label')) {
      if (currentTab !== 0) changeCategory(0);
      if (!isViewAll) {
        isViewAll = true;
        currentIndex = 0;
        renderItems();
      }
      return;
    }

    const card = target.closest('.noodle-card');
    if (!card) return;
    const tabIndex = tabItems.findIndex((list) => list.includes(card));
    if (tabIndex < 0) return;
    if (tabIndex !== currentTab) changeCategory(tabIndex);
    if (!card.hidden) return;

    const position = tabItems[tabIndex].indexOf(card);
    slideDirection = '';
    currentIndex = Math.max(0, Math.min(position, getMaxIndex()));
    renderItems();
  });

  carousel.append(previousButton, track, nextButton);

  block.textContent = '';
  block.append(heading, tabs, carousel, viewAllButton);

  renderItems();
}
