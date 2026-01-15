const nodes = document.querySelectorAll('.chain-node');
const adjacent = {
    0: [1, 3], 1: [0, 2, 4], 2: [1, 5],
    3: [0, 4, 6], 4: [1, 3, 5, 7], 5: [2, 4, 8],
    6: [3, 7], 7: [4, 6, 8], 8: [5, 7]
};

let animating = false;

function triggerChain(startIndex) {
    if (animating) return;
    animating = true;

    nodes.forEach(n => n.classList.remove('active'));

    const visited = new Set();
    const queue = [{ index: startIndex, delay: 0 }];

    while (queue.length > 0) {
        const { index, delay } = queue.shift();
        if (visited.has(index)) continue;
        visited.add(index);

        setTimeout(() => {
            nodes[index].classList.add('active');
        }, delay);

        adjacent[index].forEach(adj => {
            if (!visited.has(adj)) {
                queue.push({ index: adj, delay: delay + 150 });
            }
        });
    }

    setTimeout(() => { animating = false; }, 1500);
}

nodes.forEach((node, i) => {
    node.addEventListener('click', () => triggerChain(i));
});
