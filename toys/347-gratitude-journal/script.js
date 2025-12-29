let entries = [];

function init() {
    updateTodayDate();
    document.getElementById('addBtn').addEventListener('click', addEntry);
    renderEntries();
}

function updateTodayDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('todayDate').textContent = today.toLocaleDateString('zh-TW', options);
}

function addEntry() {
    const input = document.getElementById('gratitudeInput');
    const text = input.value.trim();
    if (!text) return;

    const now = new Date();
    entries.unshift({
        id: Date.now(),
        text,
        date: now.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    renderEntries();
}

function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    renderEntries();
}

function renderEntries() {
    const container = document.getElementById('entries');
    container.innerHTML = entries.map(entry => `
        <div class="entry">
            <button class="entry-delete" onclick="deleteEntry(${entry.id})">×</button>
            <div class="entry-date">🙏 ${entry.date}</div>
            <div class="entry-text">${entry.text}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
