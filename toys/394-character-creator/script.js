const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const options = {
    face: ['😊', '😐', '😃', '😎', '🥺'],
    eyes: ['👀', '😑', '🙄', '😳', '🤩'],
    hair: ['👱', '👨', '👩‍🦱', '👩‍🦰', '👴'],
    accessory: ['🎩', '👓', '👑', '🎀', '❌']
};

const faceShapes = ['circle', 'oval', 'square', 'heart', 'diamond'];
const eyeStyles = ['normal', 'closed', 'wink', 'wide', 'stars'];
const hairStyles = ['short', 'long', 'curly', 'spiky', 'bald'];
const accessories = ['hat', 'glasses', 'crown', 'bow', 'none'];

let current = { face: 0, eyes: 0, hair: 0, accessory: 4 };

function createButtons() {
    Object.keys(options).forEach(category => {
        const container = document.getElementById(category);
        options[category].forEach((emoji, i) => {
            const btn = document.createElement('button');
            btn.className = 'opt-btn' + (current[category] === i ? ' active' : '');
            btn.textContent = emoji;
            btn.onclick = () => selectOption(category, i);
            container.appendChild(btn);
        });
    });
}

function selectOption(category, index) {
    current[category] = index;

    // Update button states
    const container = document.getElementById(category);
    container.querySelectorAll('.opt-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = 130;

    // Draw face
    ctx.fillStyle = '#ffeaa7';
    ctx.strokeStyle = '#fdcb6e';
    ctx.lineWidth = 3;

    switch(faceShapes[current.face]) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(cx, cy, 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'oval':
            ctx.beginPath();
            ctx.ellipse(cx, cy, 50, 70, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'square':
            ctx.beginPath();
            ctx.roundRect(cx - 55, cy - 55, 110, 110, 15);
            ctx.fill();
            ctx.stroke();
            break;
        case 'heart':
            ctx.beginPath();
            ctx.moveTo(cx, cy + 50);
            ctx.bezierCurveTo(cx - 70, cy, cx - 70, cy - 50, cx, cy - 30);
            ctx.bezierCurveTo(cx + 70, cy - 50, cx + 70, cy, cx, cy + 50);
            ctx.fill();
            ctx.stroke();
            break;
        case 'diamond':
            ctx.beginPath();
            ctx.moveTo(cx, cy - 65);
            ctx.lineTo(cx + 50, cy);
            ctx.lineTo(cx, cy + 65);
            ctx.lineTo(cx - 50, cy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }

    // Draw hair
    ctx.fillStyle = ['#f1c40f', '#2c3e50', '#8e44ad', '#e74c3c', '#ffeaa7'][current.hair];
    switch(hairStyles[current.hair]) {
        case 'short':
            ctx.beginPath();
            ctx.arc(cx, cy - 50, 45, Math.PI, 0);
            ctx.fill();
            break;
        case 'long':
            ctx.beginPath();
            ctx.arc(cx, cy - 40, 55, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(cx - 55, cy - 40, 20, 80);
            ctx.fillRect(cx + 35, cy - 40, 20, 80);
            break;
        case 'curly':
            for (let i = 0; i < 8; i++) {
                const angle = Math.PI + (i / 7) * Math.PI;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(angle) * 50, cy - 50 + Math.sin(angle) * 30, 15, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'spiky':
            for (let i = 0; i < 7; i++) {
                ctx.beginPath();
                ctx.moveTo(cx - 45 + i * 15, cy - 45);
                ctx.lineTo(cx - 38 + i * 15, cy - 90);
                ctx.lineTo(cx - 30 + i * 15, cy - 45);
                ctx.fill();
            }
            break;
    }

    // Draw eyes
    ctx.fillStyle = '#2c3e50';
    const eyeY = cy - 10;
    switch(eyeStyles[current.eyes]) {
        case 'normal':
            ctx.beginPath();
            ctx.arc(cx - 20, eyeY, 8, 0, Math.PI * 2);
            ctx.arc(cx + 20, eyeY, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'closed':
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx - 20, eyeY, 8, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx + 20, eyeY, 8, 0, Math.PI);
            ctx.stroke();
            break;
        case 'wink':
            ctx.beginPath();
            ctx.arc(cx - 20, eyeY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx + 20, eyeY, 8, 0, Math.PI);
            ctx.stroke();
            break;
        case 'wide':
            ctx.beginPath();
            ctx.arc(cx - 20, eyeY, 12, 0, Math.PI * 2);
            ctx.arc(cx + 20, eyeY, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx - 17, eyeY - 3, 4, 0, Math.PI * 2);
            ctx.arc(cx + 23, eyeY - 3, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'stars':
            ctx.font = '20px Arial';
            ctx.fillText('⭐', cx - 28, eyeY + 6);
            ctx.fillText('⭐', cx + 12, eyeY + 6);
            break;
    }

    // Draw mouth
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 15, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Draw accessory
    switch(accessories[current.accessory]) {
        case 'hat':
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(cx - 40, cy - 100, 80, 10);
            ctx.fillRect(cx - 25, cy - 140, 50, 45);
            break;
        case 'glasses':
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx - 22, cy - 10, 18, 0, Math.PI * 2);
            ctx.arc(cx + 22, cy - 10, 18, 0, Math.PI * 2);
            ctx.moveTo(cx - 4, cy - 10);
            ctx.lineTo(cx + 4, cy - 10);
            ctx.stroke();
            break;
        case 'crown':
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.moveTo(cx - 35, cy - 80);
            ctx.lineTo(cx - 25, cy - 110);
            ctx.lineTo(cx - 10, cy - 85);
            ctx.lineTo(cx, cy - 115);
            ctx.lineTo(cx + 10, cy - 85);
            ctx.lineTo(cx + 25, cy - 110);
            ctx.lineTo(cx + 35, cy - 80);
            ctx.closePath();
            ctx.fill();
            break;
        case 'bow':
            ctx.fillStyle = '#e84393';
            ctx.beginPath();
            ctx.ellipse(cx - 20, cy - 70, 20, 12, -0.3, 0, Math.PI * 2);
            ctx.ellipse(cx + 20, cy - 70, 20, 12, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy - 70, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
}

document.getElementById('randomize').addEventListener('click', () => {
    Object.keys(current).forEach(category => {
        const newIndex = Math.floor(Math.random() * options[category].length);
        selectOption(category, newIndex);
    });
});

createButtons();
draw();
