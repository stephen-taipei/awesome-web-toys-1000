const cards = document.querySelectorAll('.card');
const flipAllBtn = document.getElementById('flipAll');
const resetAllBtn = document.getElementById('resetAll');

cards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});

flipAllBtn.addEventListener('click', () => {
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.toggle('flipped');
        }, index * 150);
    });
});

resetAllBtn.addEventListener('click', () => {
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
});
