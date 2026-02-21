// Notes PWA — Fully declarative MVV (no OS calls)
const CLUSTER_ID = 'Cluster_NotesApp';
const NOTES = ['Note_1', 'Note_2', 'Note_3'];
const notesContainer = document.getElementById('notesContainer');

// Render notes UI
function renderNotes(snapshot = {}) {
  notesContainer.innerHTML = '';
  NOTES.forEach(id => {
    const div = document.createElement('div');
    div.className = 'note';
    div.id = id;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = snapshot[id]?.text || ''; // text from snapshot
    input.placeholder = id;

    div.appendChild(input);
    notesContainer.appendChild(div);

    // Glow effect based on state
    const stateValue = snapshot[id]?.state || 0;
    if (stateValue > 0.7) div.classList.add('glow');
    else div.classList.remove('glow');
  });
}

// Simulated snapshot fetch from OS (could be real fetch in future)
function fetchSnapshot() {
  if (!window.entangle) return renderNotes(); // empty snapshot
  const cluster = entangle.clusters[CLUSTER_ID];
  if (!cluster) return renderNotes();

  const snapshot = {};
  Object.keys(cluster.entities).forEach(id => {
    snapshot[id] = {
      state: parseFloat(cluster.entities[id].state),
      text: `Entity: ${id}` // can be extended for actual note text
    };
  });

  renderNotes(snapshot);
}

// Auto-update loop
setInterval(fetchSnapshot, 500);
