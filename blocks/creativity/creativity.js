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

function getVolumeIconSvg(isMuted) {
  if (isMuted) {
    return `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#ffffff"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
  `;
}

function getFullscreenIconSvg() {
  return `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  `;
}

function openVideoModal(videoUrl) {
  if (!videoUrl) return;

  const modal = document.createElement('div');
  modal.classList.add('creativity-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Video player');

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

  const trimmed = videoUrl.trim();
  const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');

  let handleKeyDown;
  let videoEl = null;

  if (isYouTube) {
    const iframe = document.createElement('iframe');
    iframe.classList.add('creativity-modal-iframe');
    iframe.src = normalizeYouTubeUrl(trimmed);
    iframe.title = 'Creative DIY Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.append(iframe);
  } else {
    const video = document.createElement('video');
    videoEl = video;
    video.classList.add('creativity-modal-video');
    video.playsInline = true;
    video.preload = 'auto';

    const source = document.createElement('source');
    source.src = trimmed;
    source.type = 'video/mp4';
    video.append(source);
    player.append(video);

    // Center Starburst Play/Pause Button
    const playBtn = document.createElement('button');
    playBtn.classList.add('creativity-modal-btn');
    playBtn.type = 'button';
    playBtn.setAttribute('aria-label', 'Play or pause video');
    playBtn.innerHTML = '<span class="play-icon">&#9654;</span>';

    // Bottom Controls Bar
    const controls = document.createElement('div');
    controls.classList.add('creativity-modal-controls');

    // Progress Bar Track
    const progressWrap = document.createElement('div');
    progressWrap.classList.add('creativity-modal-progress-wrap');
    progressWrap.setAttribute('role', 'slider');
    progressWrap.setAttribute('aria-label', 'Video progress');
    progressWrap.setAttribute('aria-valuemin', '0');
    progressWrap.setAttribute('aria-valuemax', '100');
    progressWrap.setAttribute('aria-valuenow', '0');

    const progressTrack = document.createElement('div');
    progressTrack.classList.add('creativity-modal-progress-track');

    const progressFill = document.createElement('div');
    progressFill.classList.add('creativity-modal-progress-fill');
    progressTrack.append(progressFill);
    progressWrap.append(progressTrack);

    // Bottom Action Row (Volume & Fullscreen)
    const actionsRow = document.createElement('div');
    actionsRow.classList.add('creativity-modal-actions');

    const volumeBtn = document.createElement('button');
    volumeBtn.classList.add('creativity-control-btn', 'creativity-volume-btn');
    volumeBtn.type = 'button';
    volumeBtn.setAttribute('aria-label', 'Toggle mute');
    volumeBtn.innerHTML = getVolumeIconSvg(false);

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.classList.add('creativity-control-btn', 'creativity-fullscreen-btn');
    fullscreenBtn.type = 'button';
    fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    fullscreenBtn.innerHTML = getFullscreenIconSvg();

    actionsRow.append(volumeBtn, fullscreenBtn);
    controls.append(progressWrap, actionsRow);
    player.append(playBtn, controls);

    let isSeeking = false;

    const updatePlayState = () => {
      if (video.paused) {
        playBtn.innerHTML = '<span class="play-icon">&#9654;</span>';
        player.classList.remove('is-playing');
        player.classList.add('is-paused');
      } else {
        playBtn.innerHTML = '<span class="pause-icon">&#10074;&#10074;</span>';
        player.classList.add('is-playing');
        player.classList.remove('is-paused');
      }
    };

    const togglePlayPause = () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });

    video.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });

    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('ended', () => {
      playBtn.innerHTML = '<span class="play-icon">&#9654;</span>';
      player.classList.remove('is-playing');
      player.classList.add('is-paused');
    });

    video.addEventListener('timeupdate', () => {
      if (video.duration && !isSeeking) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percent}%`;
        progressWrap.setAttribute('aria-valuenow', Math.round(percent).toString());
      }
    });

    const seek = (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (video.duration) {
        video.currentTime = pos * video.duration;
        progressFill.style.width = `${pos * 100}%`;
      }
    };

    progressWrap.addEventListener('mousedown', (e) => {
      isSeeking = true;
      seek(e);
      const onMouseMove = (moveEvt) => {
        seek(moveEvt);
      };
      const onMouseUp = () => {
        isSeeking = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    progressWrap.addEventListener('touchstart', (e) => {
      isSeeking = true;
      if (e.touches.length > 0) seek(e.touches[0]);
    }, { passive: true });

    progressWrap.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) seek(e.touches[0]);
    }, { passive: true });

    progressWrap.addEventListener('touchend', () => {
      isSeeking = false;
    });

    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      volumeBtn.innerHTML = getVolumeIconSvg(video.muted);
    });

    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        if (player.requestFullscreen) {
          player.requestFullscreen();
        } else if (player.webkitRequestFullscreen) {
          player.webkitRequestFullscreen();
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });

    video.play().catch(() => {
      updatePlayState();
    });
  }

  frame.append(closeButton, player);
  modal.append(overlay, frame);
  document.body.append(modal);

  const closeModal = () => {
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    const iframeEl = modal.querySelector('iframe');
    if (iframeEl) {
      iframeEl.src = '';
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    modal.remove();
    document.removeEventListener('keydown', handleKeyDown);
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === ' ' && videoEl && e.target === modal) {
      e.preventDefault();
      if (videoEl.paused) videoEl.play();
      else videoEl.pause();
    }
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeyDown);
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
