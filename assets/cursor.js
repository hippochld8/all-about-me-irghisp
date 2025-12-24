(function(){
  // Canvas-based purple particle trail
  const COLOR_A = 'rgba(188,19,254,1)'; // neon purple
  const COLOR_B = 'rgba(122,4,235,1)';

  const canvas = document.createElement('canvas');
  canvas.id = 'cursor-trail-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];
  const MAX = 100; // max simultaneous particles

  function makeParticle(x, y) {
    const ttl = 50 + Math.floor(Math.random() * 40);
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      r: 6 + Math.random() * 14,
      life: ttl,
      ttl: ttl,
      drift: (Math.random() - 0.5) * 0.8
    };
  }

  function addAt(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8));
      if (particles.length > MAX) particles.shift();
    }
  }

  // pointer events
  window.addEventListener('pointermove', (e) => {
    addAt(e.clientX, e.clientY, 2);
  });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches && e.touches[0];
    if (t) addAt(t.clientX, t.clientY, 2);
  }, { passive: true });

  // animation
  function step() {
    // clear with transparent fill to keep only particles drawn each frame
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const alpha = Math.max(p.ttl / p.life, 0);

      // update
      p.x += p.vx + Math.sin(p.drift * (p.life - p.ttl) * 0.15);
      p.y += p.vy + Math.cos(p.drift * (p.life - p.ttl) * 0.15);
      p.vx *= 0.98; p.vy *= 0.98;
      p.ttl -= 1;

      // radial gradient for soft glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      grad.addColorStop(0, `rgba(188,19,254,${0.95 * alpha})`);
      grad.addColorStop(0.45, `rgba(138,43,226,${0.5 * alpha})`);
      grad.addColorStop(1, `rgba(138,43,226,0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      if (p.ttl <= 0) particles.splice(i, 1);
    }

    requestAnimationFrame(step);
  }

  // Start the loop
  requestAnimationFrame(step);

  // Small optimization: when user is idle, reduce particle spawn. We already only spawn on pointermove.
})();
