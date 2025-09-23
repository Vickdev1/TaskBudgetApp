// profile.js
document.addEventListener('DOMContentLoaded', async ()=>{
  const panel = document.getElementById('profile-panel');
  const res = await fetch(`${API_BASE}/profile`, { headers: authHeader() });
  if(!res.ok){ panel.innerHTML = '<div class="muted">Login to view profile</div>'; return; }
  const data = await res.json();
  panel.innerHTML = `<div><strong>${escapeHtml(data.name || '')}</strong><div class="meta">${escapeHtml(data.email)}</div></div>`;
  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
});