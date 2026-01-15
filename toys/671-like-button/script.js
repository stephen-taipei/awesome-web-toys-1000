const likeBtn = document.getElementById('likeBtn');
const particles = document.getElementById('particles');
let count = 0;
let liked = false;

likeBtn.addEventListener('click', (e) => {
    liked = !liked;
    likeBtn.classList.toggle('liked', liked);
    count = liked ? count + 1 : count - 1;
    likeBtn.querySelector('.like-count').textContent = count;

    if (liked) {
        createParticles(e);
    }
});

function createParticles(e) {
    const rect = likeBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (i / 8) * Math.PI * 2;
        const distance = 40 + Math.random() * 20;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        particles.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    }
}
