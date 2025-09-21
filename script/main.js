// Mobile menu toggle
const navbarToggle = document.getElementById("fwNavbarToggle");
const navbarMenu = document.getElementById("fwNavbarMenu");

navbarToggle.addEventListener("click", function () {
  navbarToggle.classList.toggle("fw-active");
  navbarMenu.classList.toggle("fw-active");
});

// Close mobile menu when clicking on links
const navbarLinks = document.querySelectorAll(".fw-navbar-link");
navbarLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navbarToggle.classList.remove("fw-active");
    navbarMenu.classList.remove("fw-active");
  });
});

// Scroll effect
const navbar = document.getElementById("fwNavbar");
window.addEventListener("scroll", function () {
  if (window.scrollY > 50) {
    navbar.classList.add("fw-scrolled");
  } else {
    navbar.classList.remove("fw-scrolled");
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".hero-prev");
  const nextBtn = document.querySelector(".hero-next");

  let current = 0;
  const interval = 6000; // ms
  let timer;

  function animateText(slide) {
    const tl = gsap.timeline();

    const title = slide.querySelector(".hero-title");
    const sub = slide.querySelector(".hero-sub");
    const ctas = slide.querySelector(".hero-btn");

    if (title) {
      tl.fromTo(
        title,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }

    if (sub) {
      tl.fromTo(
        sub,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      );
    }

    if (ctas) {
      tl.fromTo(
        ctas,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );
    }
  }

  function showSlide(index) {
    if (index === current) return;

    const currentSlide = slides[current];
    const nextSlide = slides[index];

    // Fade out current slide
    gsap.to(currentSlide, {
      opacity: 0,
      scale: 1.05,
      duration: 1.2,
      ease: "power2.out",
    });

    // Fade in next slide
    gsap.fromTo(
      nextSlide,
      { opacity: 0, scale: 1.08, xPercent: -3 },
      { opacity: 1, scale: 1, xPercent: 0, duration: 1.2, ease: "power3.out" }
    );

    slides.forEach((s, i) => s.classList.toggle("active", i === index));

    animateText(nextSlide);
    current = index;
    resetTimer();
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((current - 1 + slides.length) % slides.length);
  }

  // Arrow controls
  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSlide, interval);
  }

  // Initial load
  gsap.set(slides[0], { opacity: 1, scale: 1 });
  animateText(slides[0]);
  resetTimer();
});
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // --- MARQUEE ---
  gsap.to(".marquee-track", {
    xPercent: -100,
    repeat: -1,
    duration: 25,
    ease: "linear",
  });

  // --- ABOUT STATS SECTION ---
  // Counter cards
  gsap.from(".stat-card", {
    opacity: 0,
    y: 40,
    duration: 1,
    stagger: 0.3,
    delay: 0.4, // starts after map
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about-stats-section",
      start: "top 90%",
    },
  });
});

// Counter logic with GSAP + fallback
(function () {
  const counters = document.querySelectorAll(".stat-number");

  // Helper: animate counter in vanilla JS
  const animateCounter = (el, target) => {
    let current = 0;
    const duration = 2000; // 2s
    const increment = target / (duration / 16); // ~60fps

    const step = () => {
      current += increment;
      if (current < target) {
        el.innerText = Math.floor(current);
        requestAnimationFrame(step);
      } else {
        el.innerText = target;
      }
    };
    step();
  };

  // --- If GSAP + ScrollTrigger available ---
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target");

      ScrollTrigger.create({
        trigger: counter,
        start: "top 80%", // when it comes into view
        once: true, // run only once
        onEnter: () => {
          gsap.fromTo(
            counter,
            { innerText: 0 },
            {
              innerText: target,
              duration: 2,
              ease: "power3.out",
              snap: { innerText: 1 },
              onUpdate: function () {
                counter.innerText = Math.floor(counter.innerText);
              },
            }
          );
        },
      });
    });
  } else {
    // --- Fallback: IntersectionObserver ---
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = +entry.target.getAttribute("data-target");
            animateCounter(entry.target, target);
            obs.unobserve(entry.target); // only once
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }
})();

// Minimal Enhanced Infinite Carousel (no buttons, no dots)
(function () {
  const carousel = document.querySelector(".card-carousel");
  if (!carousel) return;

  let visibleCards = getVisibleCards();
  let originalCards = [];
  let originalCount = 0;
  let currentIndex = 0;
  let isTransitioning = false;
  let autoScrollInterval = null;
  let resizeTimeout = null;

  // --- Helpers ---
  function getVisibleCards() {
    return window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
  }

  function removeClones() {
    carousel.querySelectorAll(".review-card.clone").forEach((c) => c.remove());
  }

  function createClones() {
    originalCards = Array.from(
      carousel.querySelectorAll(".review-card:not(.clone)")
    );
    originalCount = originalCards.length;

    removeClones();

    if (originalCount === 0) return;

    // Start clones (last N)
    const start = Math.max(0, originalCount - visibleCards);
    for (let i = start; i < originalCount; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.classList.add("clone");
      carousel.insertBefore(clone, carousel.firstChild);
    }

    // End clones (first N)
    for (let i = 0; i < visibleCards; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.classList.add("clone");
      carousel.appendChild(clone);
    }
  }

  function getCardWidth() {
    const nodes = carousel.querySelectorAll(".review-card");
    if (nodes.length >= 2) {
      const r0 = nodes[0].getBoundingClientRect();
      const r1 = nodes[1].getBoundingClientRect();
      return Math.abs(r1.left - r0.left);
    }
    if (nodes.length === 1) return nodes[0].getBoundingClientRect().width;
    return 0;
  }

  function updateCarousel(withTransition = true) {
    const cardWidth = getCardWidth();
    const translate = (visibleCards + currentIndex) * cardWidth;

    if (withTransition) {
      carousel.style.transition =
        "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
      isTransitioning = true;
      requestAnimationFrame(() => {
        carousel.style.transform = `translateX(-${translate}px)`;
      });
    } else {
      carousel.style.transition = "none";
      carousel.style.transform = `translateX(-${translate}px)`;
      carousel.getBoundingClientRect(); // force reflow
      isTransitioning = false;
    }
  }

  function handleTransitionEnd(e) {
    if (e.target !== carousel || e.propertyName !== "transform") return;

    isTransitioning = false;

    if (currentIndex >= originalCount) {
      currentIndex = currentIndex - originalCount;
      updateCarousel(false);
    } else if (currentIndex < 0) {
      currentIndex = currentIndex + originalCount;
      updateCarousel(false);
    }
  }

  // Navigation
  function goNext() {
    if (isTransitioning || originalCount <= 1) return;
    currentIndex++;
    updateCarousel(true);
  }

  function goPrev() {
    if (isTransitioning || originalCount <= 1) return;
    currentIndex--;
    updateCarousel(true);
  }

  // Auto-scroll
  function startAutoScroll() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    stopAutoScroll();
    autoScrollInterval = setInterval(goNext, 3000);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  // Swipe support
  let touchStartX = 0;
  carousel.addEventListener(
    "touchstart",
    (evt) => {
      if (isTransitioning) return;
      stopAutoScroll();
      touchStartX = evt.touches[0].clientX;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (evt) => {
      if (isTransitioning) return;
      const endX =
        (evt.changedTouches && evt.changedTouches[0].clientX) || touchStartX;
      const diff = touchStartX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goNext() : goPrev();
      }
      setTimeout(startAutoScroll, 3000);
    },
    { passive: true }
  );

  // Pause on hover
  carousel.addEventListener("mouseenter", stopAutoScroll);
  carousel.addEventListener("mouseleave", startAutoScroll);

  // Resize
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newVisible = getVisibleCards();
      if (newVisible !== visibleCards) {
        visibleCards = newVisible;
        stopAutoScroll();
        rebuildCarousel();
        setTimeout(startAutoScroll, 1000);
      } else {
        updateCarousel(false);
      }
    }, 150);
  });

  function rebuildCarousel() {
    removeClones();
    createClones();
    currentIndex = 0;
    updateCarousel(false);
  }

  // Init
  function initCarousel() {
    visibleCards = getVisibleCards();
    createClones();
    currentIndex = 0;
    updateCarousel(false);
    startAutoScroll();
  }

  carousel.addEventListener("transitionend", handleTransitionEnd);

  initCarousel();
})();
