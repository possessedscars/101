(async function(){
  async function api(path,options={}){
    const r=await fetch(path,{...options,credentials:'same-origin'});
    if(r.status===401){location.replace('/admin/');throw new Error('Sessão expirada.')}
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||'Erro.');
    return d
  }

  const email=document.getElementById('userEmail');

  try{
    const me=await api('/api/auth/me');
    email.textContent=me.email||'Admin';
  }catch{return}

  function esc(v){
    return String(v??'').replace(/[&<>'"]/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[c]));
  }

  function money(order){
    const currency=order.currency||'$';
    const total=Number(order.total);
    return Number.isFinite(total)?`${esc(currency)}${total.toFixed(2)}`:'—';
  }

  function statusClass(status){
    return ['PAGO','PAGO / CONFIRMADO','CONFIRMADO'].includes(String(status||'').toUpperCase())?'paid':'pending';
  }

  function formatDate(value){
    if(!value)return '—';
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return value;
    return new Intl.DateTimeFormat('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);
  }

  async function load(){
    try{
      const d=await api('/api/admin/overview');

      document.getElementById('statOrders').textContent=d.stats.orders;
      document.getElementById('statBracelets').textContent=d.stats.bracelets;
      document.getElementById('statPaid').textContent=d.stats.paid;
      document.getElementById('statEvents').textContent=d.stats.events;

      const ordersBody=document.getElementById('ordersBody');
      ordersBody.innerHTML=d.orders.length
        ?d.orders.map(o=>`<tr title="${esc(formatDate(o.createdAt))}">
            <td><strong>${esc(o.orderCode)}</strong></td>
            <td>${esc(o.event)}</td>
            <td>${esc(o.customer)}<small class="table-sub">${esc(o.discord)}</small></td>
            <td>${esc(String(o.quantity))}</td>
            <td>${money(o)}</td>
            <td><span class="status ${statusClas(o.status)}">${esc(o.status)}</span></td>
          </tr>`).join('')
        :'<tr><td colspan="6" class="empty">Ainda não existem pedidos.</td></tr>';

      document.getElementById('eventsList').innerHTML=d.events.length
        ?d.events.map(e=>`<div class="mini-event"><div><strong>${esc(e.name)}</strong><small>${esc(String(e.bracelets))} pulseiras</small></div><span>${esc(String(e.orders))} pedidos</span></div>`).join('')
        :'<div class="empty">Ainda não existem eventos.</div>';

      const participants=[];
      for(const order of d.orders){
        for(const name of (order.participants||[])){
          participants.push({name,event:order.event,code:order.orderCode});
        }
      }

      document.getElementById('participantsList').innerHTML=participants.length
        ?participants.slice(0,20).map(p=>`<div class="mini-event"><div><strong>${esc(p.name)}</strong><small>${esc(p.event)}</small></div><span>${esc(p.code)}</span></div>`).join('')
        :'<div class="empty">Ainda não existem participantes.</div>';
    }catch(e){
      document.getElementById('ordersBody').innerHTML=`<tr><td colspan="6" class="empty">${esc(e.message)}</td></tr>`;
      document.getElementById('eventsList').innerHTML=`<div class="empty">${esc(e.message)}</div>`;
      document.getElementById('participantsList').innerHTML=`<div class="empty">${esc(e.message)}</div>`;
    }
  }

  document.getElementById('refreshBtn').addEventListener('click',load);
  document.getElementById('logoutBtn').addEventListener('click',async()=>{
    await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'});
    location.replace('/admin/');
  });

  load();
})();
