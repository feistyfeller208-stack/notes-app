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

function renderNotes() {
  const clusterState = entangle.getClusterState('Cluster_Notes');

  Object.keys(clusterState).forEach(noteId => {
    const value = parseFloat(clusterState[noteId]);
    const el = document.getElementById(noteId);
    if (!el) return;

    // Map value 0–1 → background color brightness
    const brightness = 30 + value * 70; // 30% → 100%
    el.style.backgroundColor = `hsl(180, 80%, ${brightness}%)`;

    // Add glow if value > 0.7
    if (value > 0.7) el.classList.add('glow');
    else el.classList.remove('glow');

    // Optional: scale font based on state
    el.style.transform = `scale(${1 + value * 0.1})`;
  });
}

// Call renderNotes after each event
function submitEvent() {
  if (!currentCluster) { alert('Select cluster first'); return; }

  const eventType = document.getElementById('eventType').value;
  const value = parseFloat(document.getElementById('eventValue').value);
  const target = document.getElementById('targetEntity').value;
  if (isNaN(value)) { alert('Value must be number'); return; }

  const event = { type: eventType, value };
  if (eventType === 'merge') event.targetEntity = target;

  entangle.applyEvent(currentCluster, event);
  updateState();   // existing dashboard state update
  renderNotes();   // NEW: update Notes UI
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
