// auth.js: handles register/login UI endpoints
document.addEventListener('DOMContentLoaded', ()=> {
  const form = document.getElementById('auth-form');
  const title = document.getElementById('form-title');
  const toggle = document.getElementById('toggle-btn');
  const msg = document.getElementById('auth-msg');
  const nameInput = document.getElementById('name');

  let mode = 'login';
  if(toggle){
    toggle.addEventListener('click', ()=> {
      mode = mode === 'login' ? 'register' : 'login';
      title.textContent = mode === 'login' ? 'Login' : 'Register';
      toggle.textContent = mode === 'login' ? 'Switch to Register' : 'Switch to Login';
      nameInput.style.display = mode === 'login' ? 'none' : 'block';
    });
    toggle.click(); // start in login: show name hidden
    toggle.click(); // flip back so default shows properly
  }

  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const name = document.getElementById('name').value;
      msg.textContent = '';

      try {
        const url = `${API_BASE}/auth/${mode}`;
        const body = mode === 'login' ? { email, password } : { name, email, password };
        const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
        const data = await res.json();
        if(!res.ok){ msg.textContent = data.error || 'Auth failed'; return; }
        setToken(data.token);
        window.location.href = '/index.html';
      } catch(err){ msg.textContent = 'Network error'; console.error(err) }
    });
  }
});