const carousel = document.querySelector(".nexortek-carousel");

if (carousel) {
  const slides = carousel.querySelectorAll(".nexortek-carousel__slide");
  const dots = carousel.querySelectorAll(".dot");
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");

  let currentSlide = 0;
  let autoPlay;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoPlay() {
    autoPlay = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  nextBtn.addEventListener("click", () => {
    stopAutoPlay();
    nextSlide();
    startAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    stopAutoPlay();
    prevSlide();
    startAutoPlay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAutoPlay();
      showSlide(Number(dot.dataset.slide));
      startAutoPlay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);

  showSlide(0);
  startAutoPlay();
}