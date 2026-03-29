document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // CARROSSEL
  // =========================
  const carousel = document.querySelector(".nexortek-carousel");

  if (carousel) {
    const slides = Array.from(
      carousel.querySelectorAll(".nexortek-carousel__slide")
    );
    const dots = Array.from(
      carousel.querySelectorAll(".nexortek-carousel__dots .dot")
    );
    const prevBtn = carousel.querySelector(".nexortek-carousel__btn.prev");
    const nextBtn = carousel.querySelector(".nexortek-carousel__btn.next");

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
  }

  // =========================
  // FORMULÁRIO
  // =========================
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusEl = document.getElementById("formStatus");

  if (!form || !submitBtn || !statusEl) return;

  function setStatus(message, type = "") {
    statusEl.textContent = message;
    statusEl.className = "nexortek__form-info montserrat";
    if (type) statusEl.classList.add(type);
  }

  function validateForm(data) {
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const service = (data.get("service") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    if (name.length < 2) return "O nome é demasiado curto.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "O email não é válido.";
    if (!service) return "Seleciona um serviço.";
    if (message.length < 20) return "Escreve mais detalhes sobre o projeto.";
    return null;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    setStatus("");
    submitBtn.disabled = true;
    submitBtn.textContent = "A enviar...";

    try {
      const formData = new FormData(form);

      const validationError = validateForm(formData);
      if (validationError) {
        setStatus(validationError, "is-error");
        return;
      }

      const token = formData.get("cf-turnstile-response");
      if (!token) {
        setStatus("Confirma a verificação antes de enviar.", "is-error");
        return;
      }

      const payload = {
        name: formData.get("name"),
        business: formData.get("business"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        service: formData.get("service"),
        message: formData.get("message"),
        company_website: formData.get("company_website"),
        turnstileToken: token,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível enviar o formulário.");
      }

      setStatus("Pedido enviado com sucesso. Vamos responder em breve.", "is-success");
      form.reset();

      if (window.turnstile) {
        window.turnstile.reset();
      }
    } catch (error) {
      setStatus(error.message || "Erro ao enviar o formulário.", "is-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar pedido";
    }
  });
});