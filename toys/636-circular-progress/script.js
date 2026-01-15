const circles = document.querySelectorAll('.circular-progress');
const animateBtn = document.getElementById('animateBtn');
const resetBtn = document.getElementById('resetBtn');

function animate() {
    circles.forEach(circle => {
        const value = parseInt(circle.dataset.value);
        const progress = circle.querySelector('.progress');
        const circumference = 2 * Math.PI * parseFloat(progress.getAttribute('r'));
        const offset = circumference - (value / 100) * circumference;
        progress.style.strokeDasharray = circumference;
        progress.style.strokeDashoffset = offset;
    });
}

function reset() {
    circles.forEach(circle => {
        const progress = circle.querySelector('.progress');
        const circumference = 2 * Math.PI * parseFloat(progress.getAttribute('r'));
        progress.style.strokeDasharray = circumference;
        progress.style.strokeDashoffset = circumference;
    });
}

animateBtn.addEventListener('click', animate);
resetBtn.addEventListener('click', reset);

setTimeout(animate, 500);
