document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".nexortek-carousel");
  if (!carousel) return;

  const slides = Array.from(
    carousel.querySelectorAll(".nexortek-carousel__slide")
  );
  const dots = Array.from(
    carousel.querySelectorAll(".nexortek-carousel__dots .dot")
  );
  const prevBtn = carousel.querySelector(".nexortek-carousel__btn.prev");
  const nextBtn = carousel.querySelector(".nexortek-carousel__btn.next");

  if (!slides.length) return;

  let currentSlide = 0;
  let autoPlayInterval = null;
  let autoPlayStoppedByUser = false;
  let isTransitioning = false;

  const AUTO_PLAY_DELAY = 5000;
  const TRANSITION_LOCK = 550;

  function updateCarousel(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });

    currentSlide = index;
  }

  function goToSlide(index) {
    if (isTransitioning) return;

    isTransitioning = true;
    updateCarousel(index);

    setTimeout(() => {
      isTransitioning = false;
    }, TRANSITION_LOCK);
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  function startAutoPlay() {
    if (autoPlayStoppedByUser) return;
    stopAutoPlay();

    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
  }

  function stopAutoPlayForever() {
    autoPlayStoppedByUser = true;
    stopAutoPlay();
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoPlayForever();
      nextSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoPlayForever();
      prevSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      stopAutoPlayForever();
      goToSlide(index);
    });
  });

  carousel.addEventListener("mouseenter", () => {
    if (!autoPlayStoppedByUser) stopAutoPlay();
  });

  carousel.addEventListener("mouseleave", () => {
    if (!autoPlayStoppedByUser) startAutoPlay();
  });

  // Suporte para swipe no mobile
  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const distance = touchEndX - touchStartX;
      const minSwipeDistance = 50;

      if (Math.abs(distance) < minSwipeDistance) return;

      stopAutoPlayForever();

      if (distance < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    },
    { passive: true }
  );

  // Navegação por teclado
  carousel.setAttribute("tabindex", "0");
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      stopAutoPlayForever();
      nextSlide();
    }

    if (e.key === "ArrowLeft") {
      stopAutoPlayForever();
      prevSlide();
    }
  });

  updateCarousel(0);
  startAutoPlay();
});