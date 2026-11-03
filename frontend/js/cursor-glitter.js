/**
 * GiftSpace - Luxury Rose & Ruby Glitter Cursor Effect
 * (Hiệu ứng hạt kim tuyến Rose Gold, Ruby & Diamond rơi theo con trỏ chuột)
 * 
 * Thiết kế đồng bộ hoàn hảo với hệ thống màu Obsidian Rose của GiftSpace:
 * - Ruby Red (#e11d48, #b80035, #ff2d55)
 * - Rose Gold & Champagne Rose (#ffb2bb, #fda4af, #fbcfe8)
 * - Diamond Starlight (#ffffff, #ffe4e6)
 * 
 * Tự động chuyển đổi bảng màu thông minh theo chế độ Dark / Light Mode.
 * Hiệu năng cao 60-120fps trên canvas, zero CPU khi đứng yên, non-blocking.
 */
(function () {
    if (typeof window === 'undefined') return;

    // Tôn trọng cài đặt giảm chuyển động của người dùng
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Tránh khởi tạo lặp lại
    if (window.__giftspace_glitter_initialized__) return;
    window.__giftspace_glitter_initialized__ = true;

    // Bảng màu Kim Tuyến cho Dark Mode (Obsidian Rose: Luminous Ruby, Rose Gold & Diamond Glow)
    const PALETTE_DARK = [
        '#ff2d55', // Neon Ruby Rose (Tone màu chủ đạo rực rỡ)
        '#ff5376', // Luminous Rose Pink
        '#fb7185', // Radiant Rose
        '#ff85a1', // Rose Quartz Shimmer
        '#ffb2bb', // Lấp lánh Rose Gold
        '#fbcfe8', // Champagne Pink Crystal
        '#ffe4e6', // Diamond Pink Flare
        '#ffffff'  // Pure Diamond Starlight (Ánh sao kim cương trắng sáng)
    ];

    // Bảng màu Kim Tuyến cho Light Mode (Velvet Ruby, Rose Quartz & Polished Rose Gold - Tương phản sắc nét trên nền sáng)
    const PALETTE_LIGHT = [
        '#b80035', // Deep GiftSpace Crimson
        '#e11d48', // Vivid Rose Red
        '#f43f5e', // Rose Quartz Gem
        '#fb7185', // Coral Blossom
        '#d03b68', // Sparkling Velvet Rose
        '#e07a93', // Polished Rose Gold
        '#fda4af', // Soft Rose Accent
        '#ffffff'  // Diamond Sparkle Core
    ];

    let canvas, ctx;
    let width = 0, height = 0;
    let dpr = 1;
    const particles = [];
    let isRunning = false;
    let lastX = null, lastY = null;
    let distAccumulator = 0;

    function isDarkMode() {
        return document.documentElement.classList.contains('dark') ||
            (!('darkMode' in localStorage) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    class GlitterParticle {
        constructor(x, y, vx, vy) {
            this.isDark = isDarkMode();
            const palette = this.isDark ? PALETTE_DARK : PALETTE_LIGHT;

            // Tán xạ tự nhiên nhẹ xung quanh đầu con trỏ chuột
            this.x = x + (Math.random() - 0.5) * 8;
            this.y = y + (Math.random() - 0.5) * 8;

            // Kích thước hạt từ 2.6px đến 6.8px
            this.size = Math.random() * 4.2 + 2.6;
            this.maxSize = this.size;

            // Vận tốc hạt: bay nhẹ lên trước khi rơi xuống theo trọng lực
            this.vx = (vx || 0) * 0.10 + (Math.random() - 0.5) * 2.2;
            this.vy = (vy || 0) * 0.10 + (Math.random() * -1.8 + 0.2);

            // Vật lý rơi trọng lực kết hợp đung đưa nhẹ như kim tuyến trong không khí
            this.gravity = 0.11 + Math.random() * 0.08;
            this.airResistance = 0.98;
            this.driftFrequency = Math.random() * 3.5 + 2.0;
            this.driftPhase = Math.random() * Math.PI * 2;
            this.driftAmplitude = Math.random() * 0.5 + 0.25;

            // Hiệu ứng xoay tròn khi rơi
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.15;

            // Vòng đời của hạt (kéo dài ~0.8s đến 1.4s)
            this.life = 1.0;
            this.decay = Math.random() * 0.014 + 0.011;

            // Nhịp lấp lánh (Twinkle phase)
            this.twinklePhase = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.26 + 0.18;

            // Tỉ lệ hình dạng hạt: 50% Ngôi sao 4 cánh (✦ đặc trưng logo), 30% Kim cương (◆), 20% Bụi sao tròn
            const rand = Math.random();
            this.shape = rand < 0.5 ? 'star' : (rand < 0.8 ? 'diamond' : 'circle');
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update(time) {
            this.vx *= this.airResistance;
            this.vy = this.vy * this.airResistance + this.gravity;

            const sway = Math.sin(time * this.driftFrequency + this.driftPhase) * this.driftAmplitude;
            this.x += this.vx + sway;
            this.y += this.vy;

            this.rotation += this.rotSpeed;
            this.life -= this.decay;
            this.twinklePhase += this.twinkleSpeed;

            // Thu nhỏ dần khi sắp tan biến
            const progress = Math.max(0, this.life);
            this.size = this.maxSize * (0.35 + 0.65 * progress);
        }

        draw(ctx) {
            if (this.life <= 0 || this.size <= 0.1) return;

            // Hiệu ứng nhấp nháy phát sáng
            const twinkle = 0.8 + 0.2 * Math.sin(this.twinklePhase);
            const alpha = Math.max(0, Math.min(1, this.life * twinkle));

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;

            const glowBlur = this.isDark ? 9 : 4;

            if (this.shape === 'star') {
                // Ngôi sao 4 cánh kim cương (✦)
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = glowBlur;

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

                // Điểm tâm kim cương trắng sáng lấp lánh ở giữa
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0.7, this.size * 0.24), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = this.isDark ? 5 : 2;
                ctx.shadowColor = '#ffffff';
                ctx.fill();
            } else if (this.shape === 'diamond') {
                // Kim cương đa giác Rose Gem (◆)
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = glowBlur;

                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.58, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size * 0.58, 0);
                ctx.closePath();
                ctx.fill();

                // Tâm sáng lấp lánh
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(0.6, this.size * 0.22), 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            } else {
                // Bụi sao phát sáng tròn (●)
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = glowBlur;

                ctx.beginPath();
                ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
                ctx.fill();

                // Điểm sáng trung tâm
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

        // Sinh hạt mịn màng theo quỹ đạo di chuyển chuột
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

    // Sự kiện di chuyển chuột
    window.addEventListener('mousemove', (e) => {
        onPointerMove(e.clientX, e.clientY);
    }, { passive: true });

    // Hiệu ứng pháo hoa kim tuyến mini (burst) khi bấm chuột vào các nút/thẻ
    window.addEventListener('click', (e) => {
        if (e.button === 0) {
            spawnGlitter(e.clientX, e.clientY, (Math.random() - 0.5) * 3.5, -2.2, 8);
        }
    }, { passive: true });

    // Hỗ trợ cảm ứng trên thiết bị di động
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

    // Khởi tạo ngay khi tải xong trang
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCanvas);
    } else {
        initCanvas();
    }
})();
