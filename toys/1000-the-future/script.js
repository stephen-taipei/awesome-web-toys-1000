// Generate Starfield
const starfield = document.getElementById('starfield');
const starCount = 200;

for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2;
    const duration = Math.random() * 3 + 2;
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = Math.random();
    star.style.animation = `twinkle ${duration}s infinite alternate`;
    
    starfield.appendChild(star);
}

// Add keyframes for twinkle programmatically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes twinkle {
        from { opacity: 0.2; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// 3D Tilt Effect for Cards
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});
