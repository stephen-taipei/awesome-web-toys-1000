const original = document.getElementById('original');
const dithered = document.getElementById('dithered');
const origCtx = original.getContext('2d');
const dithCtx = dithered.getContext('2d');

const size = 64;
original.width = size;
original.height = size;
dithered.width = size;
dithered.height = size;

const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
];

function generateGradient() {
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const gray = Math.floor((x / size) * 255);
            origCtx.fillStyle = `rgb(${gray},${gray},${gray})`;
            origCtx.fillRect(x, y, 1, 1);
        }
    }
    applyDither();
}

function applyDither() {
    const type = document.getElementById('ditherType').value;
    const threshold = document.getElementById('threshold').value;
    const imageData = origCtx.getImageData(0, 0, size, size);
    const data = new Uint8ClampedArray(imageData.data);

    if (type === 'ordered') {
        orderedDither(data, threshold);
    } else if (type === 'floyd') {
        floydSteinberg(data);
    } else {
        patternDither(data, threshold);
    }

    const output = new ImageData(data, size, size);
    dithCtx.putImageData(output, 0, 0);
}

function orderedDither(data, levels) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const gray = data[i];
            const bayerValue = bayerMatrix[y % 4][x % 4] * (256 / 16);
            const newColor = gray + bayerValue / levels > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = newColor;
        }
    }
}

function floydSteinberg(data) {
    const errors = new Float32Array(size * size);
    for (let i = 0; i < size * size; i++) errors[i] = data[i * 4];

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = y * size + x;
            const oldVal = errors[i];
            const newVal = oldVal > 127 ? 255 : 0;
            const error = oldVal - newVal;

            data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = newVal;

            if (x + 1 < size) errors[i + 1] += error * 7 / 16;
            if (y + 1 < size) {
                if (x > 0) errors[i + size - 1] += error * 3 / 16;
                errors[i + size] += error * 5 / 16;
                if (x + 1 < size) errors[i + size + 1] += error * 1 / 16;
            }
        }
    }
}

function patternDither(data, levels) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const gray = data[i];
            const pattern = ((x + y) % levels) * (256 / levels);
            const newColor = gray > pattern ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = newColor;
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generateGradient);
document.getElementById('ditherType').addEventListener('change', applyDither);
document.getElementById('threshold').addEventListener('input', applyDither);

generateGradient();
