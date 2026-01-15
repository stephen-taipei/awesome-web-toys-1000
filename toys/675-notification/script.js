const zone = document.getElementById('notificationZone');

const notifications = {
    success: { icon: '✓', text: '操作成功完成！' },
    error: { icon: '✕', text: '發生錯誤，請重試' },
    info: { icon: 'ℹ', text: '這是一條資訊通知' },
    warning: { icon: '⚠', text: '請注意此警告訊息' }
};

function showNotification(type) {
    const { icon, text } = notifications[type];
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${text}</span>
    `;
    zone.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.getElementById('successBtn').addEventListener('click', () => showNotification('success'));
document.getElementById('errorBtn').addEventListener('click', () => showNotification('error'));
document.getElementById('infoBtn').addEventListener('click', () => showNotification('info'));
document.getElementById('warningBtn').addEventListener('click', () => showNotification('warning'));
