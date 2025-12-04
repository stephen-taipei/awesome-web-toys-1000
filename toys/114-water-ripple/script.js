const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let rippleWidth, rippleHeight;
let currentBuffer, previousBuffer;
let rippleStrength = 200;
let damping = 0.98;
let rainMode = false;
let colorMode = 'blue';
let imageData;

const colorSchemes = {
    blue: {
        base: [0, 40, 80],
        highlight: [100, 200, 255],
        shadow: [0, 20, 60]
    },
    dark: {
        base: [10, 20, 30],
        highlight: [60, 100, 140],
        shadow: [5, 10, 20]
    },
    sunset: {
        base: [60, 30, 50],
        highlight: [255, 150, 100],
        shadow: [40, 20, 40]
    },
    neon: {
        base: [20, 10, 40],
        highlight: [255, 0, 255],
        shadow: [0, 255, 255]
    }
};

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Lower resolution for performance
    rippleWidth = Math.floor(width / 4);
    rippleHeight = Math.floor(height / 4);

    const size = rippleWidth * rippleHeight;
    currentBuffer = new Float32Array(size);
    previousBuffer = new Float32Array(size);

    imageData = ctx.createImageData(width, height);
}

function getIndex(x, y) {
    x = Math.max(0, Math.min(rippleWidth - 1, x));
    y = Math.max(0, Math.min(rippleHeight - 1, y));
    return y * rippleWidth + x;
}

function addRipple(x, y, strength) {
    const rx = Math.floor(x / 4);
    const ry = Math.floor(y / 4);
    const radius = 3;

    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                const nx = rx + dx;
                const ny = ry + dy;
                if (nx >= 0 && nx < rippleWidth && ny >= 0 && ny < rippleHeight) {
                    const factor = 1 - dist / radius;
                    currentBuffer[getIndex(nx, ny)] += strength * factor;
                }
            }
        }
    }
}

function updateRipples() {
    for (let y = 1; y < rippleHeight - 1; y++) {
        for (let x = 1; x < rippleWidth - 1; x++) {
            const idx = getIndex(x, y);

            // Wave equation: average of neighbors minus previous value
            const avg = (
                currentBuffer[getIndex(x - 1, y)] +
                currentBuffer[getIndex(x + 1, y)] +
                currentBuffer[getIndex(x, y - 1)] +
                currentBuffer[getIndex(x, y + 1)]
            ) / 2 - previousBuffer[idx];

            // Apply damping
            previousBuffer[idx] = avg * damping;
        }
    }

    // Swap buffers
    [currentBuffer, previousBuffer] = [previousBuffer, currentBuffer];
}

function render() {
    const data = imageData.data;
    const scheme = colorSchemes[colorMode];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const rx = Math.floor(x / 4);
            const ry = Math.floor(y / 4);

            // Get displacement from ripple
            const idx = getIndex(rx, ry);
            const displacement = currentBuffer[idx];

            // Calculate normal for lighting
            let nx = 0, ny = 0;
            if (rx > 0 && rx < rippleWidth - 1 && ry > 0 && ry < rippleHeight - 1) {
                nx = currentBuffer[getIndex(rx - 1, ry)] - currentBuffer[getIndex(rx + 1, ry)];
                ny = currentBuffer[getIndex(rx, ry - 1)] - currentBuffer[getIndex(rx, ry + 1)];
            }

            // Light direction effect
            const light = Math.max(0, Math.min(1, 0.5 + nx * 0.01 + ny * 0.01));

            // Color based on height and light
            const heightFactor = Math.max(0, Math.min(1, 0.5 + displacement * 0.005));

            let r, g, b;

            if (displacement > 5) {
                // Highlight
                r = scheme.base[0] + (scheme.highlight[0] - scheme.base[0]) * heightFactor * light;
                g = scheme.base[1] + (scheme.highlight[1] - scheme.base[1]) * heightFactor * light;
                b = scheme.base[2] + (scheme.highlight[2] - scheme.base[2]) * heightFactor * light;
            } else if (displacement < -5) {
                // Shadow
                r = scheme.base[0] + (scheme.shadow[0] - scheme.base[0]) * (1 - heightFactor);
                g = scheme.base[1] + (scheme.shadow[1] - scheme.base[1]) * (1 - heightFactor);
                b = scheme.base[2] + (scheme.shadow[2] - scheme.base[2]) * (1 - heightFactor);
            } else {
                r = scheme.base[0];
                g = scheme.base[1];
                b = scheme.base[2];
            }

            const pixelIdx = (y * width + x) * 4;
            data[pixelIdx] = Math.max(0, Math.min(255, r));
            data[pixelIdx + 1] = Math.max(0, Math.min(255, g));
            data[pixelIdx + 2] = Math.max(0, Math.min(255, b));
            data[pixelIdx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Add subtle shimmer effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 20; i++) {
        const sx = Math.random() * width;
        const sy = Math.random() * height;
        const rx = Math.floor(sx / 4);
        const ry = Math.floor(sy / 4);
        const disp = currentBuffer[getIndex(rx, ry)];
        if (disp > 10) {
            ctx.beginPath();
            ctx.arc(sx, sy, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function animate() {
    updateRipples();
    render();

    // Rain mode
    if (rainMode && Math.random() < 0.1) {
        addRipple(
            Math.random() * width,
            Math.random() * height,
            50 + Math.random() * 100
        );
    }

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    addRipple(e.clientX, e.clientY, rippleStrength);
});

canvas.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        addRipple(e.clientX, e.clientY, rippleStrength * 0.3);
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
        addRipple(touch.clientX, touch.clientY, rippleStrength);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of e.touches) {
        addRipple(touch.clientX, touch.clientY, rippleStrength * 0.3);
    }
});

// UI controls
document.getElementById('strengthSlider').addEventListener('input', (e) => {
    rippleStrength = parseInt(e.target.value);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
});

document.getElementById('rainMode').addEventListener('change', (e) => {
    rainMode = e.target.checked;
});

document.getElementById('colorSelect').addEventListener('change', (e) => {
    colorMode = e.target.value;
});

document.getElementById('clearBtn').addEventListener('click', () => {
    currentBuffer.fill(0);
    previousBuffer.fill(0);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
