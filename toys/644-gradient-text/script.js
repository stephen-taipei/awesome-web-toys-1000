const buttons = document.querySelectorAll('.controls button');
const texts = document.querySelectorAll('.gradient-text');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        texts.forEach(t => {
            t.classList.remove('active');
            if (t.classList.contains(type)) t.classList.add('active');
        });
    });
});

document.querySelector('.gradient-text.animated').classList.add('active');
