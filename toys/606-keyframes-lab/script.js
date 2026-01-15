const animatedEl = document.getElementById('animatedEl');
const startX = document.getElementById('startX');
const endX = document.getElementById('endX');
const startY = document.getElementById('startY');
const endY = document.getElementById('endY');
const rotation = document.getElementById('rotation');
const scale = document.getElementById('scale');
const duration = document.getElementById('duration');
const durationVal = document.getElementById('durationVal');

let styleSheet = null;

function updateAnimation() {
    const sx = startX.value;
    const ex = endX.value;
    const sy = startY.value;
    const ey = endY.value;
    const rot = rotation.value;
    const sc = scale.value / 100;
    const dur = duration.value;

    durationVal.textContent = (dur / 1000).toFixed(1) + 's';

    // Remove old stylesheet
    if (styleSheet) {
        styleSheet.remove();
    }

    // Create new keyframes
    styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes customAnim {
            0% {
                transform: translate(${sx}px, ${sy}px) rotate(0deg) scale(1);
            }
            50% {
                transform: translate(${ex}px, ${ey}px) rotate(${rot / 2}deg) scale(${sc});
            }
            100% {
                transform: translate(${sx}px, ${sy}px) rotate(${rot}deg) scale(1);
            }
        }
        .animated-element {
            animation: customAnim ${dur}ms ease-in-out infinite;
        }
    `;
    document.head.appendChild(styleSheet);
}

[startX, endX, startY, endY, rotation, scale, duration].forEach(input => {
    input.addEventListener('input', updateAnimation);
});

updateAnimation();
