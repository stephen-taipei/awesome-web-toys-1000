const shape = document.getElementById('morphShape');
const buttons = document.querySelectorAll('.controls button');

shape.classList.add('circle');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        shape.classList.remove('circle', 'square', 'triangle', 'star');
        shape.classList.add(btn.dataset.shape);
    });
});
