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

    // 1. Update localStorage
    let savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
    // FILTER OUT any non-strings
    savedNotes = savedNotes.filter(note => typeof note === "string");
    localStorage.setItem(`notes_${currentUser}`, JSON.stringify(savedNotes)); // optional cleanup
    savedNotes.forEach(createNoteElement);

    // 2. Refresh notes on the page
    container.innerHTML = "";
    savedNotes.forEach(createNoteElement);
    // 3. Reset and hide
    currentlyViewedNote = null;
    document.getElementById("fullNoteViewer").classList.add("hidden");
  }
};

function addNote() {
  const text = input.value.trim();
  if (!text) return;

  // Save to localStorage
  const savedNotes = JSON.parse(localStorage.getItem(`notes_${currentUser}`)) || [];
  savedNotes.push(text);
  localStorage.setItem(`notes_${currentUser}`, JSON.stringify(savedNotes));

  createNoteElement(text);
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

  content.value = textToView;
  currentlyViewedNote = textToView; // ✅ This is what was missing
  viewer.classList.remove("hidden");
}

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
