const timeline = document.getElementById('timeline');
const playBtn = document.getElementById('playBtn');

function resetAndPlay() {
    timeline.classList.remove('animate');
    const line = timeline.querySelector('.timeline-line');
    const items = timeline.querySelectorAll('.timeline-item');

    line.style.transform = 'scaleY(0)';
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
    });

    void timeline.offsetWidth;
    timeline.classList.add('animate');
}

playBtn.addEventListener('click', resetAndPlay);

setTimeout(resetAndPlay, 300);
