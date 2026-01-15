const layers = {
    1: document.getElementById('layer1'),
    2: document.getElementById('layer2'),
    3: document.getElementById('layer3')
};

const contexts = {};
let currentLayer = 3;
let drawing = false;
let color = '#00b894';

Object.keys(layers).forEach(key => {
    const canvas = layers[key];
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    contexts[key] = canvas.getContext('2d');
});

function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    return { x: x * canvas.width / rect.width, y: y * canvas.height / rect.height };
}

function startDraw(e) {
    drawing = true;
    const ctx = contexts[currentLayer];
    const pos = getPos(e, layers[currentLayer]);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = contexts[currentLayer];
    const pos = getPos(e, layers[currentLayer]);

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function endDraw() {
    drawing = false;
}

// Add events to top layer only
const topLayer = layers[3];
topLayer.addEventListener('mousedown', startDraw);
topLayer.addEventListener('mousemove', draw);
topLayer.addEventListener('mouseup', endDraw);
topLayer.addEventListener('mouseleave', endDraw);
topLayer.addEventListener('touchstart', startDraw);
topLayer.addEventListener('touchmove', draw);
topLayer.addEventListener('touchend', endDraw);

document.querySelectorAll('.layer-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.layer-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentLayer = parseInt(item.dataset.layer);
    });
});

document.getElementById('colorPicker').addEventListener('input', (e) => color = e.target.value);
document.getElementById('clearBtn').addEventListener('click', () => {
    const ctx = contexts[currentLayer];
    ctx.clearRect(0, 0, layers[currentLayer].width, layers[currentLayer].height);
});
