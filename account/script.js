
let currentUser=null, currentProfile=null, userOrders=[];
const buttons=document.querySelectorAll('.menu button');
const pages=document.querySelectorAll('.page');
const title=document.getElementById('pageTitle');
const titles={dashboard:'Dashboard',orders:'Իմ պատվերները',library:'Թվային գրադարան',payments:'Վճարումներ',profile:'Իմ տվյալները'};
buttons.forEach(btn=>btn.addEventListener('click',()=>{const page=btn.dataset.page;buttons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');pages.forEach(p=>p.classList.remove('active'));document.getElementById(page).classList.add('active');title.textContent=titles[page];}));
function money(n){return Number(n||0).toLocaleString('hy-AM')+' դր․'}
function remaining(o){return Math.max(Number(o.price||0)-Number(o.paid_amount||0),0)}
function stepIndex(status){ if(!status) return 1; if(status.includes('Հեքիաթ')||status.includes('գրվում')) return 2; if(status.includes('Իլ')||status.includes('Նկար')||status.includes('Դիզայն')) return 3; if(status.includes('Տպ')) return 4; if(status.includes('Պատրաստ')) return 5; if(status.includes('Առաք')) return 6; return 1; }
function timeline(status){const steps=['Տվյալները ստացվել են','Ստեղծման փուլ','Նկարազարդում/դիզայն','Տպագրություն','Պատրաստ է','Առաքում'];const cur=stepIndex(status);return `<div class="timeline five-step">${steps.map((s,i)=>{const n=i+1;return `<div class="${n<cur?'done':n===cur?'current':''}"><b>${n<cur?'✓':n}</b><span>${s}</span></div>`}).join('')}</div>`}
async function init(){
 const session=await Aramazd.getSession();
 if(!session){ location.href='../login.html?next=account/index.html'; return; }
 currentUser=session.user; currentProfile=await Aramazd.ensureProfile(currentUser);
 document.getElementById('userName').textContent=currentProfile?.full_name||currentUser.email;
 document.getElementById('userEmail').textContent=currentUser.email;
 document.getElementById('avatar').textContent=(currentProfile?.full_name||currentUser.email||'Ա').trim()[0].toUpperCase();
 if(currentProfile?.role==='admin') document.getElementById('adminLink').style.display='block';
 document.getElementById('profileName').value=currentProfile?.full_name||'';
 document.getElementById('profileEmail').value=currentUser.email||'';
 document.getElementById('profilePhone').value=currentProfile?.phone||'';
 document.getElementById('profileCity').value=currentProfile?.city||'';
 document.getElementById('profileAddress').value=currentProfile?.address||'';
 document.getElementById('profileIndex').value=currentProfile?.postal_code||'';
 await loadOrders();
}
async function loadOrders(){
 const {data,error}=await aramazdClient.from('orders').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
 if(error){document.getElementById('ordersList').innerHTML='Սխալ՝ '+error.message;return;}
 userOrders=data||[];
 renderDashboard(); renderOrders(); renderPayments();
}
function renderDashboard(){
 const active=userOrders.filter(o=>!String(o.status||'').includes('Ավարտ')&&!String(o.status||'').includes('Առաք'));
 const done=userOrders.length-active.length;
 const debt=userOrders.reduce((s,o)=>s+remaining(o),0);

 document.getElementById('statAll').textContent=userOrders.length;
 document.getElementById('statActive').textContent=active.length;
 document.getElementById('statDone').textContent=done;
 document.getElementById('statDebt').textContent=money(debt);

 const latest=userOrders[0];

 document.getElementById('activeOrderBox').innerHTML = latest ? `
   <div class="order-head">
     <div>
       <h3>${latest.product}</h3>
       <p>Պատվեր #AA-${latest.id} • ${latest.status || 'Նոր պատվեր'}</p>
     </div>
     <span class="badge yellow">${latest.status || 'Նոր պատվեր'}</span>
   </div>

   ${timeline(latest.status)}

   <div class="pay-line">
     <span>Վճարման վիճակ</span>
     <b>${latest.payment_status || 'Չհաստատված'}</b>
   </div>
 ` : '<p>Դեռ պատվերներ չկան։</p>';

 document.getElementById('paymentBox').innerHTML = latest ? `
   <div class="pay-line"><span>Ընդհանուր</span><b>${money(latest.price)}</b></div>
   <div class="pay-line"><span>Կանխավճար</span><b>${money(latest.deposit_amount)}</b></div>
   <div class="pay-line"><span>Վճարված</span><b>${money(latest.paid_amount)}</b></div>
   <div class="pay-line"><span>Մնացած</span><b>${money(remaining(latest))}</b></div>
   <div class="pay-line"><span>Վճարման կարգավիճակ</span><b>${latest.payment_status || 'Չհաստատված'}</b></div>
   <button onclick="alert('Իրական IDBank/Idram վճարումը կկցվի հաջորդ փուլում։')">
     Վճարել մնացածը
   </button>
 ` : '<p>Վճարում չկա։</p>';
}
function renderOrders(){
 const box=document.getElementById('ordersList');
 if(!userOrders.length){box.innerHTML='<p>Դեռ պատվերներ չկան։</p>'; return;}
 box.innerHTML=userOrders.map(o=>`<article class="order-card" onclick="showOrder(${o.id})"><div><h3>${o.product}</h3><p>#AA-${o.id} • ${money(o.price)} • ${o.phone||''}</p></div><span class="badge yellow">${o.status||'Նոր պատվեր'}</span></article>`).join('');
 showOrder(userOrders[0].id);
}
function showOrder(id){
 const o=userOrders.find(x=>x.id===id);
 if(!o) return;

 document.querySelectorAll('.order-card').forEach(c=>c.classList.remove('selected'));

 const detail=o.details||{};

 document.getElementById('orderDetails').innerHTML=`
   <h2>${o.product}</h2>
   <p>#AA-${o.id} • ${o.status || 'Նոր պատվեր'}</p>

   ${timeline(o.status)}

   <div class="pay-line"><span>Ընդհանուր</span><b>${money(o.price)}</b></div>
   <div class="pay-line"><span>Կանխավճար</span><b>${money(o.deposit_amount)}</b></div>
   <div class="pay-line"><span>Վճարված</span><b>${money(o.paid_amount)}</b></div>
   <div class="pay-line"><span>Մնացած</span><b>${money(remaining(o))}</b></div>
   <div class="pay-line"><span>Վճարման կարգավիճակ</span><b>${o.payment_status || 'Չհաստատված'}</b></div>

   <pre style="white-space:pre-wrap;background:#fff;border-radius:16px;padding:16px">${JSON.stringify(detail,null,2)}</pre>
 `;
}
function renderPayments(){
 const box=document.getElementById('paymentsList');
 box.innerHTML=`<div class="panel"><h3>Մնացած գումար</h3><div class="big-price">${money(userOrders.reduce((s,o)=>s+remaining(o),0))}</div><p>Իրական վճարման կոճակը կկցվի IDBank/Idram-ից տվյալներ ստանալուց հետո։</p></div><div class="panel"><h3>Վճարման պատմություն</h3>${userOrders.map(o=>`<div class="history"><span>#AA-${o.id} ${o.product}</span><b>${money(o.paid_amount)}</b></div>`).join('')||'<p>Չկա</p>'}</div>`;
}
async function saveProfile(){
 const updates={full_name:document.getElementById('profileName').value,phone:document.getElementById('profilePhone').value,city:document.getElementById('profileCity').value,address:document.getElementById('profileAddress').value,postal_code:document.getElementById('profileIndex').value};
 const {error}=await aramazdClient.from('profiles').update(updates).eq('id',currentUser.id);
 if(error){alert('Սխալ։ '+error.message);return;} alert('Պահպանվեց ✅');
}
async function logoutAccount(){await aramazdClient.auth.signOut();location.href='../login.html';}
document.addEventListener('DOMContentLoaded',init);
