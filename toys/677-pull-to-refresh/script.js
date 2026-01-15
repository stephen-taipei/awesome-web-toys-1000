const container = document.getElementById('refreshContainer');
const contentList = document.getElementById('contentList');
const indicator = document.getElementById('indicator');
const refreshText = document.getElementById('refreshText');

let startY = 0;
let currentY = 0;
let pulling = false;
const threshold = 60;

container.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    pulling = true;
    contentList.classList.add('pulling');
});

container.addEventListener('touchmove', (e) => {
    if (!pulling) return;
    currentY = e.touches[0].clientY;
    const diff = Math.min(currentY - startY, 120);

    if (diff > 0) {
        contentList.style.transform = `translateY(${diff}px)`;
        if (diff >= threshold) {
            refreshText.textContent = '鬆開刷新';
            indicator.classList.add('visible');
        } else {
            refreshText.textContent = '下拉刷新';
        }
    }
});

container.addEventListener('touchend', () => {
    pulling = false;
    contentList.classList.remove('pulling');
    const diff = currentY - startY;

    if (diff >= threshold) {
        indicator.classList.add('refreshing');
        refreshText.textContent = '刷新中...';
        contentList.style.transform = `translateY(${threshold}px)`;

        setTimeout(() => {
            indicator.classList.remove('refreshing', 'visible');
            contentList.style.transform = '';
            refreshText.textContent = '下拉刷新';
        }, 1500);
    } else {
        contentList.style.transform = '';
        indicator.classList.remove('visible');
    }
    startY = 0;
    currentY = 0;
});

// Mouse simulation
container.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    pulling = true;
    contentList.classList.add('pulling');
});

document.addEventListener('mousemove', (e) => {
    if (!pulling) return;
    currentY = e.clientY;
    const diff = Math.min(currentY - startY, 120);

    if (diff > 0) {
        contentList.style.transform = `translateY(${diff}px)`;
        if (diff >= threshold) {
            refreshText.textContent = '鬆開刷新';
            indicator.classList.add('visible');
        } else {
            refreshText.textContent = '下拉刷新';
        }
    }
});

document.addEventListener('mouseup', () => {
    if (!pulling) return;
    pulling = false;
    contentList.classList.remove('pulling');
    const diff = currentY - startY;

    if (diff >= threshold) {
        indicator.classList.add('refreshing');
        refreshText.textContent = '刷新中...';
        contentList.style.transform = `translateY(${threshold}px)`;

        setTimeout(() => {
            indicator.classList.remove('refreshing', 'visible');
            contentList.style.transform = '';
            refreshText.textContent = '下拉刷新';
        }, 1500);
    } else {
        contentList.style.transform = '';
        indicator.classList.remove('visible');
    }
    startY = 0;
    currentY = 0;
});
