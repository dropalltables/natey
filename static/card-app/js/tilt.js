function initTilt(cardWrapper, cardContainer) {
  let bounds;
  let enabled = false;
  let intensity = 0;
  let baseTranslateY = 0;
  let baseScale = 1;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let currentTranslateZ = 0;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let targetTranslateZ = 0;
  let isHovering = false;
  let animFrame = null;

  function updateBounds() {
    bounds = cardWrapper.getBoundingClientRect();
  }

  function rampUp() {
    intensity += (1 - intensity) * 0.02;
    const shadowY = 10 * intensity;
    const shadowBlur = 30 * intensity;
    const shadowAlpha = 0.15 * intensity;
    cardWrapper.style.filter =
      `drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha}))`;

    if (intensity < 0.995) {
      requestAnimationFrame(rampUp);
    } else {
      intensity = 1;
      cardWrapper.style.filter =
        'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))';
    }
  }

  function animate() {
    const ease = isHovering ? 0.12 : 0.04;

    currentRotateX += (targetRotateX - currentRotateX) * ease;
    currentRotateY += (targetRotateY - currentRotateY) * ease;
    currentTranslateZ += (targetTranslateZ - currentTranslateZ) * ease;

    cardWrapper.style.transform = `
      translateY(${baseTranslateY}px) scale(${baseScale})
      rotateX(${currentRotateX}deg)
      rotateY(${currentRotateY}deg)
      translateZ(${currentTranslateZ}px)
    `;

    const settled =
      Math.abs(targetRotateX - currentRotateX) < 0.01 &&
      Math.abs(targetRotateY - currentRotateY) < 0.01 &&
      Math.abs(targetTranslateZ - currentTranslateZ) < 0.01;

    if (!settled) {
      animFrame = requestAnimationFrame(animate);
    } else {
      animFrame = null;
      currentRotateX = targetRotateX;
      currentRotateY = targetRotateY;
      currentTranslateZ = targetTranslateZ;
    }
  }

  function kick() {
    if (!animFrame) {
      animFrame = requestAnimationFrame(animate);
    }
  }

  function enable() {
    enabled = true;
    updateBounds();
    requestAnimationFrame(rampUp);
  }

  updateBounds();
  window.addEventListener('resize', updateBounds);

  cardWrapper.addEventListener('mouseenter', () => {
    isHovering = true;
    updateBounds();
  });

  cardWrapper.addEventListener('mousemove', (e) => {
    if (!bounds || !enabled) return;

    const leftX = e.clientX - bounds.left;
    const topY = e.clientY - bounds.top;
    const centerX = leftX - bounds.width / 2;
    const centerY = topY - bounds.height / 2;

    const maxTilt = 15 * intensity;
    targetRotateX = (centerY / (bounds.height / 2)) * -maxTilt;
    targetRotateY = (centerX / (bounds.width / 2)) * maxTilt;
    targetTranslateZ = 20 * intensity;

    const mouseXPercent = (leftX / bounds.width) * 100;
    const mouseYPercent = (topY / bounds.height) * 100;
    const angle = Math.atan2(centerY, centerX) * (180 / Math.PI);

    cardContainer.style.setProperty('--mouse-x', `${mouseXPercent}%`);
    cardContainer.style.setProperty('--mouse-y', `${mouseYPercent}%`);
    cardContainer.style.setProperty('--mouse-angle', angle);

    kick();
  });

  cardWrapper.addEventListener('mouseleave', () => {
    if (!enabled) return;
    isHovering = false;
    targetRotateX = 0;
    targetRotateY = 0;
    targetTranslateZ = 0;
    kick();
  });

  function setBase(ty, s) {
    baseTranslateY = ty;
    baseScale = s;
    cardWrapper.style.transform = `translateY(${ty}px) scale(${s})`;
  }

  return { enable, setBase };
}

export { initTilt };
