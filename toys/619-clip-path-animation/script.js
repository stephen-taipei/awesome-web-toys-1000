const clippedRect = document.getElementById('clippedRect');
const circleClipShape = document.getElementById('circleClipShape');
const starClipShape = document.getElementById('starClipShape');
const diamondClipShape = document.getElementById('diamondClipShape');
const hexClipShape = document.getElementById('hexClipShape');

const clip1Btn = document.getElementById('clip1');
const clip2Btn = document.getElementById('clip2');
const clip3Btn = document.getElementById('clip3');
const clip4Btn = document.getElementById('clip4');
const replayBtn = document.getElementById('replayBtn');

const buttons = [clip1Btn, clip2Btn, clip3Btn, clip4Btn];
let currentClip = 'circleClip';
let animationId = null;

function resetClips() {
    circleClipShape.setAttribute('r', '0');
    starClipShape.setAttribute('points', '100,100 100,100 100,100 100,100 100,100');
    diamondClipShape.setAttribute('points', '100,100 100,100 100,100 100,100');
    hexClipShape.setAttribute('points', '100,100 100,100 100,100 100,100 100,100 100,100');
    if (animationId) cancelAnimationFrame(animationId);
}

function animateCircleClip() {
    let r = 0;
    function step() {
        r += 2;
        if (r <= 120) {
            circleClipShape.setAttribute('r', r);
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateStarClip() {
    let scale = 0;
    const cx = 100, cy = 100;
    const outerR = 100, innerR = 40;

    function step() {
        scale += 0.02;
        if (scale <= 1) {
            const points = [];
            for (let i = 0; i < 5; i++) {
                const outerAngle = (i * 72 - 90) * Math.PI / 180;
                const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
                points.push(`${cx + outerR * scale * Math.cos(outerAngle)},${cy + outerR * scale * Math.sin(outerAngle)}`);
                points.push(`${cx + innerR * scale * Math.cos(innerAngle)},${cy + innerR * scale * Math.sin(innerAngle)}`);
            }
            starClipShape.setAttribute('points', points.join(' '));
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateDiamondClip() {
    let scale = 0;
    const cx = 100, cy = 100, size = 100;

    function step() {
        scale += 0.02;
        if (scale <= 1) {
            const s = size * scale;
            diamondClipShape.setAttribute('points',
                `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`
            );
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function animateHexClip() {
    let scale = 0;
    const cx = 100, cy = 100, r = 100;

    function step() {
        scale += 0.02;
        if (scale <= 1) {
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 - 90) * Math.PI / 180;
                points.push(`${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`);
            }
            hexClipShape.setAttribute('points', points.join(' '));
            animationId = requestAnimationFrame(step);
        }
    }
    step();
}

function setClip(clipId, btn) {
    resetClips();
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentClip = clipId;
    clippedRect.setAttribute('clip-path', `url(#${clipId})`);

    setTimeout(() => {
        switch(clipId) {
            case 'circleClip': animateCircleClip(); break;
            case 'starClip': animateStarClip(); break;
            case 'diamondClip': animateDiamondClip(); break;
            case 'hexClip': animateHexClip(); break;
        }
    }, 100);
}

function replay() {
    const activeBtn = buttons.find(b => b.classList.contains('active'));
    setClip(currentClip, activeBtn);
}

clip1Btn.addEventListener('click', () => setClip('circleClip', clip1Btn));
clip2Btn.addEventListener('click', () => setClip('starClip', clip2Btn));
clip3Btn.addEventListener('click', () => setClip('diamondClip', clip3Btn));
clip4Btn.addEventListener('click', () => setClip('hexClip', clip4Btn));
replayBtn.addEventListener('click', replay);

// Initialize
setClip('circleClip', clip1Btn);
