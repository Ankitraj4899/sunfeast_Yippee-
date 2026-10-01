export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    row.classList.add('carousel-item');

    const imageCell = row.children[0];
    const contentCell = row.children[1];

    const image = imageCell.querySelector('img');
    const heading = contentCell.querySelector('h2');
    const description = contentCell.querySelector('p');

    image.classList.add('carousel-image');
    heading.classList.add('carousel-heading');
    description.classList.add('carousel-description');
  });

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
    modal.classList.add('video-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video player');

    const overlay = document.createElement('div');
    overlay.classList.add('video-modal-overlay');

    const frame = document.createElement('div');
    frame.classList.add('video-modal-frame');

    const closeButton = document.createElement('button');
    closeButton.classList.add('video-modal-close');
    closeButton.type = 'button';
    closeButton.innerHTML = '&#10005;';
    closeButton.setAttribute('aria-label', 'Close video');

    const player = document.createElement('div');
    player.classList.add('video-modal-player');

    const trimmed = videoUrl.trim();
    const isYouTube = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');

    let handleKeyDown;
    let videoEl = null;

    if (isYouTube) {
      const iframe = document.createElement('iframe');
      iframe.classList.add('video-modal-iframe');
      iframe.src = normalizeYouTubeUrl(trimmed);
      iframe.title = 'Carousel Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      player.append(iframe);
    } else {
      const video = document.createElement('video');
      videoEl = video;
      video.classList.add('video-modal-video');
      video.playsInline = true;
      video.preload = 'auto';

      const source = document.createElement('source');
      source.src = trimmed;
      source.type = 'video/mp4';
      video.append(source);
      player.append(video);

      // Center Star Play/Pause Button
      const playBtn = document.createElement('button');
      playBtn.classList.add('video-button-modal');
      playBtn.type = 'button';
      playBtn.setAttribute('aria-label', 'Play or pause video');
      playBtn.innerHTML = '<span class="play-icon">&#9654;</span>';

      // Bottom Controls Bar
      const controls = document.createElement('div');
      controls.classList.add('video-modal-controls');

      // Progress Bar Track
      const progressWrap = document.createElement('div');
      progressWrap.classList.add('video-modal-progress-wrap');
      progressWrap.setAttribute('role', 'slider');
      progressWrap.setAttribute('aria-label', 'Video progress');
      progressWrap.setAttribute('aria-valuemin', '0');
      progressWrap.setAttribute('aria-valuemax', '100');
      progressWrap.setAttribute('aria-valuenow', '0');

      const progressTrack = document.createElement('div');
      progressTrack.classList.add('video-modal-progress-track');

      const progressFill = document.createElement('div');
      progressFill.classList.add('video-modal-progress-fill');
      progressTrack.append(progressFill);
      progressWrap.append(progressTrack);

      // Bottom Action Row (Volume & Fullscreen)
      const actionsRow = document.createElement('div');
      actionsRow.classList.add('video-modal-actions');

      const volumeBtn = document.createElement('button');
      volumeBtn.classList.add('video-control-btn', 'video-volume-btn');
      volumeBtn.type = 'button';
      volumeBtn.setAttribute('aria-label', 'Toggle mute');
      volumeBtn.innerHTML = getVolumeIconSvg(false);

      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.classList.add('video-control-btn', 'video-fullscreen-btn');
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

  const star1 = document.createElement('div');
  const star2 = document.createElement('div');
  const star3 = document.createElement('div');
  const star4 = document.createElement('div');

  block.append(star1, star2, star3, star4);

  star1.classList.add('star1');
  star2.classList.add('star2');
  star3.classList.add('star3');
  star4.classList.add('star4');

  const images = rows.map((row) => row.querySelector('.carousel-image'));

  images.forEach((image) => {
    const link = image.closest('a');
    if (!link) return;

    const videoUrl = link.href;
    link.replaceWith(image);

    image.parentElement.classList.add('carousel-image-wrapper');

    const videoButton = document.createElement('button');
    videoButton.classList.add('video-button');
    videoButton.type = 'button';
    videoButton.innerHTML = '&#9654;';

    image.parentElement.append(videoButton);

    videoButton.addEventListener('click', () => {
      openVideoModal(videoUrl);
    });
  });

  let currentIndex = 0;
  rows[0].classList.add('active');

  const prevButton = document.createElement('button');
  const nextButton = document.createElement('button');

  prevButton.classList.add('prev-button');
  nextButton.classList.add('next-button');

  prevButton.textContent = '<';
  nextButton.textContent = '>';

  block.insertBefore(prevButton, block.firstChild);
  block.append(nextButton);

  prevButton.classList.add('disable');

  nextButton.addEventListener('click', () => {
    if (currentIndex < rows.length - 1) {
      rows[currentIndex].classList.remove('active');
      currentIndex += 1;
      rows[currentIndex].classList.add('active');
    }

    if (currentIndex === rows.length - 1) {
      nextButton.classList.add('disable');
    }

    prevButton.classList.remove('disable');
  });

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      rows[currentIndex].classList.remove('active');
      currentIndex -= 1;
      rows[currentIndex].classList.add('active');
    }

    if (currentIndex === 0) {
      prevButton.classList.add('disable');
    }

    nextButton.classList.remove('disable');
  });
}
