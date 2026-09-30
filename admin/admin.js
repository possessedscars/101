(async function(){
  const form=document.getElementById('loginForm');
  const error=document.getElementById('loginError');
  if(!form)return;
  try{const r=await fetch('/api/auth/me',{credentials:'same-origin'});if(r.ok){location.replace('/admin/dashboard.html');return}}catch{}
  form.addEventListener('submit',async e=>{e.preventDefault();error.textContent='';const button=form.querySelector('button');button.disabled=true;button.textContent='A ENTRAR…';try{const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({email:document.getElementById('email').value.trim(),password:document.getElementById('password').value})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Não foi possível iniciar sessão.');location.replace('/admin/dashboard.html')}catch(err){error.textContent=err.message;button.disabled=false;button.innerHTML='ENTRAR <span>→</span>'}});
})();
