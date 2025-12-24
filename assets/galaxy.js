(function(){
  // Galaxy background: moving small stars + drifting blurred blobs
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'galaxy-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  // Stars
  const STAR_COUNT = Math.round((window.innerWidth * window.innerHeight) / 60000); // scale with screen
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02
    });
  }

  // Blobs (large, soft colored shapes)
  const BLOBS = 4;
  const blobs = [];
  // Purple / galaxy-focused palette (soft alphas for subtlety)
  const blobColors = [
    {a: 'rgba(188,19,254,0.14)', b: 'rgba(122,4,235,0.09)'},
    {a: 'rgba(124,58,237,0.11)', b: 'rgba(99,102,241,0.06)'},
    {a: 'rgba(147,51,234,0.08)', b: 'rgba(79,70,229,0.05)'}
  ];

  for (let i = 0; i < BLOBS; i++) {
    const size = Math.max(w, h) * (0.18 + Math.random() * 0.25);
    const color = blobColors[i % blobColors.length];
    blobs.push({
      x: Math.random() * w,
      y: Math.random() * h,
      baseX: Math.random() * w,
      baseY: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: size,
      color: color,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004
    });
  }

  // subtle parallax from mouse movement (very small, non-intrusive)
  let mx = w/2, my = h/2;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
  });

  function draw() {
    ctx.clearRect(0,0,w,h);

    // draw blobs first (behind stars but above base background)
    blobs.forEach((b, i) => {
      // update position with slow, smooth oscillation
      b.phase += b.speed;
      b.x += Math.sin(b.phase * (0.8 + i*0.2)) * 0.35 + b.vx * 0.6;
      b.y += Math.cos(b.phase * (1 + i*0.15)) * 0.35 + b.vy * 0.6;

      // slight parallax toward mouse
      const px = (mx - w/2) * (0.02 * (i+1));
      const py = (my - h/2) * (0.02 * (i+1));

      const gx = b.x + px;
      const gy = b.y + py;

      const radius = b.size;
      const grad = ctx.createRadialGradient(gx, gy, radius * 0.05, gx, gy, radius);
      grad.addColorStop(0, b.color.a);
      grad.addColorStop(0.6, b.color.b);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, radius, 0, Math.PI*2);
      ctx.fill();
    });

    // draw stars
    ctx.globalCompositeOperation = 'lighter';
    stars.forEach(s => {
      // twinkle
      s.alpha += Math.sin(Date.now() * s.twinkleSpeed + s.r) * 0.005;
      s.alpha = Math.max(0.05, Math.min(1, s.alpha));

      // slow drift
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -2) s.x = w + 2;
      if (s.x > w + 2) s.x = -2;
      if (s.y < -2) s.y = h + 2;
      if (s.y > h + 2) s.y = -2;

      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  // Start
  requestAnimationFrame(draw);

  // Recreate stars on significant resize to scale count
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // rebuild stars array
      const newCount = Math.round((window.innerWidth * window.innerHeight) / 60000);
      stars.length = 0;
      for (let i = 0; i < newCount; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 1.2 + 0.2,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02
        });
      }
    }, 200);
  });

})();
