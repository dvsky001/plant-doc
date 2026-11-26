'use strict';
const C=window.PLANT_CONFIG;
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast('Память телефона заполнена')}}};
const p2=n=>String(n).padStart(2,'0');
const ymd=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return ymd(d)};
const diffDays=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
const fmtDate=s=>new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
const DEMO=!C.PLANTNET_KEY;
const FORM_E={succ:'🌵',rosette:'🌺',upright:'🌿',trail:'🍃',tree:'🌳',fern:'🌱'};

/* ---------- лимит бесплатных фото ---------- */
const isPrem=()=>!!LS.get('pd_prem',false);
function quota(){const q=LS.get('pd_quota',{d:'',n:0});return q.d===today()?q:{d:today(),n:0}}
const left=()=>Math.max(0,C.FREE_PER_DAY-quota().n);
function useShot(){const q=quota();q.n++;LS.set('pd_quota',q);drawQuota()}
function refundShot(){const q=quota();q.n=Math.max(0,q.n-1);LS.set('pd_quota',q);drawQuota()}
function drawQuota(){const el=$('#quota');if(isPrem()){el.textContent='Премиум ∞';el.className='quota';return}const l=left();el.textContent=l>0?`Фото сегодня: ${l} из ${C.FREE_PER_DAY}`:'Лимит на сегодня исчерпан';el.className='quota'+(l?'':' zero')}

/* ---------- состояние ---------- */
const S={view:'home',photo:null,mode:null,cands:[],pick:null,tr:{},ans:{},msg:'',plan:null,q:''};
function go(v){S.view=v;render();window.scrollTo(0,0);document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===(v==='mine'||v==='about'?v:'home')))}
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,3200)}

/* ---------- изображение ---------- */
async function loadBitmap(file){
  if(window.createImageBitmap){try{return await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){}}
  return await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file)});
}
function drawTo(bmp,max,q){
  const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,k=Math.min(1,max/Math.max(w,h));
  const c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return c;
}
async function prepare(file){
  const bmp=await loadBitmap(file);
  const big=drawTo(bmp,1280,.9);
  const blob=await new Promise(r=>big.toBlob(r,'image/jpeg',.9));
  const url=URL.createObjectURL(blob);
  const th=drawTo(bmp,160).toDataURL('image/jpeg',.7);
  return {blob,url,thumb:th};
}

/* ---------- распознавание ---------- */
const cyr=s=>/[а-яё]/i.test(s);
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function matchDB(lat){
  const l=(lat||'').toLowerCase(),gen=l.split(' ')[0];
  let p=PLANTS.find(p=>p.lat.toLowerCase()===l||p.syn.some(s=>s.toLowerCase()===l));
  if(p)return{p,genusOnly:false};
  p=PLANTS.find(p=>p.lat.toLowerCase().split(' ')[0]===gen||p.g.some(x=>x.toLowerCase()===gen)||p.syn.some(s=>s.toLowerCase().split(' ')[0]===gen));
  return p?{p,genusOnly:true}:{p:null};
}
async function identify(blob){
  const fd=new FormData();fd.append('organs','auto');fd.append('images',blob,'plant.jpg');
  const url=`https://my-api.plantnet.org/v2/identify/${encodeURIComponent(C.PLANTNET_PROJECT)}?api-key=${encodeURIComponent(C.PLANTNET_KEY)}&lang=${C.PLANTNET_LANG}&nb-results=5&include-related-images=false`;
  let r;try{r=await fetch(url,{method:'POST',body:fd})}catch(e){throw{code:'net'}}
  if(!r.ok)throw{code:r.status};
  const j=await r.json();
  return (j.results||[]).map(x=>{
    const sp=x.species||{},lat=sp.scientificNameWithoutAuthor||'';
    const m=matchDB(lat);
    const ruName=(sp.commonNames||[]).find(cyr);
    return{score:x.score||0,lat,fam:sp.family&&sp.family.scientificNameWithoutAuthor,ru:m.p&&!m.genusOnly?m.p.n:(ruName?cap(ruName):null),db:m.p,genusOnly:!!m.genusOnly};
  });
}
function errText(c){
  if(c==='net')return'Нет связи с сервисом распознавания. Проверьте интернет.';
  if(c===404)return'Растение на фото не найдено. Снимите лист или цветок крупнее и при свете.';
  if(c===429)return'Дневной лимит распознавания сервиса исчерпан. Подберите растение вручную — или попробуйте завтра.';
  if(c===401||c===403)return'Сервис отклонил ключ (проверьте ключ и список разрешённых доменов). Подберите вручную.';
  return'Сервис распознавания временно недоступен ('+c+'). Подберите вручную.';
}
async function onPhoto(file){
  if(!file)return;
  if(!isPrem()&&left()<=0){go('paywall');return}
  try{S.photo=await prepare(file)}catch(e){toast('Не удалось открыть фото');return}
  S.tr={};S.ans={};S.pick=null;S.plan=null;S.msg='';S.q='';S.cands=[];
  useShot();
  if(DEMO){S.mode='demo';go('clarify');return}
  S.mode='api';go('loading');
  try{
    S.cands=await identify(S.photo.blob);
    if(!S.cands.length)throw{code:404};
    const t=S.cands[0],second=S.cands[1];
    if(t.score>=.5&&(!second||t.score-second.score>.15)){choose(0);}
    else{S.msg='Уверенность низкая — уточните признаки или выберите из вариантов ниже.';go('clarify')}
  }catch(e){
    refundShot();S.mode='manual';S.msg=errText(e.code||'?');go('clarify');
  }
}

/* ---------- ранжирование по признакам ---------- */
const TR={form:[['succ','🌵 Сочное, толстые листья/колючки'],['rosette','🌺 Розетка листьев от земли'],['upright','🌿 Прямой куст/стебли'],['trail','🍃 Вьётся или свисает'],['tree','🌳 Дерево/пальма со стволом'],['fern','🌱 Папоротник']],
 fl:[[1,'🌸 Есть яркие цветы'],[0,'Без цветов']],
 lf:[['broad','Широкий лист'],['long','Длинный узкий'],['round','Округлый/мелкий'],['cut','Рассечённый/дырчатый'],['patt','Пёстрый/с рисунком']]};
function rank(){
  const t=S.tr,q=S.q.trim().toLowerCase();let list=[];
  const used=Object.keys(t).length;
  if(S.mode==='api'&&S.cands.length){
    S.cands.forEach((c,i)=>list.push({i,s:c.score*3+(c.db?traitScore(c.db):0),name:c.ru||c.lat,lat:c.lat,db:c.db,api:c.score,genusOnly:c.genusOnly}));
    if(used||q)PLANTS.forEach(p=>{if(!S.cands.some(c=>c.db===p))list.push({i:-1,s:traitScore(p)-1,name:p.n,lat:p.lat,db:p})});
  }else if(used||q)PLANTS.forEach(p=>list.push({i:-1,s:traitScore(p),name:p.n,lat:p.lat,db:p}));
  if(q)list=list.filter(x=>(x.name+' '+x.lat+' '+(x.db?x.db.al.join(' '):'')).toLowerCase().includes(q));
  return list.sort((a,b)=>b.s-a.s).slice(0,q?10:5);
}
function traitScore(p){const t=S.tr;let s=0;if(t.form&&p.form===t.form)s++;if('fl' in t&&p.fl===t.fl)s++;if(t.lf&&p.lf===t.lf)s++;return s}
function pickRank(x){
  if(x.i>=0){choose(x.i);return}
  S.pick={p:x.db,lat:x.db.lat,ru:x.db.n,score:null,genusOnly:false,manual:true};S.ans={};go('result');
}
function choose(i){
  const c=S.cands[i];
  S.pick={p:c.db,lat:c.lat,ru:c.ru||c.lat,fam:c.fam,score:c.score,genusOnly:c.genusOnly,manual:false};S.ans={};go('result');
}
function genericPlant(pk){return{id:null,n:pk.ru,lat:pk.lat,fam:pk.fam||'',form:'upright',fl:0,lf:'broad',lc:2,ws:7,wd:14,fd:21,rp:2,mx:80,tmin:18,tmax:26,tw:15,hum:2,soil:'univ',tox:null,tt:'',tip:'Этого вида нет во встроенной базе — показаны общие рекомендации для комнатных растений. Уточните по названию в справочнике.',buy:[],generic:true}}

/* ---------- план ухода ---------- */
const H_MID={s:10,m:27,l:70,xl:150};
function stageOf(p,a){
  const r=Math.min(1,(H_MID[a.h]||27)/(p.mx||60));
  let k='growing';
  if(r<.3)k='young';else if(r<.6)k='growing';else if(r<.85)k='adult';else k='mature';
  if(k==='young'&&a.own==='gt3')k='growing';
  if(a.bloom==='yes'&&k==='young')k='growing';
  const T={young:['Молодое растение','≈ до 1 года'],growing:['Растущее растение','≈ 1–3 года'],adult:['Взрослое растение','≈ 3–5 лет'],mature:['Зрелое растение','5+ лет']}[k];
  return{k,title:T[0],age:T[1],bloom:a.bloom==='yes'};
}
function makePlan(p,a){
  const m=new Date().getMonth(),summer=m>=3&&m<=8;
  let w=summer?p.ws:p.wd;
  if(a.light==='dark'&&p.lc>=2)w=Math.round(w*1.3);
  const st=stageOf(p,a);
  const lastW=a.last?(a.last==='today'?today():addDays(today(),-({d3:3,w1:7,w2:14}[a.last]||0))):null;
  let nextW=lastW?addDays(lastW,w):today();if(diffDays(nextW,today())<0)nextW=today();
  const feed=summer?(st.k==='young'?Math.round(p.fd*.8):p.fd):0;
  const rep=st.k==='young'?'каждую весну (растёт быстро, горшок на 2–3 см шире)':st.k==='mature'?`раз в ${p.rp+1}–${p.rp+2} г.; в остальные годы заменяйте верхние 3–5 см грунта`:`раз в ${p.rp} ${p.rp===1?'год':p.rp<5?'года':'лет'} весной`;
  const rem=[{k:'water',ic:'💧',t:'Полив',every:w,next:nextW,d:`каждые ~${w} дн. (${summer?'сейчас тёплый сезон':'сейчас прохладный сезон'}; ${summer?p.wd:p.ws} дн. в другой сезон)`}];
  if(feed)rem.push({k:'feed',ic:'🧪',t:'Подкормка',every:feed,next:addDays(today(),Math.min(feed,7)),d:`раз в ~${feed} дн. с апреля по сентябрь, половинная доза`});
  rem.push({k:'turn',ic:'🔄',t:'Повернуть к свету',every:14,next:addDays(today(),7),d:'на 1/4 оборота — крона растёт ровно'});
  rem.push({k:'pest',ic:'🔍',t:'Осмотр листьев на вредителей',every:30,next:addDays(today(),14),d:'низ листьев, пазухи: клещ, тля, щитовка'});
  const issues=[];
  if(a.light==='dark'&&p.lc===3)issues.push('Светолюбивому растению темно: ждите вытягивания и бледных листьев. Подвиньте к окну или добавьте фитолампу.');
  if(a.light==='dark'&&p.lc===2)issues.push('Света маловато: полив сокращён, поставьте ближе к окну.');
  if(a.light==='sun'&&p.lc===1)issues.push('Теневыносливое растение на прямом солнце: возможны ожоги — отодвиньте от окна или прикройте тюлью.');
  if(!summer)issues.push('Зимой подкормки не нужны, проверяйте землю пальцем перед поливом.');
  const safe=PLANTS.filter(x=>x.tox===0&&x.lc===p.lc&&x!==p).slice(0,3).map(x=>x.n);
  return{p,st,rem,rep,issues,pets:a.pets,safe,summer};
}

/* ---------- напоминания ---------- */
const mineList=()=>LS.get('pd_mine',[]);
const saveMine=l=>{LS.set('pd_mine',l);drawBadge()};
function dueCount(){const l=mineList();return l.filter(x=>diffDays(x.next.water,today())<=0).length}
function drawBadge(){const n=dueCount(),b=$('#badge');b.hidden=!n;b.textContent=n}
function savePlan(name){
  const pl=S.plan,l=mineList();const w=pl.rem.find(r=>r.k==='water'),f=pl.rem.find(r=>r.k==='feed');
  l.push({id:Date.now(),name:name||S.pick.ru,lat:S.pick.lat,thumb:S.photo?S.photo.thumb:'',added:today(),stage:pl.st.title,
    every:{water:w.every,feed:f?f.every:0},next:{water:w.next,feed:f?f.next:null}});
  saveMine(l);toast('Сохранено в «Мои растения»');
}
function icsFor(name,rem){
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Растениум//RU','CALSCALE:GREGORIAN'];
  rem.filter(r=>r.k==='water'||r.k==='feed').forEach(r=>{
    const d=r.next.replace(/-/g,'');
    L.push('BEGIN:VEVENT','UID:'+r.k+'-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'@plantarium','DTSTAMP:'+stamp,
      'DTSTART:'+d+'T090000','DTEND:'+d+'T091500','RRULE:FREQ=DAILY;INTERVAL='+r.every,
      'SUMMARY:'+(r.k==='water'?'💧 Полить: ':'🧪 Подкормить: ')+name.replace(/[,;\n]/g,' '),
      'DESCRIPTION:Напоминание из приложения Растениум. Проверьте землю пальцем перед поливом.',
      'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Растениум','TRIGGER:PT0S','END:VALARM','END:VEVENT');
  });
  L.push('END:VCALENDAR');return L.join('\r\n');
}
function downloadIcs(){
  const pl=S.plan,txt=icsFor(S.pick.ru,pl.rem);
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar;charset=utf-8'}));
  a.download='rastenium-'+(pl.p.id||'plant')+'.ics';document.body.appendChild(a);a.click();a.remove();
}
async function askNotify(){
  if(!('Notification' in window)){toast('Браузер не поддерживает уведомления. Используйте календарь (.ics)');return}
  const r=await Notification.requestPermission();
  toast(r==='granted'?'Уведомления включены: напомню при открытии приложения':'Уведомления не разрешены');if(r==='granted')LS.set('pd_notif',true);
}
async function notifyDue(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  const n=dueCount();if(!n||LS.get('pd_notified','')===today())return;
  LS.set('pd_notified',today());
  try{const reg=await navigator.serviceWorker.getRegistration();const o={body:`Пора полить растения: ${n}`,icon:'icons/icon-192.png'};reg?reg.showNotification('Растениум 💧',o):new Notification('Растениум 💧',o)}catch(e){}
}

/* ---------- покупки ---------- */
const SOILQ={univ:'грунт для комнатных растений',succ:'грунт для кактусов и суккулентов',orch:'субстрат для орхидей',aroid:'грунт для аронниковых',palm:'грунт для пальм',acid:'грунт для азалий',bulb:'грунт для луковичных',fern:'грунт для папоротников',citrus:'грунт для цитрусовых',viol:'грунт для фиалок',hoya:'грунт для хойи'};
function buyItems(p,a){
  const L=['горшок с дренажными отверстиями',SOILQ[p.soil]||SOILQ.univ];
  (p.buy&&p.buy.length?p.buy:['удобрение для комнатных растений']).forEach(x=>{if(!L.includes(x))L.push(x)});
  if(p.hum===3&&!L.some(x=>/увлажн/.test(x)))L.push('увлажнитель воздуха');
  if((p.lc===3||a.light==='dark')&&!L.some(x=>/фито/.test(x)))L.push('фитолампа для растений');
  L.push('лейка с тонким носиком');
  return [...new Set(L)].slice(0,6);
}
const shopUrl=(s,q)=>s.url.replace('{q}',encodeURIComponent(q));

/* ---------- экраны ---------- */
const demoBanner=()=>DEMO?`<div class="banner"><b>Демо-режим.</b> Распознавание по фото пока не подключено (ждёт бесплатный ключ Pl@ntNet), поэтому фото <b>не анализируется</b>: выберите растение из встроенной базы по признакам или названию. Дальше всё работает по-настоящему.</div>`:'';
const V={};
V.home=()=>{
  const due=dueCount();
  return `<section class="hero"><h1>Что это за растение?</h1><p>Сфотографируйте цветок или лист — подскажем название, стадию, как ухаживать и поливать, и безопасно ли для кошек и собак.</p></section>
  ${demoBanner()}
  <button class="btn" id="bCam">📷 Сфотографировать</button>
  <button class="btn sec" id="bGal">🖼 Выбрать из галереи</button>
  <button class="btn ghost" id="bMan">🔎 Подобрать вручную (без фото)</button>
  ${due?`<div class="banner red"><b>💧 Пора поливать: ${due}.</b> <a href="#" data-go="mine">Открыть «Мои растения»</a></div>`:''}
  <p class="mut">Советы для лучшего результата: снимайте один цветок или крупно лист, при дневном свете, без бликов.</p>
  <p class="small">Без рекламы. Фото обрабатывается на телефоне; ${DEMO?'в демо-режиме никуда не отправляется.':'для распознавания отправляется в сервис Pl@ntNet и не сохраняется у нас.'}</p>`;
};
V.loading=()=>`<img class="photo" src="${S.photo.url}" alt="Ваше фото"><div class="spin"></div><p style="text-align:center"><b>Определяем растение…</b></p>`;
V.clarify=()=>{
  const list=rank(),t=S.tr;
  const chips=(k)=>TR[k].map(([v,l])=>`<button class="chip ${k in t&&t[k]===v?'on':''}" data-tr="${k}" data-v="${v}">${l}</button>`).join('');
  const manual=!S.photo;
  return `${S.photo?`<img class="photo" src="${S.photo.url}" alt="Ваше фото" style="max-height:220px">`:''}
  ${demoBanner()}
  ${S.msg?`<div class="banner">${esc(S.msg)}</div>`:''}
  <h1>${manual?'Подбор вручную':'Давайте уточним'}</h1>
  <p class="mut">Ответьте на пару вопросов — список ниже подстроится. Или введите название.</p>
  <div class="q">Форма растения</div><div class="chips">${chips('form')}</div>
  <div class="q">Цветы</div><div class="chips">${chips('fl')}</div>
  <div class="q">Лист</div><div class="chips">${chips('lf')}</div>
  <input type="search" id="srch" placeholder="Знаете название? Например: монстера" value="${esc(S.q)}">
  <h2>${S.mode==='api'&&S.cands.length&&!Object.keys(t).length&&!S.q?'Варианты распознавания':'Подходящие растения'}</h2>
  ${list.length?list.map((x,i)=>`<div class="cand" data-pick="${i}"><div class="e">${FORM_E[x.db?x.db.form:'upright']}</div><div class="t"><b>${esc(x.name)}</b><small>${esc(x.lat)}${x.genusOnly?' (близкий вид)':''}</small></div>${x.api!=null?`<div class="s">${Math.round(x.api*100)}%</div>`:''}</div>`).join(''):`<p class="mut">${Object.keys(t).length||S.q?'Ничего не найдено — измените признаки или название.':'Выберите хотя бы один признак выше.'}</p>`}`;
};
V.result=()=>{
  const pk=S.pick,p=pk.p||genericPlant(pk),a=S.ans;
  const conf=pk.manual?`<span class="conf demo">Выбрано вручную</span>`:`<span class="conf ${pk.score<.5?'low':''}">Уверенность ${Math.round(pk.score*100)}%</span>`;
  const toxCls=p.tox==null?'tn':'t'+p.tox,toxLbl=p.tox==null?'Нет данных':['Безопасно для питомцев','Слабо токсично','Токсично'][p.tox];
  const ch=(k,opts)=>opts.map(([v,l])=>`<button class="chip ${a[k]===v?'on':''}" data-an="${k}" data-v="${v}">${l}</button>`).join('');
  return `${S.photo?`<img class="photo" src="${S.photo.url}" alt="Ваше фото">`:''}
  ${pk.manual&&DEMO&&S.photo?'<div class="banner">Демо: название выбрано вами, а не определено по фото.</div>':''}
  <div class="names"><div class="ru">${esc(pk.ru)}</div><div class="lat">${esc(pk.lat)}${p.fam?' · '+esc(p.fam):''}</div>${conf}${pk.genusOnly?'<span class="conf low">Вид близкий — уход как для рода</span>':''}</div>
  ${p.generic?`<div class="banner">${esc(p.tip)}</div>`:''}
  <h2>Параметры ухода</h2>
  <div class="grid">
   <div class="param"><b>☀️ Свет</b><span class="v">${esc(LIGHTS[p.lc])}</span></div>
   <div class="param"><b>💧 Полив</b><span class="v">лето: раз в ~${p.ws} дн.<br>зима: раз в ~${p.wd} дн.</span></div>
   <div class="param"><b>🌡 Температура</b><span class="v">${p.tmin}–${p.tmax} °C, зимой не ниже ${p.tw} °C</span></div>
   <div class="param"><b>💨 Влажность</b><span class="v">${esc(HUMS[p.hum])}</span></div>
   <div class="param full"><b>🪴 Почва</b><span class="v">${esc(SOILS[p.soil])}</span></div>
   <div class="param full"><b>🐾 Для кошек и собак</b><span class="tox ${toxCls}">${toxLbl}</span><br><span class="v">${p.tox==null?'Нет данных по этому виду — на всякий случай считайте опасным и держите вне доступа питомцев.':esc(TOX[p.tox]+(p.tt?' '+p.tt:''))}</span></div>
  </div>
  ${p.generic?'':`<div class="banner green">💡 ${esc(p.tip)}</div>`}
  <h2>Стадия и условия</h2>
  <div class="card"><p class="mut">Возраст по фото точно не определить: оценим по размеру и вашим ответам, и подстроим план.</p>
   <div class="q">Высота растения (или длина побегов)</div><div class="chips">${ch('h',[['s','до 15 см'],['m','15–40 см'],['l','40–100 см'],['xl','больше 1 м']])}</div>
   <div class="q">Как давно оно у вас?</div><div class="chips">${ch('own',[['lt1','меньше года'],['1-3','1–3 года'],['gt3','больше 3 лет'],['?','не помню']])}</div>
   ${p.fl||p.generic?`<div class="q">Цветёт или есть бутоны?</div><div class="chips">${ch('bloom',[['yes','да'],['no','нет']])}</div>`:''}
   <div class="q">Где стоит?</div><div class="chips">${ch('light',[['dark','тёмное место'],['mid','светло, без солнца'],['sun','на солнце']])}</div>
   <div class="q">Когда поливали в последний раз?</div><div class="chips">${ch('last',[['today','сегодня'],['d3','3 дня назад'],['w1','неделю назад'],['w2','2 недели назад'],['?','не помню']])}</div>
   <div class="q">Есть кошки или собаки?</div><div class="chips">${ch('pets',[['yes','да'],['no','нет']])}</div>
  </div>
  <button class="btn" id="bPlan">Составить план ухода →</button>
  <button class="btn ghost" id="bBack">Это другое растение</button>`;
};
V.plan=()=>{
  const pl=S.plan,p=pl.p,pk=S.pick,warn=pl.pets==='yes'&&(p.tox==null||p.tox>0);
  const items=buyItems(p,S.ans);
  const dueTxt=r=>{const d=diffDays(r.next,today());return d<=0?'<span class="due">сегодня</span>':d===1?'завтра':'через '+d+' дн. ('+fmtDate(r.next)+')'};
  return `<h1>План ухода: ${esc(pk.ru)}</h1>
  ${warn?`<div class="banner red">🐾 <b>У вас питомцы, а растение ${p.tox==null?'не проверено по токсичности':'токсично'}.</b> Поставьте там, куда не добраться, ${pl.safe.length?`или выберите безопасные при таком же свете: ${esc(pl.safe.join(', '))}.`:'или замените безопасным видом.'}</div>`:''}
  <div class="card"><h3>🌱 ${esc(pl.st.title)} (${pl.st.age})</h3><p class="mut">Оценка по размеру и вашим ответам, не по фото. ${pl.st.bloom?'Сейчас цветёт — не пересаживайте и не переставляйте.':''}</p></div>
  <h2>Напоминания</h2>
  <div class="card">${pl.rem.map(r=>`<div class="rem"><div class="ic">${r.ic}</div><div class="tx"><b>${r.t}: ${dueTxt(r)}</b><span>${esc(r.d)}</span></div></div>`).join('')}
   <div class="rem"><div class="ic">🪴</div><div class="tx"><b>Пересадка: ${esc(pl.rep)}</b><span>${esc(SOILS[p.soil])}</span></div></div></div>
  ${pl.issues.map(i=>`<div class="banner">${esc(i)}</div>`).join('')}
  <input type="text" id="nm" placeholder="Имя растения (необязательно)" maxlength="40">
  <button class="btn" id="bSave">💾 Сохранить в «Мои растения»</button>
  <div class="row"><button class="btn sec" id="bIcs">📅 В календарь (.ics)</button><button class="btn sec" id="bNot">🔔 Уведомления</button></div>
  <p class="small">Напоминания: в приложении («Мои растения» подсветит, что пора полить), по желанию — уведомление при открытии и повторяющееся событие в календаре телефона. Запоминается на этом устройстве (localStorage).</p>
  <h2>🛒 Купить для ухода</h2>
  <div class="card">${items.map(q=>`<div class="shop"><div class="l">${esc(cap(q))}</div>${C.SHOPS.map(s=>`<a class="${s.id}" style="background:${s.color}" href="${esc(shopUrl(s,q))}" target="_blank" rel="noopener sponsored">${s.name}</a>`).join('')}</div>`).join('')}
   ${C.AFFILIATE_PLACEHOLDER?'<p class="small">Ссылки-заглушки: ведут на поиск в магазине. Когда подключим партнёрские программы, покупка может приносить нам комиссию — цена для вас не изменится.</p>':''}</div>
  <button class="btn ghost" id="bNew">📷 Определить ещё одно</button>
  <p class="small">Справочная информация, не ветеринарная и не ботаническая консультация. При отравлении питомца обращайтесь к ветеринару.</p>`;
};
V.mine=()=>{
  const l=mineList();
  if(!l.length)return `<h1>Мои растения</h1><div class="card" style="text-align:center"><div style="font-size:48px">🪴</div><p>Пока пусто. Определите растение и сохраните план — здесь появятся напоминания о поливе.</p><button class="btn" data-go="home">📷 Определить растение</button></div>`;
  return `<h1>Мои растения</h1>`+l.sort((a,b)=>a.next.water.localeCompare(b.next.water)).map(x=>{
    const d=diffDays(x.next.water,today());
    const fd=x.next.feed?diffDays(x.next.feed,today()):null;
    return `<div class="card"><div class="mine">${x.thumb?`<img src="${x.thumb}" alt="">`:'<img alt="">'}<div style="flex:1"><h3>${esc(x.name)}</h3><div class="mut"><i>${esc(x.lat)}</i> · ${esc(x.stage||'')}</div>
    <div>💧 ${d<=0?`<span class="due">Полить ${d<0?'(просрочено на '+(-d)+' дн.)':'сегодня'}</span>`:`<span class="okc">через ${d} дн.</span> (${fmtDate(x.next.water)})`}</div>
    ${fd!=null?`<div class="mut">🧪 подкормка: ${fd<=0?'<b>пора</b>':'через '+fd+' дн.'}</div>`:''}</div></div>
    <button class="btn sm" data-wat="${x.id}">💧 Полито</button>${fd!=null&&fd<=0?`<button class="btn sm sec" data-fed="${x.id}">🧪 Подкормлено</button>`:''}<button class="btn sm danger" data-del="${x.id}">Удалить</button></div>`}).join('');
};
V.paywall=()=>`<section class="hero"><h1>Бесплатные фото на сегодня закончились</h1><p>${C.FREE_PER_DAY} фото в день — бесплатно. Завтра лимит обновится, а с подпиской фото без ограничений.</p></section>
 <div class="banner"><b>Заглушка:</b> оплата не подключена, тарифы ниже — пример оформления.</div>
 <div class="plans"><div class="pl"><b>${esc(C.PRICES.month)}</b>месяц</div><div class="pl best"><b>${esc(C.PRICES.year)}</b>год · выгоднее 50%</div></div>
 <ul class="tick"><li>Безлимитные определения по фото</li><li>Без рекламы (её у нас и так нет)</li><li>Напоминания и «Мои растения» без ограничений</li></ul>
 <button class="btn" id="bSub">Оформить подписку</button>
 <button class="btn ghost" id="bMan2">🔎 Подобрать вручную (бесплатно)</button>
 <button class="btn sec" data-go="home">Вернуться</button>`;
V.about=()=>`<h1>Растениум</h1>
 <div class="card"><h3>Режим</h3><p>${DEMO?'🟡 <b>Демо</b>: распознавание по фото не подключено (нужен ключ Pl@ntNet). Работают подбор по признакам, база из '+PLANTS.length+' растений, план и напоминания.':'🟢 Распознавание по фото: Pl@ntNet. База ухода: '+PLANTS.length+' растений.'}</p></div>
 <div class="card"><h3>Как это работает</h3><ul class="tick"><li>Фото → название (русское и латинское)</li><li>Низкая уверенность → уточняющие вопросы</li><li>Параметры, токсичность, стадия → план ухода</li><li>Напоминания о поливе: приложение, уведомление, календарь</li></ul></div>
 <div class="card"><h3>Подписка</h3><p class="mut">${isPrem()?'Включён тестовый премиум.':`Бесплатно: ${C.FREE_PER_DAY} фото в день.`}</p><button class="btn sm sec" data-go="paywall">Показать экран подписки</button></div>
 <div class="card"><h3>Тестирование</h3><button class="btn sm sec" id="bReset">Сбросить дневной лимит</button><button class="btn sm sec" id="bPrem">${isPrem()?'Выключить':'Включить'} тестовый премиум</button><button class="btn sm danger" id="bWipe">Стереть все данные</button></div>
 <p class="small">Данные растений: общедоступные справочники комнатного цветоводства и списки токсичности ASPCA. Распознавание: Pl@ntNet (my.plantnet.org). Приложение — прототип.</p>`;

function render(){
  $('#app').innerHTML=(V[S.view]||V.home)();
  bind();drawQuota();drawBadge();
}
function bind(){
  const q=s=>$(s);
  const on=(s,f)=>{const e=q(s);if(e)e.onclick=f};
  on('#bCam',()=>$('#fileCam').click());on('#bGal',()=>$('#fileGal').click());
  const manual=()=>{S.photo=null;S.mode='manual';S.cands=[];S.tr={};S.q='';S.msg='';go('clarify')};
  on('#bMan',manual);on('#bMan2',manual);
  document.querySelectorAll('[data-go]').forEach(b=>b.onclick=e=>{e.preventDefault();go(b.dataset.go)});
  document.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{const k=b.dataset.tr;let v=b.dataset.v;if(k==='fl')v=+v;if(S.tr[k]===v)delete S.tr[k];else S.tr[k]=v;render()});
  const sr=q('#srch');if(sr)sr.oninput=()=>{S.q=sr.value;const pos=sr.selectionStart;render();const n=q('#srch');n.focus();n.setSelectionRange(pos,pos)};
  document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>pickRank(rank()[+b.dataset.pick]));
  document.querySelectorAll('[data-an]').forEach(b=>b.onclick=()=>{S.ans[b.dataset.an]=b.dataset.v;const y=window.scrollY;render();window.scrollTo(0,y)});
  on('#bPlan',()=>{const p=S.pick.p||genericPlant(S.pick);S.plan=makePlan(p,S.ans);go('plan')});
  on('#bBack',()=>go('clarify'));
  on('#bSave',()=>{savePlan(($('#nm').value||'').trim());go('mine')});
  on('#bIcs',downloadIcs);on('#bNot',askNotify);
  on('#bNew',()=>go('home'));
  on('#bSub',()=>toast('Оплата пока не подключена — это заглушка. Скоро!'));
  on('#bReset',()=>{LS.set('pd_quota',{d:today(),n:0});drawQuota();toast('Лимит сброшен')});
  on('#bPrem',()=>{LS.set('pd_prem',!isPrem());go('about')});
  on('#bWipe',()=>{if(confirm('Стереть все растения и настройки на этом устройстве?')){localStorage.clear();S.photo=null;go('home')}});
  document.querySelectorAll('[data-wat]').forEach(b=>b.onclick=()=>{const l=mineList(),x=l.find(i=>i.id==b.dataset.wat);x.next.water=addDays(today(),x.every.water);saveMine(l);render()});
  document.querySelectorAll('[data-fed]').forEach(b=>b.onclick=()=>{const l=mineList(),x=l.find(i=>i.id==b.dataset.fed);x.next.feed=addDays(today(),x.every.feed);saveMine(l);render()});
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Удалить растение?')){saveMine(mineList().filter(i=>i.id!=b.dataset.del));render()}});
}
$('#fileCam').onchange=e=>{onPhoto(e.target.files[0]);e.target.value=''};
$('#fileGal').onchange=e=>{onPhoto(e.target.files[0]);e.target.value=''};
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.go));
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
go('home');notifyDue();
if(typeof window!=='undefined')window.__app={S,go,identify,matchDB};
