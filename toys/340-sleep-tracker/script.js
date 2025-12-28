let sleepLogs = [];

function init() {
    document.getElementById('logBtn').addEventListener('click', logSleep);
    updateStats();
    renderHistory();
}

function logSleep() {
    const sleepTime = document.getElementById('sleepTime').value;
    const wakeTime = document.getElementById('wakeTime').value;

    if (!sleepTime || !wakeTime) return;

    const duration = calculateDuration(sleepTime, wakeTime);
    const today = new Date().toLocaleDateString('zh-TW');

    sleepLogs.unshift({
        date: today,
        sleepTime,
        wakeTime,
        duration
    });

    updateStats();
    renderHistory();
}

function calculateDuration(sleep, wake) {
    const [sh, sm] = sleep.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);

    let sleepMins = sh * 60 + sm;
    let wakeMins = wh * 60 + wm;

    if (wakeMins < sleepMins) {
        wakeMins += 24 * 60;
    }

    return wakeMins - sleepMins;
}

function formatDuration(mins) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
}

function getQuality(duration) {
    if (duration >= 420 && duration <= 540) return { class: 'good', emoji: '😴' };
    if (duration >= 360 && duration <= 600) return { class: 'okay', emoji: '😐' };
    return { class: 'bad', emoji: '😫' };
}

function updateStats() {
    if (sleepLogs.length === 0) {
        document.getElementById('avgSleep').textContent = '--';
        document.getElementById('totalLogs').textContent = '0';
        return;
    }

    const total = sleepLogs.reduce((sum, log) => sum + log.duration, 0);
    const avg = Math.round(total / sleepLogs.length);

    document.getElementById('avgSleep').textContent = formatDuration(avg);
    document.getElementById('totalLogs').textContent = sleepLogs.length;
}

function renderHistory() {
    const container = document.getElementById('history');
    if (sleepLogs.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <h3>睡眠記錄</h3>
        ${sleepLogs.slice(0, 7).map(log => {
            const quality = getQuality(log.duration);
            return `
                <div class="history-item">
                    <div>
                        <div class="date">${log.date}</div>
                        <div class="times">${log.sleepTime} - ${log.wakeTime}</div>
                    </div>
                    <div class="duration">${formatDuration(log.duration)}</div>
                    <div class="quality ${quality.class}">${quality.emoji}</div>
                </div>
            `;
        }).join('')}
    `;
}

document.addEventListener('DOMContentLoaded', init);
