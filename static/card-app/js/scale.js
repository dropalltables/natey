function initScale() {
  const BASE_W = 637.5;
  const BASE_H = 1012.5;

  function update() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scaleW = vw / BASE_W;
    const scaleH = vh / BASE_H;
    const scale = Math.min(scaleW, scaleH) * 0.95;
    document.documentElement.style.setProperty('--scale', scale);
  }

  update();
  window.addEventListener('resize', update);
}

function initScaleForContainer(container) {
  if (!container) return initScale();

  const BASE_W = 637.5;
  const BASE_H = 1012.5;

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
    container.style.setProperty('--scale', String(scale));
  }

  update();
  const ro = new ResizeObserver(update);
  ro.observe(container);
  window.addEventListener('resize', update);
}

export { initScale, initScaleForContainer };
