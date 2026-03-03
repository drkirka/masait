// year
document.getElementById("year").textContent = new Date().getFullYear();

// Magnetic effect
(function magnetic() {
  const magnets = document.querySelectorAll("[data-magnetic]");

  function onMove(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  }

  function onLeave(e) {
    e.currentTarget.style.transform = "translate(0px,0px)";
  }

  magnets.forEach((el) => {
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  });
})();

// Tilt effect (cards)
(function tilt() {
  const cards = document.querySelectorAll(".hover-tilt");

  function move(e) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 10;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }

  function leave(e) {
    e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
  }

  cards.forEach((c) => {
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", leave);
  });
})();