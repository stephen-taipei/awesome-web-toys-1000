const text3d = document.getElementById('text3d');
const buttons = document.querySelectorAll('.controls button');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const effect = btn.dataset.effect;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        text3d.className = 'text3d ' + effect;
    });
});

text3d.classList.add('float');
