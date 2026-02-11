class SignatureController {
  constructor(overlayEl, cardWrapper, ditherCanvas, ditherModule, onComplete, tilt) {
    this.overlayEl = overlayEl;
    this.overlayCanvas = overlayEl.querySelector('canvas');
    this.cardWrapper = cardWrapper;
    this.ditherCanvas = ditherCanvas;
    this.ditherModule = ditherModule;
    this.onComplete = onComplete;
    this.tilt = tilt;

    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.isDrawing = false;
    this.isSigning = false;
    this.isSigned = false;
    this.hasDrawn = false;
    this.ditherSpeed = 0.8;
    this.ditherFrame = 0;
    this.points = [];
    this.lastWidth = 5;

    this._bindEvents();
  }

  _getPos(e) {
    const rect = this.overlayCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pressure = e.pressure || (e.touches && e.touches[0].force) || 0.5;
    return {
      x: (clientX - rect.left) * (this.overlayCanvas.width / rect.width),
      y: (clientY - rect.top) * (this.overlayCanvas.height / rect.height),
      pressure
    };
  }

  _drawBrushStroke(ctx, x, y, pressure) {
    this.points.push({ x, y, pressure });

    if (this.points.length < 3) return;

    const pts = this.points;
    const len = pts.length;
    const p0 = pts[len - 3];
    const p1 = pts[len - 2];
    const p2 = pts[len - 1];

    const mid0x = (p0.x + p1.x) / 2;
    const mid0y = (p0.y + p1.y) / 2;
    const mid1x = (p1.x + p2.x) / 2;
    const mid1y = (p1.y + p2.y) / 2;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    const pressureVal = Math.max(0.3, p1.pressure || 0.5);
    const baseWidth = 28;
    const speedFactor = Math.max(0.3, 1 - speed / 60);
    const targetWidth = baseWidth * pressureVal * speedFactor;
    const lineWidth = this.lastWidth + (targetWidth - this.lastWidth) * 0.4;
    this.lastWidth = lineWidth;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(mid0x, mid0y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid1x, mid1y);
    ctx.strokeStyle = `rgba(15, 15, 20, ${0.75 + 0.25 * speedFactor})`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    if (speed > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mid0x, mid0y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid1x, mid1y);
      ctx.strokeStyle = 'rgba(15, 15, 20, 0.08)';
      ctx.lineWidth = lineWidth * 1.8;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    if (speed < 3 && Math.random() > 0.5) {
      ctx.save();
      ctx.fillStyle = `rgba(15, 15, 20, ${0.08 + Math.random() * 0.06})`;
      const r = lineWidth * (0.4 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.arc(
        p1.x + (Math.random() - 0.5) * lineWidth,
        p1.y + (Math.random() - 0.5) * lineWidth,
        r, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    if (this.points.length > 8) {
      this.points = this.points.slice(-5);
    }
  }

  _startStroke(e) {
    if (this.isSigned) return;
    if (e.touches) e.preventDefault();

    if (!this.isSigning) {
      this.isSigning = true;
      this.cardWrapper.classList.add('signing');
    }

    this.isDrawing = true;
    this.hasDrawn = true;
    if (!this._signatureStartedCaptured) {
      this._signatureStartedCaptured = true;
      window.posthog?.capture('membership_card_signature_started');
    }
    this.cardWrapper.classList.add('drawing');
    this.points = [];
    this.lastWidth = 5;
    const pos = this._getPos(e);
    this.points.push(pos);
  }

  _moveStroke(e) {
    if (!this.isDrawing) return;
    if (e.touches) e.preventDefault();
    const pos = this._getPos(e);
    this._drawBrushStroke(this.overlayCtx, pos.x, pos.y, pos.pressure);
  }

  _endStroke(e) {
    if (e && e.touches) e.preventDefault();
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.cardWrapper.classList.remove('drawing');
    this.points = [];

    if (this.hasDrawn && !this._revealedHint) {
      this._revealedHint = true;
      this._animatePullUp();
      const hint = document.getElementById('hintText');
      if (hint) hint.classList.add('visible');
    }
  }

  complete() {
    if (!this.hasDrawn || this.isSigned) return;
    this._stopSigning();
  }

  _animatePullUp() {
    let progress = 0;
    const targetY = -window.innerHeight * 0.03;
    const targetScale = 0.95;
    const animate = () => {
      progress += (1 - progress) * 0.04;
      const y = targetY * progress;
      const s = 1 + (targetScale - 1) * progress;
      this.tilt.setBase(y, s);
      if (progress < 0.995) {
        requestAnimationFrame(animate);
      } else {
        this.tilt.setBase(targetY, targetScale);
      }
    };
    animate();
  }

  _stopSigning() {
    this.isSigning = false;
    this.cardWrapper.classList.remove('signing');
    this.overlayEl.classList.add('signed');
    this.isSigned = true;
    this._decelerateDither();
    if (this.onComplete) this.onComplete();
  }

  startDither() {
    const animate = () => {
      this.ditherFrame += this.ditherSpeed;
      this.ditherModule.createAnimatedDitheringPattern(this.ditherCanvas, this.ditherFrame);
      requestAnimationFrame(animate);
    };
    animate();
  }

  _decelerateDither() {
    const slow = () => {
      this.ditherSpeed *= 0.96;
      if (this.ditherSpeed < 0.005) {
        this.ditherSpeed = 0;
        return;
      }
      requestAnimationFrame(slow);
    };
    slow();
  }

  _bindEvents() {
    this.overlayCanvas.addEventListener('mousedown', (e) => this._startStroke(e));
    this.overlayCanvas.addEventListener('mousemove', (e) => this._moveStroke(e));
    this.overlayCanvas.addEventListener('mouseup', (e) => this._endStroke(e));
    this.overlayCanvas.addEventListener('mouseleave', (e) => this._endStroke(e));
    this.overlayCanvas.addEventListener('touchstart', (e) => this._startStroke(e));
    this.overlayCanvas.addEventListener('touchmove', (e) => this._moveStroke(e));
    this.overlayCanvas.addEventListener('touchend', (e) => this._endStroke(e));
  }
}

export { SignatureController };
