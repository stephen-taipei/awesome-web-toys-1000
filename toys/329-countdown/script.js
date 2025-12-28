let targetDate = null;
let countdownInterval = null;

function init() {
    document.getElementById('setBtn').addEventListener('click', setCountdown);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    document.getElementById('eventDate').value = tomorrow.toISOString().slice(0, 16);
}

function setCountdown() {
    const eventName = document.getElementById('eventName').value || '活動';
    const eventDate = document.getElementById('eventDate').value;

    if (!eventDate) return;

    targetDate = new Date(eventDate);
    document.getElementById('eventTitle').textContent = eventName + ' 倒數中...';

    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

function updateCountdown() {
    if (!targetDate) return;

    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        document.getElementById('eventTitle').textContent = '時間到!';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

document.addEventListener('DOMContentLoaded', init);
