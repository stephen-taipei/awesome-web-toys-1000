const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Simulation parameters
let N = 128; // Grid size
let visc = 0.0003;
let diff = 0.00002;
let dyeAmount = 150;
let rainbowMode = true;
let dt = 0.1;

// Fluid arrays
let size;
let u, v, u_prev, v_prev;
let dens, dens_prev;

// UI elements
const viscositySlider = document.getElementById('viscositySlider');
const diffusionSlider = document.getElementById('diffusionSlider');
const dyeSlider = document.getElementById('dyeSlider');
const rainbowCheckbox = document.getElementById('rainbow');
const clearBtn = document.getElementById('clearBtn');

// Mouse state
let mouseX = 0, mouseY = 0;
let prevMouseX = 0, prevMouseY = 0;
let isMouseDown = false;
let hue = 0;

function init() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Adjust grid size based on screen
    N = Math.min(128, Math.floor(Math.min(w, h) / 4));
    size = (N + 2) * (N + 2);

    canvas.width = w;
    canvas.height = h;

    // Initialize arrays
    u = new Float32Array(size);
    v = new Float32Array(size);
    u_prev = new Float32Array(size);
    v_prev = new Float32Array(size);
    dens = new Float32Array(size * 3); // RGB
    dens_prev = new Float32Array(size * 3);
}

function IX(x, y) {
    x = Math.max(0, Math.min(N + 1, x));
    y = Math.max(0, Math.min(N + 1, y));
    return x + (N + 2) * y;
}

function addSource(x, s, dt) {
    for (let i = 0; i < size; i++) {
        x[i] += dt * s[i];
    }
}

function addSourceRGB(x, s, dt) {
    for (let i = 0; i < size * 3; i++) {
        x[i] += dt * s[i];
    }
}

function setBnd(b, x) {
    for (let i = 1; i <= N; i++) {
        x[IX(0, i)] = b === 1 ? -x[IX(1, i)] : x[IX(1, i)];
        x[IX(N + 1, i)] = b === 1 ? -x[IX(N, i)] : x[IX(N, i)];
        x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
        x[IX(i, N + 1)] = b === 2 ? -x[IX(i, N)] : x[IX(i, N)];
    }
    x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
    x[IX(0, N + 1)] = 0.5 * (x[IX(1, N + 1)] + x[IX(0, N)]);
    x[IX(N + 1, 0)] = 0.5 * (x[IX(N, 0)] + x[IX(N + 1, 1)]);
    x[IX(N + 1, N + 1)] = 0.5 * (x[IX(N, N + 1)] + x[IX(N + 1, N)]);
}

function linSolve(b, x, x0, a, c) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < 4; k++) {
        for (let j = 1; j <= N; j++) {
            for (let i = 1; i <= N; i++) {
                x[IX(i, j)] = (x0[IX(i, j)] + a * (
                    x[IX(i + 1, j)] + x[IX(i - 1, j)] +
                    x[IX(i, j + 1)] + x[IX(i, j - 1)]
                )) * cRecip;
            }
        }
        setBnd(b, x);
    }
}

function diffuse(b, x, x0, diff, dt) {
    const a = dt * diff * N * N;
    linSolve(b, x, x0, a, 1 + 4 * a);
}

function advect(b, d, d0, u, v, dt) {
    const dt0 = dt * N;
    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            let x = i - dt0 * u[IX(i, j)];
            let y = j - dt0 * v[IX(i, j)];

            if (x < 0.5) x = 0.5;
            if (x > N + 0.5) x = N + 0.5;
            const i0 = Math.floor(x);
            const i1 = i0 + 1;

            if (y < 0.5) y = 0.5;
            if (y > N + 0.5) y = N + 0.5;
            const j0 = Math.floor(y);
            const j1 = j0 + 1;

            const s1 = x - i0;
            const s0 = 1 - s1;
            const t1 = y - j0;
            const t0 = 1 - t1;

            d[IX(i, j)] = s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
                          s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
        }
    }
    setBnd(b, d);
}

function project(u, v, p, div) {
    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            div[IX(i, j)] = -0.5 * (
                u[IX(i + 1, j)] - u[IX(i - 1, j)] +
                v[IX(i, j + 1)] - v[IX(i, j - 1)]
            ) / N;
            p[IX(i, j)] = 0;
        }
    }
    setBnd(0, div);
    setBnd(0, p);

    linSolve(0, p, div, 1, 4);

    for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
            u[IX(i, j)] -= 0.5 * N * (p[IX(i + 1, j)] - p[IX(i - 1, j)]);
            v[IX(i, j)] -= 0.5 * N * (p[IX(i, j + 1)] - p[IX(i, j - 1)]);
        }
    }
    setBnd(1, u);
    setBnd(2, v);
}

function velStep(u, v, u0, v0, visc, dt) {
    addSource(u, u0, dt);
    addSource(v, v0, dt);

    [u0, u] = [u, u0];
    diffuse(1, u, u0, visc, dt);

    [v0, v] = [v, v0];
    diffuse(2, v, v0, visc, dt);

    project(u, v, u0, v0);

    [u0, u] = [u, u0];
    [v0, v] = [v, v0];

    advect(1, u, u0, u0, v0, dt);
    advect(2, v, v0, u0, v0, dt);

    project(u, v, u0, v0);
}

function densStep(x, x0, u, v, diff, dt) {
    addSourceRGB(x, x0, dt);

    // Diffuse and advect for each color channel
    for (let c = 0; c < 3; c++) {
        const offset = c * size;
        const xc = x.subarray(offset, offset + size);
        const x0c = x0.subarray(offset, offset + size);

        const temp = new Float32Array(size);
        for (let i = 0; i < size; i++) temp[i] = xc[i];

        diffuse(0, xc, temp, diff, dt);

        for (let i = 0; i < size; i++) temp[i] = xc[i];
        advect(0, xc, temp, u, v, dt);
    }
}

function simulate() {
    velStep(u, v, u_prev, v_prev, visc, dt);
    densStep(dens, dens_prev, u, v, diff, dt);

    // Clear sources
    u_prev.fill(0);
    v_prev.fill(0);
    dens_prev.fill(0);
}

function render() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const cellW = canvas.width / N;
    const cellH = canvas.height / N;

    for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
            const idx = IX(i + 1, j + 1);

            const r = Math.min(255, dens[idx] * 2);
            const g = Math.min(255, dens[idx + size] * 2);
            const b = Math.min(255, dens[idx + size * 2] * 2);

            // Fill the cell
            const startX = Math.floor(i * cellW);
            const startY = Math.floor(j * cellH);
            const endX = Math.floor((i + 1) * cellW);
            const endY = Math.floor((j + 1) * cellH);

            for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                    const pidx = (py * canvas.width + px) * 4;
                    data[pidx] = r;
                    data[pidx + 1] = g;
                    data[pidx + 2] = b;
                    data[pidx + 3] = 255;
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function addInteraction() {
    if (!isMouseDown) return;

    const cellW = canvas.width / N;
    const cellH = canvas.height / N;

    const i = Math.floor(mouseX / cellW) + 1;
    const j = Math.floor(mouseY / cellH) + 1;

    if (i < 1 || i > N || j < 1 || j > N) return;

    // Add velocity
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;

    const idx = IX(i, j);
    u_prev[idx] += dx * 5;
    v_prev[idx] += dy * 5;

    // Add dye
    if (rainbowMode) {
        const h = hue / 360;
        const rgb = hslToRgb(h, 1, 0.5);
        dens_prev[idx] += rgb[0] * dyeAmount / 255;
        dens_prev[idx + size] += rgb[1] * dyeAmount / 255;
        dens_prev[idx + size * 2] += rgb[2] * dyeAmount / 255;
        hue = (hue + 1) % 360;
    } else {
        dens_prev[idx] += dyeAmount / 255 * 0.3;
        dens_prev[idx + size] += dyeAmount / 255 * 0.6;
        dens_prev[idx + size * 2] += dyeAmount / 255;
    }
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function animate() {
    addInteraction();
    simulate();
    render();

    prevMouseX = mouseX;
    prevMouseY = mouseY;

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
});

viscositySlider.addEventListener('input', () => {
    visc = parseFloat(viscositySlider.value);
});

diffusionSlider.addEventListener('input', () => {
    diff = parseFloat(diffusionSlider.value);
});

dyeSlider.addEventListener('input', () => {
    dyeAmount = parseInt(dyeSlider.value);
});

rainbowCheckbox.addEventListener('change', () => {
    rainbowMode = rainbowCheckbox.checked;
});

clearBtn.addEventListener('click', () => {
    dens.fill(0);
    dens_prev.fill(0);
    u.fill(0);
    v.fill(0);
    u_prev.fill(0);
    v_prev.fill(0);
});

window.addEventListener('resize', init);

// Initialize and start
init();
animate();
