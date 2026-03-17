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

// starss
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let w = 0;
let h = 0;
let stars = [];
const mouse = { x: -9999, y: -9999 };

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("pointermove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("pointerleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createStar() {
  return {
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.8, 1.8),
    vx: rand(-0.08, 0.08),
    vy: rand(-0.05, 0.05),
    alpha: rand(0.35, 0.9),
    twinkle: rand(0.01, 0.03),
    phase: rand(0, Math.PI * 2),
    exploded: false,
    respawnTimer: 0
  };
}

function createExplosion(x, y) {
  const parts = [];
  const count = Math.floor(rand(6, 10));

  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.3, 1.2);

    parts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(18, 35),
      maxLife: rand(18, 35),
      size: rand(0.8, 1.8)
    });
  }

  return parts;
}

for (let i = 0; i < 45; i++) {
  stars.push({
    ...createStar(),
    particles: []
  });
}

function drawStar(x, y, r, alpha) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.08})`;
  ctx.fill();
}

function update() {
  ctx.clearRect(0, 0, w, h);

  for (const star of stars) {
    if (!star.exploded) {
      star.x += star.vx;
      star.y += star.vy;
      star.phase += star.twinkle;

      if (star.x < -10) star.x = w + 10;
      if (star.x > w + 10) star.x = -10;
      if (star.y < -10) star.y = h + 10;
      if (star.y > h + 10) star.y = -10;

      const flicker = 0.15 * Math.sin(star.phase);
      const currentAlpha = Math.max(0.15, Math.min(1, star.alpha + flicker));

      drawStar(star.x, star.y, star.r, currentAlpha);

      const dx = mouse.x - star.x;
      const dy = mouse.y - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 18) {
        star.exploded = true;
        star.particles = createExplosion(star.x, star.y);
        star.respawnTimer = rand(40, 120);
      }
    } else {
      for (let i = star.particles.length - 1; i >= 0; i--) {
        const p = star.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const a = p.life / p.maxLife;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
        ctx.fill();

        if (p.life <= 0) {
          star.particles.splice(i, 1);
        }
      }

      if (star.particles.length === 0) {
        star.respawnTimer--;

        if (star.respawnTimer <= 0) {
          Object.assign(star, createStar(), { particles: [] });
        }
      }
    }
  }

  requestAnimationFrame(update);
}

update();
