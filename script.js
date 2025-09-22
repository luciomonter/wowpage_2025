const backgroundCanvas = document.querySelector('.background-canvas');

if (backgroundCanvas) {
  const ctx = backgroundCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let dotColor = '';

  const config = {
    minParticles: 32,
    maxParticles: 96,
    connectionDistance: 170,
    pointerDistance: 220,
    maxVelocity: 0.35,
  };

  const pointer = { x: 0, y: 0, active: false };

  const getDotColor = () => {
    const computed = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--dot-color');
    return computed.trim() || 'rgba(31, 122, 140, 0.28)';
  };

  const updateDotColor = () => {
    dotColor = getDotColor();
  };

  const createParticle = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * config.maxVelocity,
    vy: (Math.random() - 0.5) * config.maxVelocity,
    radius: Math.random() * 1.3 + 0.6,
  });

  const syncParticleCount = () => {
    if (!width || !height) return;
    const densityTarget = Math.round(
      Math.min(
        config.maxParticles,
        Math.max(config.minParticles, (width * height) / 14000),
      ),
    );

    if (particles.length > densityTarget) {
      particles.length = densityTarget;
      return;
    }

    while (particles.length < densityTarget) {
      particles.push(createParticle());
    }
  };

  const setCanvasSize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = window.devicePixelRatio || 1;
    backgroundCanvas.width = width * ratio;
    backgroundCanvas.height = height * ratio;
    backgroundCanvas.style.width = `${width}px`;
    backgroundCanvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    syncParticleCount();
  };

  const updatePointerPosition = (x, y) => {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  };

  const releasePointer = () => {
    pointer.active = false;
  };

  const drawParticle = (particle) => {
    ctx.beginPath();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = dotColor;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const drawConnection = (from, to, opacity) => {
    if (opacity <= 0) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = dotColor;
    ctx.globalAlpha = opacity;
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    const margin = 20;

    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x > width + margin) particle.x = -margin;
      if (particle.x < -margin) particle.x = width + margin;
      if (particle.y > height + margin) particle.y = -margin;
      if (particle.y < -margin) particle.y = height + margin;

      drawParticle(particle);
    }

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < config.connectionDistance) {
          const opacity = 0.45 * (1 - distance / config.connectionDistance);
          drawConnection(particles[i], particles[j], opacity);
        }
      }

      if (pointer.active) {
        const dxPointer = particles[i].x - pointer.x;
        const dyPointer = particles[i].y - pointer.y;
        const pointerDistance = Math.hypot(dxPointer, dyPointer);

        if (pointerDistance < config.pointerDistance) {
          const pointerOpacity = 0.5 * (1 - pointerDistance / config.pointerDistance);
          drawConnection(particles[i], pointer, pointerOpacity);
        }
      }
    }

    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', setCanvasSize);
  window.addEventListener('mousemove', (event) => {
    updatePointerPosition(event.clientX, event.clientY);
  });
  window.addEventListener('mouseleave', releasePointer);
  window.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointerPosition(touch.clientX, touch.clientY);
    },
    { passive: true },
  );
  window.addEventListener(
    'touchmove',
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointerPosition(touch.clientX, touch.clientY);
    },
    { passive: true },
  );
  window.addEventListener('touchend', releasePointer);
  window.addEventListener('touchcancel', releasePointer);

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof colorScheme.addEventListener === 'function') {
    colorScheme.addEventListener('change', updateDotColor);
  } else if (typeof colorScheme.addListener === 'function') {
    colorScheme.addListener(updateDotColor);
  }

  updateDotColor();
  setCanvasSize();
  requestAnimationFrame(animate);
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
