function initScaleForContainer(container) {
  if (!container) return;

  const BASE_W = 637.5;
  const BASE_H = 1012.5;

  let lastScale = null;
  let rafId = null;

  function update() {
    const rect = container.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;
    if (w <= 0 || h <= 0) {
      w = window.innerWidth * 0.45;
      h = window.innerHeight * 0.65;
    }
    w = Math.min(w, window.innerWidth * 0.5);
    h = Math.min(h, window.innerHeight * 0.7);
    const scaleW = w / BASE_W;
    const scaleH = h / BASE_H;
    const scale = Math.min(scaleW, scaleH, 0.7) * 0.95;

    // Writing --scale resizes the observed subtree, so re-firing the
    // ResizeObserver with an unchanged value would loop indefinitely
    // ("ResizeObserver loop completed with undelivered notifications").
    // Bail out when the scale hasn't moved, and defer the write to the
    // next frame so the mutation lands outside the observer's delivery pass.
    if (lastScale !== null && Math.abs(scale - lastScale) < 1e-4) return;
    lastScale = scale;

    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      container.style.setProperty('--scale', String(scale));
    });
  }

  update();
  const ro = new ResizeObserver(update);
  ro.observe(container);
  window.addEventListener('resize', update);
}

export { initScaleForContainer };
