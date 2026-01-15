const container = document.getElementById('glitchContainer');
const triggerBtn = document.getElementById('triggerGlitch');
const autoBtn = document.getElementById('autoGlitch');

let autoMode = false;
let autoInterval = null;

function triggerGlitch() {
    container.classList.add('glitching');
    setTimeout(() => {
        container.classList.remove('glitching');
    }, 500);
}

function toggleAutoMode() {
    autoMode = !autoMode;
    autoBtn.classList.toggle('active', autoMode);

    if (autoMode) {
        autoInterval = setInterval(() => {
            if (Math.random() > 0.5) {
                triggerGlitch();
            }
        }, 1000);
    } else {
        clearInterval(autoInterval);
    }
}

triggerBtn.addEventListener('click', triggerGlitch);
autoBtn.addEventListener('click', toggleAutoMode);
