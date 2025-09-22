const backgroundCanvas = document.getElementById('background-network');

if (backgroundCanvas && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
  const ctx = backgroundCanvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  const particles = [];
  const maxDistance = 180;

  const hexToRgb = (hex) => {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) {
      return { r: 31, g: 122, b: 140 };
    }
    const bigint = parseInt(normalized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const networkHex = '#0d00d2';
  const accentRgb = hexToRgb(networkHex);
  const dotColor = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.65)`;

  const setCanvasSize = () => {
    width = Math.floor(window.innerWidth * dpr);
    height = Math.floor(window.innerHeight * dpr);
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    backgroundCanvas.style.width = `${window.innerWidth}px`;
    backgroundCanvas.style.height = `${window.innerHeight}px`;
  };

  const createParticles = () => {
    particles.length = 0;
    const area = (width / dpr) * (height / dpr);
    const count = Math.min(140, Math.round(area / 9000));

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15 * dpr,
        vy: (Math.random() - 0.5) * 0.15 * dpr,
      });
    }
  };

  const drawConnections = () => {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.hypot(dx, dy) / dpr;

        if (distance < maxDistance) {
          const alpha = Math.max(0.08, 1 - distance / maxDistance) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${alpha})`;
          ctx.lineWidth = dpr;
          ctx.stroke();
        }
      }
    }
  };

  const updateParticles = () => {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x > width || particle.x < 0) {
        particle.vx *= -1;
      }
      if (particle.y > height || particle.y < 0) {
        particle.vy *= -1;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }

    drawConnections();
    window.requestAnimationFrame(updateParticles);
  };

  const handleResize = () => {
    setCanvasSize();
    createParticles();
  };

  setCanvasSize();
  createParticles();
  window.requestAnimationFrame(updateParticles);

  let resizeFrame = null;
  window.addEventListener('resize', () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }
    resizeFrame = window.requestAnimationFrame(() => {
      handleResize();
      resizeFrame = null;
    });
  });
}

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

