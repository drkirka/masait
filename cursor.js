(() => {
  const canvas = document.getElementById("cursorCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // На тач-устройствах отключаем
  const isTouch = matchMedia("(pointer: coarse)").matches;
  if (isTouch) {
    canvas.style.display = "none";
    document.body.style.cursor = "auto";
    return;
  }

  // Позиция мыши (target) и “плавающая” позиция (pos) для сглаживания
  const target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  const pos = { x: target.x, y: target.y };

  // История точек для хвоста
  const trail = [];
  const MAX = 42;

  // Частицы
  const particles = [];
  const MAX_P = 120;

  let hovering = false;
  let down = false;

  window.addEventListener("pointermove", (e) => {
    target.x = e.clientX;
    target.y = e.clientY;

    // лёгкие частицы по движению
    spawnParticle(e.clientX, e.clientY, 1);
  });

  window.addEventListener("pointerdown", () => { down = true; });
  window.addEventListener("pointerup", () => { down = false; });

  // Ховер по интерактивным
  const hoverSelectors = "a, button, [data-magnetic]";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(hoverSelectors)) hovering = true;
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest(hoverSelectors)) hovering = false;
  });

  function spawnParticle(x, y, n = 3) {
    for (let i = 0; i < n; i++) {
      if (particles.length > MAX_P) particles.shift();
      const a = Math.random() * Math.PI * 2;
      const s = 0.6 + Math.random() * 1.6;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        r: 1 + Math.random() * 2.2
      });
    }
  }

  function drawSmoothTrail(points) {
    if (points.length < 3) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      const next = points[i + 1];
      const cx = (p.x + next.x) / 2;
      const cy = (p.y + next.y) / 2;
      ctx.quadraticCurveTo(p.x, p.y, cx, cy);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  function loop() {
    // “пружинка” к курсору
    const ease = hovering ? 0.22 : 0.18;
    pos.x += (target.x - pos.x) * ease;
    pos.y += (target.y - pos.y) * ease;

    trail.push({ x: pos.x, y: pos.y, t: performance.now() });
    while (trail.length > MAX) trail.shift();

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // --- TRAIL / LINE ---
    // градиентная линия (визуально как “нить” за курсором)
    ctx.save();
    ctx.lineWidth = down ? 2.4 : 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Лёгкий “свет” через shadow
    ctx.shadowBlur = hovering ? 18 : 12;
    ctx.shadowColor = "rgba(160,120,255,.35)";

    const g = ctx.createLinearGradient(
      trail[0]?.x ?? pos.x, trail[0]?.y ?? pos.y,
      pos.x, pos.y
    );
    g.addColorStop(0, "rgba(0,255,200,0.00)");
    g.addColorStop(0.55, "rgba(120,80,255,0.28)");
    g.addColorStop(1, "rgba(0,255,200,0.55)");
    ctx.strokeStyle = g;

    drawSmoothTrail(trail);
    ctx.restore();

    // --- PARTICLES ---
    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= 0.018;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(p.life, 0) * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(233,236,255,0.9)";
      ctx.fill();
    }
    ctx.restore();

    // --- MAIN CURSOR ---
    ctx.save();
    const baseR = hovering ? 9 : 6.5;
    const ringR = hovering ? 22 : 16;
    const pulse = down ? 1.25 : 1;

    // точка
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseR * pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(233,236,255,0.92)";
    ctx.shadowBlur = 16;
    ctx.shadowColor = "rgba(0,255,200,.25)";
    ctx.fill();

    // кольцо
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, ringR * pulse, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = hovering
      ? "rgba(0,255,200,0.55)"
      : "rgba(255,255,255,0.25)";
    ctx.stroke();

    ctx.restore();

    requestAnimationFrame(loop);
  }

  // Микро-эффект при клике
  window.addEventListener("click", () => {
    spawnParticle(pos.x, pos.y, 14);
  });

  loop();
})();