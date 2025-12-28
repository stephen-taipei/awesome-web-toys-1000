const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 200;
canvas.width = size; canvas.height = size;

function init() {
    document.getElementById('generateBtn').addEventListener('click', generate);
    drawEmpty();
}

function drawEmpty() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ccc';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('輸入文字後點擊產生', size/2, size/2);
}

function generate() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) {
        drawEmpty();
        return;
    }

    const qrSize = 21;
    const cellSize = Math.floor(size / qrSize);
    const offset = (size - qrSize * cellSize) / 2;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    const data = generateQRData(text, qrSize);

    ctx.fillStyle = '#000';
    for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
            if (data[y][x]) {
                ctx.fillRect(offset + x * cellSize, offset + y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function generateQRData(text, qrSize) {
    const data = Array(qrSize).fill().map(() => Array(qrSize).fill(false));

    drawFinderPattern(data, 0, 0);
    drawFinderPattern(data, qrSize - 7, 0);
    drawFinderPattern(data, 0, qrSize - 7);

    for (let i = 8; i < qrSize - 8; i++) {
        data[6][i] = i % 2 === 0;
        data[i][6] = i % 2 === 0;
    }

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
    }

    const random = (seed) => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed;
    };

    let seed = Math.abs(hash);
    for (let y = 0; y < qrSize; y++) {
        for (let x = 0; x < qrSize; x++) {
            if (!isReserved(x, y, qrSize)) {
                seed = random(seed);
                data[y][x] = (seed % 2 === 0);
            }
        }
    }

    return data;
}

function drawFinderPattern(data, startX, startY) {
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
            const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
            data[startY + y][startX + x] = isOuter || isInner;
        }
    }
}

function isReserved(x, y, qrSize) {
    if (x < 8 && y < 8) return true;
    if (x >= qrSize - 8 && y < 8) return true;
    if (x < 8 && y >= qrSize - 8) return true;
    if (x === 6 || y === 6) return true;
    return false;
}

document.addEventListener('DOMContentLoaded', init);
