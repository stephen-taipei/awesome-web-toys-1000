const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let cReal = -0.7;
let cImag = 0.27015;
const maxIterations = 80;

function randomize() {
    cReal = Math.random() * 2 - 1;
    cImag = Math.random() * 2 - 1;
    render();
}

function julia(zx, zy) {
    let iteration = 0;

    while (zx * zx + zy * zy <= 4 && iteration < maxIterations) {
        const xTemp = zx * zx - zy * zy + cReal;
        zy = 2 * zx * zy + cImag;
        zx = xTemp;
        iteration++;
    }

    return iteration;
}

function render() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let py = 0; py < canvas.height; py++) {
        for (let px = 0; px < canvas.width; px++) {
            const x = (px - canvas.width / 2) * 3 / canvas.width;
            const y = (py - canvas.height / 2) * 3 / canvas.height;

            const iteration = julia(x, y);
            const i = (py * canvas.width + px) * 4;

            if (iteration === maxIterations) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            } else {
                const t = iteration / maxIterations;
                data[i] = Math.floor(186 * t);
                data[i + 1] = Math.floor(104 * (1 - t));
                data[i + 2] = Math.floor(200 * t);
            }
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    drawInfo();
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 140, 50);

    ctx.fillStyle = '#BA68C8';
    ctx.font = '11px Arial';
    ctx.fillText(`c = ${cReal.toFixed(3)}`, 20, 28);
    ctx.fillText(`    + ${cImag.toFixed(3)}i`, 20, 45);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    cReal = (px / canvas.width) * 2 - 1;
    cImag = (py / canvas.height) * 2 - 1;

    render();
});

document.getElementById('randomBtn').addEventListener('click', randomize);

render();
