// main.js: common helpers
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:4000/api' : '/api';

function getToken(){ return localStorage.getItem('tb_token'); }
function setToken(t){ localStorage.setItem('tb_token', t); }
function logout(){
  localStorage.removeItem('tb_token');
  window.location.href = '/index.html';
}

function authHeader(){
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
}

document.addEventListener('DOMContentLoaded', ()=>{
  const authLink = document.getElementById('auth-link');
  if(authLink){
    if(getToken()){
      authLink.textContent = 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', (e)=>{ e.preventDefault(); logout(); });
    } else {
      authLink.textContent = 'Login';
      authLink.href = '/public/auth.html';
    }
  }
});