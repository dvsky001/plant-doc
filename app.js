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

/* ---------- регион, сезоны, язык ---------- */
const RGL=()=>Object.assign({r:'ru',hem:'N',lang:'ru'},LS.get('pd_region',{}));
function rg(){const s=RGL(),cfg=C.REGIONS[s.r]||C.REGIONS.ru;const sh=m=>s.hem==='S'?m.map(x=>(x+6)%12):m;
  return{key:s.r,hem:s.hem,lang:s.lang,cfg,shops:cfg.shops,prices:cfg.prices,warm:sh(cfg.warm),heat:sh(cfg.heat),dark:sh(cfg.dark)}}
const isWarm=m=>rg().warm.includes(m),isHeat=m=>rg().heat.includes(m),isDark=m=>rg().dark.includes(m);
const MONTHS=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const T={
 ru:{nav_id:'Определить',nav_mine:'Мои растения',nav_grow:'Гровинг',nav_more:'Ещё',hero_h:'Что это за растение?',hero_p:'Сфотографируйте цветок или лист — подскажем название, стадию, как ухаживать и поливать, и безопасно ли для кошек и собак.',b_cam:'📷 Сфотографировать',b_gal:'🖼 Выбрать из галереи',b_man:'🔎 Подобрать вручную (без фото)',q_left:'Фото сегодня: {l} из {n}',q_zero:'Лимит на сегодня исчерпан',prem:'Премиум ∞'},
 kk:{nav_id:'Анықтау',nav_mine:'Менің өсімдіктерім',nav_grow:'Өсіру',nav_more:'Тағы',hero_h:'Бұл қандай өсімдік?',hero_p:'Гүлді немесе жапырақты суретке түсіріңіз — атауын, күтімін, суаруын және мысықтар мен иттерге қауіпсіздігін айтамыз.',b_cam:'📷 Суретке түсіру',b_gal:'🖼 Галереядан таңдау',b_man:'🔎 Қолмен таңдау (суретсіз)',q_left:'Бүгінгі фото: {l} / {n}',q_zero:'Бүгінгі лимит таусылды',prem:'Премиум ∞'},
 en:{nav_id:'Identify',nav_mine:'My plants',nav_grow:'Growing',nav_more:'More',hero_h:'What plant is this?',hero_p:'Take a photo of a flower or leaf — we will tell you its name, how to water and care for it, and whether it is safe for cats and dogs.',b_cam:'📷 Take a photo',b_gal:'🖼 Choose from gallery',b_man:'🔎 Pick manually (no photo)',q_left:'Photos today: {l} of {n}',q_zero:'Daily limit reached',prem:'Premium ∞'}
};
const t=(k,o)=>{let s=(T[rg().lang]||T.ru)[k]||T.ru[k]||k;if(o)for(const x in o)s=s.replace('{'+x+'}',o[x]);return s};
// запросы для магазинов на английском (для «другого региона» с английским языком)
const Q_EN={'горшок с дренажными отверстиями':'plant pot with drainage holes','лейка с тонким носиком':'watering can long spout','увлажнитель воздуха':'room humidifier','фитолампа для растений':'full spectrum grow light','фитолампа полный спектр':'full spectrum grow light','фитолампа':'full spectrum grow light','гигрометр':'hygrometer','пульверизатор':'plant mister spray bottle','кашпо подвесное':'hanging planter','грунт для комнатных растений':'indoor potting mix','грунт универсальный':'potting soil','грунт для кактусов и суккулентов':'cactus succulent soil','грунт для суккулентов':'cactus succulent soil','субстрат для орхидей':'orchid bark mix','грунт для аронниковых':'aroid potting mix','грунт для пальм':'palm potting mix','грунт для азалий':'azalea acidic soil','грунт для луковичных':'bulb potting mix','грунт для папоротников':'fern potting mix','грунт для цитрусовых':'citrus potting soil','грунт для фиалок':'african violet soil','грунт для хойи':'hoya potting mix','удобрение для комнатных растений':'houseplant fertilizer','удобрение для цветущих':'flowering plant fertilizer','удобрение для фикусов':'ficus fertilizer','удобрение для орхидей':'orchid fertilizer','удобрение для фиалок':'african violet fertilizer','удобрение для пальм и драцен':'palm dracaena fertilizer','удобрение для герани':'geranium fertilizer','удобрение для цитрусовых':'citrus fertilizer','удобрение для роз':'rose fertilizer','удобрение для кактусов':'cactus fertilizer','удобрение для луковичных':'bulb fertilizer','удобрение для ягод':'berry fertilizer','удобрение для томатов':'tomato fertilizer','мох-палка опора':'moss pole plant support','опора для вьющихся растений':'plant trellis support','прозрачный горшок для орхидей':'clear orchid pot','средство для блеска листьев':'leaf shine spray','перчатки садовые':'garden gloves','средство для подкисления воды':'water acidifier','поддон глубокий':'deep plant saucer','обработка от вредителей':'houseplant pest spray','рассада клубники ремонтантной':'everbearing strawberry plants','кашпо для клубники с дренажом':'strawberry planter','грунт для клубники':'strawberry potting soil','гидропонная система для клубники':'hydroponic strawberry system','питательный раствор для клубники':'strawberry hydroponic nutrient','pH и EC тестер':'pH EC meter','семена томатов черри высокорослые':'indeterminate cherry tomato seeds','семена томатов черри балконные':'dwarf cherry tomato seeds','гроубокс':'grow tent','led фитолампа полный спектр':'full spectrum LED grow light','вентилятор для гроубокса':'grow tent clip fan','грунт для томатов':'tomato potting soil','горшок 5 л для томатов':'5 gallon pot tomatoes','лоток для микрозелени':'microgreens growing tray','кокосовый субстрат для микрозелени':'coco coir microgreens'};
const qt=q=>rg().lang==='en'?(Q_EN[q]||q):q;

const FORM_E={succ:'🌵',rosette:'🌺',upright:'🌿',trail:'🍃',tree:'🌳',fern:'🌱'};

/* ---------- лимит бесплатных фото ---------- */
const isPrem=()=>!!LS.get('pd_prem',false);
function quota(){const q=LS.get('pd_quota',{d:'',n:0});return q.d===today()?q:{d:today(),n:0}}
const left=()=>Math.max(0,C.FREE_PER_DAY-quota().n);
function useShot(){const q=quota();q.n++;LS.set('pd_quota',q);drawQuota()}
function refundShot(){const q=quota();q.n=Math.max(0,q.n-1);LS.set('pd_quota',q);drawQuota()}
function drawQuota(){const el=$('#quota');if(isPrem()){el.textContent=t('prem');el.className='quota';return}const l=left();el.textContent=l>0?t('q_left',{l,n:C.FREE_PER_DAY}):t('q_zero');el.className='quota'+(l?'':' zero')}

/* ---------- состояние ---------- */
const S={view:'home',photo:null,mode:null,cands:[],pick:null,tr:{},ans:{},msg:'',plan:null,q:''};
function setNav(){const m={home:'nav_id',mine:'nav_mine',grow:'nav_grow',about:'nav_more'};document.querySelectorAll('#nav button').forEach(b=>{b.querySelector('em').textContent=t(m[b.dataset.go])})}
function go(v){S.view=v;render();window.scrollTo(0,0);document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===(['mine','about'].includes(v)?v:['grow','gcrop','gproj'].includes(v)?'grow':'home')))}
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
  const m=new Date().getMonth(),summer=isWarm(m);
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
  if(!summer)issues.push('В холодный сезон подкормки не нужны, проверяйте землю пальцем перед поливом.');
  if(isHeat(m)&&p.hum>=2)issues.push('Идёт отопительный сезон: воздух сухой — поставьте увлажнитель или поддон с мокрой галькой, держите подальше от батареи.');
  const safe=PLANTS.filter(x=>x.tox===0&&x.lc===p.lc&&x!==p).slice(0,3).map(x=>x.n);
  return{p,st,rem,rep,issues,pets:a.pets,safe,summer};
}

/* ---------- напоминания ---------- */
const mineList=()=>LS.get('pd_mine',[]);
const saveMine=l=>{LS.set('pd_mine',l);drawBadge()};
function dueCount(){const l=mineList();return l.filter(x=>diffDays(x.next.water,today())<=0).length+growDue()}
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
const shopUrl=(s,q)=>s.url.replace('{q}',encodeURIComponent(qt(q)));


/* ---------- Гровинг ---------- */
const growList=()=>LS.get('pd_grow',[]);
const saveGrow=l=>{LS.set('pd_grow',l);drawBadge()};
function gFind(cid,vid,k){const c=GCROPS.find(x=>x.id===cid);let v=c.v.find(v=>v.id===vid)||c.v[0];
  if(k&&k!==1){const s=d=>Math.round(d*k);v={...v,steps:v.steps.map(x=>({...x,d:s(x.d)})),rep:v.rep.map(r=>({...r,from:s(r.from),to:s(r.to)})),harvest:{...v.harvest,min:s(v.harvest.min),max:s(v.harvest.max)}}}
  return{c,v}}
const kFor=(v,start)=>v.nat&&isDark(new Date(start+'T12:00:00').getMonth())?rg().cfg.kdark:1;
function gTasks(pr){
  const {c,v}=gFind(pr.crop,pr.vr,pr.k),el=diffDays(today(),pr.start),dn=pr.done||{};
  const out={due:[],next:[],all:[],el,c,v};
  v.steps.forEach((s,i)=>{const t={key:'s'+i,date:addDays(pr.start,s.d),day:s.d,t:s.t,x:s.x,ic:'📌',done:!!dn['s'+i],rep:false};out.all.push(t);if(!t.done)(s.d<=el?out.due:out.next).push(t)});
  v.rep.forEach((r,i)=>{
    const maxK=Math.floor((r.to-r.from)/r.every);
    const kc=el>=r.from?Math.min(maxK,Math.floor((el-r.from)/r.every)):-1;
    const last=dn['r'+i]==null?-1:dn['r'+i];
    out.all.push({key:'r'+i,date:addDays(pr.start,r.from),day:r.from,t:r.t+' — каждые '+r.every+' дн.',x:r.x,ic:r.ic,rep:true,every:r.every});
    if(kc>last&&kc>=0&&el<=r.to)out.due.push({key:'r'+i,k:kc,date:addDays(pr.start,r.from+kc*r.every),day:r.from+kc*r.every,t:r.t,x:r.x,ic:r.ic,rep:true});
    const kn=Math.max(kc+1,0);if(kn<=maxK)out.next.push({key:'r'+i,date:addDays(pr.start,r.from+kn*r.every),day:r.from+kn*r.every,t:r.t,x:r.x,ic:r.ic,rep:true,fut:true});
  });
  out.due.sort((a,b)=>a.day-b.day);out.next.sort((a,b)=>a.day-b.day);out.all.sort((a,b)=>a.day-b.day);
  return out;
}
function growDue(){try{return growList().reduce((n,p)=>n+gTasks(p).due.length,0)}catch(e){return 0}}
function gIcs(pr){
  const {c,v}=gFind(pr.crop,pr.vr,pr.k),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,''),name=(pr.name||c.n).replace(/[,;\n]/g,' ');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Растениум//RU','CALSCALE:GREGORIAN'];
  const ev=(d,sum,desc,rr)=>{const dd=addDays(pr.start,d).replace(/-/g,'');L.push('BEGIN:VEVENT','UID:g'+Date.now()+Math.random().toString(36).slice(2)+'@plantarium','DTSTAMP:'+stamp,'DTSTART:'+dd+'T090000','DTEND:'+dd+'T091500',...(rr?['RRULE:'+rr]:[]),'SUMMARY:'+sum,'DESCRIPTION:'+String(desc).replace(/[\n,;]/g,' '),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Растениум','TRIGGER:PT0S','END:VALARM','END:VEVENT')};
  v.steps.forEach(s=>ev(s.d,'🌱 '+name+': '+s.t,s.x));
  v.rep.forEach(r=>ev(r.from,r.ic+' '+name+': '+r.t,r.x,'FREQ=DAILY;INTERVAL='+r.every+';COUNT='+(Math.floor((r.to-r.from)/r.every)+1)));
  L.push('END:VCALENDAR');return L.join('\r\n');
}
function gDownload(pr){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([gIcs(pr)],{type:'text/calendar;charset=utf-8'}));a.download='growing-'+pr.crop+'.ics';document.body.appendChild(a);a.click();a.remove()}
const harvestLine=(v,el)=>el<v.harvest.min?`до первого сбора ≈ ${v.harvest.min-el} дн.`:el<=v.harvest.max?'🎉 пора собирать!':'окно первого урожая прошло — продолжайте собирать по мере созревания';
const taskRow=(t,pid,withBtn)=>`<div class="rem"><div class="ic">${t.ic}</div><div class="tx"><b>${esc(t.t)}</b><span>${t.fut?'':''}${fmtDate(t.date)} · ${esc(t.x)}</span></div>${withBtn?`<button class="btn sm" data-gdone="${pid}|${t.key}|${t.k==null?'':t.k}">✓</button>`:''}</div>`;

/* ---------- экраны ---------- */
const demoBanner=()=>DEMO?`<div class="banner"><b>Демо-режим.</b> Распознавание по фото пока не подключено (ждёт бесплатный ключ Pl@ntNet), поэтому фото <b>не анализируется</b>: выберите растение из встроенной базы по признакам или названию. Дальше всё работает по-настоящему.</div>`:'';
const V={};
V.home=()=>{
  const due=dueCount();
  return `<section class="hero"><h1>${t('hero_h')}</h1><p>${t('hero_p')}</p></section>
  ${demoBanner()}
  <button class="btn" id="bCam">${t('b_cam')}</button>
  <button class="btn sec" id="bGal">${t('b_gal')}</button>
  <button class="btn ghost" id="bMan">${t('b_man')}</button>
  <button class="btn sec" data-go="grow">🌱 ${t('nav_grow')}: клубника, микрозелень, помидоры черри</button>
  ${due?`<div class="banner red"><b>💧 Пора поливать: ${due}.</b> <a href="#" data-go="mine">Открыть «Мои растения»</a></div>`:''}
  <p class="small">${rg().cfg.flag} Регион: <b>${esc(rg().cfg.n)}</b> · <a href="#" data-go="about">изменить</a></p>
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
  <div class="card">${items.map(q=>`<div class="shop"><div class="l">${esc(cap(q))}</div>${rg().shops.map(s=>`<a class="${s.id}" style="background:${s.color}" href="${esc(shopUrl(s,q))}" target="_blank" rel="noopener sponsored">${s.name}</a>`).join('')}</div>`).join('')}
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
 <div class="plans"><div class="pl"><b>${esc(rg().prices.month)}</b>месяц</div><div class="pl best"><b>${esc(rg().prices.year)}</b>год · выгоднее 50%</div></div>
 <ul class="tick"><li>Безлимитные определения по фото</li><li>Без рекламы (её у нас и так нет)</li><li>Напоминания и «Мои растения» без ограничений</li></ul>
 <button class="btn" id="bSub">Оформить подписку</button>
 <button class="btn ghost" id="bMan2">🔎 Подобрать вручную (бесплатно)</button>
 <button class="btn sec" data-go="home">Вернуться</button>`;
V.about=()=>`<h1>Растениум</h1>

 <div class="card"><h3>Регион и язык</h3>
  <div class="chips">${Object.entries(C.REGIONS).map(([k,r])=>`<button class="chip ${rg().key===k?'on':''}" data-rg="${k}">${r.flag} ${r.n}</button>`).join('')}</div>
  ${rg().key==='other'?`<div class="q">Полушарие</div><div class="chips"><button class="chip ${rg().hem==='N'?'on':''}" data-hem="N">Северное</button><button class="chip ${rg().hem==='S'?'on':''}" data-hem="S">Южное</button></div>`:''}
  <div class="q">Язык интерфейса</div><div class="chips">${[['ru','Русский'],['kk','Қазақша'],['en','English']].map(([k,l])=>`<button class="chip ${rg().lang===k?'on':''}" data-lang="${k}">${l}</button>`).join('')}</div>
  <p class="mut">${esc(rg().cfg.climate)}</p>
  <ul class="tick"><li>Сезоны: тёплый — ${rg().warm.length?MONTHS[rg().warm[0]]+'…':'—'}; отопительный: ${rg().heat.length?'учитывается':'нет'}</li><li>Календарь «Гровинг»: сроки старта и поправка на тёмный сезон</li><li>Магазины: ${rg().shops.map(s=>s.name).join(', ')}</li><li>Валюта подписки: ${rg().cfg.cur}</li></ul>
  <p class="small">Список растений и культур от региона не зависит. Перевод на казахский и английский пока частичный (меню и главный экран), остальное на русском.</p></div>
 <div class="card"><h3>Режим</h3><p>${DEMO?'🟡 <b>Демо</b>: распознавание по фото не подключено (нужен ключ Pl@ntNet). Работают подбор по признакам, база из '+PLANTS.length+' растений, план и напоминания.':'🟢 Распознавание по фото: Pl@ntNet. База ухода: '+PLANTS.length+' растений.'}</p></div>
 <div class="card"><h3>Как это работает</h3><ul class="tick"><li>Фото → название (русское и латинское)</li><li>Низкая уверенность → уточняющие вопросы</li><li>Параметры, токсичность, стадия → план ухода</li><li>Напоминания о поливе: приложение, уведомление, календарь</li></ul></div>
 <div class="card"><h3>Подписка</h3><p class="mut">${isPrem()?'Включён тестовый премиум.':`Бесплатно: ${C.FREE_PER_DAY} фото в день.`}</p><button class="btn sm sec" data-go="paywall">Показать экран подписки</button></div>
 <div class="card"><h3>Тестирование</h3><button class="btn sm sec" id="bReset">Сбросить дневной лимит</button><button class="btn sm sec" id="bPrem">${isPrem()?'Выключить':'Включить'} тестовый премиум</button><button class="btn sm danger" id="bWipe">Стереть все данные</button></div>
 <p class="small">Данные растений: общедоступные справочники комнатного цветоводства и списки токсичности ASPCA. Распознавание: Pl@ntNet (my.plantnet.org). Приложение — прототип.</p>`;


V.grow=()=>{
  const l=growList();
  const cats=[...new Set(GCROPS.map(c=>c.cat))];
  const due=l.map(p=>({p,t:gTasks(p)})).filter(x=>x.t.due.length);
  return `<section class="hero"><h1>🌱 Гровинг</h1><p>Выращивайте дома: клубнику, микрозелень и помидоры черри. Свет, полив, температура, субстрат, сроки до урожая и календарь задач с напоминаниями.</p></section>
  ${due.length?`<h2>Сегодня</h2><div class="card">${due.map(x=>x.t.due.slice(0,4).map(t=>`<div class="mut">${esc(x.p.name||x.t.c.n)}</div>`+taskRow(t,x.p.id,true)).join('')).join('')}</div>`:''}
  ${l.length?`<h2>Мои посадки</h2>`+l.map(p=>{const t=gTasks(p);return `<div class="card cand" data-gp="${p.id}" style="box-shadow:none"><div class="e">${t.c.e}</div><div class="t"><b>${esc(p.name||t.c.n)}</b><small style="font-style:normal">${esc(t.v.n)} · день ${Math.max(0,t.el)} · ${harvestLine(t.v,t.el)}</small></div>${t.due.length?`<div class="s due">${t.due.length}</div>`:''}</div>`}).join(''):''}
  ${cats.map(cat=>`<h2>${cat}</h2>${GCROPS.filter(c=>c.cat===cat).map(c=>`<div class="cand" data-gc="${c.id}"><div class="e">${c.e}</div><div class="t"><b>${esc(c.n)}</b><small style="font-style:normal">${c.v.length>1?c.v.map(v=>v.n).join(' · '):'урожай через '+c.v[0].harvest.min+'–'+c.v[0].harvest.max+' дн.'}</small></div></div>`).join('')}`).join('')}
  <p class="small">Сроки и режимы ориентировочные и зависят от сорта, света и температуры. Не заменяют консультацию агронома.</p>`;
};
V.gcrop=()=>{
  const c=GCROPS.find(x=>x.id===S.gc),v0=c.v.find(x=>x.id===S.gv)||c.v[0],startD=addDays(today(),S.gs||0),k=kFor(v0,startD),v=gFind(c.id,v0.id,k).v,win=(GWIN[c.id+'/'+v0.id]||{})[rg().key];
  const wm=new Date().getMonth(),inWin=!win||win.m.map(x=>rg().hem==='S'?(x+6)%12:x).includes(wm);
  const hv=`≈ ${v.harvest.min}–${v.harvest.max} дн. до первого урожая`+(k>1?` (с учётом тёмного сезона в вашем регионе, +${Math.round((k-1)*100)}%)`:(v0.harvest.txt?' — '+v0.harvest.txt:''));
  return `<button class="btn sm sec" data-go="grow">← Назад</button>
  <div class="names"><div class="ru">${c.e} ${esc(c.n)}</div></div>
  <p class="mut">${esc(c.intro)}</p>
  ${c.v.length>1?`<div class="chips">${c.v.map(x=>`<button class="chip ${x.id===v.id?'on':''}" data-gv="${x.id}">${esc(x.n)}</button>`).join('')}</div>`:`<p class="mut"><b>${esc(v.n)}</b></p>`}
  <div class="grid">
   <div class="param"><b>☀️ Свет</b><span class="v">${esc(v.light.h)}</span><br><span class="mut">${esc(v.light.sp)}</span></div>
   <div class="param"><b>💧 Полив</b><span class="v">${esc(v.water)}</span></div>
   <div class="param"><b>🌡 Температура</b><span class="v">${esc(v.temp)}</span></div>
   <div class="param"><b>💨 Влажность</b><span class="v">${esc(v.hum)}</span></div>
   <div class="param full"><b>🪴 Субстрат</b><span class="v">${esc(v.sub)}</span></div>
   <div class="param full"><b>⏱ До урожая</b><span class="v">${esc(hv)}</span></div>
  </div>
  <div class="banner ${win&&!inWin?'':'green'}">${rg().cfg.flag} ${esc(rg().cfg.n)}: ${win?`лучшее время старта — ${esc(win.t)}.${inWin?' Сейчас подходящий период.':' Сейчас не лучший период — нужна досветка 14–16 ч.'}`:'можно начинать круглый год.'}${k>1?' Сейчас в регионе короткий световой день, сроки удлинены.':''}</div>
  ${v.tips&&v.tips.length?v.tips.map(t=>`<div class="banner green">💡 ${esc(t)}</div>`).join(''):''}
  <h2>Пошаговый календарь</h2>
  <div class="card">${v.steps.map(s=>`<div class="rem"><div class="ic">📌</div><div class="tx"><b>День ${s.d}: ${esc(s.t)}</b><span>${esc(s.x)}</span></div></div>`).join('')}
   ${v.rep.map(r=>`<div class="rem"><div class="ic">${r.ic}</div><div class="tx"><b>${esc(r.t)} — каждые ${r.every} дн.</b><span>с дня ${r.from}. ${esc(r.x)}</span></div></div>`).join('')}</div>
  <h2>Начать выращивание</h2>
  <div class="card"><div class="q">Когда посадили/посеяли?</div><div class="chips">${[[0,'сегодня'],[1,'завтра'],[-7,'неделю назад'],[-14,'2 недели назад']].map(([n,l])=>`<button class="chip ${S.gs===n?'on':''}" data-gs="${n}">${l}</button>`).join('')}</div>
   <input type="text" id="gname" placeholder="Название (необязательно)" maxlength="40">
   <button class="btn" id="bGStart">🌱 Начать и включить календарь</button></div>
  <h2>🛒 Купить для выращивания</h2>
  <div class="card">${growBuy(c,v).map(q=>`<div class="shop"><div class="l">${esc(cap(q))}</div>${rg().shops.map(s=>`<a class="${s.id}" style="background:${s.color}" href="${esc(shopUrl(s,q))}" target="_blank" rel="noopener sponsored">${s.name}</a>`).join('')}</div>`).join('')}
   ${C.AFFILIATE_PLACEHOLDER?'<p class="small">Ссылки-заглушки: ведут на поиск в магазине.</p>':''}</div>`;
};
function growBuy(c,v){
  if(c.id==='straw')return v.id==='hydro'?['рассада клубники ремонтантной','гидропонная система для клубники','питательный раствор для клубники','pH и EC тестер','фитолампа полный спектр']:['рассада клубники ремонтантной','кашпо для клубники с дренажом','грунт для клубники','удобрение для ягод','фитолампа полный спектр'];
  if(c.id==='tom')return v.id==='box'?['семена томатов черри высокорослые','гроубокс','led фитолампа полный спектр','вентилятор для гроубокса','грунт для томатов','удобрение для томатов']:['семена томатов черри балконные','горшок 5 л для томатов','грунт для томатов','удобрение для томатов','фитолампа полный спектр'];
  return ['семена '+c.n.toLowerCase()+' для микрозелени','лоток для микрозелени','кокосовый субстрат для микрозелени','фитолампа полный спектр'];
}
V.gproj=()=>{
  const pr=growList().find(p=>p.id==S.gp);if(!pr)return V.grow();
  const t=gTasks(pr),v=t.v,pct=Math.max(0,Math.min(100,Math.round(t.el/v.harvest.max*100)));
  return `<button class="btn sm sec" data-go="grow">← Гровинг</button>
  <div class="names"><div class="ru">${t.c.e} ${esc(pr.name||t.c.n)}</div><div class="lat">${esc(t.c.n)} · ${esc(v.n)}</div></div>
  <div class="card"><b>День ${Math.max(0,t.el)}</b> · ${harvestLine(v,t.el)}<div style="background:var(--gl);border-radius:99px;height:10px;margin-top:8px"><div style="background:var(--g);height:10px;border-radius:99px;width:${pct}%"></div></div><p class="small">Старт: ${fmtDate(pr.start)}. Сроки ориентировочные.</p></div>
  <h2>Сегодня</h2><div class="card">${t.due.length?t.due.map(x=>taskRow(x,pr.id,true)).join(''):'<p class="okc">Все задачи на сегодня выполнены ✓</p>'}</div>
  <h2>Ближайшее</h2><div class="card">${t.next.slice(0,6).map(x=>taskRow(x,pr.id,false)).join('')||'<p class="mut">Нет предстоящих задач.</p>'}</div>
  <details class="card"><summary>Весь календарь (${t.all.length})</summary>${t.all.map(x=>`<div class="rem"><div class="ic">${x.done?'✅':x.ic}</div><div class="tx"><b>${x.rep?'':'День '+x.day+': '}${esc(x.t)}</b><span>${x.rep?'с ':''}${fmtDate(x.date)} · ${esc(x.x)}</span></div></div>`).join('')}</details>
  <div class="row"><button class="btn sec" id="bGIcs">📅 В календарь (.ics)</button><button class="btn sec" id="bNot">🔔 Уведомления</button></div>
  <button class="btn danger" data-gdel="${pr.id}">Удалить посадку</button>`;
};

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

  document.querySelectorAll('[data-rg]').forEach(b=>b.onclick=()=>{const s=RGL();s.r=b.dataset.rg;LS.set('pd_region',s);setNav();render()});
  document.querySelectorAll('[data-hem]').forEach(b=>b.onclick=()=>{const s=RGL();s.hem=b.dataset.hem;LS.set('pd_region',s);render()});
  document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const s=RGL();s.lang=b.dataset.lang;LS.set('pd_region',s);setNav();render()});
  document.querySelectorAll('[data-gc]').forEach(b=>b.onclick=()=>{S.gc=b.dataset.gc;S.gv=null;S.gs=0;go('gcrop')});
  document.querySelectorAll('[data-gv]').forEach(b=>b.onclick=()=>{S.gv=b.dataset.gv;render()});
  document.querySelectorAll('[data-gs]').forEach(b=>b.onclick=()=>{S.gs=+b.dataset.gs;const y=window.scrollY;render();window.scrollTo(0,y)});
  document.querySelectorAll('[data-gp]').forEach(b=>b.onclick=()=>{S.gp=b.dataset.gp;go('gproj')});
  on('#bGStart',()=>{const c=GCROPS.find(x=>x.id===S.gc),v=c.v.find(x=>x.id===S.gv)||c.v[0],l=growList(),id=Date.now();const stD=addDays(today(),S.gs||0);
    l.push({id,crop:c.id,vr:v.id,name:($('#gname').value||'').trim(),start:stD,k:kFor(v,stD),region:rg().key,done:{}});
    saveGrow(l);S.gp=id;toast('Посадка сохранена, календарь включён');go('gproj')});
  on('#bGIcs',()=>{const pr=growList().find(p=>p.id==S.gp);if(pr)gDownload(pr)});
  document.querySelectorAll('[data-gdone]').forEach(b=>b.onclick=()=>{const [pid,key,k]=b.dataset.gdone.split('|'),l=growList(),pr=l.find(p=>p.id==pid);pr.done=pr.done||{};pr.done[key]=key[0]==='r'?+k:true;saveGrow(l);render()});
  document.querySelectorAll('[data-gdel]').forEach(b=>b.onclick=()=>{if(confirm('Удалить посадку?')){saveGrow(growList().filter(p=>p.id!=b.dataset.gdel));go('grow')}});
  document.querySelectorAll('[data-wat]').forEach(b=>b.onclick=()=>{const l=mineList(),x=l.find(i=>i.id==b.dataset.wat);x.next.water=addDays(today(),x.every.water);saveMine(l);render()});
  document.querySelectorAll('[data-fed]').forEach(b=>b.onclick=()=>{const l=mineList(),x=l.find(i=>i.id==b.dataset.fed);x.next.feed=addDays(today(),x.every.feed);saveMine(l);render()});
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Удалить растение?')){saveMine(mineList().filter(i=>i.id!=b.dataset.del));render()}});
}
$('#fileCam').onchange=e=>{onPhoto(e.target.files[0]);e.target.value=''};
$('#fileGal').onchange=e=>{onPhoto(e.target.files[0]);e.target.value=''};
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.go));
if('serviceWorker' in navigator)window.addEventListener('load',()=>{const had=!!navigator.serviceWorker.controller;let re=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(re||!had)return;re=true;location.reload()});navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(reg=>{const chk=()=>{try{reg.update()}catch(e){}};document.addEventListener('visibilitychange',()=>{if(!document.hidden)chk()});setInterval(chk,300000)}).catch(()=>{})});
setNav();go('home');notifyDue();
if(typeof window!=='undefined')window.__app={S,go,identify,matchDB,gIcs,growList,makePlan};
