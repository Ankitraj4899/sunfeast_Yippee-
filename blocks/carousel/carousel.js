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

  function openVideoModal(videoUrl) {
    const modal = document.createElement('div');
    modal.classList.add('video-modal');
    modal.innerHTML = `
      <div class="video-modal-overlay"></div>
      <div class="video-modal-content">
        <button class="video-modal-close" type="button">×</button>
        <video controls autoplay>
          <source src="${videoUrl}" type="video/mp4">
        </video>
        <button class="video-button-modal" type="button">&#10074;&#10074;</button>
      </div>
    `;

    document.body.append(modal);

    const video = modal.querySelector('video');
    const closeButton = modal.querySelector('.video-modal-close');
    const overlay = modal.querySelector('.video-modal-overlay');
    const pauseButton = modal.querySelector('.video-button-modal');

    const closeModal = () => {
      video.pause();
      video.currentTime = 0;
      modal.remove();
    };

    pauseButton.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        pauseButton.innerHTML = '&#10074;&#10074;';
      } else {
        video.pause();
        pauseButton.innerHTML = '&#9654;';
      }
    });

    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    video.play();
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
