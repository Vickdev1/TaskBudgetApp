// tasks.js
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('task-form');
  const listEl = document.getElementById('tasks-list');
  const filter = document.getElementById('filter-category');
  const streakEl = document.getElementById('streak');
  const checkAchievements = document.getElementById('check-achievements');

  async function fetchTasks() {
    const token = getToken();
    if(!token){ listEl.innerHTML = '<div class="muted">Login to manage tasks</div>'; return; }
    const q = filter.value ? `?category=${encodeURIComponent(filter.value)}` : '';
    const res = await fetch(`${API_BASE}/tasks${q}`, { headers: authHeader() });
    const data = await res.json();
    if(!Array.isArray(data)) return;
    listEl.innerHTML = data.map(t => `
      <div class="item">
        <div>
          <strong style="text-decoration:${t.completed ? 'line-through' : 'none'}">${escapeHtml(t.title)}</strong>
          <div class="meta">${escapeHtml(t.category || '')} • ${t.due_date ? t.due_date.split('T')[0] : ''}</div>
        </div>
        <div>
          <button class="btn" data-id="${t.id}" data-action="toggle">${t.completed ? 'Undo' : 'Complete'}</button>
          <button class="btn hollow" data-id="${t.id}" data-action="del">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // populate category options from tasks
  async function populateCategories(){
    const token = getToken();
    if(!token) return;
    const res = await fetch(`${API_BASE}/tasks`, { headers: authHeader() });
    const tasks = await res.json();
    const cats = Array.from(new Set(tasks.map(t => t.category || 'general')));
    filter.innerHTML = '<option value="">All</option>' + cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  form && form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const category = document.getElementById('task-category').value || 'general';
    const due = document.getElementById('task-due').value || null;
    const res = await fetch(`${API_BASE}/tasks`, { method:'POST', headers: authHeader(), body: JSON.stringify({title,category,due_date:due}) });
    if(res.ok){
      document.getElementById('task-title').value='';
      await refreshAll();
    } else {
      alert('Failed to add task');
    }
  });

  listEl && listEl.addEventListener('click', async (e)=>{
    const action = e.target.dataset.action;
    const id = e.target.dataset.id;
    if(!action || !id) return;
    if(action === 'toggle'){
      await fetch(`${API_BASE}/tasks/${id}/complete`, { method:'PUT', headers: authHeader() });
      await refreshAll();
    } else if(action === 'del'){
      if(!confirm('Delete task?')) return;
      await fetch(`${API_BASE}/tasks/${id}`, { method:'DELETE', headers: authHeader() });
      await refreshAll();
    }
  });

  filter && filter.addEventListener('change', fetchTasks);

  async function computeStreak(){
    // simple: count consecutive days with at least one completed task. We'll compute from tasks completed_at.
    const res = await fetch(`${API_BASE}/tasks`, { headers: authHeader() });
    const tasks = await res.json();
    const completed = tasks.filter(t=>t.completed && t.completed_at).map(t=>new Date(t.completed_at).toISOString().split('T')[0]);
    if(completed.length===0) { streakEl.textContent = 'No completed tasks yet'; return; }
    const daysSet = new Set(completed);
    // compute from today backwards
    let streak = 0;
    let d = new Date();
    while(true){
      const iso = d.toISOString().split('T')[0];
      if(daysSet.has(iso)){ streak++; d.setDate(d.getDate()-1); } else break;
    }
    streakEl.textContent = `${streak} day(s) current streak`;
  }

  async function refreshAll(){
    await fetchTasks();
    await populateCategories();
    await computeStreak();
  }

  if(checkAchievements) checkAchievements.addEventListener('click', async ()=>{
    const r = await fetch(`${API_BASE}/achievements/check`, { method:'POST', headers: authHeader() });
    const data = await r.json();
    if(data.awarded && data.awarded.length) alert('New achievements: ' + data.awarded.map(a=>a.title).join(', '));
    await fetchTasks();
  });

  refreshAll();
});