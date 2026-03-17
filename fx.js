// Scroll reveal using IntersectionObserver
(function reveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
})();

// Subtle parallax for bg glow
(function parallax() {
  const glow = document.querySelector(".bg-glow");
  if (!glow) return;

  let y = 0;

  function onScroll() {
    y = window.scrollY || 0;
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  function loop() {
    const b = Math.min(y * 0.03, 26);
    glow.style.transform = `translate3d(0, ${b}px, 0)`;
    requestAnimationFrame(loop);
  }

  loop();
})();
