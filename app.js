
// app.js
// This script sends notes to your Supabase REST API. You must create config.js with SUPABASE_URL and SUPABASE_ANON_KEY.

if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
  document.body.innerHTML = '<div style="padding:20px;color:red">Create config.js (copy config.example.js) and add SUPABASE_URL and SUPABASE_ANON_KEY. Then reload.</div>';
  throw new Error('Missing Supabase config');
}

const API_URL = SUPABASE_URL + '/rest/v1/notes';

async function saveNoteToSupabase(title, content) {
  const body = [{ title, content }];
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function fetchNotes() {
  const res = await fetch(API_URL + '?select=*&order=created_at.desc', {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  return res.json();
}

function escapeHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showMessage(txt) {
  const el = document.getElementById('message');
  el.textContent = txt;
  setTimeout(()=> el.textContent = '', 3000);
}

document.getElementById('noteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  if (!title || !content) { showMessage('Please add title and content'); return; }
  showMessage('Saving...');
  try {
    const result = await saveNoteToSupabase(title, content);
    if (result && result.length) {
      showMessage('Saved ✅');
      document.getElementById('noteForm').reset();
      loadAndRenderNotes();
    } else {
      showMessage('Save failed ❌ (check console)');
      console.error('save result', result);
    }
  } catch (err) {
    console.error(err);
    showMessage('Error saving (see console).');
  }
});

async function loadAndRenderNotes() {
  const list = document.getElementById('notesList');
  list.innerHTML = 'Loading...';
  try {
    const notes = await fetchNotes();
    if (!Array.isArray(notes)) { list.innerHTML = 'No notes yet.'; return; }
    if (notes.length === 0) { list.innerHTML = '<li>No notes yet</li>'; return; }
    list.innerHTML = '';
    for (const n of notes) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(n.title)}</strong>
                      <p>${escapeHtml(n.content)}</p>
                      <small>${n.created_at ? new Date(n.created_at).toLocaleString() : ''}</small>`;
      list.appendChild(li);
    }
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Error loading notes (see console)</li>';
  }
}

// initial load
loadAndRenderNotes();


