const cityNames = {
    'Asia/Taipei': '台北',
    'Asia/Tokyo': '東京',
    'Asia/Shanghai': '上海',
    'Asia/Hong_Kong': '香港',
    'America/New_York': '紐約',
    'America/Los_Angeles': '洛杉磯',
    'Europe/London': '倫敦',
    'Europe/Paris': '巴黎',
    'Australia/Sydney': '雪梨'
};

let clocks = ['Asia/Taipei', 'America/New_York', 'Europe/London'];

function init() {
    document.getElementById('addBtn').addEventListener('click', addClock);
    renderClocks();
    setInterval(updateClocks, 1000);
}

function addClock() {
    const timezone = document.getElementById('timezone').value;
    if (!clocks.includes(timezone)) {
        clocks.push(timezone);
        renderClocks();
    }
}

function removeClock(timezone) {
    clocks = clocks.filter(c => c !== timezone);
    renderClocks();
}

function renderClocks() {
    const container = document.getElementById('clocks');
    container.innerHTML = clocks.map(tz => `
        <div class="clock-item" data-tz="${tz}">
            <div>
                <div class="city">${cityNames[tz]}</div>
                <div class="date" id="date-${tz.replace('/', '-')}"></div>
            </div>
            <div class="time" id="time-${tz.replace('/', '-')}"></div>
            <button class="remove" onclick="removeClock('${tz}')">×</button>
        </div>
    `).join('');
    updateClocks();
}

function updateClocks() {
    const now = new Date();

    clocks.forEach(tz => {
        const options = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const dateOptions = { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' };

        try {
            const timeStr = now.toLocaleTimeString('zh-TW', options);
            const dateStr = now.toLocaleDateString('zh-TW', dateOptions);

            const timeEl = document.getElementById('time-' + tz.replace('/', '-'));
            const dateEl = document.getElementById('date-' + tz.replace('/', '-'));

            if (timeEl) timeEl.textContent = timeStr;
            if (dateEl) dateEl.textContent = dateStr;
        } catch (e) {
            console.error(e);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
