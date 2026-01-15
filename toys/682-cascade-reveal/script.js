const items = document.querySelectorAll('.cascade-item');
const playBtn = document.getElementById('playBtn');

function resetAndPlay() {
    items.forEach(item => {
        item.classList.remove('animate');
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
    });

    void items[0].offsetWidth;

    items.forEach(item => item.classList.add('animate'));
}

playBtn.addEventListener('click', resetAndPlay);

setTimeout(resetAndPlay, 300);
