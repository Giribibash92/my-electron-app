window.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('note');
  const titleInput = document.getElementById('note-title');
  const saveBtn = document.getElementById('save');
  const saveAsBtn = document.getElementById('save-as');
  const openFileBtn = document.getElementById('open-file');
  const newNoteBtn = document.getElementById('new-note');
  const exportPdfBtn = document.getElementById('export-pdf');
  const statisticsBtn = document.getElementById('statistics');  
  const recentFilesBtn = document.getElementById('recent-files');
  const noteList = document.getElementById('note-list');
  const statusEl = document.getElementById('save_status');
  const categoryInput = document.getElementById('note-category');
  const categoryFilterEl = document.getElementById('category-filter');

  function getCategoryColor(category) {
    if (!category) return '#888888';
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 40%)`;
}

  // State
  let notes = [];                // all notes loaded from JSON
  let currentNoteId = null;      // id of the note being edited
  let lastSavedContent = '';     // tracks unsaved changes
  let debounceTimer = null;
  let lastSavedText = '';
  let currentFilePath = null;

  const fontIncreaseBtn = document.getElementById('font-increase');
  const fontDecreaseBtn = document.getElementById('font-decrease');
  let currentFontSize = 16;

  const darkModeBtn = document.getElementById('dark-mode-toggle');
let isDarkMode = false;

function applyDarkMode(enabled) {
    isDarkMode = enabled;

    if (enabled) {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        darkModeBtn.textContent = '🌙 Dark Mode';
    }
}

darkModeBtn.addEventListener('click', async () => {
    applyDarkMode(!isDarkMode);
    await window.electronAPI.saveSettings({
        darkMode: isDarkMode
    });
});

// NEW: Search input listener
const searchInput = document.getElementById('search');

searchInput.addEventListener('input', () => {
    renderNoteList(searchInput.value);
});


  function applyFontSize(size) {
     currentFontSize = Math.min(32, Math.max(10, size));
     textarea.style.fontSize = `${currentFontSize}px`;
}

fontIncreaseBtn.addEventListener('click', async () => {
    applyFontSize(currentFontSize + 2);
    await window.electronAPI.saveSettings({
        fontSize: currentFontSize
    });
});

fontDecreaseBtn.addEventListener('click', async () => {
    applyFontSize(currentFontSize - 2);
    await window.electronAPI.saveSettings({
        fontSize: currentFontSize
    });
});


exportPdfBtn.addEventListener('click', async () => {      //PDFfeature
    const result = await window.electronAPI.exportPdf({
        title: titleInput.value,
        content: textarea.value
    });

    if (result.success) {
        statusEl.textContent = `PDF exported: ${result.filePath}`;
    } else {
        statusEl.textContent = 'PDF export cancelled.';
    }
}); 

statisticsBtn.addEventListener('click', () => {      
    const totalNotes = notes.length;

    const pinnedNotes = notes.filter(note => note.pinned).length;

    const totalWords = notes.reduce((sum, note) => {
        const words = (note.content || '').trim() === ''
            ? 0
            : (note.content || '').trim().split(/\s+/).length;

        return sum + words;
    }, 0);

    const averageWords =
        totalNotes > 0
            ? Math.round(totalWords / totalNotes)
            : 0;

    alert(
`📊 Note Statistics

Total Notes: ${totalNotes}

Pinned Notes: ${pinnedNotes}

Total Words: ${totalWords}

Average Words Per Note: ${averageWords}`
    );
});

recentFilesBtn.addEventListener('click', async () => {
    const files = await window.electronAPI.getRecentFiles();

    if (files.length === 0) {
        alert('No recent files');
        return;
    }

    alert(files.join('\n'));
});

  function updateWordCount() {
    const text = textarea.value;
    const characters = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    const wordCountEl = document.getElementById('word-count');
    wordCountEl.textContent = `Words: ${words} | Characters: ${characters}`;
}





 // UPDATED: renderNoteList now accepts an optional search term
function renderNoteList(filter = '') {
    noteList.innerHTML = '';
    const categoryFilter = categoryFilterEl.value;  //NEW
    let filtered = notes.filter(note => {
    const matchesSearch =
        filter.trim() === '' ||
        (note.title || '').toLowerCase().includes(filter.toLowerCase()) ||
        (note.content || '').toLowerCase().includes(filter.toLowerCase());

    const matchesCategory =
        categoryFilter === '' ||
        (note.category || '') === categoryFilter;

    return matchesSearch && matchesCategory;
});

 
   

        filtered.forEach(note => {
    const item = document.createElement('div');

    item.className =
        'note-item' +
        (note.id === currentNoteId ? ' active' : '');

    item.innerHTML = `
        <div class="note-item-title">${note.title || 'Untitled'}</div>
        <div class="note-item-date">
            ${new Date(note.updatedAt).toLocaleDateString()}
        </div>
    `;

    item.addEventListener('click', async () => {
        await switchNote(note.id);
    });

    noteList.appendChild(item);
});

updateCategoryFilter();
}
    ;

    function updateCategoryFilter() {
    const currentValue = categoryFilterEl.value;

    const categories = [
        ...new Set(
            notes
                .map(n => n.category)
                .filter(Boolean)
        )
    ];

    categoryFilterEl.innerHTML =
        '<option value="">All Categories</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;

        if (cat === currentValue) {
            option.selected = true;
        }

        categoryFilterEl.appendChild(option);
    });
}

categoryFilterEl.addEventListener('change', () => {
    renderNoteList(searchInput.value);
});

// NEW: Switch to a different note (with unsaved changes warning)
async function switchNote(id) {
    // Check for unsaved changes first
    if (textarea.value !== lastSavedContent) {
        const result = await window.electronAPI.newNote();
        if (!result.confirmed) return; // user cancelled - stay on current note
    }

    // Load the selected note
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = note.id;
    titleInput.value = note.title || '';
    textarea.value = note.content || '';
    categoryInput.value = note.category || '';
    lastSavedContent = note.content || '';
    statusEl.textContent = '';
    updateWordCount();
    renderNoteList(searchInput.value); // refresh sidebar to show active state

}


// NEW: Save the currently open note to JSON
async function saveCurrentNote() {
    if (!currentNoteId) return;
    const note = {
    id: currentNoteId,
    title: titleInput.value || 'Untitled',
    content: textarea.value,
    category: categoryInput.value.trim() || ''
};
    await window.electronAPI.saveNoteJson(note);
    lastSavedContent = textarea.value;
    
    // Update the note in the local array too
    const index = notes.findIndex(n => n.id === currentNoteId);
    if (index !== -1) {
        notes[index] = { ...notes[index], ...note, updatedAt: new Date().toISOString() };
    }
    renderNoteList(searchInput.value);
    statusEl.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
}


// NEW: Delete a note
async function deleteNote(id) {
    const result = await window.electronAPI.newNote(); // reuse warning dialog
    if (!result.confirmed) return;
    await window.electronAPI.deleteNote(id);
    notes = notes.filter(n => n.id !== id);
    // If we deleted the current note, clear the editor
    if (currentNoteId === id) {
        currentNoteId = null;
        titleInput.value = '';
        textarea.value = '';
        lastSavedContent = '';
        statusEl.textContent = 'Note deleted.';
    }
    updateWordCount();
    renderNoteList(searchInput.value);
}

const settings = await window.electronAPI.getSettings();

applyFontSize(settings.fontSize || 16);
applyDarkMode(settings.darkMode || false);
// Load all notes when app starts
notes = await window.electronAPI.getNotes();

if (notes.length > 0) {
    const mostRecent = notes.reduce((a, b) =>
        new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
    );

    await switchNote(mostRecent.id);
} else {
    newNoteBtn.click();
}

renderNoteList(searchInput.value);
updateWordCount();

 
    const deleteBtn = document.getElementById('deleteBtn');
        
 
saveBtn.addEventListener('click', async () => {
    await saveCurrentNote();

    statusEl.textContent = 'Note saved!';
});


// UPDATED: New Note button – creates a new note in JSON storage
newNoteBtn.addEventListener('click', async () => {
    if (textarea.value !== lastSavedContent) {
        const result = await window.electronAPI.newNote();
        if (!result.confirmed) return;
    }

    // Create a new note object
    const newNote = {
        id: Date.now().toString(),
        title: 'Untitled',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    await window.electronAPI.saveNoteJson(newNote);
    notes.unshift(newNote);          // add to the top of the list
    currentNoteId = newNote.id;
    titleInput.value = '';
    textarea.value = '';
    lastSavedContent = '';
    renderNoteList(searchInput.value);
    titleInput.focus();             // move cursor to title field
    statusEl.textContent = 'New note created.';
});



// NEW: Open File button

openFileBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.openFile();
  if (result.success) {
    textarea.value = result.content;
    lastSavedText = result.content;
    currentFilePath = result.filePath;
    statusEl.textContent = `Opened: ${result.filePath}`;
  } else {
    statusEl.textContent = 'Open cancelled.';
  }
});

saveBtn.addEventListener('click', async () => {
    await saveCurrentNote();
});

saveAsBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.saveAs(textarea.value);

    if (result.success) {
        statusEl.textContent = `Saved as: ${result.filePath}`;
    } else {
        statusEl.textContent = 'Save As cancelled.';
    }
});

openFileBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
});

    // UPDATED: Auto-save with debounce
textarea.addEventListener('input', () => {
    updateWordCount();
  statusEl.textContent = 'Unsaved changes...';
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveCurrentNote, 5000);
});

// Also auto-save when title changes
titleInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveCurrentNote, 5000);
});

    deleteBtn.addEventListener('click', async () => {
    if (confirm('Really delete ALL notes? This cannot be undone!')) {
        try {
            await window.electronAPI.deleteNote();
            textarea.value = '';             // clear the box
            lastSavedText = '';
            statusEl.textContent = 'All notes deleted!';
            statusEl.style.color = 'red';
        } catch (err) {
            alert('Delete failed!');
        }
    }
});

// NEW: Menu action listeners
window.electronAPI.onMenuAction('menu-new-note', () => {
    newNoteBtn.click();  // reuse the existing button logic
});

window.electronAPI.onMenuAction('menu-open-file', () => {
    openFileBtn.click(); // reuse the existing button logic
});

window.electronAPI.onMenuAction('menu-save', () => {
    saveBtn.click();     // reuse the existing button logic
});

window.electronAPI.onMenuAction('menu-save-as', () => {
    saveAsBtn.click();   // reuse the existing button logic
});

});