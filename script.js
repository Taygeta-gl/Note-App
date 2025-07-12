let currentUser = localStorage.getItem("loggedInUser");
const input = document.getElementById("noteInput");
const container = document.getElementById("notesContainer");

// Load saved notes
window.onload = function () {
  cleanUpTrash();
  const savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
  savedNotes.forEach(createNoteElement);

  document.getElementById("saveViewerBtn").onclick = function () {
  const newText = document.getElementById("fullNoteContent").value.trim();
  if (!newText || !currentlyViewedNote) return;

  // 1. Load existing notes
  let savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];

  // 2. Find index of the original note
  const index = savedNotes.indexOf(currentlyViewedNote);
  if (index !== -1) {
    // 3. Replace with new version
    savedNotes[index] = newText;

    // 4. Save back to localStorage
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(savedNotes));

    // 5. Refresh notes on the page
    container.innerHTML = "";
    savedNotes.forEach(createNoteElement);
  }

  // 6. Clear and disable viewer, keep it visible
currentlyViewedNote = null;

const content = document.getElementById("fullNoteContent");
content.value = "";
content.disabled = true;
content.placeholder = "Select the note First using ♣";
}

}

function addNote() {
  const text = input.value.trim();
  if (!text) return;

  // Get the current list of notes for this user
  let savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];

  // Add the new note
  savedNotes.push(text);

  // Save the updated notes list back to localStorage
  localStorage.setItem(`notes_${currentUser}`, JSON.stringify(savedNotes));

  // Create the visual note element
  createNoteElement(text);

  // Clear the input box
  input.value = "";
}


function createNoteElement(text) {
  const div = document.createElement("div");
  div.className = "note";
  const para = document.createElement("p");
  const previewText = text.length > 90 ? text.slice(0, 90) + "..." : text;
  para.textContent = previewText;
  div.appendChild(para);

  const viewBTN = document.createElement("button");
  viewBTN.className = "view-btn";
  viewBTN.textContent = "♣";
  viewBTN.onclick = function () {
    viewNote(text);
  }
  div.appendChild(viewBTN);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✖";
  deleteBtn.onclick = function () {
    div.remove();
    deleteNote(text);
  };

  div.appendChild(deleteBtn);
  container.appendChild(div);
   
}



let currentlyViewedNote = null;

function viewNote(textToView) {
  const viewer = document.getElementById("fullNoteViewer");
  const content = document.getElementById("fullNoteContent");

  content.disabled = false; // re-enable textarea
  content.placeholder = ""; // clear placeholder
  content.value = textToView;
  currentlyViewedNote = textToView;
  viewer.classList.remove("hidden");
}

function updateCenteredNote() {
  const notes = document.querySelectorAll('.note');
  const containerRect = container.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;

  let closestNote = null;
  let closestDistance = Infinity;

  notes.forEach(note => {
    const noteRect = note.getBoundingClientRect();
    const noteCenterX = noteRect.left + noteRect.width / 2;
    const distance = Math.abs(noteCenterX - containerCenterX);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestNote = note;
    }
  });

  notes.forEach(note => {
    if (note === closestNote) {
      note.classList.add('enlarged');
    } else {
      note.classList.remove('enlarged');
    }
  });
}

// Run on scroll
container.addEventListener('scroll', () => {
  requestAnimationFrame(updateCenteredNote); // smooth + optimized
});

// Also run once after loading notes
setTimeout(updateCenteredNote, 300);


function deleteNote(textToRemove) {
  // Remove from notes
  let savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
  savedNotes = savedNotes.filter(note => note !== textToRemove);
  localStorage.setItem(`notes_${currentUser}`, JSON.stringify(savedNotes));

  // Save to trash with timestamp
  let trash = JSON.parse(localStorage.getItem(`trash_${currentUser}`)) || [];
  trash.push({ text: textToRemove, deletedAt: Date.now() });
  localStorage.setItem(`trash_${currentUser}`, JSON.stringify(trash));
}

function viewTrash() {
  const overlay = document.getElementById("trashOverlay");
  const trashDiv = document.getElementById("trashContainer");

  overlay.classList.remove("hidden");
  trashDiv.innerHTML = "";

  const trash = JSON.parse(localStorage.getItem(`trash_${currentUser}`)) || [];

  if (trash.length === 0) {
    trashDiv.innerHTML = "<p style='color:gray;'>Trash is empty.</p>";
    return;
  }

  trash.forEach(({ text, deletedAt }) => {
    const div = document.createElement("div");
    div.className = "noteFromTrash";

    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);

    const restoreBtn = document.createElement("button");
    restoreBtn.textContent = "↩️";
    restoreBtn.onclick = function () {
      restoreNote(text);
      div.remove();
    };

    div.appendChild(restoreBtn);
    trashDiv.appendChild(div);
  });
}

function restoreNote(text) {
  const notes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
  restoreBtn.className = "restore-btn";
  
  notes.push(text);
  localStorage.setItem(`notes_${currentUser}`, JSON.stringify(notes));

  let trash = JSON.parse(localStorage.getItem(`trash_${currentUser}`)) || [];
  trash = trash.filter(item => item.text !== text);
  localStorage.setItem(`trash_${currentUser}`, JSON.stringify(trash));

  createNoteElement(text);
}

function cleanUpTrash() {
  let trash = JSON.parse(localStorage.getItem(`trash_${currentUser}`)) || [];
  const now = Date.now();
  trash = trash.filter(item => now - item.deletedAt < 24 * 60 * 60 * 1000); // 1 day
  localStorage.setItem(`trash_${currentUser}`, JSON.stringify(trash));
}

function closeTrash() {
  document.getElementById("trashOverlay").classList.add("hidden");
}

