const sourceCanvas = document.getElementById('sourceCanvas');
const ctx = sourceCanvas.getContext('2d');
const asciiOutput = document.getElementById('asciiOutput');
const resolutionInput = document.getElementById('resolution');

sourceCanvas.width = 370;
sourceCanvas.height = 280;

const asciiChars = ' .:-=+*#%@';

function generateImage() {
    const gradient = ctx.createRadialGradient(185, 140, 0, 185, 140, 150);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(0.5, '#888');
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(120, 100, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#aaa';
    ctx.fillRect(180, 80, 80, 80);

    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(300, 60);
    ctx.lineTo(350, 180);
    ctx.lineTo(250, 180);
    ctx.closePath();
    ctx.fill();

    convertToAscii();
}

function convertToAscii() {
    const resolution = parseInt(resolutionInput.value);
    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = imageData.data;

    let ascii = '';
    const cols = Math.floor(sourceCanvas.width / resolution);
    const rows = Math.floor(sourceCanvas.height / resolution);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let totalBrightness = 0;
            let count = 0;

            for (let dy = 0; dy < resolution; dy++) {
                for (let dx = 0; dx < resolution; dx++) {
                    const px = x * resolution + dx;
                    const py = y * resolution + dy;
                    const idx = (py * sourceCanvas.width + px) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    totalBrightness += brightness;
                    count++;
                }
            }

            const avgBrightness = totalBrightness / count;
            const charIndex = Math.floor((avgBrightness / 255) * (asciiChars.length - 1));
            ascii += asciiChars[charIndex];
        }
        ascii += '\n';
    }

    asciiOutput.textContent = ascii;
}

resolutionInput.addEventListener('input', convertToAscii);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
