const cursor = document.getElementById('cursor');
const trail = document.getElementById('trail');
const buttons = document.querySelectorAll('.controls button');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 5 + 'px';
    cursor.style.top = e.clientY - 5 + 'px';
    trail.style.left = e.clientX - 15 + 'px';
    trail.style.top = e.clientY - 15 + 'px';
});

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.cursor;
        document.body.className = `cursor-${type}`;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.body.classList.add('cursor-default');
