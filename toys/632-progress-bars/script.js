const fills = document.querySelectorAll('.progress-fill[data-progress]');
const animateBtn = document.getElementById('animateBtn');
const resetBtn = document.getElementById('resetBtn');

function animate() {
    fills.forEach(fill => {
        fill.style.width = fill.dataset.progress + '%';
    });
}

function reset() {
    fills.forEach(fill => {
        fill.style.width = '0%';
    });
}

animateBtn.addEventListener('click', animate);
resetBtn.addEventListener('click', reset);

setTimeout(animate, 500);
