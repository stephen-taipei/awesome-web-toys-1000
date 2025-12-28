const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const names = ['小明', '小華', '小美', '小強', '小芳', '小偉', '小玲', '小龍', '小雯', '小傑'];

let users = [];
let connections = [];
let selectedUser = null;

function init() {
    users = names.map((name, i) => {
        const angle = (i / names.length) * Math.PI * 2;
        const radius = 120;
        return {
            id: i,
            name: name,
            x: 180 + Math.cos(angle) * radius,
            y: 180 + Math.sin(angle) * radius,
            friends: []
        };
    });

    // Random friendships
    connections = [];
    for (let i = 0; i < users.length; i++) {
        const numFriends = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < numFriends; j++) {
            const target = Math.floor(Math.random() * users.length);
            if (target !== i && !users[i].friends.includes(target)) {
                users[i].friends.push(target);
                users[target].friends.push(i);
                connections.push([i, target]);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(([a, b]) => {
        const userA = users[a];
        const userB = users[b];

        let isHighlighted = false;
        if (selectedUser !== null) {
            isHighlighted = (a === selectedUser || b === selectedUser);
        }

        ctx.beginPath();
        ctx.moveTo(userA.x, userA.y);
        ctx.lineTo(userB.x, userB.y);
        ctx.strokeStyle = isHighlighted ? '#fff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isHighlighted ? 3 : 1;
        ctx.stroke();
    });

    // Draw users
    users.forEach((user, i) => {
        const isSelected = i === selectedUser;
        const isFriend = selectedUser !== null && users[selectedUser].friends.includes(i);
        const radius = isSelected ? 25 : (isFriend ? 22 : 18);

        // Glow effect for selected/friends
        if (isSelected || isFriend) {
            ctx.beginPath();
            ctx.arc(user.x, user.y, radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = isSelected ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(user.x, user.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#e74c3c' : (isFriend ? '#2ecc71' : '#3498db');
        ctx.fill();

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(user.name, user.x, user.y + radius + 15);
    });
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let clicked = null;
    users.forEach((user, i) => {
        const dist = Math.sqrt((mx - user.x) ** 2 + (my - user.y) ** 2);
        if (dist < 25) clicked = i;
    });

    if (clicked !== null) {
        selectedUser = clicked === selectedUser ? null : clicked;
        if (selectedUser !== null) {
            const user = users[selectedUser];
            const friendNames = user.friends.map(f => users[f].name).join('、');
            infoEl.textContent = `${user.name} 的好友 (${user.friends.length}人): ${friendNames}`;
        } else {
            infoEl.textContent = '點擊用戶查看好友關係';
        }
    }

    draw();
});

init();
draw();
