const ball = document.getElementById('ball');
const dropBtn = document.getElementById('dropBtn');
const zone = document.getElementById('gravityZone');

let position = 10;
let velocity = 0;
const gravity = 0.5;
const bounce = 0.7;
const groundY = zone.offsetHeight - 60;
let animating = false;

function animate() {
    if (!animating) return;

    velocity += gravity;
    position += velocity;

    if (position >= groundY) {
        position = groundY;
        velocity = -velocity * bounce;

        if (Math.abs(velocity) < 1) {
            animating = false;
            velocity = 0;
        }
    }

    ball.style.top = `${position}px`;

    if (animating) {
        requestAnimationFrame(animate);
    }
}

dropBtn.addEventListener('click', () => {
    position = 10;
    velocity = 0;
    ball.style.top = `${position}px`;
    animating = true;
    requestAnimationFrame(animate);
});
