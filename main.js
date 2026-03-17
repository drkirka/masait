// year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

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
    e.currentTarget.style.transform = "translate(0px, 0px)";
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

// Stars background
(function starfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const mouse = {
    x: -9999,
    y: -9999,
    lastX: -9999,
    lastY: -9999,
    speed: 0
  };

  const stars = [];
  const STAR_COUNT = 36;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("pointermove", (e) => {
    const dx = e.clientX - mouse.lastX;
    const dy = e.clientY - mouse.lastY;

    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (mouse.lastX !== -9999) {
      mouse.speed = Math.min(Math.sqrt(dx * dx + dy * dy), 25);
    }

    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  });

  window.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.lastX = -9999;
    mouse.lastY = -9999;
    mouse.speed = 0;
  });

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function chance(value) {
    return Math.random() < value;
  }

  function createStar() {
    const size = rand(0.7, 1.8);

    return {
      x: rand(0, w),
      y: rand(0, h),
      baseX: rand(-0.12, 0.12),
      baseY: rand(-0.08, 0.08),
      driftPhase: rand(0, Math.PI * 2),
      driftSpeed: rand(0.003, 0.009),
      size,
      glow: rand(8, 18),
      alpha: rand(0.45, 0.95),
      twinklePhase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.015, 0.035),
      shape: chance(0.35) ? "cross" : "dot",
      exploded: false,
      particles: [],
      respawn: 0,
      cooldown: rand(40, 140)
    };
  }

  function createParticleExplosion(x, y) {
    const count = Math.floor(rand(6, 11));
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(0.15, 0.8);

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(20, 42),
        maxLife: rand(20, 42),
        size: rand(0.8, 1.8),
        glow: rand(4, 10)
      });
    }

    return particles;
  }

  function drawGlow(x, y, radius, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.18})`);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDotStar(x, y, r, alpha) {
    drawGlow(x, y, r * 7, alpha * 0.25);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  function drawCrossStar(x, y, r, alpha) {
    drawGlow(x, y, r * 10, alpha * 0.22);

    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = Math.max(0.7, r * 0.9);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-r * 3, 0);
    ctx.lineTo(r * 3, 0);
    ctx.moveTo(0, -r * 3);
    ctx.lineTo(0, r * 3);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.45})`;
    ctx.lineWidth = Math.max(0.5, r * 0.5);

    ctx.beginPath();
    ctx.moveTo(-r * 1.7, -r * 1.7);
    ctx.lineTo(r * 1.7, r * 1.7);
    ctx.moveTo(r * 1.7, -r * 1.7);
    ctx.lineTo(-r * 1.7, r * 1.7);
    ctx.stroke();

    ctx.restore();
  }

  function drawStar(star, x, y, alpha) {
    if (star.shape === "cross") {
      drawCrossStar(x, y, star.size, alpha);
    } else {
      drawDotStar(x, y, star.size, alpha);
    }
  }

  function updateStar(star) {
    if (star.exploded) {
      for (let i = star.particles.length - 1; i >= 0; i--) {
        const p = star.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const a = Math.max(0, p.life / p.maxLife);

        drawGlow(p.x, p.y, p.glow, a * 0.18);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.95})`;
        ctx.fill();

        if (p.life <= 0) {
          star.particles.splice(i, 1);
        }
      }

      if (star.particles.length === 0) {
        star.respawn -= 1;

        if (star.respawn <= 0) {
          Object.assign(star, createStar());
        }
      }

      return;
    }

    star.driftPhase += star.driftSpeed;
    star.twinklePhase += star.twinkleSpeed;

    star.x += star.baseX + Math.cos(star.driftPhase) * 0.05;
    star.y += star.baseY + Math.sin(star.driftPhase * 0.8) * 0.04;

    if (star.x < -20) star.x = w + 20;
    if (star.x > w + 20) star.x = -20;
    if (star.y < -20) star.y = h + 20;
    if (star.y > h + 20) star.y = -20;

    const twinkle = 0.16 * Math.sin(star.twinklePhase);
    let alpha = Math.max(0.18, Math.min(1, star.alpha + twinkle));

    const dx = mouse.x - star.x;
    const dy = mouse.y - star.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let drawX = star.x;
    let drawY = star.y;

    if (dist < 140) {
      const force = (140 - dist) / 140;
      drawX -= dx * force * 0.015;
      drawY -= dy * force * 0.015;
      alpha += force * 0.08;
    }

    drawStar(star, drawX, drawY, alpha);

    if (star.cooldown > 0) {
      star.cooldown -= 1;
      return;
    }

    if (dist < 22) {
      const triggerChance = mouse.speed > 1.5 ? 0.18 : 0.05;

      if (chance(triggerChance)) {
        star.exploded = true;
        star.particles = createParticleExplosion(drawX, drawY);
        star.respawn = Math.floor(rand(50, 160));
        star.cooldown = Math.floor(rand(80, 160));
      }
    }
  }

  function createInitialStars() {
    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar());
    }
  }

  createInitialStars();

  function animate() {
    ctx.clearRect(0, 0, w, h);

    for (const star of stars) {
      updateStar(star);
    }

    mouse.speed *= 0.92;
    requestAnimationFrame(animate);
  }

  animate();
})();
