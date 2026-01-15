// Toggle switches work with pure CSS
// This file can be extended for additional functionality

document.querySelectorAll('.toggle-switch input').forEach(input => {
    input.addEventListener('change', (e) => {
        console.log(`Switch ${e.target.id}: ${e.target.checked ? 'ON' : 'OFF'}`);
    });
});
