const card = document.getElementById('gestureCard');
const hint = document.getElementById('hint');
const resetBtn = document.getElementById('resetBtn');

let startX = 0, currentX = 0, isDragging = false;

card.addEventListener('mousedown', startDrag);
card.addEventListener('touchstart', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);
document.addEventListener('mouseup', endDrag);
document.addEventListener('touchend', endDrag);

function startDrag(e) {
    isDragging = true;
    card.classList.add('dragging');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
}

function drag(e) {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    currentX = x - startX;
    const rotate = currentX * 0.1;
    card.style.transform = `translateY(-50%) translateX(${currentX}px) rotate(${rotate}deg)`;
}

function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('dragging');

    if (currentX < -100) {
        card.classList.add('swipe-left');
        hint.textContent = '往左滑動 ✓';
    } else if (currentX > 100) {
        card.classList.add('swipe-right');
        hint.textContent = '往右滑動 ✓';
    } else {
        card.style.transform = 'translateY(-50%)';
    }
    currentX = 0;
}

resetBtn.addEventListener('click', () => {
    card.classList.remove('swipe-left', 'swipe-right');
    card.style.transform = 'translateY(-50%)';
    hint.textContent = '往左或往右滑動';
});
