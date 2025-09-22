const slidesContainer = document.querySelector('.slides');
const slides = Array.from(document.querySelectorAll('.slide'));
const dots = Array.from(document.querySelectorAll('.dot'));
const prevButton = document.querySelector('.nav.prev');
const nextButton = document.querySelector('.nav.next');

let currentIndex = 0;

const updateCarousel = () => {
  slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

  slides.forEach((slide, index) => {
    const isActive = index === currentIndex;
    slide.setAttribute('aria-hidden', String(!isActive));
    slide.id = `slide-${index + 1}`;
  });

  dots.forEach((dot, index) => {
    dot.setAttribute('aria-selected', String(index === currentIndex));
  });
};

const goToIndex = (index) => {
  currentIndex = (index + slides.length) % slides.length;
  updateCarousel();
};

const handlePrev = () => goToIndex(currentIndex - 1);
const handleNext = () => goToIndex(currentIndex + 1);

prevButton.addEventListener('click', handlePrev);
nextButton.addEventListener('click', handleNext);

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => goToIndex(index));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    handlePrev();
  }
  if (event.key === 'ArrowRight') {
    handleNext();
  }
});

let autoPlayTimer = null;

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayTimer = window.setInterval(() => {
    handleNext();
  }, 6000);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', stopAutoPlay);
carousel.addEventListener('mouseleave', startAutoPlay);

let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (event) => {
  touchStartX = event.changedTouches[0].screenX;
};

const handleTouchMove = (event) => {
  touchEndX = event.changedTouches[0].screenX;
};

const handleTouchEnd = () => {
  const distance = touchStartX - touchEndX;
  if (Math.abs(distance) < 40) return;
  if (distance > 0) {
    handleNext();
  } else {
    handlePrev();
  }
};

carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
carousel.addEventListener('touchmove', handleTouchMove, { passive: true });
carousel.addEventListener('touchend', handleTouchEnd);

updateCarousel();
startAutoPlay();
