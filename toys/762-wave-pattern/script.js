const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const amplitudeInput = document.getElementById('amplitude');
const frequencyInput = document.getElementById('frequency');

canvas.width = 370;
canvas.height = 280;

function generate() {
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const amplitude = parseInt(amplitudeInput.value);
    const frequency = parseInt(frequencyInput.value);
    const layers = 8;
    const spacing = canvas.height / (layers + 1);

    for (let layer = 0; layer < layers; layer++) {
        const baseY = spacing * (layer + 1);
        const hue = (layer / layers) * 200 + 180;
        const phase = layer * 0.5;

        ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x++) {
            const y = baseY + Math.sin((x / canvas.width) * Math.PI * 2 * frequency + phase) * amplitude;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
amplitudeInput.addEventListener('input', generate);
frequencyInput.addEventListener('input', generate);

generate();
