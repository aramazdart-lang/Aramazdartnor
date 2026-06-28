
let planName='Անհատական գիրք + NFC';
let planPrice=17000;
let currentMode='custom';
let heroes=0;
let pages=0;
let uploadedCount=0;
function format(n){return Number(n||0).toLocaleString('hy-AM')+' դր․'}
function updateTotal(){
  const heroPrice=heroes*2000, pagePrice=pages*2500, total=planPrice+heroPrice+pagePrice;
  document.getElementById('planName').textContent=planName;
  document.getElementById('planPrice').textContent=format(planPrice);
  document.getElementById('heroPrice').textContent=format(heroPrice);
  document.getElementById('pagePrice').textContent=format(pagePrice);
  document.getElementById('totalPrice').textContent=format(total);
}
function setMode(mode){
  currentMode=mode;
  document.getElementById('templates')?.classList.toggle('hidden',mode!=='ready');
  document.getElementById('customOnlyFields')?.classList.toggle('hidden',mode==='ready');
  document.getElementById('readyOnlyInfo')?.classList.toggle('hidden',mode!=='ready');
  document.getElementById('readyBlock')?.classList.toggle('hidden',mode!=='ready');
  document.getElementById('customQuestions')?.classList.toggle('hidden',mode!=='custom');
  if(mode==='ready'){heroes=0;pages=0;document.getElementById('heroCount').textContent='0';document.getElementById('pageCount').textContent='0'}
  updateTotal();
}
function selectPlan(name,price,mode='custom',btn){planName=name;planPrice=price;setMode(mode);document.querySelectorAll('.plan-card').forEach(c=>c.classList.remove('selected-plan'));btn?.closest('.plan-card')?.classList.add('selected-plan');(mode==='ready'?document.getElementById('templates'):document.getElementById('order'))?.scrollIntoView({behavior:'smooth',block:'start'});}
function selectTemplate(name,el){const selected=document.getElementById('selectedTemplate');if(selected)selected.textContent=name;document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));el?.closest('.template-card')?.classList.add('selected');document.getElementById('order')?.scrollIntoView({behavior:'smooth',block:'start'});}
function changeHero(d){if(currentMode==='ready')return;heroes=Math.max(0,heroes+d);document.getElementById('heroCount').textContent=heroes;updateTotal()}
function changePage(d){if(currentMode==='ready')return;pages=Math.max(0,pages+d);document.getElementById('pageCount').textContent=pages;updateTotal()}
function handleFiles(e){const files=Array.from(e.target.files||[]);uploadedCount=files.length;document.getElementById('uploadStatus').textContent=`Կցված է ${uploadedCount} նկար / նվազագույնը 10`;const t=document.getElementById('thumbs');if(t){t.innerHTML='';files.slice(0,12).forEach(f=>{const img=document.createElement('img');img.src=URL.createObjectURL(f);t.appendChild(img)})}}
async function fakeSubmit(){
  const selectedStory=document.getElementById('selectedTemplate')?.textContent||'';
  if(currentMode==='ready' && (!selectedStory || selectedStory==='Դեռ ընտրված չէ')){alert('Խնդրում ենք ընտրել պատրաստի հեքիաթի տարբերակը։');return}
  if(currentMode==='custom' && uploadedCount<10){alert('Խնդրում ենք կցել նվազագույնը 10 նկար։');return}
  const childName=document.querySelector('input[placeholder="օր․ Էվա"]')?.value||'';
  const phone=document.querySelector('input[placeholder="+374"]')?.value||'';
  const age=document.querySelector('input[placeholder="օր․ 5"]')?.value||'';
  const gender=document.querySelector('.grid-2 select')?.value||'';
  const notes=document.querySelector('textarea')?.value||'';
  if(!phone){alert('Խնդրում ենք լրացնել հեռախոսահամարը։');return}
  const total=planPrice+heroes*2000+pages*2500;
  await AramazdCheckout.start({
    product: planName,
    customer_name: childName||'Չնշված',
    phone: phone,
    price: total,
    deposit: 5000,
    details: {product_type:'fairytale',mode:currentMode,selected_story:selectedStory,child_name:childName,age,gender,uploaded_count:uploadedCount,extra_heroes:heroes,extra_pages:pages,notes}
  });
}
document.addEventListener('DOMContentLoaded',()=>{setMode('custom');updateTotal()});
