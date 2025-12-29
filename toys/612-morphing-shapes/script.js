const morphPath = document.getElementById('morphPath');
const shape1Btn = document.getElementById('shape1');
const shape2Btn = document.getElementById('shape2');
const shape3Btn = document.getElementById('shape3');
const shape4Btn = document.getElementById('shape4');
const autoBtn = document.getElementById('autoBtn');

const shapes = {
    diamond: 'M100,20 L180,100 L100,180 L20,100 Z',
    circle: 'M100,20 C144,20 180,56 180,100 C180,144 144,180 100,180 C56,180 20,144 20,100 C20,56 56,20 100,20 Z',
    star: 'M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z',
    square: 'M30,30 L170,30 L170,170 L30,170 Z'
};

let autoInterval = null;
let currentIndex = 0;
const shapeOrder = ['diamond', 'circle', 'star', 'square'];
const buttons = [shape1Btn, shape2Btn, shape3Btn, shape4Btn];

function setShape(shapeName, btn) {
    morphPath.setAttribute('d', shapes[shapeName]);
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentIndex = shapeOrder.indexOf(shapeName);
}

function toggleAuto() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        autoBtn.classList.remove('active');
        autoBtn.textContent = '自動';
    } else {
        autoBtn.classList.add('active');
        autoBtn.textContent = '停止';
        autoInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % shapeOrder.length;
            setShape(shapeOrder[currentIndex], buttons[currentIndex]);
        }, 1500);
    }
}

shape1Btn.addEventListener('click', () => { if (autoInterval) toggleAuto(); setShape('diamond', shape1Btn); });
shape2Btn.addEventListener('click', () => { if (autoInterval) toggleAuto(); setShape('circle', shape2Btn); });
shape3Btn.addEventListener('click', () => { if (autoInterval) toggleAuto(); setShape('star', shape3Btn); });
shape4Btn.addEventListener('click', () => { if (autoInterval) toggleAuto(); setShape('square', shape4Btn); });
autoBtn.addEventListener('click', toggleAuto);
