const imageCanvas = document.getElementById('imageCanvas');
const histCanvas = document.getElementById('histCanvas');
const imgCtx = imageCanvas.getContext('2d');
const histCtx = histCanvas.getContext('2d');

imageCanvas.width = 370;
imageCanvas.height = 150;
histCanvas.width = 370;
histCanvas.height = 120;

let imageData = null;
let channel = 'red';

function generateImage() {
    for (let y = 0; y < imageCanvas.height; y++) {
        for (let x = 0; x < imageCanvas.width; x++) {
            const r = Math.floor(Math.sin(x * 0.03 + Math.random() * 0.5) * 127 + 128);
            const g = Math.floor(Math.sin(y * 0.04 + Math.random() * 0.5) * 127 + 128);
            const b = Math.floor(Math.sin((x + y) * 0.02 + Math.random() * 0.5) * 127 + 128);
            imgCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            imgCtx.fillRect(x, y, 1, 1);
        }
    }

    imgCtx.fillStyle = 'rgba(255,0,0,0.7)';
    imgCtx.beginPath();
    imgCtx.arc(60, 75, 35, 0, Math.PI * 2);
    imgCtx.fill();

    imgCtx.fillStyle = 'rgba(0,255,0,0.7)';
    imgCtx.fillRect(140, 40, 60, 70);

    imgCtx.fillStyle = 'rgba(0,0,255,0.7)';
    imgCtx.beginPath();
    imgCtx.arc(280, 75, 35, 0, Math.PI * 2);
    imgCtx.fill();

    imageData = imgCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    drawHistogram();
}

function drawHistogram() {
    if (!imageData) return;

    const histogram = new Array(256).fill(0);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let value;
        if (channel === 'red') value = data[i];
        else if (channel === 'green') value = data[i + 1];
        else if (channel === 'blue') value = data[i + 2];
        else value = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        histogram[value]++;
    }

    const max = Math.max(...histogram);

    histCtx.fillStyle = 'rgba(0,0,0,0.8)';
    histCtx.fillRect(0, 0, histCanvas.width, histCanvas.height);

    const colors = { red: '#e74c3c', green: '#2ecc71', blue: '#3498db', luma: '#9b59b6' };
    histCtx.fillStyle = colors[channel];

    const barWidth = histCanvas.width / 256;
    for (let i = 0; i < 256; i++) {
        const height = (histogram[i] / max) * (histCanvas.height - 10);
        histCtx.fillRect(i * barWidth, histCanvas.height - height, barWidth, height);
    }
}

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        channel = btn.id;
        drawHistogram();
    });
});

document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
