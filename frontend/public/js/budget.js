// budget.js
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('budget-form');
  const list = document.getElementById('budget-list');
  const balanceEl = document.getElementById('balance');
  const catSummary = document.getElementById('category-summary');

  async function refresh(){
    const res = await fetch(`${API_BASE}/budget/summary`, { headers: authHeader() });
    const data = await res.json();
    balanceEl.textContent = data.balance.toFixed(2);
    catSummary.innerHTML = data.categories.map(c=>`<div>${escapeHtml(c.category)}: ${parseFloat(c.net).toFixed(2)}</div>`).join('');
    // list entries
    const entries = await (await fetch(`${API_BASE}/budget`, { headers: authHeader() })).json();
    list.innerHTML = entries.map(e=>`<div class="item"><div><strong>${e.type === 'income' ? '+' : '-'}${parseFloat(e.amount).toFixed(2)}</strong><div class="meta">${escapeHtml(e.category)} • ${e.entry_date.split('T')[0]}</div></div><div>${escapeHtml(e.note||'')}</div></div>`).join('');
  }

  function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  form && form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const note = document.getElementById('note').value;
    const res = await fetch(`${API_BASE}/budget`, { method:'POST', headers: authHeader(), body: JSON.stringify({ amount, type, category, note })});
    if(res.ok){
      document.getElementById('amount').value='';
      await refresh();
    } else {
      alert('Failed to add budget entry');
    }
  });

  refresh();
});
