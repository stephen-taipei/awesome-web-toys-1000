let consumed = 0;
const dailyGoal = 2000;

function init() {
    document.querySelectorAll('.food-btn').forEach(btn => {
        btn.addEventListener('click', () => addCalories(parseInt(btn.dataset.cal)));
    });
    document.getElementById('addBtn').addEventListener('click', addCustom);
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
}

function addCalories(cal) {
    consumed += cal;
    updateDisplay();
}

function addCustom() {
    const input = document.getElementById('customCal');
    const cal = parseInt(input.value);
    if (!isNaN(cal) && cal > 0) {
        consumed += cal;
        input.value = '';
        updateDisplay();
    }
}

function reset() {
    consumed = 0;
    updateDisplay();
}

function updateDisplay() {
    const remaining = Math.max(dailyGoal - consumed, 0);

    document.getElementById('remaining').textContent = remaining.toLocaleString();
    document.getElementById('goal').textContent = dailyGoal.toLocaleString();
    document.getElementById('consumed').textContent = consumed.toLocaleString();

    // Change color based on remaining
    const remainingEl = document.getElementById('remaining');
    if (remaining <= 0) {
        remainingEl.style.color = '#e74c3c';
    } else if (remaining <= 500) {
        remainingEl.style.color = '#f39c12';
    } else {
        remainingEl.style.color = '#e84393';
    }
}

document.addEventListener('DOMContentLoaded', init);
