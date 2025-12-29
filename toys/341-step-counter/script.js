let steps = 0;
const goal = 10000;
const stepLength = 0.0007; // km per step
const caloriesPerStep = 0.04;

function init() {
    document.getElementById('stepBtn').addEventListener('click', addSteps);
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
}

function addSteps() {
    const increment = Math.floor(Math.random() * 50) + 50; // 50-100 steps per click
    steps += increment;
    updateDisplay();
    animateButton();
}

function reset() {
    steps = 0;
    updateDisplay();
}

function animateButton() {
    const btn = document.getElementById('stepBtn');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 100);
}

function updateDisplay() {
    document.getElementById('steps').textContent = steps.toLocaleString();
    document.getElementById('goalDisplay').textContent = goal.toLocaleString();

    const distance = (steps * stepLength).toFixed(2);
    const calories = Math.floor(steps * caloriesPerStep);

    document.getElementById('distance').textContent = distance;
    document.getElementById('calories').textContent = calories;

    const progress = Math.min((steps / goal) * 100, 100);
    const offset = 283 * (1 - progress / 100);
    document.getElementById('progress').style.strokeDashoffset = offset;

    // Change color when goal reached
    if (steps >= goal) {
        document.body.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #f093fb, #f5576c)';
    }
}

document.addEventListener('DOMContentLoaded', init);
