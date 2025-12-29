let tasks = [];
let filter = 'all';

function init() {
    document.getElementById('addBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });
    renderTasks();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) return;

    tasks.push({ id: Date.now(), text, completed: false });
    input.value = '';
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
}

function setFilter(f) {
    filter = f;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === f);
    });
    renderTasks();
}

function renderTasks() {
    const container = document.getElementById('tasks');
    let filteredTasks = tasks;

    if (filter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    container.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
        </li>
    `).join('');

    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('stats').textContent = `${completed} / ${tasks.length} 已完成`;
}

document.addEventListener('DOMContentLoaded', init);
