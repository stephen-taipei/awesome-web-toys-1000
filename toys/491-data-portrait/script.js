const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const infoEl = document.getElementById('info');

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function generatePortrait(name) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const hash = hashString(name);
    let seed = hash;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Generate color palette from name
    const hue1 = (hash % 360);
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;

    // Draw concentric rings
    const ringCount = 5 + (hash % 5);
    for (let r = ringCount; r > 0; r--) {
        const radius = r * 25;
        const segments = 6 + (hash % 12);
        const angleStep = (Math.PI * 2) / segments;

        for (let i = 0; i < segments; i++) {
            const angle = i * angleStep + seededRandom(seed++) * 0.3;
            const nextAngle = angle + angleStep * 0.8;

            const hue = [hue1, hue2, hue3][Math.floor(seededRandom(seed++) * 3)];
            const sat = 50 + seededRandom(seed++) * 50;
            const light = 40 + seededRandom(seed++) * 30;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, angle, nextAngle);
            ctx.arc(cx, cy, radius - 20, nextAngle, angle, true);
            ctx.closePath();
            ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, 0.7)`;
            ctx.fill();
        }
    }

    // Draw center symbol
    const charCode = name.charCodeAt(0) || 65;
    const points = 3 + (charCode % 6);
    const innerRadius = 20;
    const outerRadius = 40;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `hsl(${hue1}, 80%, 60%)`;
    ctx.fill();

    // Draw orbiting particles
    const particleCount = 20 + (hash % 30);
    for (let i = 0; i < particleCount; i++) {
        const angle = seededRandom(seed++) * Math.PI * 2;
        const dist = 80 + seededRandom(seed++) * 60;
        const size = 2 + seededRandom(seed++) * 4;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue2}, 70%, 70%, ${0.3 + seededRandom(seed++) * 0.7})`;
        ctx.fill();
    }

    // Draw name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, cx, canvas.height - 20);

    infoEl.textContent = `${name} 的獨特數據肖像`;
}

generateBtn.addEventListener('click', () => {
    const name = nameInput.value.trim() || '匿名';
    generatePortrait(name);
});

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateBtn.click();
});

// Generate initial portrait
generatePortrait('數據藝術');
