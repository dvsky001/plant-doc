/* Растениум v9: «Обмен и маркет», услуги мастеров, лента и сторис соседей, карта района, модерация */
const SB={url:'https://zzuyvlzraykibovxsfvc.supabase.co',key:'sb_publishable_YIMP4FCnDx2cXFbqEz9sdA_E0NuRKpp'};
const SV=[['chimney','🧹','Трубочист'],['stove','🔥','Печник'],['fence','🚧','Забор'],['greenhouse','🏠','Теплица'],['plough','🚜','Культиватор, вспашка'],['handyman','🔨','Разнорабочий'],['devices','📡','Подключить устройства']];
const LK=[['seeds','🌰','Семена'],['seedlings','🌱','Рассада'],['preserves','🫙','Заготовки'],['other','📦','Другое']];
const PK=[['harvest','🧺','Урожай'],['bloom','🌸','Цветение'],['question','❓','Вопрос'],['story','⏱','Сторис 24 ч']];
const S9={st:null,busy:false,cache:{},mkind:'',psv:'',ptab:'pros',open:null,rev:null,photo:null,pkind:'harvest',stars:0,media:new Map(),lk:null};
const ERR9={bad:'Что-то не так с данными — проверьте поля',empty:'Заполните обязательные поля',contact:'Укажите Telegram (ник) или WhatsApp (номер, от 7 цифр)',price:'Укажите цену или отметьте «Меняю»',
 link:'Ссылки в тексте нельзя — контакты укажите в полях Telegram / WhatsApp',mat:'Уберите грубые слова, пожалуйста',drugs:'Такое нельзя размещать: запрещённые вещества',weapon:'Такое нельзя размещать: оружие и патроны',alcohol:'Такое нельзя размещать: алкоголь',
 limit:'Лимит на сегодня исчерпан — попробуйте завтра',photo:'Фото не подошло — попробуйте другое',already:'Вы это уже сделали',self:'Нельзя оставить отзыв самому себе',gone:'Запись уже удалена',services:'Выберите хотя бы одну услугу',net:'Нет связи с сервером — попробуйте позже'};

/* ---------- фильтры (те же, что на сервере) ---------- */
const norm9=t=>{const a='ёaeopcyxkmthbu',b='еаеорсухкмтнву';return String(t||'').toLowerCase().replace(/[ёaeopcyxkmthbu]/g,c=>b[a.indexOf(c)])};
const RX9={
 link:/(https?:\/\/|www\.|t\.me\/|wa\.me\/|[a-z0-9-]+\.(ru|com|net|org|su|io|me|info|biz|рф|xyz|site|online)([\/?#\s]|$))/,
 mat:/(^|[^а-яa-z0-9])(бля|ебат|ебан|ебал|ебл|ебу|ебет|хуй|хуе|хуя|хуи|пизд|пидор|пидар|мудак|мудил|сука|суки|сучк|гандон|залуп|шлюх|дроч|выеб|заеб|наеб|отъеб|уеб|долбоеб|распизд|охуе|похуй|нахуй|нихуя|ебну|ебись)/,
 drugs:/(конопл|каннаб|канаб|марихуан|гашиш|наркот|спайс|психотроп|псилоц|амфетамин|героин|кокаин|опиум|опийн|мак снотворн|снотворный мак|шишки для курения|травк[аиу] для курения)/,
 drugsL:/(cannab|marijuan|hemp seed|weed seed|hashish|cocaine|heroin|psilocyb)/,
 weapon:/(^|[^а-я])(оружи|пистолет|револьвер|ружь|винтовк|патрон|травмат|арбалет|боеприпас|взрывчат|порох|кастет|глушител)/,
 weapon2:/(^|[^а-я])(обрез|обреза|обрезы|обрезов)([^а-я]|$)/,
 alc:/(^|[^а-я])(самогон|водк|коньяк|алкогол|наливк|брага|бражк|спиртн|пиво|пива|вино|вина|виски|ликер)([^а-я]|$)/,
 alc2:/(^|[^а-я])(самогон|водк|коньяк|алкогол|наливк|бражк|спиртн)/
};
function bad9(t){
  const r=String(t||'').toLowerCase(),n=norm9(t);
  if(RX9.link.test(r))return 'link';if(RX9.mat.test(n))return 'mat';
  if(RX9.drugs.test(n)||RX9.drugsL.test(r))return 'drugs';if(RX9.weapon.test(n)||RX9.weapon2.test(n))return 'weapon';
  if(RX9.alc.test(n)||RX9.alc2.test(n))return 'alcohol';return null;
}
const badAny=(...a)=>{for(const x of a){const b=bad9(x);if(b)return b}return null};

/* ---------- устройство, район, контакты ---------- */
function dev9(){let d=LS.get('pd_dev','');if(!/^[A-Za-z0-9-]{16,64}$/.test(d)){d=(crypto.randomUUID?crypto.randomUUID():ID8()+ID8()+ID8()+ID8()).replace(/[^A-Za-z0-9-]/g,'');LS.set('pd_dev',d)}return d}
const grid9=(x,lim)=>!isFinite(x)||Math.abs(x)>lim?null:Math.round(Math.round(x/0.015)*0.015*1000)/1000;
function geo9(){const g=curG().geo||LS.get('pd_geo',null);return g&&isFinite(g.lat)&&isFinite(g.lon)?{lat:grid9(+g.lat,90),lon:grid9(+g.lon,180)}:null}
const me9=()=>LS.get('pd_me',{name:'',area:'',tg:'',wa:''});
const own9=()=>LS.get('pd_own',{});
const ownAdd=(t,id)=>{const o=own9();o[t+':'+id]=Date.now();LS.set('pd_own',o)};
const isOwn=(t,id)=>!!own9()[t+':'+id];
const repd=()=>LS.get('pd_rep',{});
const tgOk=s=>/^[A-Za-z0-9_]{0,32}$/.test(s);
const cleanTg=s=>String(s||'').trim().replace(/^https?:\/\/t\.me\//i,'').replace(/^@/,'');
const cleanWa=s=>String(s||'').replace(/\D/g,'').replace(/^8(\d{10})$/,'7$1');
const ago=ts=>{const m=Math.max(0,Math.round((Date.now()-new Date(ts))/6e4));return m<1?'только что':m<60?m+' мин назад':m<1440?Math.round(m/60)+' ч назад':Math.round(m/1440)+' дн назад'};
const rub=v=>(+v).toLocaleString('ru-RU')+' ₽';
const svL=id=>{const s=SV.find(x=>x[0]===id);return s?s[1]+' '+s[2]:id};
function contacts9(o,label){
  const a=[];if(o.tg)a.push(`<a class="btn sm ctg" href="https://t.me/${encodeURIComponent(o.tg)}" target="_blank" rel="noopener">✈️ Telegram</a>`);
  if(o.wa)a.push(`<a class="btn sm cwa" href="https://wa.me/${encodeURIComponent(o.wa)}" target="_blank" rel="noopener">💬 WhatsApp</a>`);
  return a.length?`<div class="cts">${label?`<span class="mut">${label}</span>`:''}${a.join('')}</div>`:'';
}

/* ---------- Supabase ---------- */
const sbH=()=>({apikey:SB.key,Authorization:'Bearer '+SB.key,'Content-Type':'application/json'});
async function sbFetch(path,opt){
  let r;try{r=await fetch(SB.url+'/rest/v1/'+path,Object.assign({headers:sbH()},opt||{}))}catch(e){const er=new Error('net');er.code='net';throw er}
  if(r.status===404){S9.st='off';try{sessionStorage.setItem('pd_sb',JSON.stringify({st:'off',t:Date.now()}))}catch(e){}const er=new Error('off');er.code='off';throw er}
  let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const er=new Error((j&&j.message)||('HTTP '+r.status));er.code=r.status>=500?'net':'bad';throw er}
  return j;
}
const sbRpc=(fn,body)=>sbFetch('rpc/'+fn,{method:'POST',body:JSON.stringify(body||{})});
const sbGet=path=>sbFetch(path);
async function sbStatus(force){
  if(S9.st&&!force&&S9.st!=='err')return S9.st;
  if(!force){try{const c=JSON.parse(sessionStorage.getItem('pd_sb')||'null');if(c&&c.st==='off'&&Date.now()-c.t<6e5){S9.st='off';return 'off'}}catch(e){}}
  if(!navigator.onLine){S9.st='err';return 'err'}
  try{const j=await sbRpc('plant_status',{});S9.st=j&&j.ok?'on':'off'}catch(e){S9.st=e.code==='off'?'off':'err'}
  return S9.st;
}
function need9(){ // гарантирует статус, перерисует экран, когда узнаем
  if(S9.st)return S9.st;
  if(!S9.busy){S9.busy=true;const v=S.view;sbStatus().then(()=>{S9.busy=false;if(S.view===v)rerender9()})}
  return null;
}
function rerender9(){const y=window.scrollY;render();window.scrollTo(0,y)}
function cached(key,ttl,loader){
  const c=S9.cache[key];
  if(c&&(Date.now()-c.t<ttl||c.loading))return c;
  S9.cache[key]=Object.assign(c||{rows:null},{loading:true,t:Date.now()});
  const v=S.view;
  loader().then(rows=>{S9.cache[key]={rows,t:Date.now(),loading:false}}).catch(e=>{S9.cache[key]={rows:(c&&c.rows)||null,err:e.code||'net',t:Date.now(),loading:false}}).then(()=>{if(S.view===v)rerender9()});
  return S9.cache[key];
}
const drop9=pre=>Object.keys(S9.cache).forEach(k=>{if(k.startsWith(pre))delete S9.cache[k]});
const hideRep=(t,rows)=>{const r=repd();return (rows||[]).filter(x=>!r[t+':'+x.id])};

/* ---------- фото ---------- */
async function compress9(file){
  const bmp=await loadBitmap(file);
  for(const max of [800,640,480]){
    const c=drawTo(bmp,max);
    for(const q of [.8,.7,.6,.5,.42]){const d=c.toDataURL('image/jpeg',q);if(d.length<=270000)return d}
  }
  throw new Error('big');
}
function loadMedia9(){
  const els=$$('#app img[data-mid]'),need=[];
  els.forEach(im=>{const id=im.dataset.mid,d=S9.media.get(id);if(d)im.src=d;else if(d===undefined&&!need.includes(id))need.push(id)});
  if(!need.length||S9.st!=='on')return;
  need.forEach(id=>S9.media.set(id,''));
  for(let i=0;i<need.length;i+=12){const part=need.slice(i,i+12);
    sbGet('plant_media?select=id,data&id=in.('+part.join(',')+')').then(rows=>{(rows||[]).forEach(r=>S9.media.set(r.id,r.data));
      $$('#app img[data-mid]').forEach(im=>{const d=S9.media.get(im.dataset.mid);if(d)im.src=d})}).catch(()=>part.forEach(id=>S9.media.delete(id)))}
}
const img9=(id,cls)=>id?`<img class="${cls||'ph9'}" data-mid="${esc(id)}" alt="" loading="lazy" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">`:'';

/* ---------- черновики (пока сервер не запущен или нет связи) ---------- */
const drafts=()=>LS.get('pd_drafts',[]);
function saveDraft(d){const l=drafts();if(l.length>=5){toast('Черновиков уже 5 — опубликуйте или удалите старые');return false}l.push(Object.assign({id:ID8(),at:Date.now()},d));LS.set('pd_drafts',l);return true}
const dKinds={listing:'объявление',pro:'профиль мастера',request:'заявка',post:'пост'};
function draftsCard(type){
  const l=drafts().filter(d=>!type||type.includes(d.t));if(!l.length)return'';
  return `<div class="card drf"><b>📝 Черновики: ${l.length}</b>${l.map(d=>`<div class="drow"><span>${esc(dKinds[d.t]||'')}: ${esc((d.p.title||d.p.name||d.p.body||d.p.items||'').slice(0,40))}</span><button class="btn sm sec" data-dpub="${d.id}" ${S9.st==='on'?'':'disabled'}>Опубликовать</button><button class="btn sm danger" data-ddel="${d.id}">✕</button></div>`).join('')}
  ${S9.st==='on'?'':'<p class="mut">Опубликуем, когда сервис запустится.</p>'}</div>`;
}
async function pubDraft(id){
  const d=drafts().find(x=>x.id===id);if(!d)return;
  const r=await send9(d.t,d.p,d.photo,true);
  if(r){LS.set('pd_drafts',drafts().filter(x=>x.id!==id));rerender9()}
}

/* ---------- отправка ---------- */
const RPC9={listing:'plant_add_listing',pro:'plant_upsert_pro',request:'plant_add_request',post:'plant_add_post'};
async function send9(t,p,photo,fromDraft){
  const st=await sbStatus(!fromDraft&&S9.st!=='on');
  if(st!=='on'){
    if(fromDraft){toast(ERR9.net);return false}
    if(saveDraft({t,p,photo})){toast(st==='off'?'Сохранено в черновики: опубликуем, когда сервис запустится':'Нет связи — сохранено в черновики');return 'draft'}
    return false;
  }
  try{
    const dv=dev9();
    if(photo){const m=await sbRpc('plant_add_media',{p_data:photo,p_dev:dv});if(!m||!m.ok){toast(ERR9[m&&m.err]||ERR9.photo);return false}p=Object.assign({},p,{media:m.id})}
    const j=await sbRpc(RPC9[t],{p,p_dev:dv});
    if(!j||!j.ok){toast(ERR9[j&&j.err]||ERR9.bad);return false}
    ownAdd(t==='pro'?'pro':t,j.id);if(t==='pro')LS.set('pd_proid',j.id);
    drop9(t==='pro'?'pros':t==='post'?'feed':t==='request'?'reqs':'mk');drop9('map');
    toast('Опубликовано ✓');return true;
  }catch(e){toast(e.code==='off'?'Сервис ещё не запущен':ERR9.net);return false}
}
async function act9(fn,body,okMsg){
  try{const j=await sbRpc(fn,Object.assign(body,{p_dev:dev9()}));if(!j||!j.ok){toast(ERR9[j&&j.err]||ERR9.bad);return null}if(okMsg)toast(okMsg);return j}
  catch(e){toast(e.code==='off'?'Сервис ещё не запущен':ERR9.net);return null}
}
async function report9(t,id){
  if(!confirm('Пожаловаться на эту запись? Она скроется у вас, а после 3 жалоб — у всех.'))return;
  if(S9.st!=='on'){toast('Сервис ещё не запущен');return}
  const j=await act9('plant_report',{p_type:t,p_id:id,p_reason:''});
  const r=repd();r[t+':'+id]=Date.now();LS.set('pd_rep',r);if(j)toast('Спасибо, жалоба отправлена');rerender9();
}
async function del9(t,id){
  if(!confirm('Удалить?'))return;
  const j=await act9('plant_delete_own',{p_type:t,p_id:id});
  if(j){const o=own9();delete o[t+':'+id];LS.set('pd_own',o);if(t==='pro')localStorage.removeItem('pd_proid');drop9('');toast('Удалено');rerender9()}
}

/* ---------- общие куски экранов ---------- */
function stCard(){
  const st=need9();
  if(st===null)return '<div class="card mut">Подключаюсь…</div>';
  if(st==='off')return `<div class="card soon"><div class="soonE">🚀</div><b>Скоро запуск!</b><p class="mut">Сервис соседей включается. Уже сейчас можно подготовить запись — сохраню её на телефоне и опубликую, когда всё заработает.</p></div>`;
  if(st==='err')return `<div class="card soon"><div class="soonE">📶</div><b>Нет связи</b><p class="mut">Проверьте интернет. Записи сохранятся в черновики.</p><button class="btn sm sec" id="bSbRetry">Повторить</button></div>`;
  return '';
}
const rules9='<div class="small rules9">Запрещено: наркотики и коноплю в любом виде, оружие, алкоголь, мат и ссылки. Записи с 3 жалобами скрываются автоматически.</div>';
function photoField(){return `<label class="btn sm sec filebtn">📷 Фото<input type="file" id="f9" accept="image/*" hidden></label><span id="f9p" class="mut">${S9.photo?'✓ фото добавлено':''}</span>${S9.photo?`<img class="ph9 prev" src="${S9.photo}" alt="">`:''}`}
function contactFields(req){const m=me9();return `<div class="row"><input type="text" id="c9tg" placeholder="Telegram: ник" value="${esc(m.tg||'')}" autocomplete="off"><input type="tel" id="c9wa" placeholder="WhatsApp: номер" value="${esc(m.wa||'')}" inputmode="tel" autocomplete="tel"></div>${req?'<p class="small">Нужен хотя бы один контакт: Telegram или WhatsApp.</p>':''}`}
function readContacts(req){
  const tg=cleanTg(($('#c9tg')||{}).value),wa=cleanWa(($('#c9wa')||{}).value);
  if(!tgOk(tg)){toast('Telegram: только латиница, цифры и _');return null}
  if(wa&&(wa.length<7||wa.length>15)){toast('WhatsApp: номер от 7 до 15 цифр');return null}
  if(req&&!tg&&!wa){toast(ERR9.contact);return null}
  const m=me9();m.tg=tg;m.wa=wa;LS.set('pd_me',m);return {tg,wa};
}
const areaField=()=>`<input type="text" id="a9" placeholder="Район или посёлок" maxlength="60" value="${esc(me9().area||'')}" autocomplete="off">`;
function readArea(){const a=(($('#a9')||{}).value||'').trim();if(a.length<2){toast('Укажите район или посёлок');return null}const m=me9();m.area=a;LS.set('pd_me',m);return a}
const geoField=()=>geo9()?`<label class="fr"><input type="checkbox" id="g9" checked> 📍 Показать на карте района (примерно, ±1–2 км)</label>`:`<p class="small">Чтобы запись была на карте района, укажите место огорода в «Бать, копать!».</p>`;
const readGeo=()=>{const g=geo9();return g&&$('#g9')&&$('#g9').checked?g:{lat:null,lon:null}};

/* ---------- Обмен и маркет ---------- */
V.market=()=>{
  const st=stCard(),k=S9.mkind;let list='';
  if(S9.st==='on'){
    const q='plant_listings?select=id,kind,title,body,price,cur,swap,area,tg,wa,media,created_at&order=created_at.desc&limit=40'+(k?'&kind=eq.'+k:'');
    const c=cached('mk:'+k,6e4,()=>sbGet(q)),rows=hideRep('listing',c.rows);
    list=c.rows===null?'<div class="card mut">Загрузка…</div>':rows.length?rows.map(lCard).join(''):`<div class="card mut">Пока нет объявлений${k?' в этом разделе':''}. Будьте первым!</div>`;
    if(c.err&&c.rows===null)list=`<div class="card mut">${ERR9[c.err]||ERR9.net}</div>`;
  }
  return `${swHtml()}<h1>🔄 Обмен и маркет</h1>
  ${st}<div class="chips"><button class="chip ${!k?'on':''}" data-mk="">Все</button>${LK.map(x=>`<button class="chip ${k===x[0]?'on':''}" data-mk="${x[0]}">${x[1]} ${x[2]}</button>`).join('')}</div>
  <button class="btn" data-go="mkadd">➕ Разместить объявление</button>${draftsCard(['listing'])}${list}${rules9}`;
};
function lCard(x){
  const pr=x.price!=null?`<b class="price">${rub(x.price)}</b>`:'',sw=x.swap?'<span class="tag sw">🔄 Меняю</span>':'',kk=LK.find(y=>y[0]===x.kind)||LK[3];
  return `<div class="card it9">${img9(x.media)}<div class="mut">${kk[1]} ${kk[2]} · ${esc(x.area)} · ${ago(x.created_at)}</div><h3>${esc(x.title)}</h3><div>${pr} ${sw}</div>
  ${x.body?`<p>${esc(x.body)}</p>`:''}${x.kind==='preserves'?'<p class="warn9">⚠️ За качество отвечает продавец</p>':''}
  ${contacts9(x,'Связаться:')}<div class="acts">${isOwn('listing',x.id)?`<button class="btn sm danger" data-del9="listing:${x.id}">Удалить</button>`:`<button class="lnk9" data-rep9="listing:${x.id}">⚠️ Пожаловаться</button>`}</div></div>`;
}
V.mkadd=()=>`<button class="btn sm sec" data-go="market">← Маркет</button><h1>➕ Объявление</h1>${stCard()}
  <div class="card"><div class="chips">${LK.map(x=>`<button class="chip ${S9.lk===x[0]?'on':''}" data-lk="${x[0]}">${x[1]} ${x[2]}</button>`).join('')}</div>
  ${S9.lk==='preserves'?'<p class="warn9">⚠️ За качество заготовок отвечает продавец. Указывайте состав и дату.</p>':''}
  <input type="text" id="l9t" placeholder="Что предлагаете (например: семена томата «Бычье сердце»)" maxlength="80" autocomplete="off">
  <textarea id="l9b" rows="3" maxlength="600" placeholder="Описание: сорт, количество, год сбора"></textarea>
  <div class="row"><input type="text" id="l9p" placeholder="Цена, ₽" inputmode="numeric" autocomplete="off"><label class="fr"><input type="checkbox" id="l9s"> 🔄 Меняю</label></div>
  ${areaField()}${contactFields(true)}${photoField()}${geoField()}
  <button class="btn" id="bL9">Опубликовать</button></div>${rules9}`;

/* ---------- Услуги: мастера и заявки ---------- */
V.pros=()=>{
  const st=stCard(),s=S9.psv,tab=S9.ptab;let list='';
  if(S9.st==='on'){
    if(tab==='pros'){
      const q='plant_pros?select=id,name,services,area,prices,about,tg,wa,media,rating_sum,rating_n,updated_at&order=rating_n.desc,updated_at.desc&limit=40'+(s?'&services=cs.{'+s+'}':'');
      const c=cached('pros:'+s,6e4,()=>sbGet(q)),rows=hideRep('pro',c.rows);
      list=c.rows===null?(c.err?`<div class="card mut">${ERR9[c.err]||ERR9.net}</div>`:'<div class="card mut">Загрузка…</div>'):rows.length?rows.map(pCard).join(''):'<div class="card mut">Мастеров пока нет. Знаете хорошего — расскажите ему о Растениуме!</div>';
    }else{
      const q='plant_requests?select=id,services,items,note,area,tg,wa,created_at&order=created_at.desc&limit=40'+(s?'&services=cs.{'+s+'}':'');
      const c=cached('reqs:'+s,6e4,()=>sbGet(q)),rows=hideRep('request',c.rows);
      list=c.rows===null?(c.err?`<div class="card mut">${ERR9[c.err]||ERR9.net}</div>`:'<div class="card mut">Загрузка…</div>'):rows.length?rows.map(rCard).join(''):'<div class="card mut">Заявок пока нет.</div>';
    }
  }
  return `${swHtml()}<h1>👷 Услуги</h1>${st}
  <div class="seg"><button class="${tab==='pros'?'on':''}" data-ptab="pros">Мастера</button><button class="${tab==='reqs'?'on':''}" data-ptab="reqs">Заявки</button></div>
  <div class="chips"><button class="chip ${!s?'on':''}" data-psv="">Все</button>${SV.map(x=>`<button class="chip ${s===x[0]?'on':''}" data-psv="${x[0]}">${x[1]} ${x[2]}</button>`).join('')}</div>
  ${tab==='pros'?`<button class="btn" data-go="proadd">👷 ${LS.get('pd_proid','')?'Мой профиль мастера':'Я мастер — разместить профиль'}</button>`:'<button class="btn" data-go="reqadd">📢 Нужен мастер — оставить заявку</button>'}
  ${draftsCard(tab==='pros'?['pro']:['request'])}${list}${rules9}`;
};
const stars9=(n,sum)=>n?`<span class="stars">${'★'.repeat(Math.round(sum/n))}${'☆'.repeat(5-Math.round(sum/n))}</span> <b>${(sum/n).toFixed(1).replace('.',',')}</b> <span class="mut">(${n})</span>`:'<span class="mut">Отзывов пока нет</span>';
function pCard(x){
  const open=S9.rev===x.id;let rv='';
  if(open){
    const c=cached('rev:'+x.id,6e4,()=>sbGet('plant_reviews?select=id,stars,body,name,created_at&pro_id=eq.'+x.id+'&order=created_at.desc&limit=30')),rows=hideRep('review',c.rows);
    rv=`<div class="revs">${c.rows===null?'<p class="mut">Загрузка…</p>':rows.length?rows.map(r=>`<div class="rv"><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</span> <b>${esc(r.name||'Сосед')}</b> <span class="mut">${ago(r.created_at)}</span>${r.body?`<p>${esc(r.body)}</p>`:''}<button class="lnk9" data-rep9="review:${r.id}">⚠️ Пожаловаться</button></div>`).join(''):'<p class="mut">Отзывов пока нет.</p>'}
    ${isOwn('pro',x.id)?'':`<div class="rvf"><div class="starsel">${[1,2,3,4,5].map(i=>`<button data-st9="${i}" class="${S9.stars>=i?'on':''}" aria-label="${i} из 5">★</button>`).join('')}</div><textarea id="rv9" rows="2" maxlength="400" placeholder="Как поработал мастер?"></textarea><button class="btn sm" data-rv9="${x.id}">Оставить отзыв</button></div>`}</div>`;
  }
  return `<div class="card it9">${img9(x.media)}<h3>${esc(x.name)}</h3><div>${stars9(x.rating_n,x.rating_sum)}</div><div class="mut">📍 ${esc(x.area)}</div>
  <div class="tags">${(x.services||[]).map(s=>`<span class="tag">${svL(s)}</span>`).join('')}</div>${x.prices?`<p><b>Цены:</b> ${esc(x.prices)}</p>`:''}${x.about?`<p>${esc(x.about)}</p>`:''}
  ${contacts9(x,'Связаться:')}<div class="acts"><button class="btn sm sec" data-rvo="${x.id}">${open?'Скрыть отзывы':'⭐ Отзывы'}</button>${isOwn('pro',x.id)?`<button class="btn sm danger" data-del9="pro:${x.id}">Удалить профиль</button>`:`<button class="lnk9" data-rep9="pro:${x.id}">⚠️ Пожаловаться</button>`}</div>${rv}</div>`;
}
function rCard(x){
  return `<div class="card it9"><div class="mut">📍 ${esc(x.area)} · ${ago(x.created_at)}</div><div class="tags">${(x.services||[]).map(s=>`<span class="tag">${svL(s)}</span>`).join('')}</div>
  ${x.items?`<p><b>${esc(x.items)}</b></p>`:''}${x.note?`<p>${esc(x.note)}</p>`:''}${contacts9(x,'Откликнуться:')}
  <div class="acts">${isOwn('request',x.id)?`<button class="btn sm danger" data-del9="request:${x.id}">Удалить</button>`:`<button class="lnk9" data-rep9="request:${x.id}">⚠️ Пожаловаться</button>`}</div></div>`;
}
V.proadd=()=>{const m=me9();return `<button class="btn sm sec" data-go="pros">← Услуги</button><h1>👷 Профиль мастера</h1>${stCard()}
  <div class="card"><input type="text" id="p9n" placeholder="Имя или название бригады" maxlength="60" value="${esc(m.name||'')}" autocomplete="off">
  <h3>Что делаете</h3>${SV.map(x=>`<label class="fr"><input type="checkbox" data-p9s="${x[0]}"> ${x[1]} ${x[2]}</label>`).join('')}
  <input type="text" id="p9p" placeholder="Цены: например, «чистка дымохода от 2500 ₽»" maxlength="200" autocomplete="off">
  <textarea id="p9a" rows="3" maxlength="600" placeholder="О себе: опыт, инструмент, выезд"></textarea>
  ${areaField()}${contactFields(true)}${photoField()}${geoField()}
  <button class="btn" id="bP9">Сохранить профиль</button></div><p class="small">Один профиль на телефон, его можно обновлять. Отзывы оставляют заказчики.</p>${rules9}`};
V.reqadd=()=>`<button class="btn sm sec" data-go="pros">← Услуги</button><h1>📢 Нужен мастер</h1>${stCard()}
  <div class="card"><h3>Кто нужен</h3>${SV.map(x=>`<label class="fr"><input type="checkbox" data-r9s="${x[0]}" ${(S9.rpre||[]).includes(x[0])?'checked':''}> ${x[1]} ${x[2]}</label>`).join('')}
  <input type="text" id="r9i" placeholder="Что сделать (кратко)" maxlength="300" value="${esc(S9.ritems||'')}" autocomplete="off">
  <textarea id="r9n" rows="2" maxlength="400" placeholder="Подробности: сроки, объём"></textarea>
  ${areaField()}${contactFields(true)}${geoField()}<button class="btn" id="bR9">Опубликовать заявку</button></div>
  <p class="small">Заявку увидят мастера во вкладке «Заявки». Контакт будет виден всем — указывайте тот, что не жалко.</p>${rules9}`;

/* ---------- Лента и сторис ---------- */
V.feed=()=>{
  const st=stCard();let stories='',posts='';
  if(S9.st==='on'){
    const sel='id,kind,body,name,media,area,swap,tg,wa,likes,replies,created_at,expires_at';
    const cs=cached('feed:st',6e4,()=>sbGet('plant_posts?select='+sel+'&kind=eq.story&order=created_at.desc&limit=20')),sr=hideRep('post',cs.rows);
    const cp=cached('feed:p',6e4,()=>sbGet('plant_posts?select='+sel+'&kind=neq.story&order=created_at.desc&limit=30')),pr=hideRep('post',cp.rows);
    S9.stories=sr;
    stories=`<div class="stor"><button class="st9 add" data-go="postadd" data-sk="story"><span>➕</span><em>Сторис</em></button>${sr.map((x,i)=>`<button class="st9" data-sto="${i}">${x.media?img9(x.media,'sti'):`<span>${(PK.find(p=>p[0]===x.kind)||PK[3])[1]}</span>`}<em>${esc(x.name||'Сосед')}</em></button>`).join('')}</div>`;
    posts=cp.rows===null?(cp.err?`<div class="card mut">${ERR9[cp.err]||ERR9.net}</div>`:'<div class="card mut">Загрузка…</div>'):pr.length?pr.map(postCard).join(''):'<div class="card mut">Пока тихо. Покажите свой урожай первым!</div>';
  }
  return `${swHtml()}<h1>📰 Лента соседей</h1>${st}${stories}<button class="btn" data-go="postadd">📷 Поделиться с соседями</button>${draftsCard(['post'])}${posts}${rules9}`;
};
function postCard(x){
  const k=PK.find(p=>p[0]===x.kind)||PK[0],liked=(LS.get('pd_likes',{}))[x.id],open=S9.open===x.id;let rp='';
  if(open){
    const c=cached('rep:'+x.id,3e4,()=>sbGet('plant_replies?select=id,kind,body,name,tg,wa,created_at&post_id=eq.'+x.id+'&order=created_at.asc&limit=50')),rows=hideRep('reply',c.rows);
    rp=`<div class="reps">${c.rows===null?'<p class="mut">Загрузка…</p>':rows.map(r=>`<div class="rp"><b>${r.kind==='swap'?'🔄 ':''}${esc(r.name||'Сосед')}</b> <span class="mut">${ago(r.created_at)}</span><p>${esc(r.body)}</p>${r.kind==='swap'?contacts9(r):''}<button class="lnk9" data-rep9="reply:${r.id}">⚠️</button></div>`).join('')}
    <div class="rpf"><div class="chips"><button class="chip ${S9.rk!=='swap'?'on':''}" data-rk="reply">💬 Ответ</button><button class="chip ${S9.rk==='swap'?'on':''}" data-rk="swap">🔄 Предложить обмен</button></div>
    <textarea id="rp9" rows="2" maxlength="300" placeholder="${S9.rk==='swap'?'Что предлагаете взамен?':'Ваш ответ'}"></textarea>${S9.rk==='swap'?contactFields(true):''}<button class="btn sm" data-rp9="${x.id}">Отправить</button></div></div>`;
  }
  return `<div class="card it9 post9"><div class="mut"><b>${esc(x.name||'Сосед')}</b> · ${k[1]} ${k[2]}${x.area?' · '+esc(x.area):''} · ${ago(x.created_at)}</div>${img9(x.media)}${x.body?`<p>${esc(x.body)}</p>`:''}
  ${x.swap?`<div><span class="tag sw">🔄 Готов к обмену</span></div>${contacts9(x)}`:''}
  <div class="acts"><button class="btn sm ${liked?'':'sec'}" data-like9="${x.id}">${liked?'❤️':'🤍'} ${x.likes||0}</button><button class="btn sm sec" data-op9="${x.id}">💬 ${x.replies||0}</button><button class="btn sm sec" data-sw9="${x.id}">🔄 Обмен</button>
  ${isOwn('post',x.id)?`<button class="btn sm danger" data-del9="post:${x.id}">Удалить</button>`:`<button class="lnk9" data-rep9="post:${x.id}">⚠️ Пожаловаться</button>`}</div>${rp}</div>`;
}
V.postadd=()=>`<button class="btn sm sec" data-go="feed">← Лента</button><h1>📷 Поделиться</h1>${stCard()}
  <div class="card"><div class="chips">${PK.map(x=>`<button class="chip ${S9.pkind===x[0]?'on':''}" data-pk="${x[0]}">${x[1]} ${x[2]}</button>`).join('')}</div>
  ${S9.pkind==='story'?'<p class="mut">Сторис исчезнет через 24 часа.</p>':''}
  ${photoField()}<textarea id="po9" rows="3" maxlength="500" placeholder="${S9.pkind==='question'?'Что случилось? Опишите вопрос':'Расскажите соседям'}"></textarea>
  <input type="text" id="pn9" placeholder="Как вас подписать (например: Баба Валя)" maxlength="30" value="${esc(me9().name||'')}" autocomplete="off">
  ${areaField()}${geoField()}
  <label class="fr"><input type="checkbox" id="ps9" ${S9.pswap?'checked':''}> 🔄 Готов(а) к обмену</label>${S9.pswap?contactFields(true):''}
  <button class="btn" id="bPo9">Опубликовать</button></div>${rules9}`;
function storyView(i){
  const l=S9.stories||[],x=l[i];let o=$('#sto9');if(!x){if(o)o.remove();return}
  if(!o){o=document.createElement('div');o.id='sto9';document.body.appendChild(o)}
  o.innerHTML=`<div class="stbar">${l.map((_,j)=>`<i class="${j<=i?'on':''}"></i>`).join('')}</div><button class="stx" aria-label="Закрыть">✕</button>
  <div class="stc">${x.media?img9(x.media,'stimg'):''}<div class="stt"><b>${esc(x.name||'Сосед')}</b> · ${ago(x.created_at)}<p>${esc(x.body||'')}</p>${contacts9(x)}<button class="lnk9" data-srep="${x.id}">⚠️ Пожаловаться</button></div></div>`;
  const im=o.querySelector('img[data-mid]');if(im){const d=S9.media.get(im.dataset.mid);if(d)im.src=d}
  o.querySelector('.stx').onclick=e=>{e.stopPropagation();o.remove()};
  o.querySelector('[data-srep]').onclick=e=>{e.stopPropagation();o.remove();report9('post',x.id)};
  o.querySelectorAll('a').forEach(a=>a.onclick=e=>e.stopPropagation());
  o.onclick=()=>storyView(i+1);
}

/* ---------- карта района (Leaflet + OSM) ---------- */
const LEAF={css:['https://unpkg.com/leaflet@1.9.4/dist/leaflet.css','sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='],js:['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=']};
function leaflet9(){
  if(window.L&&window.L.map)return Promise.resolve(window.L);
  if(S9.lp)return S9.lp;
  S9.lp=new Promise((res,rej)=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href=LEAF.css[0];l.integrity=LEAF.css[1];l.crossOrigin='';document.head.appendChild(l);
    const s=document.createElement('script');s.src=LEAF.js[0];s.integrity=LEAF.js[1];s.crossOrigin='';s.onload=()=>res(window.L);s.onerror=()=>{S9.lp=null;rej(new Error('leaflet'))};document.head.appendChild(s);
  });
  return S9.lp;
}
V.rmap=()=>`${swHtml()}<h1>📍 Карта района</h1>${stCard()}
  <div class="chips mleg"><span class="tag"><i style="background:#2E7D4F"></i>Посты</span><span class="tag"><i style="background:#E07A1F"></i>Маркет</span><span class="tag"><i style="background:#2A6FB0"></i>Мастера</span><span class="tag"><i style="background:#7B4BB0"></i>Заявки</span></div>
  <div id="rmap9" class="rmap9"><div class="mut" style="padding:20px">Загружаю карту…</div></div>
  <p class="small">Точки — примерно, с точностью до района (±1–2 км). Точный адрес не хранится и не передаётся.</p>
  ${geo9()?'':'<div class="card mut">Укажите место огорода в «Бать, копать!» — карта откроется на вашем районе.</div>'}`;
async function drawMap9(){
  const el=$('#rmap9');if(!el)return;
  let L;try{L=await leaflet9()}catch(e){el.innerHTML='<div class="mut" style="padding:20px">Не удалось загрузить карту. Проверьте интернет.</div>';return}
  if(!$('#rmap9')||S.view!=='rmap')return;el.innerHTML='';
  const g=geo9(),c=g?[g.lat,g.lon]:[55.75,37.62];
  const map=L.map(el,{zoomControl:true}).setView(c,g?12:4);S9.map=map;
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(map);
  if(g)L.circle(c,{radius:1500,color:'#2E7D4F',weight:1,fillOpacity:.06}).addTo(map);
  if(S9.st!=='on')return;
  const lay=L.layerGroup().addTo(map);
  const load=async()=>{
    const b=map.getBounds(),f=`&lat=gte.${b.getSouth().toFixed(3)}&lat=lte.${b.getNorth().toFixed(3)}&lon=gte.${b.getWest().toFixed(3)}&lon=lte.${b.getEast().toFixed(3)}&limit=150`;
    const src=[['plant_posts?select=id,kind,body,name,lat,lon,created_at','#2E7D4F',x=>`<b>${esc(x.name||'Сосед')}</b> · ${(PK.find(p=>p[0]===x.kind)||PK[0])[2]}<br>${esc((x.body||'').slice(0,80))}`,'feed'],
      ['plant_listings?select=id,kind,title,price,swap,lat,lon','#E07A1F',x=>`<b>${esc(x.title)}</b><br>${x.price!=null?rub(x.price):''}${x.swap?' 🔄 Меняю':''}`,'market'],
      ['plant_pros?select=id,name,services,lat,lon','#2A6FB0',x=>`<b>${esc(x.name)}</b><br>${(x.services||[]).map(svL).join(', ')}`,'pros'],
      ['plant_requests?select=id,services,items,lat,lon','#7B4BB0',x=>`<b>Заявка</b><br>${esc((x.items||'')||(x.services||[]).map(svL).join(', '))}`,'pros']];
    const res=await Promise.all(src.map(s=>sbGet(s[0]+f).catch(()=>[])));
    lay.clearLayers();const seen={};
    res.forEach((rows,i)=>(rows||[]).forEach(x=>{if(x.lat==null||x.lon==null)return;const k=x.lat+','+x.lon;seen[k]=(seen[k]||0)+1;const j=seen[k]-1,a=j*2.4,r=j?0.002:0;
      L.circleMarker([+x.lat+r*Math.sin(a),+x.lon+r*Math.cos(a)],{radius:9,color:'#fff',weight:2,fillColor:src[i][1],fillOpacity:.9}).bindPopup(`${src[i][2](x)}<br><a href="#" data-mgo="${src[i][3]}">Открыть →</a>`).addTo(lay)}));
  };
  map.on('moveend',()=>{clearTimeout(S9.mt);S9.mt=setTimeout(load,400)});
  map.on('popupopen',e=>{const a=e.popup.getElement().querySelector('[data-mgo]');if(a)a.onclick=ev=>{ev.preventDefault();if(a.dataset.mgo==='pros')S9.ptab='pros';go(a.dataset.mgo)}});
  load();
}

/* ---------- плитки, функции, помощник, навигация ---------- */
FEATS.push(['social','👥 Соседи: маркет, услуги, лента','garden'],['market','🔄 Обмен и маркет','social'],['pros','👷 Услуги мастеров','social'],['feed','📰 Лента и сторис','social'],['rmap','📍 Карта района','social']);
Object.assign(VFEAT,{market:'market',mkadd:'market',pros:'pros',proadd:'pros',reqadd:'pros',feed:'feed',postadd:'feed',rmap:'rmap'});
Object.assign(FIRST,{
 market:['Здесь меняются и продают семена, рассаду и заготовки.','Нажмите «Разместить объявление», укажите цену или «Меняю» и контакт в Telegram или WhatsApp. За заготовки отвечает продавец.'],
 pros:['Тут мастера: печник, трубочист, забор, теплица и другие.','Смотрите отзывы и звёзды, пишите мастеру напрямую. Вкладка «Заявки» — для тех, кому нужен мастер.'],
 feed:['Это лента соседей: урожай, цветение, вопросы.','Сторис живут 24 часа. Лайкайте, отвечайте и предлагайте обмен. Плохое — «Пожаловаться».'],
 rmap:['Карта района: посты, объявления и мастера рядом.','Точки примерные — до 1–2 км, точный адрес не хранится.']
});
FIRST.master=['Оставьте заявку — её можно опубликовать в маркете услуг.','Нажмите «📢 Опубликовать в маркет» под заявкой — её увидят мастера во вкладке «Услуги → Заявки».'];
{
  const _ht=hubTiles;
  hubTiles=function(){
    const h=_ht(),t=[['feed','📰','Лента соседей',feat('feed')],['market','🔄','Обмен и маркет',feat('market')],['pros','👷','Услуги мастеров',feat('pros')],['rmap','📍','Карта района',feat('rmap')]].filter(x=>x[3]);
    const ins=t.map(x=>`<button class="tile t9" data-go="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('');
    return h.includes('<button class="tile" id="bBigT"')?h.replace('<button class="tile" id="bBigT"',ins+'<button class="tile" id="bBigT"'):h.replace(/<\/div>\s*$/,ins+'</div>');
  };
  const _fc=featCard;featCard=function(){let h=_fc();['market','pros','feed','rmap'].forEach(id=>{h=h.replace(new RegExp('class="fr sub( off)?"><input type="checkbox" data-feat="'+id+'"'),(m,o)=>`class="fr sub sub2${o||''}"><input type="checkbox" data-feat="${id}"`)});return h};
  const _no=navOf;navOf=function(v){return ['market','mkadd','pros','proadd','reqadd','feed','postadd','rmap'].includes(v)?'garden':_no(v)};
  const _vm=V.master;V.master=()=>{
    let h=_vm().replace(/Мастера пока не подключены:[^<]*/,feat('pros')?'Заявку можно опубликовать в маркете услуг — её увидят мастера рядом. Или отправьте кнопкой «Поделиться».':'Заявка хранится на этом устройстве, отправьте её кнопкой «Поделиться».');
    if(feat('pros'))h=h.replace(/<button class="btn sm" data-oshare="([^"]+)">/g,'<button class="btn sm" data-opub="$1">📢 Опубликовать в маркет</button><button class="btn sm sec" data-oshare="$1">')+`<button class="btn sec" data-go="pros">👷 Смотреть мастеров</button>`;
    return h;
  };
}

/* ---------- обработчики ---------- */
function bind9(){
  const v=S.view;
  on8('#bSbRetry','click',async()=>{S9.st=null;try{sessionStorage.removeItem('pd_sb')}catch(e){}await sbStatus(true);rerender9()});
  on8('[data-dpub]','click',function(){pubDraft(this.dataset.dpub)});
  on8('[data-ddel]','click',function(){if(confirm('Удалить черновик?')){LS.set('pd_drafts',drafts().filter(x=>x.id!==this.dataset.ddel));rerender9()}});
  on8('[data-rep9]','click',function(){const [t,id]=this.dataset.rep9.split(':');report9(t,id)});
  on8('[data-del9]','click',function(){const [t,id]=this.dataset.del9.split(':');del9(t,id)});
  const f9=$('#f9');if(f9)f9.onchange=async()=>{const f=f9.files[0];if(!f)return;$('#f9p').textContent='Сжимаю фото…';
    try{S9.photo=await compress9(f);const keep=saveForm9();rerender9();restoreForm9(keep)}catch(e){S9.photo=null;$('#f9p').textContent='';toast('Не удалось открыть фото')}};
  // маркет
  on8('[data-mk]','click',function(){S9.mkind=this.dataset.mk;rerender9()});
  on8('[data-lk]','click',function(){const keep=saveForm9();S9.lk=this.dataset.lk;rerender9();restoreForm9(keep)});
  on8('#bL9','click',async function(){
    if(!S9.lk){toast('Выберите раздел: семена, рассада, заготовки или другое');return}
    const title=$('#l9t').value.trim(),body=$('#l9b').value.trim(),ps=$('#l9p').value.replace(/[^\d.,]/g,'').replace(',','.'),swap=$('#l9s').checked;
    if(title.length<3){toast('Напишите, что предлагаете');return}
    const price=ps===''?null:+ps;if(price!=null&&(!isFinite(price)||price<0||price>1e7)){toast('Проверьте цену');return}
    if(price==null&&!swap){toast(ERR9.price);return}
    const area=readArea();if(!area)return;const c=readContacts(true);if(!c)return;
    const b=badAny(title,body,area);if(b){toast(ERR9[b]);return}
    this.disabled=true;const g=readGeo();
    const r=await send9('listing',Object.assign({kind:S9.lk,title,body,price,swap,area},c,g),S9.photo);this.disabled=false;
    if(r){S9.photo=null;S9.lk=null;S9.mkind='';go('market')}
  });
  // услуги
  on8('[data-ptab]','click',function(){S9.ptab=this.dataset.ptab;rerender9()});
  on8('[data-psv]','click',function(){S9.psv=this.dataset.psv;rerender9()});
  on8('[data-rvo]','click',function(){S9.rev=S9.rev===this.dataset.rvo?null:this.dataset.rvo;S9.stars=0;rerender9()});
  on8('[data-st9]','click',function(){S9.stars=+this.dataset.st9;$$('[data-st9]').forEach(b=>b.classList.toggle('on',+b.dataset.st9<=S9.stars))});
  on8('[data-rv9]','click',async function(){
    if(!S9.stars){toast('Поставьте оценку: от 1 до 5 звёзд');return}
    const body=($('#rv9').value||'').trim(),b=bad9(body);if(b){toast(ERR9[b]);return}
    const id=this.dataset.rv9;this.disabled=true;
    const j=await act9('plant_add_review',{p_pro:id,p_stars:S9.stars,p_body:body,p_name:me9().name||''},'Спасибо за отзыв!');this.disabled=false;
    if(j){S9.stars=0;drop9('rev:'+id);drop9('pros');rerender9()}
  });
  on8('#bP9','click',async function(){
    const name=$('#p9n').value.trim(),services=$$('[data-p9s]').filter(x=>x.checked).map(x=>x.dataset.p9s),prices=$('#p9p').value.trim(),about=$('#p9a').value.trim();
    if(name.length<2){toast('Укажите имя');return}if(!services.length){toast(ERR9.services);return}
    const area=readArea();if(!area)return;const c=readContacts(true);if(!c)return;
    const b=badAny(name,prices,about,area);if(b){toast(ERR9[b]);return}
    const m=me9();m.name=name;LS.set('pd_me',m);this.disabled=true;
    const r=await send9('pro',Object.assign({name,services,prices,about,area},c,readGeo()),S9.photo);this.disabled=false;
    if(r){S9.photo=null;S9.ptab='pros';go('pros')}
  });
  on8('#bR9','click',async function(){
    const services=$$('[data-r9s]').filter(x=>x.checked).map(x=>x.dataset.r9s),items=$('#r9i').value.trim(),note=$('#r9n').value.trim();
    if(!services.length&&items.length+note.length<3){toast('Выберите, кто нужен, или опишите задачу');return}
    const area=readArea();if(!area)return;const c=readContacts(true);if(!c)return;
    const b=badAny(items,note,area);if(b){toast(ERR9[b]);return}
    this.disabled=true;const r=await send9('request',Object.assign({services,items,note,area},c,readGeo()));this.disabled=false;
    if(r){S9.rpre=null;S9.ritems='';S9.ptab='reqs';go('pros')}
  });
  on8('[data-opub]','click',function(){
    const o=ordersL().find(x=>x.id===this.dataset.opub);if(!o)return;
    S9.rpre=['devices'];S9.ritems=('Подключить: '+(o.items||[]).join(', ')).slice(0,300);
    const m=me9();if(o.area&&!m.area)m.area=o.area;if(o.phone&&!m.wa)m.wa=cleanWa(o.phone);LS.set('pd_me',m);go('reqadd');
  });
  // лента
  $$('[data-sk]').forEach(b=>b.addEventListener('click',()=>{S9.pkind='story'},true));
  on8('[data-pk]','click',function(){const keep=saveForm9();S9.pkind=this.dataset.pk;rerender9();restoreForm9(keep)});
  const ps=$('#ps9');if(ps)ps.onchange=()=>{const keep=saveForm9();S9.pswap=ps.checked;rerender9();restoreForm9(keep)};
  on8('#bPo9','click',async function(){
    const body=$('#po9').value.trim(),name=$('#pn9').value.trim(),swap=$('#ps9').checked;
    if(body.length<2&&!S9.photo){toast('Добавьте фото или текст');return}
    const area=(($('#a9')||{}).value||'').trim();let c={tg:'',wa:''};if(swap){c=readContacts(true);if(!c)return}
    const b=badAny(body,name,area);if(b){toast(ERR9[b]);return}
    const m=me9();m.name=name;if(area)m.area=area;LS.set('pd_me',m);this.disabled=true;
    const r=await send9('post',Object.assign({kind:S9.pkind,body,name,area,swap},c,readGeo()),S9.photo);this.disabled=false;
    if(r){S9.photo=null;S9.pswap=false;S9.pkind='harvest';go('feed')}
  });
  on8('[data-sto]','click',function(){storyView(+this.dataset.sto)});
  on8('[data-like9]','click',async function(){
    const id=this.dataset.like9,lk=LS.get('pd_likes',{});if(lk[id]){toast('Вы уже лайкнули');return}
    const j=await act9('plant_like',{p_post:id});if(!j)return;lk[id]=1;LS.set('pd_likes',lk);
    ['feed:p','feed:st'].forEach(k=>{const c=S9.cache[k];if(c&&c.rows)c.rows.forEach(x=>{if(x.id===id)x.likes=j.likes})});rerender9();
  });
  on8('[data-op9]','click',function(){S9.open=S9.open===this.dataset.op9?null:this.dataset.op9;S9.rk='reply';rerender9()});
  on8('[data-sw9]','click',function(){S9.open=this.dataset.sw9;S9.rk='swap';rerender9()});
  on8('[data-rk]','click',function(){const t=($('#rp9')||{}).value||'';S9.rk=this.dataset.rk;rerender9();if($('#rp9'))$('#rp9').value=t});
  on8('[data-rp9]','click',async function(){
    const id=this.dataset.rp9,body=($('#rp9').value||'').trim();if(!body){toast('Напишите текст');return}
    let c={tg:'',wa:''};if(S9.rk==='swap'){c=readContacts(true);if(!c)return}
    const b=bad9(body);if(b){toast(ERR9[b]);return}
    this.disabled=true;const j=await act9('plant_add_reply',{p_post:id,p_kind:S9.rk==='swap'?'swap':'reply',p_body:body,p_name:me9().name||'',p_tg:c.tg,p_wa:c.wa},S9.rk==='swap'?'Предложение обмена отправлено':'Ответ отправлен');this.disabled=false;
    if(j){drop9('rep:'+id);['feed:p','feed:st'].forEach(k=>{const cc=S9.cache[k];if(cc&&cc.rows)cc.rows.forEach(x=>{if(x.id===id)x.replies=(x.replies||0)+1})});rerender9()}
  });
  if(v==='rmap')drawMap9();
  loadMedia9();
}
// сохраняем введённое при перерисовке формы
function saveForm9(){const o={};$$('#app input[id],#app textarea[id]').forEach(e=>{if(e.type==='file')return;o[e.id]=e.type==='checkbox'?e.checked:e.value});$$('#app input[type=checkbox][data-p9s],#app input[type=checkbox][data-r9s]').forEach(e=>{o['@'+(e.dataset.p9s||e.dataset.r9s)]=e.checked});return o}
function restoreForm9(o){Object.keys(o).forEach(k=>{if(k[0]==='@'){const e=$(`[data-p9s="${k.slice(1)}"],[data-r9s="${k.slice(1)}"]`);if(e)e.checked=o[k];return}const e=document.getElementById(k);if(!e||e.type==='file')return;if(e.type==='checkbox'){if(k!=='ps9')e.checked=o[k]}else e.value=o[k]})}

/* ---------- подключение ---------- */
{
  const _b=bind;bind=function(){_b();bind9()};
  const _g=go;go=function(v){if(S9.map&&v!=='rmap'){try{S9.map.remove()}catch(e){}S9.map=null}const o=$('#sto9');if(o)o.remove();
    if(['mkadd','proadd','postadd','reqadd'].includes(v)&&v!==S.view){S9.photo=null}_g(v)};
  window.addEventListener('online',()=>{if(S9.st==='err'){S9.st=null;if(['market','pros','feed','rmap'].includes(S.view))rerender9()}});
  Object.assign(window.__app,{go,S9,bad9,grid9,sbStatus,compress9,dev9});
  if(['market','pros','feed','rmap','mkadd','proadd','postadd','reqadd'].includes(S.view))render();
}
