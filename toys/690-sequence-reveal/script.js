const cards = document.querySelectorAll('.reveal-card');
const playBtn = document.getElementById('playBtn');

function resetAndPlay() {
    cards.forEach(card => {
        card.classList.remove('animate');
        card.style.opacity = '0';
        card.style.transform = 'rotateY(-90deg)';
    });

    void cards[0].offsetWidth;

    cards.forEach(card => card.classList.add('animate'));
}

playBtn.addEventListener('click', resetAndPlay);

setTimeout(resetAndPlay, 300);
