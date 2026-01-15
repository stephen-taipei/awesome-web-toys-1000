// Checkbox animations work with pure CSS
// This file can be extended for additional functionality

document.querySelectorAll('.custom-checkbox input').forEach(input => {
    input.addEventListener('change', (e) => {
        console.log(`Checkbox: ${e.target.checked ? 'checked' : 'unchecked'}`);
    });
});
