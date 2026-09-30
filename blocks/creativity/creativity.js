function normalizeYouTubeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) {
    if (!trimmed.includes('autoplay=1')) {
      return trimmed.includes('?') ? `${trimmed}&autoplay=1` : `${trimmed}?autoplay=1`;
    }
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
  }
  return trimmed;
}

function openVideoModal(videoUrl) {
  const modal = document.createElement('div');
  modal.classList.add('creativity-modal');

  const overlay = document.createElement('div');
  overlay.classList.add('creativity-modal-overlay');

  const frame = document.createElement('div');
  frame.classList.add('creativity-modal-frame');

  const closeButton = document.createElement('button');
  closeButton.classList.add('creativity-modal-close');
  closeButton.type = 'button';
  closeButton.innerHTML = '&#10005;';
  closeButton.setAttribute('aria-label', 'Close video');

  const player = document.createElement('div');
  player.classList.add('creativity-modal-player');

  const iframe = document.createElement('iframe');
  iframe.classList.add('creativity-modal-iframe');
  iframe.src = normalizeYouTubeUrl(videoUrl);
  iframe.title = 'Creative DIY Video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;

  player.append(iframe);
  frame.append(closeButton, player);
  modal.append(overlay, frame);
  document.body.append(modal);

  const closeModal = () => {
    modal.remove();
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

export default function decorate(block) {
  block.classList.add('creativity');

  const rawRows = [...block.children];
  const items = [];

  rawRows.forEach((row) => {
    const cols = [...row.children];
    if (cols.length === 0) return;

    const imgCol = cols[0];
    const videoCol = cols[1];

    let imgSrc = '';
    let videoUrl = '';

    if (imgCol) {
      const pic = imgCol.querySelector('picture');
      const img = imgCol.querySelector('img');
      const link = imgCol.querySelector('a');
      const text = imgCol.textContent.trim();

      if (pic) {
        const foundImg = pic.querySelector('img');
        imgSrc = foundImg ? foundImg.src : '';
      } else if (img) {
        imgSrc = img.src;
      } else if (link && link.href) {
        imgSrc = link.href;
      } else if (text.startsWith('http://') || text.startsWith('https://')) {
        imgSrc = text;
      }
    }

    if (videoCol) {
      const link = videoCol.querySelector('a');
      const text = videoCol.textContent.trim();
      videoUrl = link && link.href ? link.href : text;
    } else if (imgCol) {
      const link = imgCol.querySelector('a');
      if (link && link.href && link.href.includes('youtube')) {
        videoUrl = link.href;
      }
    }

    if (imgSrc || videoUrl) {
      items.push({ imgSrc, videoUrl });
    }
  });

  block.textContent = '';

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('creativity-container');

  const headerWrapper = document.createElement('div');
  headerWrapper.classList.add('creativity-header');

  const heading = document.createElement('h2');
  heading.classList.add('creativity-title');

  const leftStar = document.createElement('span');
  leftStar.classList.add('creativity-heading-star');
  leftStar.textContent = '✧';
  leftStar.setAttribute('aria-hidden', 'true');

  const titleText = document.createElement('span');
  titleText.classList.add('creativity-title-text');
  titleText.textContent = 'Get Creative With Us';

  const rightStar = document.createElement('span');
  rightStar.classList.add('creativity-heading-star');
  rightStar.textContent = '✧';
  rightStar.setAttribute('aria-hidden', 'true');

  heading.append(leftStar, titleText, rightStar);

  const subtitle = document.createElement('p');
  subtitle.classList.add('creativity-subtitle');
  subtitle.textContent = 'Take a look at our DIY Videos and upcycle waste';

  headerWrapper.append(heading, subtitle);
  mainContainer.append(headerWrapper);

  const stage = document.createElement('div');
  stage.classList.add('creativity-stage');

  const prevBtn = document.createElement('button');
  prevBtn.classList.add('creativity-arrow');
  prevBtn.classList.add('creativity-arrow-prev');
  prevBtn.type = 'button';
  prevBtn.textContent = '<';
  prevBtn.setAttribute('aria-label', 'Previous slide');

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('creativity-arrow');
  nextBtn.classList.add('creativity-arrow-next');
  nextBtn.type = 'button';
  nextBtn.textContent = '>';
  nextBtn.setAttribute('aria-label', 'Next slide');

  const viewport = document.createElement('div');
  viewport.classList.add('creativity-viewport');

  const track = document.createElement('div');
  track.classList.add('creativity-track');

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.classList.add('creativity-card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Play creative video ${index + 1}`);

    const cardBadge = document.createElement('div');
    cardBadge.classList.add('creativity-card-badge');

    const cardMedia = document.createElement('div');
    cardMedia.classList.add('creativity-card-media');

    if (item.imgSrc) {
      const img = document.createElement('img');
      img.classList.add('creativity-card-img');
      img.src = item.imgSrc;
      img.alt = `Creative DIY Video ${index + 1}`;
      img.loading = 'lazy';
      cardMedia.append(img);
    }

    const playBtn = document.createElement('div');
    playBtn.classList.add('creativity-play-btn');

    const playIcon = document.createElement('span');
    playIcon.classList.add('creativity-play-icon');
    playIcon.textContent = '▶';

    playBtn.append(playIcon);
    card.append(cardBadge, cardMedia, playBtn);

    const triggerPlay = () => {
      if (item.videoUrl) {
        openVideoModal(item.videoUrl);
      }
    };

    card.addEventListener('click', triggerPlay);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerPlay();
      }
    });

    track.append(card);
  });

  viewport.append(track);
  stage.append(prevBtn, viewport, nextBtn);
  mainContainer.append(stage);

  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('creativity-dots');

  const getCardsPerView = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };

  let currentIndex = 0;
  let isViewAll = false;

  const updateCarousel = () => {
    if (isViewAll) return;
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, Math.ceil(items.length / cardsPerView) - 1);

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const offsetPercentage = currentIndex * 100;
    track.style.transform = `translateX(-${offsetPercentage}%)`;

    if (currentIndex === 0) {
      prevBtn.classList.add('creativity-arrow-disabled');
    } else {
      prevBtn.classList.remove('creativity-arrow-disabled');
    }

    if (currentIndex >= maxIndex) {
      nextBtn.classList.add('creativity-arrow-disabled');
    } else {
      nextBtn.classList.remove('creativity-arrow-disabled');
    }

    dotsContainer.textContent = '';
    const totalPages = Math.ceil(items.length / cardsPerView);

    if (totalPages > 1) {
      Array.from({ length: totalPages }).forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('creativity-dot');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to slide page ${i + 1}`);
        if (i === currentIndex) {
          dot.classList.add('creativity-dot-active');
        }
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        dotsContainer.append(dot);
      });
    }
  };

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateCarousel();
    }
  });

  nextBtn.addEventListener('click', () => {
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, Math.ceil(items.length / cardsPerView) - 1);
    if (currentIndex < maxIndex) {
      currentIndex += 1;
      updateCarousel();
    }
  });

  mainContainer.append(dotsContainer);

  const footerWrapper = document.createElement('div');
  footerWrapper.classList.add('creativity-footer');

  const viewAllBtn = document.createElement('button');
  viewAllBtn.classList.add('creativity-view-all-btn');
  viewAllBtn.type = 'button';
  viewAllBtn.textContent = 'View All';

  viewAllBtn.addEventListener('click', () => {
    isViewAll = !isViewAll;
    if (isViewAll) {
      mainContainer.classList.add('creativity-view-all-active');
      viewAllBtn.textContent = 'View Less';
      track.style.transform = 'none';
      prevBtn.classList.add('creativity-arrow-hidden');
      nextBtn.classList.add('creativity-arrow-hidden');
      dotsContainer.classList.add('creativity-dots-hidden');
    } else {
      mainContainer.classList.remove('creativity-view-all-active');
      viewAllBtn.textContent = 'View All';
      prevBtn.classList.remove('creativity-arrow-hidden');
      nextBtn.classList.remove('creativity-arrow-hidden');
      dotsContainer.classList.remove('creativity-dots-hidden');
      updateCarousel();
    }
  });

  footerWrapper.append(viewAllBtn);
  mainContainer.append(footerWrapper);
  block.append(mainContainer);

  updateCarousel();
  window.addEventListener('resize', () => {
    updateCarousel();
  });
}
