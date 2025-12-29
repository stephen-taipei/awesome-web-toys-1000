const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoEl = document.getElementById('info');

const fileSystem = {
    name: 'project',
    type: 'folder',
    expanded: true,
    children: [
        { name: 'src', type: 'folder', expanded: true, children: [
            { name: 'components', type: 'folder', expanded: false, children: [
                { name: 'Button.tsx', type: 'file' },
                { name: 'Modal.tsx', type: 'file' }
            ]},
            { name: 'utils', type: 'folder', expanded: false, children: [
                { name: 'helpers.ts', type: 'file' }
            ]},
            { name: 'index.ts', type: 'file' },
            { name: 'App.tsx', type: 'file' }
        ]},
        { name: 'public', type: 'folder', expanded: false, children: [
            { name: 'index.html', type: 'file' },
            { name: 'favicon.ico', type: 'file' }
        ]},
        { name: 'package.json', type: 'file' },
        { name: 'README.md', type: 'file' }
    ]
};

const rowHeight = 22;
const indent = 20;
let items = [];
let hoverItem = null;

function flattenTree(node, depth = 0) {
    const result = [{ node, depth, y: 0 }];

    if (node.type === 'folder' && node.expanded && node.children) {
        node.children.forEach(child => {
            result.push(...flattenTree(child, depth + 1));
        });
    }

    return result;
}

function getIcon(item) {
    if (item.node.type === 'folder') {
        return item.node.expanded ? '📂' : '📁';
    }
    const ext = item.node.name.split('.').pop();
    const icons = {
        ts: '📘', tsx: '📘', js: '📙', html: '📄', json: '📋', md: '📝', ico: '🖼️'
    };
    return icons[ext] || '📄';
}

function draw() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    items = flattenTree(fileSystem);

    // Assign y positions
    items.forEach((item, i) => {
        item.y = 45 + i * rowHeight;
    });

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('📁 專案目錄', 20, 28);

    items.forEach(item => {
        const isHover = hoverItem === item;
        const x = 20 + item.depth * indent;
        const y = item.y;

        // Hover background
        if (isHover) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
            ctx.fillRect(15, y - 14, canvas.width - 30, rowHeight);
        }

        // Icon
        ctx.font = '14px Arial';
        ctx.fillText(getIcon(item), x, y);

        // Name
        ctx.fillStyle = isHover ? '#fff' : (item.node.type === 'folder' ? '#3498db' : 'rgba(255,255,255,0.8)');
        ctx.font = item.node.type === 'folder' ? 'bold 12px Arial' : '12px Arial';
        ctx.fillText(item.node.name, x + 22, y);

        // Expand indicator for folders
        if (item.node.type === 'folder') {
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.font = '10px Arial';
            ctx.fillText(item.node.expanded ? '▼' : '▶', x - 12, y);
        }
    });
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    hoverItem = null;
    for (const item of items) {
        if (y >= item.y - 14 && y < item.y + 8) {
            hoverItem = item;
            break;
        }
    }

    canvas.style.cursor = hoverItem ? 'pointer' : 'default';
    draw();
});

canvas.addEventListener('click', () => {
    if (hoverItem) {
        if (hoverItem.node.type === 'folder') {
            hoverItem.node.expanded = !hoverItem.node.expanded;
            infoEl.textContent = `${hoverItem.node.expanded ? '展開' : '收合'}: ${hoverItem.node.name}`;
        } else {
            infoEl.textContent = `選取: ${hoverItem.node.name}`;
        }
        draw();
    }
});

draw();
