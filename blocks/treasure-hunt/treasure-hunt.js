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
  if (!videoUrl) return;

  const modal = document.createElement('div');
  modal.classList.add('treasure-hunt-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Video player');

  const overlay = document.createElement('div');
  overlay.classList.add('treasure-hunt-modal-overlay');

  const frame = document.createElement('div');
  frame.classList.add('treasure-hunt-modal-frame');

  const closeButton = document.createElement('button');
  closeButton.classList.add('treasure-hunt-modal-close');
  closeButton.type = 'button';
  closeButton.innerHTML = '&#10005;';
  closeButton.setAttribute('aria-label', 'Close video');

  const player = document.createElement('div');
  player.classList.add('treasure-hunt-modal-player');

  const trimmed = videoUrl.trim();
  const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');

  if (isYouTube) {
    const iframe = document.createElement('iframe');
    iframe.classList.add('treasure-hunt-modal-iframe');
    iframe.src = normalizeYouTubeUrl(trimmed);
    iframe.title = 'Treasure Hunt Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    player.append(iframe);
  } else {
    const video = document.createElement('video');
    video.classList.add('treasure-hunt-modal-video');
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    const source = document.createElement('source');
    source.src = trimmed;
    source.type = 'video/mp4';
    video.append(source);
    player.append(video);

    const pauseButton = document.createElement('button');
    pauseButton.classList.add('treasure-hunt-modal-btn');
    pauseButton.type = 'button';
    pauseButton.setAttribute('aria-label', 'Play or pause video');
    pauseButton.innerHTML = '<span class="pause-icon">&#10074;&#10074;</span>';

    const updatePlayState = () => {
      if (video.paused) {
        pauseButton.innerHTML = '<span class="play-icon">&#9654;</span>';
      } else {
        pauseButton.innerHTML = '<span class="pause-icon">&#10074;&#10074;</span>';
      }
    };

    pauseButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      updatePlayState();
    });

    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    player.append(pauseButton);
  }

  frame.append(closeButton, player);
  modal.append(overlay, frame);
  document.body.append(modal);

  let handleKeyDown;

  const closeModal = () => {
    const videoEl = modal.querySelector('video');
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    const iframeEl = modal.querySelector('iframe');
    if (iframeEl) {
      iframeEl.src = '';
    }
    modal.remove();
    document.removeEventListener('keydown', handleKeyDown);
  };

  handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', handleKeyDown);
}

export default function decorate(block) {
  block.classList.add('treasure-hunt');

  const rows = [...block.children];
  let mainCell = null;
  let waveCell = null;

  if (rows.length === 1 && rows[0].children.length >= 2) {
    [mainCell, waveCell] = rows[0].children;
  } else if (rows.length >= 2) {
    [mainCell] = rows[0].children;
    if (rows[1].children.length > 0) {
      [waveCell] = rows[1].children;
    }
  } else if (rows.length === 1 && rows[0].children.length === 1) {
    [mainCell] = rows[0].children;
  }

  // Extract video URL
  let videoUrl = '';
  if (mainCell) {
    const link = mainCell.querySelector('a');
    if (link && link.href) {
      videoUrl = link.href;
    } else {
      const text = mainCell.textContent.trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        videoUrl = text;
      }
    }
  }

  // If no video URL in mainCell, check waveCell or whole block defensively
  if (!videoUrl) {
    const fallbackLink = block.querySelector('a');
    if (fallbackLink && fallbackLink.href) {
      videoUrl = fallbackLink.href;
    }
  }

  // Extract images / pictures
  const allPictures = [...block.querySelectorAll('picture, img')];
  let mainPicture = mainCell ? mainCell.querySelector('picture, img') : null;
  let wavePicture = waveCell ? waveCell.querySelector('picture, img') : null;

  if (!mainPicture && allPictures.length > 0) {
    [mainPicture] = allPictures;
  }
  if (!wavePicture && allPictures.length > 1) {
    [, wavePicture] = allPictures;
  }

  // Clear original raw content
  block.textContent = '';

  const container = document.createElement('div');
  container.classList.add('treasure-hunt-container');

  const banner = document.createElement('div');
  banner.classList.add('treasure-hunt-banner');
  if (videoUrl) {
    banner.setAttribute('role', 'button');
    banner.setAttribute('tabindex', '0');
    banner.setAttribute('aria-label', 'Play treasure hunt video');
  }

  const mediaWrapper = document.createElement('div');
  mediaWrapper.classList.add('treasure-hunt-media');

  if (mainPicture) {
    mediaWrapper.append(mainPicture);
  }

  const playButton = document.createElement('button');
  playButton.classList.add('treasure-hunt-play-btn');
  playButton.type = 'button';
  playButton.setAttribute('aria-label', 'Play video');

  const playIcon = document.createElement('span');
  playIcon.classList.add('treasure-hunt-play-icon');
  playIcon.textContent = '▶';
  playIcon.setAttribute('aria-hidden', 'true');

  playButton.append(playIcon);
  banner.append(mediaWrapper, playButton);

  const triggerVideo = () => {
    if (videoUrl) {
      openVideoModal(videoUrl);
    }
  };

  if (videoUrl) {
    banner.addEventListener('click', triggerVideo);
    banner.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerVideo();
      }
    });
  }

  container.append(banner);

  const waveWrapper = document.createElement('div');
  waveWrapper.classList.add('treasure-hunt-wave');
  waveWrapper.setAttribute('aria-hidden', 'true');

  if (wavePicture) {
    waveWrapper.append(wavePicture);
  } else {
    const defaultWave = document.createElement('img');
    defaultWave.src = '/updated-wave.webp';
    defaultWave.alt = '';
    defaultWave.loading = 'lazy';
    waveWrapper.append(defaultWave);
  }

  container.append(waveWrapper);
  block.append(container);
}
