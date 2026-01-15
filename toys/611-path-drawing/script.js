const paths = document.querySelectorAll('.draw-path');
const shape1Btn = document.getElementById('shape1');
const shape2Btn = document.getElementById('shape2');
const shape3Btn = document.getElementById('shape3');
const shape4Btn = document.getElementById('shape4');
const replayBtn = document.getElementById('replayBtn');

const pathMap = {
    shape1: 'path1',
    shape2: 'path2',
    shape3: 'circle1',
    shape4: 'rect1'
};

let currentPath = 'path1';

function showPath(pathId, btn) {
    paths.forEach(p => {
        p.classList.remove('active');
        p.style.animation = 'none';
    });

    [shape1Btn, shape2Btn, shape3Btn, shape4Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentPath = pathId;

    setTimeout(() => {
        const path = document.getElementById(pathId);
        const length = path.getTotalLength ? path.getTotalLength() : 1000;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.animation = '';
        path.classList.add('active');
    }, 50);
}

function replay() {
    const path = document.getElementById(currentPath);
    path.classList.remove('active');
    path.style.animation = 'none';

    setTimeout(() => {
        path.style.animation = '';
        path.classList.add('active');
    }, 50);
}

shape1Btn.addEventListener('click', () => showPath('path1', shape1Btn));
shape2Btn.addEventListener('click', () => showPath('path2', shape2Btn));
shape3Btn.addEventListener('click', () => showPath('circle1', shape3Btn));
shape4Btn.addEventListener('click', () => showPath('rect1', shape4Btn));
replayBtn.addEventListener('click', replay);

// Initialize
showPath('path1', shape1Btn);
