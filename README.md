Quick Note Taker [Extended Edition]

Group Information

Group Number: 8

Name| Student ID| Contribution
Giri Bibash| 2024591142| Export Note as PDF
Gurung Karuna| 2024791140| Note Statistics
Karki Mamata| 2024591255| Keyboard Shortcut Cheat Sheet
Tharu Chandrawati| 2024991274| Recent Files List
Thapa Minal| 2024791280| Testing, Packaging and Documentation

---

Application Description

Quick Note Taker is a desktop note-taking application developed using Electron. The application allows users to create, edit, save, organize, and manage multiple notes. Notes are stored locally using JSON storage and can be categorized, searched, and accessed efficiently through a user-friendly interface.

The application supports multiple notes, note switching, auto-saving, file operations, dark mode, categories, and several additional features implemented by the group.

---

Additional Features Implemented

1. Export Note as PDF

Developer: Giri Bibash

Description

Allows users to export the currently selected note as a PDF document.

Files Modified

- main.js
- preload.js
- renderer.js
- index.html

---

2. Note Statistics

Developer: Gurung Karuna

Description

Displays useful statistics about the current note, including:

- Word Count
- Character Count

Files Modified

- renderer.js
- index.html

---

3. Keyboard Shortcut Cheat Sheet

Developer: Karki Mamata

Description

Provides a Help menu option that displays available keyboard shortcuts used in the application.

Supported Shortcuts

- Ctrl + N → New Note
- Ctrl + O → Open File
- Ctrl + S → Save
- Ctrl + Shift + S → Save As

Files Modified

- main.js

---

4. Recent Files List

Developer: Tharu Chandrawati

Description

Stores recently opened files and allows quick access to previously opened documents.

Files Modified

- main.js
- preload.js
- renderer.js
- index.html

---

Existing Core Features

The application also includes the following required features:

- Multiple Notes Support
- Note Sidebar
- Save Notes
- Save As
- Open File
- Auto Save
- Unsaved Changes Warning
- Dark Mode
- Category Management
- Category Filter
- Pin Notes
- Word Counter
- Application Menu
- Keyboard Shortcuts
- Packaged Desktop Application

---

Technologies Used

- Electron
- Node.js
- JavaScript
- HTML
- CSS
- PDFKit

---

How to Run the Project

1. Install Node.js.
2. Open the project folder in Terminal or Command Prompt.
3. Install dependencies:

npm install

4. Start the application:

npm start

---

How to Build the Application

To generate a Windows installer:

npm run build

The installer will be created inside the dist folder.

---

Installation Instructions

1. Open the generated installer inside the dist folder.
2. Run the setup file.
3. Follow the installation wizard.
4. Launch Quick Note Taker from the Desktop or Start Menu.

---

Conclusion

This project extends the original Quick Note Taker application by implementing four additional features: Export Note as PDF, Note Statistics, Keyboard Shortcut Cheat Sheet, and Recent Files List. These enhancements improve usability, productivity, and overall user experience while maintaining all required core functionality.