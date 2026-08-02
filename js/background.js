const canvas = document.getElementById("bg-canvas");

if (!canvas) {
    console.warn("Canvas de fundo não encontrado.");
} else {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, active: false };
    const particles = [];
    const gridSpacing = 90;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticles();
    }

    function initParticles() {
        particles.length = 0;
        const count = Math.max(70, Math.min(140, Math.floor((w * h) / 18000)));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.24,
                vy: (Math.random() - 0.5) * 0.24,
                size: 1 + Math.random() * 2.2,
                alpha: 0.35 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawGrid(time) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;

        const offset = (time * 0.03) % gridSpacing;

        for (let x = -gridSpacing; x < w + gridSpacing; x += gridSpacing) {
            const drift = Math.sin((x + offset) * 0.018 + time * 0.001) * 10;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + drift, h);
            ctx.stroke();
        }

        for (let y = -gridSpacing; y < h + gridSpacing; y += gridSpacing) {
            const drift = Math.cos((y + offset) * 0.016 + time * 0.001) * 12;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y + drift);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawScanLine(time) {
        const scanY = ((time * 0.03) % (h + 220)) - 110;

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY + 70);
        ctx.stroke();

        const glow = ctx.createLinearGradient(0, scanY, w, scanY + 70);
        glow.addColorStop(0, "rgba(255,255,255,0)");
        glow.addColorStop(0.5, "rgba(255,255,255,0.18)");
        glow.addColorStop(1, "rgba(255,255,255,0)");

        ctx.strokeStyle = glow;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(w, scanY + 70);
        ctx.stroke();
        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        drawGrid(performance.now());
        drawScanLine(performance.now());

        particles.forEach((p) => {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const dist = Math.hypot(dx, dy) || 1;

            if (pointer.active && dist < 220) {
                const force = (220 - dist) / 220;
                p.vx -= (dx / dist) * force * 0.0014;
                p.vy -= (dy / dist) * force * 0.0014;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;

            if (p.x < -20 || p.x > w + 20) p.vx *= -1;
            if (p.y < -20 || p.y > h + 20) p.vy *= -1;

            const pulse = 0.35 + Math.sin(performance.now() * 0.001 + p.phase) * 0.1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha + pulse * 0.1})`;
            ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    const alpha = (1 - dist / 140) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
    });
    window.addEventListener("mouseleave", () => {
        pointer.active = false;
    });

    resize();
    draw();
}