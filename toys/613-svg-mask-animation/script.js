const maskedImage = document.getElementById('maskedImage');
const maskCircle = document.getElementById('maskCircle');
const wipeRect = document.getElementById('wipeRect');
const radialEllipse = document.getElementById('radialEllipse');
const stripeGroup = document.getElementById('stripeGroup');

const mask1Btn = document.getElementById('mask1');
const mask2Btn = document.getElementById('mask2');
const mask3Btn = document.getElementById('mask3');
const mask4Btn = document.getElementById('mask4');
const replayBtn = document.getElementById('replayBtn');

const buttons = [mask1Btn, mask2Btn, mask3Btn, mask4Btn];
let currentMask = 'circleMask';
let animationId = null;

function resetMasks() {
    maskCircle.setAttribute('r', '0');
    wipeRect.setAttribute('width', '0');
    radialEllipse.setAttribute('rx', '0');
    radialEllipse.setAttribute('ry', '0');
    stripeGroup.innerHTML = '';
    if (animationId) cancelAnimationFrame(animationId);
}

function animateCircleMask() {
    let r = 0;
    const maxR = 150;
    function step() {
        r += 2;
        if (r <= maxR) {
            maskCircle.setAttribute('r', r);
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateWipeMask() {
    let w = 0;
    function step() {
        w += 3;
        if (w <= 200) {
            wipeRect.setAttribute('width', w);
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateRadialMask() {
    let rx = 0, ry = 0;
    function step() {
        rx += 2.5;
        ry += 1.5;
        if (rx <= 150) {
            radialEllipse.setAttribute('rx', rx);
            radialEllipse.setAttribute('ry', ry);
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateStripeMask() {
    const stripeCount = 10;
    const stripeWidth = 200 / stripeCount;
    stripeGroup.innerHTML = '';

    for (let i = 0; i < stripeCount; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i * stripeWidth);
        rect.setAttribute('y', '200');
        rect.setAttribute('width', stripeWidth);
        rect.setAttribute('height', '0');
        rect.setAttribute('fill', 'white');
        stripeGroup.appendChild(rect);
    }

    let progress = 0;
    function step() {
        progress += 3;
        const rects = stripeGroup.querySelectorAll('rect');
        rects.forEach((rect, i) => {
            const delay = i * 10;
            const h = Math.max(0, Math.min(200, progress - delay));
            rect.setAttribute('height', h);
            rect.setAttribute('y', 200 - h);
        });
        if (progress < 300) {
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function setMask(maskId, btn) {
    resetMasks();
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMask = maskId;
    maskedImage.setAttribute('mask', `url(#${maskId})`);

    setTimeout(() => {
        switch(maskId) {
            case 'circleMask': animateCircleMask(); break;
            case 'wipeMask': animateWipeMask(); break;
            case 'radialMask': animateRadialMask(); break;
            case 'stripeMask': animateStripeMask(); break;
        }
    }, 100);
}

function replay() {
    const activeBtn = buttons.find(b => b.classList.contains('active'));
    setMask(currentMask, activeBtn);
}

mask1Btn.addEventListener('click', () => setMask('circleMask', mask1Btn));
mask2Btn.addEventListener('click', () => setMask('wipeMask', mask2Btn));
mask3Btn.addEventListener('click', () => setMask('radialMask', mask3Btn));
mask4Btn.addEventListener('click', () => setMask('stripeMask', mask4Btn));
replayBtn.addEventListener('click', replay);

// Initialize
setMask('circleMask', mask1Btn);
