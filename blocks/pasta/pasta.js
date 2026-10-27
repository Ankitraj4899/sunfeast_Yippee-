import { moveCellInstrumentation } from '../../scripts/scripts.js';

// Block-level fields, in model order (one row each, before the item rows).
const CONFIG_FIELDS = ['heading', 'viewMoreLabel', 'viewLessLabel'];

// Today's texts: used when a field is empty or its row is missing (older content).
const DEFAULTS = {
  heading: "YiPPee!'s Pasta Range",
  viewMoreLabel: 'View More',
  viewLessLabel: 'View Less',
};

const IMAGE_URL = /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i;

/** A config row has a single cell without any image (item rows carry a picture). */
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
  return { config, rows: rows.slice(count) };
}

/** Creates a label element showing a config value, carrying the cell's instrumentation. */
function label(tag, cell, fallback) {
  const el = document.createElement(tag);
  el.textContent = (cell ? cell.textContent.trim() : '') || fallback;
  moveCellInstrumentation(cell, el);
  return el;
}

export default function decorate(block) {
  const { config, rows } = splitRows(block);

  // Each authored row becomes its card once; rendering only toggles visibility.
  const items = rows.map((row) => {
    const image = row.querySelector('img');
    if (image) {
      image.classList.add('pasta-image');
    }
    row.classList.add('pasta-card');
    return row;
  });
  block.classList.add('pasta');
  const heading = document.createElement('h2');
  heading.classList.add('pasta-heading');
  const leftStar = document.createElement('span');
  leftStar.classList.add('pasta-heading-star');
  leftStar.textContent = '✧';
  const title = label('span', config.heading, DEFAULTS.heading);
  const rightStar = document.createElement('span');
  rightStar.classList.add('pasta-heading-star');
  rightStar.textContent = '✧';

  heading.append(leftStar, title, rightStar);

  const pastaIcon1 = document.createElement('span');
  pastaIcon1.classList.add(
    'pasta-icon',
    'pasta-icon-1',
  );

  const pastaIcon2 = document.createElement('span');
  pastaIcon2.classList.add(
    'pasta-icon',
    'pasta-icon-2',
  );

  const pastaIcon3 = document.createElement('span');
  pastaIcon3.classList.add(
    'pasta-icon',
    'pasta-icon-3',
  );

  const pastaIcon4 = document.createElement('span');
  pastaIcon4.classList.add(
    'pasta-icon',
    'pasta-icon-4',
  );

  const carousel = document.createElement('div');
  carousel.classList.add('pasta-carousel');

  const previousButton = document.createElement('button');
  previousButton.classList.add(
    'pasta-arrow',
    'pasta-prev',
  );
  previousButton.type = 'button';
  previousButton.textContent = '‹';
  previousButton.setAttribute(
    'aria-label',
    'Previous pasta products',
  );

  const nextButton = document.createElement('button');
  nextButton.classList.add(
    'pasta-arrow',
    'pasta-next',
  );
  nextButton.type = 'button';
  nextButton.textContent = '›';
  nextButton.setAttribute(
    'aria-label',
    'Next pasta products',
  );

  const track = document.createElement('div');
  track.classList.add('pasta-track');
  track.append(...items);

  const viewAllButton = document.createElement('button');
  viewAllButton.classList.add('pasta-view-all');
  viewAllButton.type = 'button';

  const viewMoreLabel = label('span', config.viewMoreLabel, DEFAULTS.viewMoreLabel);
  viewMoreLabel.classList.add('pasta-view-more-label');
  const viewLessLabel = label('span', config.viewLessLabel, DEFAULTS.viewLessLabel);
  viewLessLabel.classList.add('pasta-view-less-label');
  viewAllButton.append(viewMoreLabel, viewLessLabel);

  let currentIndex = 0;
  let isViewAll = false;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  const getItemsToShow = () => {
    if (isViewAll) {
      return items;
    }

    if (isMobile()) {
      return items.slice(currentIndex, currentIndex + 1);
    }

    if (currentIndex === 0) {
      return items.slice(0, 3);
    }

    return items.slice(3);
  };

  const render = () => {
    const itemsToShow = getItemsToShow();

    items.forEach((item) => {
      item.hidden = !itemsToShow.includes(item);
    });

    track.classList.toggle(
      'view-all-active',
      isViewAll,
    );

    if (isViewAll) {
      previousButton.disabled = true;
      nextButton.disabled = true;
    } else if (isMobile()) {
      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= items.length - 1;
    } else {
      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex !== 0;
    }

    previousButton.classList.toggle(
      'disabled',
      previousButton.disabled,
    );

    nextButton.classList.toggle(
      'disabled',
      nextButton.disabled,
    );

    previousButton.hidden = isViewAll || items.length <= 1;

    nextButton.hidden = isViewAll || items.length <= 3;

    viewMoreLabel.hidden = isViewAll;
    viewLessLabel.hidden = !isViewAll;
  };

  previousButton.addEventListener('click', () => {
    if (isViewAll) {
      return;
    }

    if (isMobile()) {
      if (currentIndex > 0) {
        currentIndex -= 1;
        render();
      }
      return;
    }

    if (currentIndex !== 0) {
      currentIndex = 0;
      render();
    }
  });

  nextButton.addEventListener('click', () => {
    if (isViewAll) {
      return;
    }

    if (isMobile()) {
      if (currentIndex < items.length - 1) {
        currentIndex += 1;
        render();
      }
      return;
    }

    if (currentIndex === 0) {
      currentIndex = 3;
      render();
    }
  });

  viewAllButton.addEventListener('click', () => {
    isViewAll = !isViewAll;
    currentIndex = 0;
    render();
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) {
      currentIndex = currentIndex >= 3
        ? 3
        : 0;
    } else if (currentIndex >= items.length) {
      currentIndex = items.length - 1;
    }

    render();
  });

  // Universal Editor: reveal whatever the author selects.
  block.addEventListener('aue:ui-select', (e) => {
    if (!e.detail?.selected) return;
    const { target } = e;

    if (target.closest('.pasta-view-less-label')) {
      if (!isViewAll) {
        isViewAll = true;
        currentIndex = 0;
        render();
      }
      return;
    }

    const item = target.closest('.pasta-card');
    if (!item || !item.hidden) return;
    const position = items.indexOf(item);
    if (position < 0) return;

    if (isMobile()) {
      currentIndex = position;
    } else {
      currentIndex = position < 3 ? 0 : 3;
    }
    render();
  });

  carousel.append(
    previousButton,
    track,
    nextButton,
  );

  block.textContent = '';

  block.append(
    heading,
    pastaIcon1,
    pastaIcon2,
    pastaIcon3,
    pastaIcon4,
    carousel,
    viewAllButton,
  );

  render();
}
