const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const angle = document.getElementById('angle');
const linearGrad = document.getElementById('linearGrad');
const stop1 = document.getElementById('stop1');
const stop2 = document.getElementById('stop2');
const stop3 = document.getElementById('stop3');
const stop4 = document.getElementById('stop4');

function updateGradient() {
    const c1 = color1.value;
    const c2 = color2.value;
    const deg = angle.value;

    // Convert angle to x1,y1,x2,y2
    const rad = (deg * Math.PI) / 180;
    const x2 = 50 + 50 * Math.cos(rad);
    const y2 = 50 + 50 * Math.sin(rad);
    const x1 = 50 - 50 * Math.cos(rad);
    const y1 = 50 - 50 * Math.sin(rad);

    linearGrad.setAttribute('x1', `${x1}%`);
    linearGrad.setAttribute('y1', `${y1}%`);
    linearGrad.setAttribute('x2', `${x2}%`);
    linearGrad.setAttribute('y2', `${y2}%`);

    stop1.setAttribute('stop-color', c1);
    stop2.setAttribute('stop-color', c2);
    stop3.setAttribute('stop-color', c1);
    stop4.setAttribute('stop-color', c2);
}

color1.addEventListener('input', updateGradient);
color2.addEventListener('input', updateGradient);
angle.addEventListener('input', updateGradient);

updateGradient();
