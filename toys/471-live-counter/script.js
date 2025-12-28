const usersEl = document.getElementById('users');
const ordersEl = document.getElementById('orders');
const visitsEl = document.getElementById('visits');
const infoEl = document.getElementById('info');

let users = 125847;
let orders = 8432;
let visits = 1567890;

function formatNumber(n) {
    return n.toLocaleString('zh-TW');
}

function animateValue(el, start, end, duration) {
    const startTime = performance.now();
    const diff = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + diff * easeOut);

        el.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateCounters() {
    const oldUsers = users;
    const oldOrders = orders;
    const oldVisits = visits;

    users += Math.floor(Math.random() * 50) + 10;
    orders += Math.floor(Math.random() * 5) + 1;
    visits += Math.floor(Math.random() * 500) + 100;

    animateValue(usersEl, oldUsers, users, 800);
    animateValue(ordersEl, oldOrders, orders, 800);
    animateValue(visitsEl, oldVisits, visits, 800);

    const totalIncrease = (users - oldUsers) + (orders - oldOrders) + (visits - oldVisits);
    infoEl.textContent = `本次更新增加 ${formatNumber(totalIncrease)} 筆數據`;
}

// Initial display
usersEl.textContent = formatNumber(users);
ordersEl.textContent = formatNumber(orders);
visitsEl.textContent = formatNumber(visits);

// Update every 2 seconds
setInterval(updateCounters, 2000);
