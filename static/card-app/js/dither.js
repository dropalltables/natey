const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

function createAnimatedDitheringPattern(canvas, frame, container) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  let color = '#E2E8CE';
  const el = container || canvas.closest('.home-card-embed');
  if (el) {
    const dither = getComputedStyle(el).getPropertyValue('--card-dither').trim();
    const bg = getComputedStyle(el).getPropertyValue('--card-bg').trim();
    if (dither) {
      color = dither;
    } else if (bg) {
      const isDarkCard = bg.includes('262626') || /rgb\(\s*38\s*,\s*38\s*,\s*38\s*\)/.test(bg);
      color = isDarkCard ? '#E2E8CE' : '#262626';
    }
  }

  ctx.clearRect(0, 0, width, height);

  const scale = 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) * 0.4;
  const t = frame * 0.008;

  const lightX = Math.sin(t * 1.3) * 0.6;
  const lightY = Math.cos(t * 0.9) * 0.5 - 0.3;
  const lightZ = 0.8 + Math.sin(t * 0.7) * 0.2;
  const lightMag = Math.sqrt(lightX * lightX + lightY * lightY + lightZ * lightZ);

  const cosA = Math.cos(t * 0.7);
  const sinA = Math.sin(t * 0.7);
  const cosB = Math.cos(t * 0.5);
  const sinB = Math.sin(t * 0.5);
  const cosC = Math.cos(t * 0.3);
  const sinC = Math.sin(t * 0.3);

  for (let y = 0; y < height; y += scale) {
    for (let x = 0; x < width; x += scale) {
      const dx = x - centerX;
      const dy = y - centerY;

      const normalizedX = dx / baseRadius;
      const normalizedY = dy / baseRadius;
      const rSq = normalizedX * normalizedX + normalizedY * normalizedY;

      if (rSq < 1) {
        const z = Math.sqrt(1 - rSq);

        let nx = normalizedX;
        let ny = normalizedY;
        let nz = z;

        const ny1 = ny * cosA - nz * sinA;
        const nz1 = ny * sinA + nz * cosA;
        ny = ny1;
        nz = nz1;

        const nx1 = nx * cosB + nz * sinB;
        const nz2 = -nx * sinB + nz * cosB;
        nx = nx1;
        nz = nz2;

        const nx2 = nx * cosC - ny * sinC;
        const ny2 = nx * sinC + ny * cosC;
        nx = nx2;
        ny = ny2;

        const dot = (nx * lightX + ny * lightY + nz * lightZ) / lightMag;
        const intensity = Math.max(0, dot) * 0.75 + 0.25;

        const bayerX = Math.floor(x / scale) % 4;
        const bayerY = Math.floor(y / scale) % 4;
        const bayerValue = bayerMatrix[bayerY][bayerX];

        if (intensity * 16 > bayerValue) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, scale, scale);
        }
      }
    }
  }
}

export { createAnimatedDitheringPattern };
