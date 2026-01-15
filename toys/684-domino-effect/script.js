const dominoes = document.querySelectorAll('.domino');
const playBtn = document.getElementById('playBtn');

playBtn.addEventListener('click', () => {
    dominoes.forEach(d => {
        d.classList.remove('fall');
        d.style.transform = 'rotate(0deg)';
    });

    void dominoes[0].offsetWidth;

    dominoes.forEach(d => d.classList.add('fall'));
});
