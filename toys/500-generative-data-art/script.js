const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const animateBtn = document.getElementById('animateBtn');
const infoEl = document.getElementById('info');

let particles = [];
let connections = [];
let isAnimating = true;
let time = 0;
let seed = Math.random() * 1000;

function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function generateData() {
    seed = Math.random() * 1000;
    particles = [];
    connections = [];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Generate particles based on data patterns
    const numClusters = 3 + Math.floor(seededRandom() * 4);
    const particlesPerCluster = 15 + Math.floor(seededRandom() * 20);

    for (let c = 0; c < numClusters; c++) {
        const clusterAngle = (c / numClusters) * Math.PI * 2;
        const clusterDist = 60 + seededRandom() * 60;
        const clusterX = cx + Math.cos(clusterAngle) * clusterDist;
        const clusterY = cy + Math.sin(clusterAngle) * clusterDist;
        const clusterHue = (c / numClusters) * 360;

        for (let i = 0; i < particlesPerCluster; i++) {
            const angle = seededRandom() * Math.PI * 2;
            const dist = seededRandom() * 50;
            particles.push({
                x: clusterX + Math.cos(angle) * dist,
                y: clusterY + Math.sin(angle) * dist,
                baseX: clusterX + Math.cos(angle) * dist,
                baseY: clusterY + Math.sin(angle) * dist,
                size: 2 + seededRandom() * 4,
                hue: clusterHue + seededRandom() * 30 - 15,
                speed: 0.5 + seededRandom() * 1.5,
                phase: seededRandom() * Math.PI * 2,
                cluster: c
            });
        }
    }

    // Generate connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].baseX - particles[j].baseX;
            const dy = particles[i].baseY - particles[j].baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 50 && seededRandom() > 0.5) {
                connections.push({
                    from: i,
                    to: j,
                    strength: 1 - dist / 50
                });
            }
        }
    }

    infoEl.textContent = `粒子: ${particles.length} | 連結: ${connections.length} | 群集: ${numClusters}`;
}

function draw() {
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Update and draw particles
    particles.forEach((p, i) => {
        if (isAnimating) {
            const t = time * p.speed + p.phase;
            p.x = p.baseX + Math.sin(t) * 10;
            p.y = p.baseY + Math.cos(t * 0.7) * 10;
        }

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw connections
    connections.forEach(c => {
        const p1 = particles[c.from];
        const p2 = particles[c.to];
        const alpha = c.strength * 0.3;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsla(${(p1.hue + p2.hue) / 2}, 60%, 50%, ${alpha})`;
        ctx.lineWidth = c.strength * 2;
        ctx.stroke();
    });

    // Center decoration
    const centerPulse = Math.sin(time * 2) * 0.2 + 0.8;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 * centerPulse, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${(time * 30) % 360}, 70%, 60%, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // "500" watermark
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('500', cx, cy + 25);

    if (isAnimating) {
        time += 0.02;
    }

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    generateData();
});

animateBtn.addEventListener('click', () => {
    isAnimating = !isAnimating;
    animateBtn.textContent = isAnimating ? '暫停動畫' : '開始動畫';
});

generateData();
draw();
