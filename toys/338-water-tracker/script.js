let current = 0;
const goal = 2000;

function init() {
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
    });
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
}

function addWater(amount) {
    current = Math.min(current + amount, goal * 1.5);
    updateDisplay();
    animateAdd();
}

function reset() {
    current = 0;
    updateDisplay();
}

function animateAdd() {
    const fill = document.getElementById('waterFill');
    fill.style.transform = 'scaleY(1.1)';
    setTimeout(() => {
        fill.style.transform = 'scaleY(1)';
    }, 200);
}

function updateDisplay() {
    const percentage = Math.min((current / goal) * 100, 100);

    document.getElementById('waterFill').style.height = percentage + '%';
    document.getElementById('waterLevel').textContent = Math.round(percentage) + '%';
    document.getElementById('current').textContent = current;
    document.getElementById('goal').textContent = goal;

    // Change color when goal reached
    const fill = document.getElementById('waterFill');
    if (current >= goal) {
        fill.style.background = 'linear-gradient(180deg, #00b894, #00cec9)';
    } else {
        fill.style.background = 'linear-gradient(180deg, #74b9ff, #0984e3)';
    }
}

document.addEventListener('DOMContentLoaded', init);
