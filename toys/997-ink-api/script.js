const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d', { desynchronized: true }); // 'desynchronized' hint for low latency
const clearBtn = document.getElementById('clearBtn');
const colorPicker = document.getElementById('colorPicker');
const sizePicker = document.getElementById('sizePicker');
const sizeValue = document.getElementById('sizeValue');
const inkStatus = document.getElementById('inkStatus');

// Setup canvas resolution
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// State
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let inkPresenter = null;

// Initialize Ink API
async function initInk() {
    if (navigator.ink) {
        try {
            inkPresenter = await navigator.ink.requestPresenter({ presentationArea: canvas });
            inkStatus.textContent = "Active (Hardware Accelerated)";
            inkStatus.style.color = "#55efc4";
        } catch (e) {
            console.error("Ink API error:", e);
            inkStatus.textContent = "Error (Fallback to Canvas)";
            inkStatus.style.color = "#fab1a0";
        }
    } else {
        inkStatus.textContent = "Not Supported (Standard Canvas)";
        inkStatus.style.color = "#ffeaa7";
    }
}
initInk();

// Drawing Logic
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
    
    // Also draw a dot
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
}

function getCoordinates(e) {
    if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        return [
            e.touches[0].clientX - rect.left,
            e.touches[0].clientY - rect.top
        ];
    }
    return [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    // Prevent scrolling on touch
    if(e.type.includes('touch')) {
        e.preventDefault(); 
    }

    const [x, y] = getCoordinates(e);
    const color = colorPicker.value;
    const size = sizePicker.value;

    // 1. Standard Canvas Drawing (The "Trail")
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Ink API Prediction (The "Lead")
    if (inkPresenter && e.pointerType !== 'mouse') { // Ink API often works best with pen/touch events
        // The Ink API requires the raw PointerEvent to predict the trail
        if (e instanceof PointerEvent) {
             inkPresenter.updateInkTrailStartPoint(e, {
                 color: color,
                 diameter: parseInt(size)
             });
        }
    }

    [lastX, lastY] = [x, y];
}

// Event Listeners
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerout', stopDrawing);

// Touch fallbacks if pointer events aren't perfect on some devices
canvas.addEventListener('touchstart', startDrawing, {passive: false});
canvas.addEventListener('touchmove', draw, {passive: false});
canvas.addEventListener('touchend', stopDrawing);

// Controls
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

sizePicker.addEventListener('input', (e) => {
    sizeValue.textContent = `${e.target.value}px`;
});
