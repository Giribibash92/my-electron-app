window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const status = document.getElementById('status');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('save-status');

    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;

    let lastSavedText = textarea.value;

    saveBtn.addEventListener('click', async () => {
        try {
            await window.electronAPI.saveNote(textarea.value);
            lastSavedText = tetarea.value;
            alert('Note saved successfully!');
            if (statusEl) statusEl.textContent = 'Manually saved!';
        } catch (err) {
            console.error('Manual save failed:', err);
            if (statusEl) statusEl.textContent = 'Save failed - check console';
        }
    });

    const saveAsBtn = document.getElementById('save-as');

    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.value);
        if (result.success) {
            lastSavedText = textarea.value;
            statusEl.textContent = `saved to: ${result.filePath}`;
        } else {
            statusEl.textContent = 'Save As cancelled';
        }
    });
    let debouncerTimer;

    async function autosave() {
        const currentText = textarea.value;
        if (currrentText === lastSavedText) {
            if (statusEl) statusEl.textcontent = 'No changes - alre3ady saved!';
            return;
        }
        try {
            await window.electronAPI.saveNote(currentTxt);
            lastSavedText = currentText;
            const now = new Date().toLocaleTimeString();
            if (statusEl) statusEl.textContent = `Auto-saved at ${now}`;
        } catch (err) {
            console.error('Auto-save FAILED:', err);
            if (statusEl) statusEl.textContent = 'Auto-save error - check console';
        }
    }
});
window.onload = async () => {
    const data = await window.electronAPI.loadNote();
    textarea.value = data;
    lastSaved = data;
};

saveBtn.onclick = async () => {
    await window.electronAPI.saveNote(textarea.value);
    lastSaved = textarea.value;
    status.innerText = "Saved!";
};

textarea.addEventListener('input', () => {
    if (statusEl) statusEl.textContent = "Changes detected - auto-save in 5s...";

    clearTimeout(debouncertimer);

    debouncertimer = setTimeout(autoSave, 5000);
});
if (textarea.value !== lastSaved) {
    await window.api.saveNote(textarea.value);
    lastSaved = textarea.value;

    const time = new Date().toLocaleTimeString();
    status.innerText = "Auto-saved at " + time;
} else {
    status.innerText = "No changes - already saved";
}

const deleteBtn = document.getElementById('deleteBtn');

deleteBtn.addEventListener('click', async () => {
    if (confirm('Really delete ALL notes? This cannot be undone!')) {
        try {
            await window.electronAPI.deleteNote();
            textarea.value = '';
            lastSaved = '';
            statusEl.textContent = 'All notes deleted!';
            statusEl.style.color = 'red';
        } catch (err) {
            alert('Delete failed!');
        }
    }
});