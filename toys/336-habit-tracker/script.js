let habits = [];
const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

function init() {
    document.getElementById('addBtn').addEventListener('click', addHabit);
    document.getElementById('habitInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') addHabit();
    });
    renderHabits();
}

function addHabit() {
    const input = document.getElementById('habitInput');
    const name = input.value.trim();
    if (!name) return;

    habits.push({
        id: Date.now(),
        name,
        days: [false, false, false, false, false, false, false]
    });
    input.value = '';
    renderHabits();
}

function toggleDay(habitId, dayIndex) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.days[dayIndex] = !habit.days[dayIndex];
        renderHabits();
    }
}

function deleteHabit(id) {
    habits = habits.filter(h => h.id !== id);
    renderHabits();
}

function getStreak(days) {
    let streak = 0;
    const today = new Date().getDay();
    for (let i = today; i >= 0; i--) {
        if (days[i]) streak++;
        else break;
    }
    return streak;
}

function renderHabits() {
    const container = document.getElementById('habits');
    const today = new Date().getDay();

    container.innerHTML = habits.map(habit => `
        <div class="habit-item">
            <div class="habit-header">
                <span class="habit-name">${habit.name}</span>
                <span class="habit-streak">連續 ${getStreak(habit.days)} 天</span>
                <button class="delete-btn" onclick="deleteHabit(${habit.id})">×</button>
            </div>
            <div class="habit-days">
                ${habit.days.map((completed, i) => `
                    <div class="day-circle ${completed ? 'completed' : ''}"
                         onclick="toggleDay(${habit.id}, ${i})"
                         style="${i === today ? 'border-width: 3px' : ''}">
                        ${dayNames[i]}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
