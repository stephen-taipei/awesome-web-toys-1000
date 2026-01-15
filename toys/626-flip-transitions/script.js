const cards = document.querySelectorAll('.flip-card');
const flipAllBtn = document.getElementById('flipAll');
const resetBtn = document.getElementById('resetAll');

cards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});

flipAllBtn.addEventListener('click', () => {
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('flipped');
        }, index * 150);
    });
});

resetBtn.addEventListener('click', () => {
    cards.forEach(card => card.classList.remove('flipped'));
});
