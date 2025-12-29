let moodHistory = [];

function init() {
    updateTodayDate();
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMood(btn));
    });
    renderHistory();
}

function updateTodayDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('today').textContent = today.toLocaleDateString('zh-TW', options);
}

function selectMood(btn) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const today = new Date().toLocaleDateString('zh-TW');
    const existingIndex = moodHistory.findIndex(m => m.date === today);

    const entry = {
        date: today,
        mood: btn.dataset.mood,
        emoji: btn.dataset.emoji
    };

    if (existingIndex >= 0) {
        moodHistory[existingIndex] = entry;
    } else {
        moodHistory.unshift(entry);
    }

    updateBackground(btn.dataset.mood);
    renderHistory();
}

function updateBackground(mood) {
    const gradients = {
        great: 'linear-gradient(135deg, #00b894, #00cec9)',
        good: 'linear-gradient(135deg, #74b9ff, #0984e3)',
        okay: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
        bad: 'linear-gradient(135deg, #fd79a8, #e84393)',
        awful: 'linear-gradient(135deg, #636e72, #2d3436)'
    };
    document.body.style.background = gradients[mood] || gradients.okay;
}

function renderHistory() {
    const container = document.getElementById('history');
    if (moodHistory.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <h3>最近記錄</h3>
        ${moodHistory.slice(0, 7).map(entry => `
            <div class="history-item">
                <span class="date">${entry.date}</span>
                <span class="emoji">${entry.emoji}</span>
            </div>
        `).join('')}
    `;
}

document.addEventListener('DOMContentLoaded', init);
