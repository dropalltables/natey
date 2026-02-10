import { buildCardData } from './js/data.js';
import { createAnimatedDitheringPattern } from './js/dither.js';
import { SignatureController } from './js/signature.js';
import { initTilt } from './js/tilt.js';
import { initScaleForContainer } from './js/scale.js';

const STORAGE_KEY = 'viruus-membership-card';
const VIP_STORAGE_KEY = 'viruus-vip-badge';

function isExpired(expStr) {
  const today = new Date().toISOString().slice(0, 10);
  return expStr < today;
}

function loadSavedCard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.exp || !saved?.data) return null;
    if (isExpired(saved.exp)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

function saveCard(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function initEmbeddedCard(container) {
  if (!container) return;

  initScaleForContainer(container);

  const infoValues = container.querySelector('[data-card-info-values]');
  const organization = container.querySelector('[data-card-organization]');
  const cardWrapper = container.querySelector('[data-card-wrapper]');
  const cardContainer = container.querySelector('[data-card-container]');
  const firstNameInput = container.querySelector('[data-card-first-name]');
  const lastNameInput = container.querySelector('[data-card-last-name]');
  const nameInputWrapper = container.querySelector('[data-card-name-wrapper]');
  const nameDisplay = container.querySelector('[data-card-name-display]');
  const signatureOverlay = container.querySelector('[data-card-signature]');
  const ditherCanvas = container.querySelector('[data-card-dither]');
  const hintText = container.querySelector('[data-card-hint]');

  if (!infoValues || !cardWrapper || !cardContainer) return;

  const tilt = initTilt(cardWrapper, cardContainer);

  let nameFinalized = false;
  let signatureFinalized = false;

  const saved = loadSavedCard();

  function applyData(data) {
    infoValues.innerHTML =
      `${data.id}<br/>${data.timezone}<br/>${data.exp}<br/>${data.crewId}<br/>${data.callsign}<br/>${data.rank}<br/>${data.os}<br/>${data.rating}`;
    if (organization) organization.textContent = data.organization;
  }

  function showCompletedCard(firstName, lastName, signatureDataUrl) {
    if (nameDisplay) {
      nameDisplay.innerHTML = `${firstName}<br/>${lastName}`;
      nameDisplay.classList.add('finalized');
    }
    if (nameInputWrapper) {
      nameInputWrapper.classList.add('finalized');
    }
    if (signatureDataUrl) {
      signatureOverlay?.classList.add('signed');
      const canvas = signatureOverlay?.querySelector('canvas');
      if (canvas) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
        };
        img.src = signatureDataUrl;
      }
    }
    nameFinalized = true;
    signatureFinalized = true;
    tilt.enable();
  }

  if (saved) {
    applyData(saved.data);
    showCompletedCard(saved.firstName || 'Jane', saved.lastName || 'Doe', saved.signatureDataUrl);
  }

  const vipBadge = container.querySelector('[data-vip-badge]');
  if (vipBadge && localStorage.getItem(VIP_STORAGE_KEY)) {
    vipBadge.classList.add('vip-badge--visible');
    vipBadge.removeAttribute('aria-hidden');
  }

  const data = saved?.data ?? buildCardData();
  if (!saved) {
    applyData(data);
  }

  function onComplete() {
    signatureFinalized = true;
    finalizeName();
    if (hintText) hintText.classList.remove('visible');
    checkComplete();
    window.posthog?.capture('membership_card_completed');

    const first = firstNameInput?.value?.trim() || 'Jane';
    const last = lastNameInput?.value?.trim() || 'Doe';
    const canvas = signatureOverlay?.querySelector('canvas');
    const signatureDataUrl = canvas?.toDataURL?.('image/png');
    saveCard({
      exp: data.exp,
      data,
      firstName: first,
      lastName: last,
      signatureDataUrl
    });
  }

  const ditherModule = {
    createAnimatedDitheringPattern: (canvas, frame) =>
      createAnimatedDitheringPattern(canvas, frame, container)
  };
  const sig = new SignatureController(
    signatureOverlay,
    cardWrapper,
    ditherCanvas,
    ditherModule,
    onComplete,
    tilt
  );

  sig.startDither();

  function checkComplete() {
    if (nameFinalized && signatureFinalized) {
      tilt.enable();
    }
  }

  function finalizeName() {
    if (nameFinalized) return;
    const first = firstNameInput?.value?.trim() || 'Jane';
    const last = lastNameInput?.value?.trim() || 'Doe';
    if (nameDisplay) {
      nameDisplay.innerHTML = `${first}<br/>${last}`;
      nameDisplay.classList.add('finalized');
    }
    if (nameInputWrapper) nameInputWrapper.classList.add('finalized');
    nameFinalized = true;
    checkComplete();
  }

  if (!saved) {
    signatureOverlay.addEventListener('mousedown', finalizeName, { once: true });
    signatureOverlay.addEventListener('touchstart', finalizeName, { once: true, passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && sig.hasDrawn && !sig.isSigned) {
      e.preventDefault();
      sig.complete();
    }
  });
}