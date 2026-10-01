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

  // TERRA Brand Badge at Top-Right
  const badge = document.createElement('div');
  badge.classList.add('treasure-hunt-modal-badge');
  badge.setAttribute('aria-hidden', 'true');
  badge.innerHTML = `
    <div class="terra-badge-inner">
      <div class="terra-badge-title">TERRA</div>
      <div class="terra-badge-logo">
        <span class="terra-logo-sunfeast">Sunfeast</span>
        <span class="terra-logo-yippee">YiPPee!</span>
      </div>
      <div class="terra-badge-tagline">A BETTER WORLD</div>
    </div>
  `;
  player.append(badge);

  const trimmed = videoUrl.trim();
  const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');

  let handleKeyDown;
  let videoEl = null;

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
    videoEl = video;
    video.classList.add('treasure-hunt-modal-video');
    video.playsInline = true;
    video.preload = 'auto';

    const source = document.createElement('source');
    source.src = trimmed;
    source.type = 'video/mp4';
    video.append(source);
    player.append(video);

    // Center Starburst Play/Pause Button
    const playBtn = document.createElement('button');
    playBtn.classList.add('treasure-hunt-modal-btn');
    playBtn.type = 'button';
    playBtn.setAttribute('aria-label', 'Play or pause video');
    playBtn.innerHTML = '<span class="play-icon">&#9654;</span>';

    // Bottom Controls Bar
    const controls = document.createElement('div');
    controls.classList.add('treasure-hunt-modal-controls');

    // Progress Bar Track
    const progressWrap = document.createElement('div');
    progressWrap.classList.add('treasure-hunt-modal-progress-wrap');
    progressWrap.setAttribute('role', 'slider');
    progressWrap.setAttribute('aria-label', 'Video progress');
    progressWrap.setAttribute('aria-valuemin', '0');
    progressWrap.setAttribute('aria-valuemax', '100');
    progressWrap.setAttribute('aria-valuenow', '0');

    const progressTrack = document.createElement('div');
    progressTrack.classList.add('treasure-hunt-modal-progress-track');

    const progressFill = document.createElement('div');
    progressFill.classList.add('treasure-hunt-modal-progress-fill');
    progressTrack.append(progressFill);
    progressWrap.append(progressTrack);

    // Bottom Action Row (Volume & Fullscreen)
    const actionsRow = document.createElement('div');
    actionsRow.classList.add('treasure-hunt-modal-actions');

    const volumeBtn = document.createElement('button');
    volumeBtn.classList.add('treasure-hunt-control-btn', 'treasure-hunt-volume-btn');
    volumeBtn.type = 'button';
    volumeBtn.setAttribute('aria-label', 'Toggle mute');
    volumeBtn.innerHTML = getVolumeIconSvg(false);

    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.classList.add('treasure-hunt-control-btn', 'treasure-hunt-fullscreen-btn');
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

    // Auto-play initially
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
