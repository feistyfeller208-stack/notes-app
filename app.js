const notesList = document.getElementById('notesList');
const editor = document.getElementById('editor');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const newNoteBtn = document.getElementById('newNoteBtn');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let notes = [];
let editingIndex = null;

// render notes list
function renderNotes() {
  notesList.innerHTML = '';
  notes.forEach((note, i) => {
    const li = document.createElement('li');
    li.textContent = note.title || 'Untitled Note';
    li.addEventListener('click', () => editNote(i));
    notesList.appendChild(li);
  });
}

// edit or create
function editNote(index = null) {
  editor.classList.remove('hidden');
  editingIndex = index;
  if(index !== null) {
    noteTitle.value = notes[index].title;
    noteContent.value = notes[index].content;
  } else {
    noteTitle.value = '';
    noteContent.value = '';
  }
}

// save note
function saveNote() {
  const note = {
    title: noteTitle.value,
    content: noteContent.value
  };
  if(editingIndex !== null) {
    notes[editingIndex] = note;
  } else {
    notes.push(note);
  }
  editor.classList.add('hidden');
  renderNotes();

  // optional: register with Entanglement OS
  if(window.entangle && currentCluster) {
    const entityId = `Note_${notes.length}`;
    entangle.registerEntity(currentCluster, entityId, 0, {});
  }
}

// cancel edit
function cancelEdit() { editor.classList.add('hidden'); }

// events
newNoteBtn.addEventListener('click', () => editNote());
saveNoteBtn.addEventListener('click', saveNote);
cancelEditBtn.addEventListener('click', cancelEdit);

// initial render
renderNotes();

// Make sure the OS is loaded first
// currentCluster = 'Cluster_Notes' in the dashboard

function registerAllNotesWithOS() {
  if (!window.entangle) return;
  if (!currentCluster) {
    // register cluster in OS if not existing
    entangle.registerCluster('Cluster_Notes');
    currentCluster = 'Cluster_Notes';
  }

  notes.forEach((note, i) => {
    const entityId = `Note_${i+1}`;
    // check if entity already exists in OS
    const cluster = entangle.clusters[currentCluster];
    if (cluster.entities[entityId]) return;

    // create entity with initial state 0 and empty correlations
    entangle.registerEntity(currentCluster, entityId, 0, {});
  });

  // update dashboard display
  if (typeof updateState === 'function') updateState();
}

// Call this whenever notes change
function syncNotesToOS() {
  registerAllNotesWithOS();
}

// Modify saveNote function to sync immediately
function saveNote() {
  const note = { title: noteTitle.value, content: noteContent.value };
  if(editingIndex !== null) {
    notes[editingIndex] = note;
  } else {
    notes.push(note);
  }
  editor.classList.add('hidden');
  renderNotes();
  syncNotesToOS(); // <- sync with OS
}
