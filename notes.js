// Notes PWA — Declarative integration with Entanglement OS
const CLUSTER_ID = 'Cluster_NotesApp'; // must match OS dashboard cluster
const INITIAL_NOTES = ['Note_1', 'Note_2', 'Note_3'];

const notesContainer = document.getElementById('notesContainer');
const notesState = {}; // local state mirrors OS state

// Render notes
function renderNotes() {
  notesContainer.innerHTML = '';
  INITIAL_NOTES.forEach(id => {
    const div = document.createElement('div');
    div.className = 'note';
    div.id = id;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = notesState[id] || '';
    input.placeholder = id;

    // When user types, automatically send "boost" event to Entanglement OS
    input.addEventListener('input', (e) => {
      const value = e.target.value.length / 100; // arbitrary mapping: length → value
      sendEvent({ type: 'boost', value, entity: id });
    });

    div.appendChild(input);
    notesContainer.appendChild(div);
  });
  updateVisuals();
}

// Simulate sending event to Entanglement OS
function sendEvent(event) {
  if (!window.entangle) return;
  const osEvent = { type: event.type, value: event.value };
  if (event.type === 'merge') osEvent.target = event.target;
  entangle.applyEvent(CLUSTER_ID, osEvent); // OS handles event
  updateVisuals();
}

// Update visuals based on OS cluster state
function updateVisuals() {
  if (!window.entangle) return;
  const cluster = entangle.clusters[CLUSTER_ID];
  if (!cluster) return;

  Object.keys(cluster.entities).forEach(id => {
    const state = parseFloat(cluster.entities[id].state);
    notesState[id] = state > 0.5 ? 'Active' : '';
    const el = document.getElementById(id);
    if (el) {
      if (state > 0.7) el.classList.add('glow');
      else el.classList.remove('glow');
    }
  });
}

// Add a new note dynamically
function addNote() {
  const id = `Note_${INITIAL_NOTES.length + 1}`;
  INITIAL_NOTES.push(id);
  if (window.entangle) entangle.registerEntity(CLUSTER_ID, id, 0, {}); // OS tracks it
  renderNotes();
}

// Initial render
renderNotes();

// Auto-update loop to sync with Entanglement OS
setInterval(() => renderNotes(), 500);
