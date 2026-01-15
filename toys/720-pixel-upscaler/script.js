const original = document.getElementById('original');
const nearest = document.getElementById('nearest');
const scale2x = document.getElementById('scale2x');

const origCtx = original.getContext('2d');
const nearCtx = nearest.getContext('2d');
const scaleCtx = scale2x.getContext('2d');

const size = 8;
original.width = size;
original.height = size;
nearest.width = size * 2;
nearest.height = size * 2;
scale2x.width = size * 2;
scale2x.height = size * 2;

const colors = ['#16a085', '#1abc9c', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12', '#3498db'];

function generateRandom() {
    origCtx.fillStyle = '#222';
    origCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (Math.random() > 0.5) {
                origCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                origCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    applyUpscaling();
}

function applyUpscaling() {
    // Nearest neighbor
    nearCtx.imageSmoothingEnabled = false;
    nearCtx.drawImage(original, 0, 0, size * 2, size * 2);

    // Scale2x algorithm
    const srcData = origCtx.getImageData(0, 0, size, size);
    const dstData = scaleCtx.createImageData(size * 2, size * 2);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const srcIdx = (y * size + x) * 4;
            const A = getPixelSafe(srcData, x, y - 1);
            const B = getPixelSafe(srcData, x - 1, y);
            const C = getPixelSafe(srcData, x, y);
            const D = getPixelSafe(srcData, x + 1, y);
            const E = getPixelSafe(srcData, x, y + 1);

            let E0, E1, E2, E3;

            if (!colorsEqual(B, D) && !colorsEqual(A, E)) {
                E0 = colorsEqual(A, B) ? A : C;
                E1 = colorsEqual(A, D) ? A : C;
                E2 = colorsEqual(E, B) ? E : C;
                E3 = colorsEqual(E, D) ? E : C;
            } else {
                E0 = E1 = E2 = E3 = C;
            }

            setPixel(dstData, x * 2, y * 2, E0, size * 2);
            setPixel(dstData, x * 2 + 1, y * 2, E1, size * 2);
            setPixel(dstData, x * 2, y * 2 + 1, E2, size * 2);
            setPixel(dstData, x * 2 + 1, y * 2 + 1, E3, size * 2);
        }
    }

    scaleCtx.putImageData(dstData, 0, 0);
}

function getPixelSafe(data, x, y) {
    x = Math.max(0, Math.min(size - 1, x));
    y = Math.max(0, Math.min(size - 1, y));
    const idx = (y * size + x) * 4;
    return [data.data[idx], data.data[idx + 1], data.data[idx + 2], data.data[idx + 3]];
}

function setPixel(data, x, y, color, w) {
    const idx = (y * w + x) * 4;
    data.data[idx] = color[0];
    data.data[idx + 1] = color[1];
    data.data[idx + 2] = color[2];
    data.data[idx + 3] = color[3];
}

function colorsEqual(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

document.getElementById('randomBtn').addEventListener('click', generateRandom);
generateRandom();
