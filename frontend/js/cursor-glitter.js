/**
 * GiftSpace - Luxury Falling Glitter Cursor Effect (Hiệu ứng hạt kim tuyến rơi theo con trỏ chuột)
 * Lightweight, high-performance (60-120fps) canvas particle system.
 * Zero CPU overhead when idle. Non-blocking (pointer-events: none).
 */
(function () {
    if (typeof window === 'undefined') return;

    // Respect user's reduced motion setting
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Avoid duplicate initialization
    if (window.__giftspace_glitter_initialized__) return;
    window.__giftspace_glitter_initialized__ = true;

    // Glitter Palette (Brilliant Gold, Shimmering Champagne, Crystal White, GiftSpace Rose & Ruby)
    const GLITTER_COLORS = [
        '#ffd700', // Saturated Gold
        '#ffea79', // Sparkling Champagne
        '#ffffff', // Pure Crystal White
        '#ff3b69', // GiftSpace Ruby Rose
        '#fda4af', // Soft Blush Pink
        '#fbcfe8', // Shimmering Pink
        '#facc15', // Bright Amber Gold
        '#fed7aa', // Peach Gold
        '#e0e7ff'  // Crystal Starlight
    ];

    let canvas, ctx;
    let width = 0, height = 0;
    let dpr = 1;
    const particles = [];
    let isRunning = false;
    let lastX = null, lastY = null;
    let distAccumulator = 0;

    class GlitterParticle {
        constructor(x, y, vx, vy) {
            // Slight natural scatter around cursor position
            this.x = x + (Math.random() - 0.5) * 10;
            this.y = y + (Math.random() - 0.5) * 10;

            // Size: 2.8px to 7.5px for rich sparkle visibility
            this.size = Math.random() * 4.6 + 2.8;
            this.maxSize = this.size;

            // Velocity: initial gentle burst, then gravity takes over
            this.vx = (vx || 0) * 0.12 + (Math.random() - 0.5) * 2.4;
            this.vy = (vy || 0) * 0.12 + (Math.random() * -2.0 + 0.3); // slight upward pop before floating down

            // Falling physics: realistic falling glitter with gentle air resistance & side-to-side sway
            this.gravity = 0.12 + Math.random() * 0.09; // Acceleration downwards
            this.airResistance = 0.978;
            this.driftFrequency = Math.random() * 3.5 + 2.0;
            this.driftPhase = Math.random() * Math.PI * 2;
            this.driftAmplitude = Math.random() * 0.5 + 0.2;

            // Rotation as it falls
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.16;

            // Lifespan: lasts ~0.7s to 1.4s
            this.life = 1.0;
            this.decay = Math.random() * 0.015 + 0.012;

            // Twinkle fluctuation (nhấp nháy lấp lánh)
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.28 + 0.16;

            // Shape distribution: 50% 4-point star (✦), 30% diamond, 20% glowing circle
            const rand = Math.random();
            this.shape = rand < 0.5 ? 'star' : (rand < 0.8 ? 'diamond' : 'circle');
            this.color = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)];
        }

        update(time) {
            // Apply drag and gravity
            this.vx *= this.airResistance;
            this.vy = this.vy * this.airResistance + this.gravity;

            // Gentle fluttering horizontal sway
            const sway = Math.sin(time * this.driftFrequency + this.driftPhase) * this.driftAmplitude;
            this.x += this.vx + sway;
            this.y += this.vy;

            this.rotation += this.rotSpeed;
            this.life -= this.decay;
            this.twinklePhase += this.twinkleSpeed;

            // Shrink slightly as it fades away
            const progress = Math.max(0, this.life);
            this.size = this.maxSize * (0.35 + 0.65 * progress);
        }

        draw(ctx) {
            if (this.life <= 0 || this.size <= 0.1) return;

            // Twinkle pulse factor
            const twinkle = 0.78 + 0.22 * Math.sin(this.twinklePhase);
            const alpha = Math.max(0, Math.min(1, this.life * twinkle));

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;

            if (this.shape === 'star') {
                // 4-pointed diamond sparkle star (✦)
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 8;

                ctx.beginPath();
                const spikes = 4;
                const outerRadius = this.size;
                const innerRadius = this.size * 0.22;
                for (let i = 0; i < spikes * 2; i++) {
                    const r = (i % 2 === 0) ? outerRadius : innerRadius;
                    const a = (i * Math.PI) / spikes;
                    const px = Math.cos(a) * r;
                    const py = Math.sin(a) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                // Ultra-bright crystal center core
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0.7, this.size * 0.22), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 3;
                ctx.shadowColor = '#ffffff';
                ctx.fill();
            } else if (this.shape === 'diamond') {
                // Shimmering Diamond
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.58, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size * 0.58, 0);
                ctx.closePath();
                ctx.fill();

                // Sparkle core
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0.6, this.size * 0.22), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            } else {
                // Glowing Shimmer Dust Dot
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
                ctx.fill();

                // White twinkle dot
                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function initCanvas() {
        if (canvas) return;

        canvas = document.createElement('canvas');
        canvas.id = 'giftspace-glitter-cursor-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999';
        canvas.style.userSelect = 'none';
        canvas.setAttribute('aria-hidden', 'true');

        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
    }

    function resize() {
        if (!canvas) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }

    function spawnGlitter(x, y, vx, vy, count) {
        initCanvas();
        for (let i = 0; i < count; i++) {
            if (particles.length > 280) {
                particles.shift();
            }
            particles.push(new GlitterParticle(x, y, vx, vy));
        }
        startLoop();
    }

    let globalTime = 0;
    function loop() {
        if (particles.length === 0) {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, width, height);
            }
            isRunning = false;
            return;
        }

        ctx.clearRect(0, 0, width, height);
        globalTime += 0.05;

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update(globalTime);
            if (p.life <= 0 || p.y > height + 20) {
                particles.splice(i, 1);
            } else {
                p.draw(ctx);
            }
        }

        requestAnimationFrame(loop);
    }

    function startLoop() {
        if (!isRunning) {
            isRunning = true;
            requestAnimationFrame(loop);
        }
    }

    function onPointerMove(x, y) {
        if (lastX === null || lastY === null) {
            lastX = x;
            lastY = y;
            spawnGlitter(x, y, 0, 0, 3);
            return;
        }

        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        distAccumulator += dist;

        // Emit falling glitter particles smoothly along movement path
        if (distAccumulator >= 7) {
            const count = Math.min(Math.floor(distAccumulator / 7), 5);
            for (let i = 1; i <= count; i++) {
                const ratio = i / count;
                const interpX = lastX + dx * ratio;
                const interpY = lastY + dy * ratio;
                spawnGlitter(interpX, interpY, dx, dy, 2);
            }
            distAccumulator = 0;
        }

        lastX = x;
        lastY = y;
    }

    // Attach mouse listeners
    window.addEventListener('mousemove', (e) => {
        onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    // Touch support for mobile / touch devices
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        lastX = null;
        lastY = null;
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCanvas);
    } else {
        initCanvas();
    }
})();
