export default function decorate(block) {
  const rows = [...block.children];
  const instantItems = rows.slice(0, 4);
  const cupItems = rows.slice(4, 6);

  block.classList.add('noodle-range');

  const heading = document.createElement('h2');
  heading.classList.add('noodle-range-heading');

  const leftStar = document.createElement('span');
  leftStar.classList.add('heading-star');
  leftStar.textContent = '✧';

  const title = document.createElement('span');
  title.textContent = "YiPPee!'s Noodle Range";

  const rightStar = document.createElement('span');
  rightStar.classList.add('heading-star');
  rightStar.textContent = '✧';

  heading.append(leftStar, title, rightStar);

  const tabs = document.createElement('div');
  tabs.classList.add('noodle-tabs');

  const instantTab = document.createElement('button');
  instantTab.classList.add('noodle-tab', 'active');
  instantTab.type = 'button';
  instantTab.textContent = 'Instant Noodles';

  const cupTab = document.createElement('button');
  cupTab.classList.add('noodle-tab');
  cupTab.type = 'button';
  cupTab.textContent = 'Cup Noodles';

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

  const viewAllButton = document.createElement('button');
  viewAllButton.classList.add('view-all-button');
  viewAllButton.type = 'button';
  viewAllButton.textContent = 'View All';

  let currentItems = instantItems;
  let currentIndex = 0;
  let isViewAll = false;
  let slideDirection = '';

  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

  const createCard = (row) => {
    const card = row.cloneNode(true);
    card.classList.add('noodle-card');

    const cell = card.children[0];
    if (!cell) return card;

    const image = cell.querySelector('img');
    if (image) image.classList.add('noodle-image');

    return card;
  };

  const renderItems = () => {
    const mobile = isMobile();
    const isCup = currentItems === cupItems;

    track.classList.remove('slide-next', 'slide-prev');
    track.textContent = '';

    const itemsToShow = [];

    if (isViewAll) {
      itemsToShow.push(...currentItems);
    } else if (mobile) {
      itemsToShow.push(currentItems[currentIndex]);
    } else if (isCup) {
      itemsToShow.push(...currentItems);
    } else {
      itemsToShow.push(
        currentItems[currentIndex],
        currentItems[currentIndex + 1],
        currentItems[currentIndex + 2],
      );
    }

    itemsToShow.forEach((row) => {
      if (!row) return;
      track.append(createCard(row));
    });

    track.classList.toggle('show-all', isViewAll);
    track.classList.toggle('cup-layout', isCup);
    track.classList.toggle('mobile-layout', mobile);

    carousel.classList.toggle('cup-active', isCup);
    carousel.classList.toggle('view-all-active', isViewAll);

    const maxIndex = mobile
      ? currentItems.length - 1
      : currentItems.length - 3;

    const disablePrevious = isViewAll || currentIndex === 0;
    const disableNext = isViewAll || currentIndex >= maxIndex;

    previousButton.disabled = disablePrevious;
    nextButton.disabled = disableNext;

    previousButton.classList.toggle('disable', disablePrevious);
    nextButton.classList.toggle('disable', disableNext);

    viewAllButton.hidden = isCup;
    viewAllButton.textContent = isViewAll ? 'View Less' : 'View All';
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

  const changeCategory = (items, activeTab, inactiveTab) => {
    slideDirection = '';
    currentItems = items;
    currentIndex = 0;
    isViewAll = false;

    activeTab.classList.add('active');
    inactiveTab.classList.remove('active');

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

    const maxIndex = isMobile()
      ? currentItems.length - 1
      : currentItems.length - 3;

    if (currentIndex < maxIndex) {
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

  instantTab.addEventListener('click', () => {
    changeCategory(instantItems, instantTab, cupTab);
  });

  cupTab.addEventListener('click', () => {
    changeCategory(cupItems, cupTab, instantTab);
  });

  window.addEventListener('resize', () => {
    slideDirection = '';
    renderItems();
  });

  carousel.append(previousButton, track, nextButton);

  block.textContent = '';
  block.append(heading, tabs, carousel, viewAllButton);

  renderItems();
}
