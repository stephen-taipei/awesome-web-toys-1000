let notes = [];
const colors = ['yellow', 'pink', 'blue', 'green'];

function init() {
    document.getElementById('addBtn').addEventListener('click', addNote);
    renderNotes();
}

function addNote() {
    notes.push({
        id: Date.now(),
        text: '',
        color: colors[Math.floor(Math.random() * colors.length)]
    });
    renderNotes();
}

function updateNote(id, text) {
    const note = notes.find(n => n.id === id);
    if (note) note.text = text;
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    renderNotes();
}

function changeColor(id, color) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.color = color;
        renderNotes();
    }
}

function renderNotes() {
    const container = document.getElementById('notes');
    container.innerHTML = notes.map(note => `
        <div class="note ${note.color}">
            <button class="delete" onclick="deleteNote(${note.id})">×</button>
            <textarea placeholder="寫點什麼..." onchange="updateNote(${note.id}, this.value)">${note.text}</textarea>
            <div class="color-picker">
                ${colors.map(c => `<span style="background: ${getColorValue(c)}" onclick="changeColor(${note.id}, '${c}')"></span>`).join('')}
            </div>
        </div>
    `).join('');
}

function getColorValue(color) {
    const values = { yellow: '#fff740', pink: '#ff7eb9', blue: '#7afcff', green: '#7fff7f' };
    return values[color];
}

document.addEventListener('DOMContentLoaded', init);
