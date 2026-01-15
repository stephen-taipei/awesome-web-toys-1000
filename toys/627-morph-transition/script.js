const shape = document.getElementById('morphShape');
const shapeInfo = document.getElementById('shapeInfo');
const buttons = document.querySelectorAll('.controls button');

const shapeNames = {
    circle: 'Circle',
    square: 'Square',
    triangle: 'Triangle',
    star: 'Star',
    heart: 'Heart'
};

function setShape(shapeName) {
    shape.className = 'morph-shape ' + shapeName;
    shapeInfo.textContent = shapeNames[shapeName];

    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shape === shapeName);
    });
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => setShape(btn.dataset.shape));
});

setShape('circle');
