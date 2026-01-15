const zone = document.getElementById('explosionZone');
const btn = document.getElementById('triggerBtn');

const colors = ['#fdcb6e', '#e17055', '#ff7675', '#fd79a8', '#a29bfe', '#74b9ff'];

btn.addEventListener('click', (e) => {
    const rect = zone.getBoundingClientRect();
    const x = zone.offsetWidth / 2;
    const y = zone.offsetHeight / 2;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const angle = (Math.random() * Math.PI * 2);
        const distance = 80 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = `${6 + Math.random() * 10}px`;
        particle.style.height = particle.style.width;

        zone.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
});
