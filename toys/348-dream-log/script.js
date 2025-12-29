let dreams = [];
let selectedMood = 'strange';

const moodLabels = {
    good: '✨ 美好',
    strange: '🌀 奇異',
    scary: '😰 可怕'
};

function init() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMood(btn.dataset.mood));
    });
    document.getElementById('saveBtn').addEventListener('click', saveDream);
    selectMood('strange');
    renderDreams();
}

function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
    });
}

function saveDream() {
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('dreamInput').value.trim();

    if (!content) return;

    const now = new Date();
    dreams.unshift({
        id: Date.now(),
        title: title || '未命名的夢',
        content,
        mood: selectedMood,
        date: now.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
    });

    document.getElementById('titleInput').value = '';
    document.getElementById('dreamInput').value = '';
    renderDreams();
}

function deleteDream(id) {
    dreams = dreams.filter(d => d.id !== id);
    renderDreams();
}

function renderDreams() {
    const container = document.getElementById('dreams');
    container.innerHTML = dreams.map(dream => `
        <div class="dream">
            <div class="dream-header">
                <span class="dream-title">${dream.title}</span>
                <button class="dream-delete" onclick="deleteDream(${dream.id})">×</button>
            </div>
            <div class="dream-date">🌙 ${dream.date}</div>
            <div class="dream-content">${dream.content}</div>
            <div class="dream-mood">${moodLabels[dream.mood]}</div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', init);
