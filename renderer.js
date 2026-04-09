const textarea = document.getElementById('note');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save');

let timeout;
let lastSaved = "";

// Load note on startup
window.onload = async () => {
    const data = await window.api.loadNote();
    textarea.value = data;
    lastSaved = data;
};

// Manual save
saveBtn.onclick = async () => {
    await window.api.saveNote(textarea.value);
    lastSaved = textarea.value;
    status.innerText = "Saved!";
};

// Auto-save (debounce)
textarea.addEventListener('input', () => {
    status.innerText = "Changes detected - auto-save soon...";

    clearTimeout(timeout);

    timeout = setTimeout(async () => {
    if (textarea.value !== lastSaved) {
        await window.api.saveNote(textarea.value);
        lastSaved = textarea.value;

        const time = new Date().toLocaleTimeString();
        status.innerText = "Auto-saved at " + time;
    } else {
        status.innerText = "No changes - already saved";
    }
    }, 5000);
});