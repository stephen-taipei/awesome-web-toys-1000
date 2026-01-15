const wrapper = document.getElementById('wrapper');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
const totalSections = 4;

function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, totalSections - 1));
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

// Touch swipe support
let startX;
wrapper.addEventListener('touchstart', e => startX = e.touches[0].clientX);
wrapper.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
        goTo(currentIndex + (diff > 0 ? 1 : -1));
    }
});
