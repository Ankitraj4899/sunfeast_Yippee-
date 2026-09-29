export default function decorate(block) {
  const rows = [...block.children];

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

  const title = document.createElement('span');
  title.textContent = "YiPPee!'s Pasta Range";

  const rightStar = document.createElement('span');
  rightStar.classList.add('pasta-heading-star');
  rightStar.textContent = '✧';

  heading.append(
    leftStar,
    title,
    rightStar,
  );

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

  const viewAllButton = document.createElement('button');
  viewAllButton.classList.add('pasta-view-all');
  viewAllButton.type = 'button';
  viewAllButton.textContent = 'View More';

  let currentIndex = 0;
  let isViewAll = false;

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  const getItemsToShow = () => {
    if (isViewAll) {
      return items;
    }

    if (isMobile()) {
      return [items[currentIndex]];
    }

    if (currentIndex === 0) {
      return items.slice(0, 3);
    }

    return items.slice(3);
  };

  const render = () => {
    track.textContent = '';

    const itemsToShow = getItemsToShow();

    itemsToShow.forEach((item) => {
      track.append(item.cloneNode(true));
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

    previousButton.hidden = isViewAll
            || items.length <= 1;

    nextButton.hidden = isViewAll
            || items.length <= 3;

    viewAllButton.textContent = isViewAll
      ? 'View Less'
      : 'View More';
  };

  previousButton.addEventListener(
    'click',
    () => {
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
    },
  );

  nextButton.addEventListener(
    'click',
    () => {
      if (isViewAll) {
        return;
      }

      if (isMobile()) {
        if (
          currentIndex
                    < items.length - 1
        ) {
          currentIndex += 1;
          render();
        }

        return;
      }

      if (currentIndex === 0) {
        currentIndex = 3;
        render();
      }
    },
  );

  viewAllButton.addEventListener(
    'click',
    () => {
      isViewAll = !isViewAll;
      currentIndex = 0;
      render();
    },
  );

  window.addEventListener(
    'resize',
    () => {
      if (!isMobile()) {
        currentIndex = currentIndex >= 3
          ? 3
          : 0;
      } else if (
        currentIndex >= items.length
      ) {
        currentIndex = items.length - 1;
      }

      render();
    },
  );

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
