/* Фаза Луны: эклиптические долготы Солнца и Луны по рядам Мёзуса (Astronomical Algorithms, гл. 25 и 47, главные члены).
   Погрешность элонгации порядка десятых долей градуса (≈ десятки минут по времени фаз). */
const MOON=(()=>{
  const R=Math.PI/180,mod=(x,m)=>((x%m)+m)%m;
  const jd=ms=>ms/864e5+2440587.5;
  // [D,M,M',F, sinL(1e-6 °)]
  const LT=[[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],[2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],[2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],[2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],[2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],[2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294]];
  function sunLon(T){
    const L0=mod(280.46646+36000.76983*T+0.0003032*T*T,360),M=mod(357.52911+35999.05029*T-0.0001537*T*T,360)*R;
    const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
    const om=(125.04-1934.136*T)*R;
    return mod(L0+C-0.00569-0.00478*Math.sin(om),360);
  }
  function moonLon(T){
    const Lp=mod(218.3164477+481267.88123421*T-0.0015786*T*T,360),D=mod(297.8501921+445267.1114034*T-0.0018819*T*T,360)*R,
      M=mod(357.5291092+35999.0502909*T-0.0001536*T*T,360)*R,Mp=mod(134.9633964+477198.8675055*T+0.0087414*T*T,360)*R,F=mod(93.272095+483202.0175233*T-0.0036539*T*T,360)*R;
    const E=1-0.002516*T-0.0000074*T*T;let s=0;
    for(const [d,m,mp,f,c] of LT){const e=Math.abs(m)===1?E:Math.abs(m)===2?E*E:1;s+=c*e*Math.sin(d*D+m*M+mp*Mp+f*F)}
    const A1=(119.75+131.849*T)*R,A2=(53.09+479264.29*T)*R;
    s+=3958*Math.sin(A1)+1962*Math.sin(Lp*R-F)+318*Math.sin(A2);
    const nut=(-17.2/3600)*Math.sin((125.04-1934.136*T)*R);
    return mod(Lp+s/1e6+nut,360);
  }
  const elong=ms=>{const T=(jd(ms)-2451545)/36525;return mod(moonLon(T)-sunLon(T),360)};
  const frac=el=>(1-Math.cos(el*R))/2;
  function findPhase(from,target,dir){ // ближайшее после/до from время, когда элонгация = target (0/90/180/270)
    const step=3600e3*(dir||1);let t=from,prev=mod(elong(t)-target+180,360)-180;
    for(let i=0;i<24*40;i++){const t2=t+step,cur=mod(elong(t2)-target+180,360)-180;
      if(prev*cur<=0&&Math.abs(prev-cur)<90){let a=Math.min(t,t2),b=Math.max(t,t2);
        for(let k=0;k<40;k++){const m=(a+b)/2,v=mod(elong(m)-target+180,360)-180,va=mod(elong(a)-target+180,360)-180;if(va*v<=0)b=m;else a=m}
        return (a+b)/2}
      t=t2;prev=cur}
    return null;
  }
  const NAMES=['Новолуние','Растущая Луна (серп)','Первая четверть','Растущая Луна','Полнолуние','Убывающая Луна','Последняя четверть','Убывающая Луна (серп)'];
  const EMO=['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  function info(ms){
    const el=elong(ms),idx=Math.floor(mod(el+22.5,360)/45)%8;
    const waxing=el<180;
    // «ближайшие сутки около новолуния/полнолуния» (±1.5 сут. от точной фазы)
    const dn=Math.min(el,360-el),df=Math.abs(180-el); // градусы до новой/полной (≈12.19°/сут)
    const edge=dn<=18?'new':df<=18?'full':'';
    return{el,idx,name:NAMES[idx],emo:EMO[idx],fr:frac(el),waxing,edge,age:el/12.1907};
  }
  return{elong,info,findPhase,frac,NAMES,EMO};
})();
if(typeof module!=='undefined')module.exports=MOON;
/* v8: каталог устройств и советы по сбору/заготовкам. Только общеизвестные безопасные приёмы. */
const DEV_NOTE='Цены — ориентир «от …» по Яндекс Маркету (ноябрь 2026), только для России; реальные цены и сроки доставки смотрите на маркетплейсе.';
const DEVICES=[
 {id:'soil',e:'🌱',n:'Датчик влажности почвы',what:'Показывает, когда почва действительно сухая: поливаете по факту, а не по календарю. Бывают Wi‑Fi и Zigbee (Tuya/Smart Life).',q:'датчик влажности почвы tuya',from:500,zb:true},
 {id:'air',e:'🌡',n:'Датчик температуры и влажности',what:'Для теплицы и грядок под плёнкой: видно жару и холод, можно настроить уведомление о заморозке.',q:'датчик температуры и влажности tuya zigbee',from:400,zb:true},
 {id:'tap',e:'🚰',n:'Умный кран / таймер полива',what:'Привод на шаровой кран или таймер для шланга: полив по расписанию и с телефона. Нужен уличный монтаж и защита от влаги.',q:'умный кран привод шаровой tuya',from:1500,zb:true,note:'Wi‑Fi таймер для садового шланга обычно дороже, от ≈3000 ₽.'},
 {id:'drip',e:'💦',n:'Капельный полив',what:'Лента или трубки с капельницами к каждой грядке: экономит воду, листья остаются сухими. Подключается к бочке или водопроводу.',q:'набор капельного полива для грядок',from:500},
 {id:'cam',e:'📹',n:'Уличная Wi‑Fi камера',what:'Смотреть участок с телефона. Выбирайте защиту IP65 и выше, ИК‑подсветку и работу на морозе; нужен Wi‑Fi или SIM.',q:'уличная wifi камера для дачи',from:1500},
 {id:'gw',e:'📡',n:'Шлюз Zigbee',what:'Нужен для датчиков и кранов Zigbee. Если берёте Wi‑Fi версии устройств, шлюз не нужен.',q:'zigbee шлюз tuya',from:1100}
];
const devPrices=()=>rg().cfg.cur==='₽';
const HSAFE='Домашние заготовки: банки и крышки стерилизуйте, овощи мойте, закатывайте строго по проверенному рецепту с указанной долей уксуса, соли и сахара. Низкокислотные продукты (овощи без кислоты, грибы, фасоль, кукуруза, чеснок и травы в масле) без достаточной кислоты и стерилизации могут вызвать ботулизм: не экспериментируйте с рецептом. Вздутая крышка, мутный рассол, пена, неприятный запах — банку выбросить, не пробовать на вкус.';
const HARV={
 tomato:{w:'Снимают при бланжевой (молочной, розовой) спелости, если ожидаются холода ниже +8…+10 °C; дозревают при +18…+22 °C. Спелые снимайте каждые 2–3 дня.',s:'Не храните в холодильнике: теряют вкус. Дозаривание — в тёплом месте, не на прямом солнце.',p:['Сушка: дольки при 55–65 °C в сушилке до гибкости.','Заморозка: целиком или пюре, в контейнерах.','Маринад и соленья — только по рецепту, со стерилизацией банок.']},
 cucumber:{w:'Зеленцы собирают часто, каждые 1–2 дня, пока не перерослись и не пожелтели.',s:'В холодильнике 7–10 дней в плёнке с влажной салфеткой.',p:['Засолка и маринад — по рецепту, огурцы замочите на 3–4 часа в холодной воде, банки стерилизуйте.','Свежие огурцы для заморозки не годятся.']},
 pepper:{w:'Сладкий — в технической (зелёный) или биологической (красный, жёлтый) спелости, срезайте с плодоножкой.',s:'В прохладе (+7…+10 °C) 2–3 недели, в холодильнике дольше.',p:['Заморозка: нарезанный, без семян, в пакетах.','Сушка: острый перец нанизывают на нитку и сушат в тёплом проветриваемом месте.']},
 chili:{w:'Срезайте с плодоножкой, в перчатках: сок жжёт кожу и глаза.',s:'Сушёный держат в сухой банке; свежий — в холодильнике 1–2 недели.',p:['Сушка: нитка в проветриваемом месте или сушилка 50–60 °C.','Заморозка: целыми стручками в пакете.']},
 eggplant:{w:'Снимают, пока кожица гладкая и блестящая, а семена ещё светлые и мягкие; перезревшие горчат.',s:'В прохладе 1–2 недели.',p:['Заморозка: кружки или кубики после обжарки или запекания.','Консервация — по проверенному рецепту, со стерилизацией.']},
 zucchini:{w:'Молодыми, 15–20 см, раз в 2–3 дня: тогда кожица тонкая. Зрелые для хранения снимают с твёрдой коркой.',s:'Зрелые — в прохладе +5…+10 °C 1–2 месяца.',p:['Заморозка: кружки или кубики, лучше после бланширования 1–2 мин.','Сушка кружков в сушилке.']},
 pumpkin:{w:'Убирают до заморозков, когда кора твёрдая, а плодоножка подсохла. Оставляйте черенок 5 см.',s:'Дозаривают 10–14 дней в тепле, затем хранят в сухом месте при +10…+15 °C.',p:['Заморозка: кубики сырой или запечённой мякоти.','Сушка ломтиков.']},
 carrot:{w:'В сухую погоду до сильных морозов; осенью корнеплоды выдерживают лёгкие заморозки, но не промерзание.',s:'Обрежьте ботву, обсушите. Хранят при 0…+2 °C и высокой влажности — в ящиках с песком или в погребе.',p:['Заморозка: брусочки или тёртая после бланширования.','Сушка: брусочки в сушилке.']},
 beet:{w:'До устойчивых заморозков. Ботву скручивайте или срезайте, оставив 1–2 см, корешок не обрезайте.',s:'0…+2 °C, влажно: песок, ящики, погреб.',p:['Заморозка: варёная, тёртая.','Квашение и маринад — по рецепту.']},
 potato:{w:'Когда ботва увяла. Выкопайте в сухую погоду, подсушите на воздухе 2–3 часа, не на ярком солнце.',s:'В темноте при +2…+4 °C. На свету клубни зеленеют (соланин): зелёные части не едят.',p:['Свежий картофель хранят насыпью или в ящиках, перебирая осенью.','Сушат только предварительно отваренный картофель, сырой не сушат.']},
 onion:{w:'Когда перья полегли и пожелтели. Выкопайте в сухую погоду и подсушите 1–2 недели под навесом.',s:'Сухо и прохладно, косами или в сетках.',p:['Сушка тонких колец при 50–60 °C.','Заморозка: нарезанный лук в пакете.']},
 garlic:{w:'Озимый — когда нижние листья пожелтели, обычно июль. Подсушивайте в тени 2–3 недели, обрежьте корни.',s:'Сухо, +16…+20 °C или при 0…+4 °C.',p:['Чеснок в масле держат только в холодильнике и недолго, при комнатной температуре — риск ботулизма.','Сушка пластинок в сушилке.']},
 cabbage:{w:'Поздняя капуста выдерживает лёгкие заморозки; срезайте до −5 °C в сухую погоду, оставив 2–3 покровных листа.',s:'0…+1 °C, высокая влажность. Кочаны можно подвесить за кочерыгу или хранить в ящиках.',p:['Квашение: около 2% соли от массы капусты, держите под гнётом, при +18…+22 °C пару дней, затем в холод.','Заморозка: шинкованная после бланширования.']},
 cauliflower:{w:'Срезайте, пока головка плотная и белая, до распускания соцветий.',s:'В холодильнике 1–2 недели.',p:['Заморозка: соцветия после бланширования 2–3 мин.']},
 broccoli:{w:'Срезайте центральную головку, пока бутоны плотные и зелёные; после неё растут боковые побеги.',s:'В холодильнике 3–5 дней.',p:['Заморозка: соцветия после бланширования 2–3 мин.']},
 corn:{w:'Молочная спелость: сок початка молочный, зёрна мягкие, обёртка зелёная.',s:'Сладость быстро снижается — используйте в день сбора.',p:['Заморозка: початки или зёрна после бланширования 3–4 мин.','Консервация кукурузы — низкокислотная, без стерилизации опасна.']},
 pea:{w:'Лопатки с зёрнами сочные и сладкие, собирайте каждые 2–3 дня; перезревший горох мучнистый.',s:'Свежий — 2–3 дня в холодильнике.',p:['Заморозка: после бланширования 1–2 мин.']},
 beans:{w:'Стручковую — молодой, пока стручок мягкий и ломкий; на зерно — когда стручки высохли.',s:'Сухие зёрна — в сухой банке. Сырые зёрна не едят, их надо варить.',p:['Заморозка стручков после бланширования 2–3 мин.']},
 dill:{w:'Зелень срезают до цветения, зонтики — на засолку, когда семена ещё зелёные.',s:'В холодильнике пучком в воде 5–7 дней.',p:['Сушка в тени с проветриванием.','Заморозка: рубленая в формочках с водой или маслом (в морозилке).']},
 parsley:{w:'Срезайте внешние листья по мере надобности, корень — в конце сезона.',s:'В холодильнике пучком в воде.',p:['Сушка в тени.','Заморозка: рубленая в формочках.']},
 basil:{w:'Срезайте верхушки до цветения, это даёт ветвление.',s:'Не хранить в холодильнике: чернеет. Держите как букет в воде.',p:['Заморозка: листья в формочках с маслом или водой.','Сушка в тени.']},
 strawberry:{w:'Полностью красные, в сухую погоду, с чашелистиками и плодоножкой.',s:'Не мойте до употребления; в холодильнике 2–3 дня.',p:['Заморозка: на подносе, потом в пакеты.','Варенье и протёртая с сахаром — варёное и стерилизованное хранится дольше.']},
 raspberry:{w:'Ягода легко отделяется от плодоложа. Собирайте часто, она быстро портится.',s:'Холодильник 1–2 дня.',p:['Заморозка на подносе.','Варенье, протёртая с сахаром.']},
 blackcurrant:{w:'Когда вся кисть почернела, в сухую погоду.',s:'Холодильник до недели.',p:['Заморозка, сушка.','Протёртая с сахаром (1:1,5) — в холодильнике.']},
 gooseberry:{w:'Для варенья — недозрелая, для еды — полностью спелая.',s:'Холодильник 1–2 недели.',p:['Заморозка, варенье.']},
 blueberry:{w:'Через 2–3 дня после посинения ягоды; собирают в несколько приёмов.',s:'Холодильник до 2 недель.',p:['Заморозка на подносе — лучший способ.']},
 grape:{w:'Кисти срезают секатором, когда ягоды сладкие (проверьте на вкус), в сухую погоду.',s:'Прохладное место, +0…+4 °C, кисти подвесьте.',p:['Сушка на изюм при тёплой сушке.','Сок и вино — отдельная технология.']},
 apple:{w:'Летние сорта — по мере спелости; зимние снимают зрелыми, но плотными, без повреждений.',s:'0…+4 °C, влажно; каждое яблоко — в ящик без ударов; осенью сортировать.',p:['Сушка: дольки при 55–65 °C.','Заморозка кусочков, пюре, повидло.']},
 pear:{w:'Зимние снимают недозрелыми и дозревают в тепле; летние — по спелости.',s:'0…+3 °C.',p:['Сушка, заморозка, варенье.']},
 sourcherry:{w:'Когда ягода полностью окрасилась и легко отделяется.',s:'В холодильнике 3–5 дней.',p:['Заморозка: с косточкой или без неё.','Косточки не едят.']},
 sweetcherry:{w:'Собирайте полностью спелую, с плодоножкой, в сухую погоду.',s:'Холодильник 5–7 дней.',p:['Заморозка на подносе.']},
 plum:{w:'Когда плоды окрасились и чуть мягкие, с восковым налётом.',s:'Холодильник 1–2 недели.',p:['Сушка на чернослив, заморозка, варенье.']},
 apricot:{w:'Полностью окрасившиеся плоды; перезревшие мягкие и быстро портятся.',s:'Холодильник несколько дней.',p:['Сушка на курагу, заморозка, варенье.']}
};
const HCAT={'Зелень':{w:'Срезайте по мере надобности, лучше утром и до цветения.',s:'В холодильнике пучком в воде.',p:['Сушка в тени.','Заморозка в формочках.']},'Ягоды':{w:'Собирайте в сухую погоду полностью спелыми.',s:'Холодильник 1–3 дня.',p:['Заморозка на подносе.','Варенье.']},'Корнеплоды':{w:'Выкапывайте в сухую погоду до сильных морозов.',s:'Хранят при 0…+2 °C во влажном песке.',p:['Заморозка и сушка после обработки.']}};
/* Растениум v8: функции, огороды, помощник, луна, «Сегодня», устройства, мастер, дневник, внук, заготовки, карта */
const $$=s=>[...document.querySelectorAll(s)];
const ID8=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const on8=(s,ev,fn)=>$$(s).forEach(e=>{e['on'+ev]=fn});

/* ---------- функции (галочки в настройках) ---------- */
const FEATS=[
 ['photo','📷 Распознавание по фото'],['grow','🌱 Гровинг (выращивание дома)'],['garden','🥕 «Бать, копать!» — огород'],
 ['weather','🌦 Погода и подсказки','garden'],['map','🗺 Карта участка','garden'],['multi','🌳 Несколько огородов','garden'],
 ['shop','🛒 Устройства и «Что докупить»','garden'],['master','🛠 Найти мастера','garden'],['diary','📔 Дневник огорода','garden'],
 ['moon','🌙 Лунный календарь','garden'],['harvest','🧺 Советы по заготовкам','garden'],['call','📞 Позвонить внуку','garden'],
 ['voice','🎤 Голос (озвучивание и микрофон)'],['assist','🧑‍🌾 Анимированный помощник'],['big','🔍 Крупный режим']];
function feat(id){const f=LS.get('pd_feat',{});if(f[id]===false)return false;const d=FEATS.find(x=>x[0]===id);return d&&d[2]?feat(d[2]):true}
const wxOn=()=>feat('garden')&&feat('weather');
const isBig=()=>feat('big')&&!!LS.get('pd_big',false);
const VFEAT={home:'photo',grow:'grow',gcrop:'grow',gproj:'grow',garden:'garden',gdn:'garden',today:'garden',shop:'shop',master:'master',moon:'moon',diary:'diary',harv:'harvest',call:'call',gmap:'map',gmgr:'multi'};
const viewOk=v=>!VFEAT[v]||feat(VFEAT[v])&&(feat('garden')||!['today','shop','master','moon','diary','harv','call','gmap','gmgr'].includes(v));
const startView=()=>isBig()&&feat('garden')?'today':feat('photo')?'home':'mine';

/* ---------- огороды ---------- */
const GKEY='pd_gardens',GCUR='pd_gcur';
function gList(){
  let l=LS.get(GKEY,null);
  if(!l||!l.length){
    const g0=LS.get('pd_geo',null);
    l=[{id:'g1',name:'Мой огород',geo:g0&&isFinite(g0.lat)?g0:null,map:null,have:[],gh:false,away:false}];
    LS.set(GKEY,l);LS.set(GCUR,'g1');
    const m=LS.get('pd_mine',[]);let ch=false;m.forEach(x=>{if(x.outdoor&&!x.gdn){x.gdn='g1';ch=true}});if(ch)LS.set('pd_mine',m);
  }
  return l;
}
function curG(){const l=gList(),id=LS.get(GCUR,'');return l.find(g=>g.id===id)||l[0]}
function saveG(g){const l=gList().map(x=>x.id===g.id?g:x);LS.set(GKEY,l)}
const gOf=x=>x.gdn||(x.outdoor?gList()[0].id:null);
function mineVis(x){return !x.outdoor||!feat('garden')||gOf(x)===curG().id}
function syncGeo8(){const g=curG(),c=LS.get('pd_geo',null);g.geo=c;saveG(g)}
function switchG(id){
  if(!gList().some(g=>g.id===id))return;
  LS.set(GCUR,id);const g=curG();
  if(g.geo)LS.set('pd_geo',g.geo);else localStorage.removeItem('pd_geo');
  S.wx=null;S.wxs='idle';S.latIn=undefined;S.lonIn=undefined;S8.sel=null;
  render();if(geo())loadWx(false);
}
const swHtml=()=>{
  if(!feat('multi')||!feat('garden'))return'';
  const cur=curG().id;
  return `<div class="gsw">${gList().map(g=>`<button class="chip ${g.id===cur?'on':''}" data-gsw="${g.id}">🌳 ${esc(g.name)}</button>`).join('')}<button class="chip" data-go="gmgr" aria-label="Управление огородами">⚙️ ＋</button></div>`;
};
const S8={sel:null,dType:'plant',moonM:0,heard:'',callFile:null,masterPre:[]};

/* ---------- помощник ---------- */
const AS={busy:false,t1:null};
const asMem=()=>LS.get('pd_assist',{});
const asShown=k=>!!asMem()[k];
const hasTTS=()=>'speechSynthesis' in window&&typeof SpeechSynthesisUtterance!=='undefined';
const hasSR=()=>!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function speak(text){
  if(!feat('voice')||!hasTTS())return false;
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ru-RU';u.rate=.95;speechSynthesis.speak(u);return true}catch(e){return false}
}
function helperEl(){
  let h=$('#helper');if(h)return h;
  h=document.createElement('div');h.id='helper';h.hidden=true;
  h.innerHTML=`<div class="hb" role="status" aria-live="polite"><span class="ht"></span><div class="hm" hidden></div><button class="hx" type="button">Понятно</button></div>
  <button class="hp" type="button" aria-label="Помощник"><svg viewBox="0 0 64 64" width="58" height="58" aria-hidden="true"><g class="hsway"><ellipse class="hl1" cx="22" cy="14" rx="10" ry="5" transform="rotate(-30 22 14)"/><ellipse class="hl2" cx="42" cy="14" rx="10" ry="5" transform="rotate(30 42 14)"/></g><path class="hst" d="M32 24V16" /><circle class="hbody" cx="32" cy="40" r="20"/><g class="hblink"><circle cx="25" cy="37" r="3.2" class="he"/><circle cx="39" cy="37" r="3.2" class="he"/></g><path d="M25 46q7 6 14 0" class="hmouth"/><circle cx="20" cy="44" r="3" class="hck"/><circle cx="44" cy="44" r="3" class="hck"/></svg></button>`;
  document.body.appendChild(h);
  h.querySelector('.hx').onclick=e=>{e.stopPropagation();asHide()};
  const tap=()=>{
    const m=h.querySelector('.hm');
    if(h.classList.contains('on')&&m.textContent&&!h.classList.contains('open')){h.classList.add('open');m.hidden=false;clearTimeout(AS.t1);AS.t1=setTimeout(asHide,25000)}
    else asHide();
  };
  h.querySelector('.hb').onclick=tap;h.querySelector('.hp').onclick=tap;
  return h;
}
function asHide(){
  const h=$('#helper');if(!h)return;clearTimeout(AS.t1);
  h.classList.remove('on','open');const m=h.querySelector('.hm');m.hidden=true;
  setTimeout(()=>{if(!h.classList.contains('on')){h.hidden=true;AS.busy=false}},300);
}
// o: {key,text,more,kind,force}; одна подсказка за раз, показанные запоминаются
function say(o){
  if(!feat('assist'))return false;
  if(!o.force){if(o.key&&asShown(o.key))return false;if(AS.busy)return false}
  const h=helperEl();AS.busy=true;clearTimeout(AS.t1);
  if(o.key){const m=asMem();m[o.key]=Date.now();LS.set('pd_assist',m)}
  h.className='';h.dataset.kind=o.kind||'tip';h.hidden=false;
  h.querySelector('.ht').textContent=o.text;
  const m=h.querySelector('.hm');m.textContent=o.more||'';m.hidden=true;
  h.querySelector('.hx').hidden=false;
  requestAnimationFrame(()=>h.classList.add('on'));
  AS.t1=setTimeout(asHide,9000);
  if(isBig())speak(o.text);
  return true;
}
const FIRST={
 home:['Сфотографируйте растение — подскажу название и уход.','Снимайте один цветок или лист крупно, при дневном свете и без бликов. Если распознавание не подключено, выберите растение по признакам.'],
 mine:['Здесь ваши растения и сроки полива.','Нажмите «Полито» после полива — следующий срок пересчитается сам.'],
 grow:['Выберите культуру — расскажу, как вырастить дома.','Сроки и режимы ориентировочные, зависят от сорта, света и температуры.'],
 garden:['Это «Бать, копать!»: огород, прогноз и инструменты.','Укажите место — предупрежу о заморозке, жаре, дожде и ветре. Внизу каталог из 68 культур.'],
 today:['Это «Сегодня в огороде». Спросите: что сегодня делать?','Нажмите микрофон и скажите «что сегодня делать» или нажмите «Прочитать вслух».'],
 shop:['Подберу устройства под ваши грядки.','Рекомендации строятся по растениям на вкладке «Мои» и по карте участка. Цены — ориентир «от …».'],
 master:['Оставьте заявку — её можно отправить мастеру.','Заявка хранится на этом устройстве и отправляется кнопкой «Поделиться». Серверный маркет мастеров будет позже.'],
 moon:['Фазы Луны считаются по расчёту, советы — народные приметы.','Это народная традиция, научно не подтверждено.'],
 diary:['Записывайте посадки, урожай и заметки с фото.','Записи хранятся на этом устройстве и группируются по годам.'],
 harv:['Когда собирать и как заготовить — по культурам.','Только общеизвестные безопасные способы. Банки стерилизуйте и следуйте проверенным рецептам.'],
 call:['Сохраните номер внука — отправлю ему фото и вопрос.','Фото уйдёт через «Поделиться»: выберите Telegram или WhatsApp.'],
 gmap:['Это карта участка. Добавьте грядку и потяните пальцем.','Тап по грядке — назначить растения из каталога. Размер — кнопками − и + или за уголок.'],
 gmgr:['Здесь можно завести несколько огородов.','У каждого свои координаты, растения, карта, дневник и устройства.']
};
const wxShort=a=>{
  const n=(a.x.match(/(-?\d+(?:\.\d+)?) (?:°C|мм|м\/с)/)||[])[1]||'',day=a.x.split(':')[0].replace(/^\S+\s/,'');
  return a.k==='frost'?`❄️ ${day}: ночью до ${n} °C. Укройте рассаду!`:a.k==='heat'?`🔥 ${day}: жара до ${n} °C. Поливайте вечером.`:a.k==='wind'?`💨 ${day}: ветер до ${n} м/с. Подвяжите растения.`:`🌧 ${day}: дождь ${n} мм. Полив не нужен.`;
};
function assistCheck(){
  if(!feat('assist')||AS.busy)return;
  const v=S.view,gv=['garden','gdn','mine','today','shop','home'].includes(v);
  if(wxOn()&&geo()&&S.wxs==='err'&&gv&&!(S.wx&&sameGeo(S.wx,geo()))){
    if(say({key:'err:wx:'+Math.floor(Date.now()/6e5),kind:'err',text:'Не получилось загрузить прогноз 😕',more:S.wxe}))return;
  }
  if(S.msg&&['clarify','home'].includes(v)&&/сервис|связи|ключ|лимит|время|ответ|ошиб|Pl@ntNet/i.test(S.msg)){
    if(say({key:'err:id:'+Math.floor(Date.now()/6e5),kind:'err',text:'Не получилось распознать по фото 😕',more:S.msg}))return;
  }
  if(wxOn()&&geo()&&S.wx&&sameGeo(S.wx,geo())&&gv){
    const al=wxAlerts({fr:'t',gen:true})||[];
    for(const k of ['frost','heat','wind','rain']){const a=al.find(x=>x.k===k);
      if(a&&say({key:'wx:'+curG().id+':'+k+':'+a.x.split(':')[0],kind:k,text:wxShort(a),more:a.x}))return}
  }
  if(['mine','today','garden','home'].includes(v)){
    const due=mineList().filter(mineVis).filter(x=>diffDays(x.next.water,today())<=0),fed=mineList().filter(mineVis).filter(x=>x.next.feed&&diffDays(x.next.feed,today())<=0);
    if(due.length&&say({key:'due:w:'+today(),kind:'water',text:'💧 Пора полить: '+due.slice(0,3).map(x=>x.name).join(', ')+(due.length>3?' и ещё '+(due.length-3):''),more:'Откройте «Мои растения» и нажмите «Полито» после полива.'}))return;
    if(fed.length&&say({key:'due:f:'+today(),kind:'feed',text:'🧪 Пора подкормить: '+fed.slice(0,3).map(x=>x.name).join(', '),more:'Подкормку вносят по инструкции на упаковке удобрения. После внесения нажмите «Подкормлено».'}))return;
  }
  const f=FIRST[v];if(f&&viewOk(v))say({key:'first:'+v,kind:'tip',text:f[0],more:f[1]});
}

/* ---------- плитки главной огорода ---------- */
function hubTiles(){
  const t=[['today','🌤','Сегодня',feat('garden')],['gmap','🗺','Карта участка',feat('map')],['shop','🛒','Что докупить',feat('shop')],['diary','📔','Дневник',feat('diary')],['moon','🌙','Луна',feat('moon')],['harv','🧺','Заготовки',feat('harvest')],['call','📞','Позвонить внуку',feat('call')],['master','🛠','Найти мастера',feat('master')],['gmgr','🌳','Огороды',feat('multi')]];
  const tiles=t.filter(x=>x[3]).map(x=>`<button class="tile" data-go="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`);
  if(feat('big'))tiles.push(`<button class="tile" id="bBigT"><span>🔍</span>${isBig()?'Обычный режим':'Крупный режим'}</button>`);
  return `<div class="tiles">${tiles.join('')}</div>`;
}

/* ---------- луна ---------- */
const MFOLK='Народная традиция, научно не подтверждено.';
function moonAdvice(i){
  if(i.edge==='new')return 'Новолуние: по народной традиции — день отдыха, не сеют и не пересаживают.';
  if(i.edge==='full')return 'Полнолуние: по народной традиции — не сеют и не пересаживают, можно собирать урожай.';
  return i.waxing?'Растущая Луна: по традиции сажают то, что плодоносит над землёй — томаты, огурцы, капусту, зелень.':'Убывающая Луна: по традиции сажают корнеплоды и луковичные — морковь, свёклу, лук, чеснок; обрезают и рыхлят.';
}
const fmtDT=ms=>new Date(ms).toLocaleString('ru-RU',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'});
V.moon=()=>{
  const now=Date.now(),i=MOON.info(now),d=new Date();d.setDate(1);d.setMonth(d.getMonth()+S8.moonM);
  const y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,td=new Date();
  const nn=MOON.findPhase(now,0),nf=MOON.findPhase(now,180);
  let cells='';for(let k=0;k<off;k++)cells+='<i></i>';
  for(let k=1;k<=days;k++){const ii=MOON.info(new Date(y,m,k,12).getTime()),isT=td.getFullYear()===y&&td.getMonth()===m&&td.getDate()===k;cells+=`<b class="mc${isT?' td':''}" data-d="${k}"><u>${k}</u><s>${ii.emo}</s></b>`}
  return `${swHtml()}<h1>🌙 Лунный календарь</h1>
  <div class="card mtop"><div class="mbig">${i.emo}</div><div><b>${i.name}</b><div class="mut">Освещено ${Math.round(i.fr*100)}% · возраст ${i.age.toFixed(1).replace('.',',')} сут.</div></div></div>
  <div class="card"><p>${esc(moonAdvice(i))}</p><p class="ptr">⚠️ ${MFOLK}</p></div>
  <div class="card"><div class="mut">🌑 Ближайшее новолуние: <b>${nn?fmtDT(nn):'—'}</b></div><div class="mut">🌕 Ближайшее полнолуние: <b>${nf?fmtDT(nf):'—'}</b></div><p class="small nc">Время по часам вашего устройства. Фаза рассчитана по положению Солнца и Луны.</p></div>
  <div class="mnav"><button class="btn sm sec" id="bMoP">←</button><b>${MONTHS[m]} ${y}</b><button class="btn sm sec" id="bMoN">→</button></div>
  <div class="mgrid"><em>Пн</em><em>Вт</em><em>Ср</em><em>Чт</em><em>Пт</em><em>Сб</em><em>Вс</em>${cells}</div>`;
};

/* ---------- «Сегодня в огороде» + голос ---------- */
function dayPlan(){
  const rows=[],f=x=>x==null?'—':Math.round(x),now=new Date();
  const dtx=now.toLocaleDateString('ru-RU',{weekday:'long',day:'numeric',month:'long'});
  if(wxOn()){
    if(geo()&&S.wx&&sameGeo(S.wx,geo())){
      const w=S.wx.d,pr=w.pr[0]==null?0:Math.round(w.pr[0]*10)/10;
      rows.push({k:'wx',ic:wxIcon(w.code[0]),t:`${f(w.tmin[0])}…${f(w.tmax[0])} °C · 💧 ${pr} мм · 💨 ${f(w.wind[0])} м/с`,s:`Сегодня от ${f(w.tmin[0])} до ${f(w.tmax[0])} градусов, осадки ${String(pr).replace('.',',')} миллиметров, ветер ${f(w.wind[0])} метров в секунду.`});
      (wxAlerts({fr:'t',gen:true})||[]).forEach(a=>rows.push({k:'wx',ic:'⚠️',t:wxShort(a).replace(/^\S+\s/,''),s:wxShort(a).replace(/^\S+\s/,'').replace(/°C/g,'градусов').replace(/м\/с/g,'метров в секунду').replace(/мм/g,'миллиметров')}));
    }else if(!geo())rows.push({k:'wx',ic:'📍',t:'Укажите место — расскажу о погоде',s:'Укажите место на вкладке Бать, копать, и я расскажу о погоде.'});
    else if(S.wxs==='err')rows.push({ic:'⚠️',t:'Прогноз недоступен',s:'Прогноз погоды сейчас недоступен.'});
  }
  const items=mineList().filter(mineVis),rain=S.wx&&geo()&&sameGeo(S.wx,geo())&&wxOn()&&S.wx.d.pr[0]!=null&&S.wx.d.pr[0]>=5;
  const dw=items.filter(x=>diffDays(x.next.water,today())<=0),df=items.filter(x=>x.next.feed&&diffDays(x.next.feed,today())<=0);
  const nm=a=>a.slice(0,4).map(x=>x.name).join(', ')+(a.length>4?' и ещё '+(a.length-4):'');
  if(dw.length)rows.push(rain?{ic:'🌧',t:'Дождь обещан — полив можно пропустить: '+nm(dw),s:'Сегодня обещан дождь, полив можно пропустить.'}:{ic:'💧',t:'Полить: '+nm(dw),s:'Нужно полить: '+nm(dw)+'.',act:'wat'});
  if(df.length)rows.push({ic:'🧪',t:'Подкормить: '+nm(df),s:'Пора подкормить: '+nm(df)+'.'});
  if(!dw.length&&!df.length&&items.length)rows.push({ic:'✅',t:'Поливать и подкармливать сегодня не нужно',s:'Сегодня поливать и подкармливать не нужно.'});
  if(!items.length)rows.push({ic:'🌱',t:'Добавьте растения в «Мои» из каталога',s:'Добавьте растения из каталога, и я буду напоминать о поливе.'});
  const mo=new Date().getMonth()+1,mine=new Set(items.map(x=>x.gid).filter(Boolean));
  (curG().map&&curG().map.objs||[]).forEach(o=>(o.c||[]).forEach(c=>mine.add(c)));
  const pick=fn=>{const a=GARDEN.filter(fn);a.sort((x,y)=>(mine.has(y.id)?1:0)-(mine.has(x.id)?1:0));return a.slice(0,4)};
  const sow=pick(g=>hemM([...g.sm,...g.pl]).includes(mo)&&g.hm.length),hv=pick(g=>hemM(g.hm).includes(mo));
  if(sow.length)rows.push({ic:'🌱',t:'Сейчас сеют и сажают: '+sow.map(g=>g.n).join(', '),s:'В этом месяце сеют и сажают: '+sow.map(g=>g.n).join(', ')+'.'});
  if(hv.length)rows.push({ic:'🧺',t:'Время собирать: '+hv.map(g=>g.n).join(', '),s:'Сейчас время собирать: '+hv.map(g=>g.n).join(', ')+'.'});
  if(feat('moon')){const i=MOON.info(Date.now());rows.push({ic:i.emo,t:i.name+' · по народной примете',s:i.name+'. По народной примете, научно не подтверждено.'})}
  return{dtx,rows,speech:'Сегодня '+dtx+'. '+rows.map(r=>r.s).join(' ')};
}
V.today=()=>{
  const p=dayPlan(),mic=hasSR()&&feat('voice'),rd=hasTTS()&&feat('voice');
  return `${swHtml()}<section class="hero"><h1>🌤 Сегодня в огороде</h1><p>${esc(p.dtx)}</p></section>
  ${feat('voice')?`<div class="vrow">${mic?'<button class="btn bigb" id="bMic">🎤 Что сегодня делать?</button>':''}<button class="btn sec bigb" id="bRead" ${rd?'':'data-nospeech="1"'}>🔊 Прочитать вслух</button></div>`:''}
  <div id="heard" class="card" ${S8.heard?'':'hidden'}>${esc(S8.heard)}</div>
  <div class="card plan">${p.rows.map(r=>`<div class="pr"><span>${r.ic}</span><div>${esc(r.t)}</div></div>`).join('')}${p.rows.some(r=>r.act==='wat')?'<button class="btn sm" id="bTWat">💧 Всё полито</button>':''}</div>
  ${hubTiles()}`;
};
function voiceAnswer(q){
  const n=nrm(q),p=dayPlan();let ans,sp;
  if(/луна|фаза|лунн/.test(n)){const i=MOON.info(Date.now());ans=`${i.name}. ${moonAdvice(i)} ${MFOLK}`;sp=ans}
  else if(/погод|дожд|мороз|заморозк/.test(n)){const r=p.rows.filter(x=>x.k==='wx');ans=r.map(x=>x.t).join('. ')||'Погоды пока нет.';sp=r.map(x=>x.s).join(' ')||ans}
  else if(/дел|заня|сегодня|план|огород/.test(n)){ans=p.rows.map(r=>r.t).join('. ');sp=p.speech}
  else{ans='Я умею отвечать на вопрос «что сегодня делать». Спросите так, или нажмите «Прочитать вслух».';sp=ans}
  S8.heard='Вы сказали: «'+q+'». '+ans;const h=$('#heard');if(h){h.hidden=false;h.textContent=S8.heard}
  if(!speak(sp))toast('Озвучивание недоступно в этом браузере — текст на экране');
}
function readPlan(){
  const p=dayPlan();S8.heard='План на сегодня: '+p.rows.map(r=>r.t).join('. ');const h=$('#heard');if(h){h.hidden=false;h.textContent=S8.heard}
  if(!speak(p.speech))toast('Озвучивание недоступно в этом браузере — текст плана на экране');
}
function listen(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){readPlan();return}
  let r;try{r=new SR()}catch(e){readPlan();return}
  r.lang='ru-RU';r.interimResults=false;r.maxAlternatives=1;
  const b=$('#bMic');if(b){b.textContent='🎤 Слушаю…';b.classList.add('rec')}
  const done=()=>{const b2=$('#bMic');if(b2){b2.textContent='🎤 Что сегодня делать?';b2.classList.remove('rec')}};
  r.onresult=e=>{const q=(e.results[0]&&e.results[0][0]&&e.results[0][0].transcript)||'';if(q)voiceAnswer(q);else toast('Не расслышала. Нажмите «Прочитать вслух».')};
  r.onerror=e=>{done();toast(e&&e.error==='not-allowed'?'Нет доступа к микрофону. Нажмите «Прочитать вслух».':'Не удалось распознать речь. Нажмите «Прочитать вслух».')};
  r.onend=done;
  try{r.start()}catch(e){done();readPlan()}
}

/* ---------- что докупить ---------- */
const WARM=['tomato','cucumber','pepper','chili','eggplant','melon','watermelon','basil'];
function recs(){
  const g=curG(),items=mineList().filter(mineVis).filter(x=>x.outdoor&&x.gid),mp=g.map&&g.map.objs||[];
  const crops=new Set(items.map(x=>x.gid));mp.forEach(o=>(o.c||[]).forEach(c=>crops.add(c)));
  const beds=mp.filter(o=>o.t==='bed').length,ghObj=mp.some(o=>o.t==='gh'),warm=[...crops].filter(c=>WARM.includes(c));
  const nm=a=>a.slice(0,3).map(c=>(GARDEN.find(x=>x.id===c)||{}).n).filter(Boolean).join(', ');
  const out=[];if(!crops.size&&!beds)return{out,crops,beds,empty:true};
  out.push({id:'soil',why:'Поливать по факту, а не по календарю: '+(nm([...crops])||'грядки')+'.'});
  if(g.gh||ghObj||warm.length>=2)out.push({id:'air',why:(g.gh||ghObj?'В теплице':'Для теплолюбивых ('+nm(warm)+')')+' датчик покажет жару и холод.'});
  const drip=crops.size>=4||beds>=3;
  if(drip)out.push({id:'drip',why:beds>=3?`Грядок: ${beds}. Капельный полив экономит воду и время.`:`Культур: ${crops.size}. Капельный полив экономит воду и время.`});
  if(drip||g.away)out.push({id:'tap',why:g.away?'Вас нет каждый день — полив по расписанию.':'Кран подключит капельный полив к расписанию и дождю.'});
  if(g.away)out.push({id:'cam',why:'Смотреть участок, когда вас нет рядом.'});else out.push({id:'cam',why:'По желанию: смотреть участок с телефона.',opt:true});
  if(out.filter(r=>['soil','air','tap'].includes(r.id)).length>=2)out.push({id:'gw',why:'Нужен для датчиков и кранов Zigbee; для Wi‑Fi версий не нужен.',opt:true});
  return{out,crops,beds,empty:false};
}
V.shop=()=>{
  const g=curG(),r=recs(),have=g.have||[],cur=devPrices();
  const links=d=>rg().shops.map(s=>`<a class="btn sm sec lnk" href="${esc(shopUrl(s,d.q))}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join('');
  const card=x=>{const d=DEVICES.find(y=>y.id===x.id),own=have.includes(d.id);
    return `<div class="card dev${own?' own':''}"><h3>${d.e} ${esc(d.n)}${x.opt?' <span class="conf demo">по желанию</span>':''}</h3>
    <p class="why">${esc(x.why)}</p>
    ${cur&&d.from?`<div class="price">от ≈ ${d.from.toLocaleString('ru-RU')} ₽</div>`:''}
    <div class="mut">Срок доставки: см. на маркетплейсе</div>
    <details class="inf"><summary>Что это</summary><p>${esc(d.what)}${d.note?' '+esc(d.note):''}</p></details>
    <div class="shops">${links(d)}</div>
    <button class="btn sm ${own?'sec':'ghost'}" data-have="${d.id}">${own?'✓ Уже есть':'Уже есть у меня'}</button></div>`};
  let sum=0;r.out.filter(x=>!x.opt&&!have.includes(x.id)).forEach(x=>{const d=DEVICES.find(y=>y.id===x.id);if(d.from)sum+=d.from});
  return `${swHtml()}<h1>🛒 Что докупить</h1>
  <div class="chips"><button class="chip ${g.gh?'on':''}" data-flag="gh">🏠 Есть теплица</button><button class="chip ${g.away?'on':''}" data-flag="away">🚗 Бываю не каждый день</button></div>
  ${r.empty?`<div class="card" style="text-align:center"><div style="font-size:44px">🥕</div><p>Добавьте растения из каталога или грядки на карту — подберу устройства.</p><button class="btn" data-go="garden">К каталогу</button></div>`
  :`${cur?`<div class="card sum"><div class="mut">Ориентировочная сумма комплекта</div><div class="price big">от ≈ ${sum.toLocaleString('ru-RU')} ₽</div><div class="mut">Без «по желанию» и без того, что у вас уже есть.</div></div>`:'<div class="card sum"><div class="mut">Цены в вашем регионе смотрите на маркетплейсе.</div></div>'}
  ${r.out.map(card).join('')}
  ${feat('master')?'<button class="btn" id="bShopMaster">🛠 Найти мастера, чтобы подключил</button>':''}
  <p class="small">${esc(DEV_NOTE)}</p>`}`;
};

/* ---------- найти мастера ---------- */
const ordersL=()=>LS.get('pd_orders',[]);
function orderText(o){
  return `Заявка: подключить устройства (Растениум)\nЧто подключить: ${o.items.join(', ')||'—'}${o.note?'\nКомментарий: '+o.note:''}\nРайон: ${o.area||'—'}\nТелефон: ${o.phone||'—'}${o.name?'\nИмя: '+o.name:''}\nОгород: ${o.garden||'—'}`;
}
async function shareText(text,title){
  try{
    if(navigator.share){await navigator.share({title:title||'Растениум',text});return 'shared'}
    if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);toast('Текст скопирован — вставьте его в мессенджер');return 'copied'}
    toast('Поделиться не поддерживается — скопируйте текст вручную');return 'none';
  }catch(e){if(e&&e.name==='AbortError')return 'cancel';toast('Не удалось поделиться');return 'err'}
}
V.master=()=>{
  const l=ordersL(),pre=S8.masterPre;
  return `${swHtml()}<h1>🛠 Найти мастера</h1>
  <div class="card"><h3>Что подключить</h3>${DEVICES.map(d=>`<label class="fr"><input type="checkbox" data-mdev="${d.id}" ${pre.includes(d.id)?'checked':''}> ${d.e} ${esc(d.n)}</label>`).join('')}
  <input type="text" id="mNote" placeholder="Другое или уточнение" autocomplete="off">
  <input type="text" id="mArea" placeholder="Район или посёлок" autocomplete="off">
  <input type="tel" id="mPhone" placeholder="Телефон для связи" autocomplete="tel" inputmode="tel">
  <input type="text" id="mName" placeholder="Как к вам обращаться (необязательно)" autocomplete="off">
  <button class="btn" id="bMSave">💾 Сохранить заявку</button></div>
  <p class="small">Мастера пока не подключены: заявка хранится на этом устройстве, отправьте её кнопкой «Поделиться». Серверный маркет мастеров будет позже.</p>
  ${l.length?'<h2>Мои заявки</h2>'+l.map(o=>`<div class="card"><div class="mut">${esc(o.date)} · ${esc(o.garden||'')}</div><b>${esc(o.items.join(', ')||'—')}</b><div class="mut">${esc(o.area||'')} · ${esc(o.phone||'')}</div><button class="btn sm" data-oshare="${o.id}">📤 Поделиться</button><button class="btn sm danger" data-odel="${o.id}">Удалить</button></div>`).join(''):''}`;
};

/* ---------- дневник (IndexedDB) ---------- */
function idb(mode,fn){return new Promise((res,rej)=>{
  if(!window.indexedDB)return rej(new Error('no-idb'));
  const o=indexedDB.open('plantarium-diary',1);
  o.onupgradeneeded=()=>{o.result.createObjectStore('entries',{keyPath:'id'})};
  o.onerror=()=>rej(o.error);
  o.onsuccess=()=>{const db=o.result,tx=db.transaction('entries',mode),st=tx.objectStore('entries');let r;
    try{r=fn(st)}catch(e){db.close();rej(e);return}
    tx.oncomplete=()=>{db.close();res(r&&'result' in r?r.result:undefined)};tx.onerror=tx.onabort=()=>{db.close();rej(tx.error)}}
})}
const DT={plant:['🌱','Посадка'],harvest:['🧺','Урожай'],note:['📝','Заметка']};
V.diary=()=>{
  S8.dPhoto=null;
  return `${swHtml()}<h1>📔 Дневник огорода</h1>
  <div class="card"><div class="chips">${Object.keys(DT).map(k=>`<button class="chip ${S8.dType===k?'on':''}" data-dt="${k}">${DT[k][0]} ${DT[k][1]}</button>`).join('')}</div>
  <input type="text" id="dCrop" list="dCrops" placeholder="Культура: томат, морковь…" autocomplete="off"><datalist id="dCrops">${GARDEN.map(g=>`<option value="${esc(g.n)}">`).join('')}</datalist>
  <input type="date" id="dDate" value="${today()}" max="${today()}">
  ${S8.dType==='harvest'?'<input type="text" id="dQty" inputmode="decimal" placeholder="Сколько собрали, кг" autocomplete="off">':''}
  <textarea id="dText" rows="2" placeholder="Заметка: что сделали, что заметили"></textarea>
  <div class="row"><label class="btn sm sec filebtn" for="dFile">📷 Фото</label><input type="file" id="dFile" accept="image/*" hidden><span id="dPrev" class="mut"></span></div>
  <button class="btn" id="bDSave">💾 Записать</button></div>
  <div id="dEnt"><p class="mut">Загружаю записи…</p></div>`;
};
async function loadDiary(){
  const box=$('#dEnt');if(!box)return;
  let all;try{all=await idb('readonly',st=>st.getAll())}catch(e){box.innerHTML='<div class="banner red">Дневник недоступен: в этом браузере нет локального хранилища (IndexedDB).</div>';return}
  const gid=curG().id,l=(all||[]).filter(e=>(e.gid||gList()[0].id)===gid).sort((a,b)=>b.ts-a.ts);
  if(!l.length){box.innerHTML='<p class="mut">Записей пока нет — первая появится здесь.</p>';return}
  const yrs={};l.forEach(e=>{(yrs[new Date(e.ts).getFullYear()]=yrs[new Date(e.ts).getFullYear()]||[]).push(e)});
  (S8.urls||[]).forEach(u=>URL.revokeObjectURL(u));S8.urls=[];
  box.innerHTML=Object.keys(yrs).sort((a,b)=>b-a).map(y=>{
    const kg=yrs[y].filter(e=>e.type==='harvest'&&e.qty>0).reduce((s,e)=>s+e.qty,0);
    return `<h2 class="dyr">${y} <small>${yrs[y].length} зап.${kg?' · урожай '+(Math.round(kg*10)/10).toString().replace('.',',')+' кг':''}</small></h2>`+yrs[y].map(e=>{
      let img='';if(e.photo){const u=URL.createObjectURL(e.photo);S8.urls.push(u);img=`<img class="dph" src="${u}" alt="Фото записи">`}
      return `<div class="card dent"><div class="mut">${DT[e.type]?DT[e.type][0]:'📝'} ${esc(e.date)} · ${DT[e.type]?DT[e.type][1]:''}</div><b>${esc(e.crop||'')}${e.qty?' · '+String(e.qty).replace('.',',')+' кг':''}</b>${e.text?`<div>${esc(e.text)}</div>`:''}${img}<button class="btn sm danger" data-ddel="${e.id}">Удалить</button></div>`}).join('');
  }).join('');
  on8('[data-ddel]','click',function(){const id=this.dataset.ddel;if(confirm('Удалить запись?'))idb('readwrite',st=>st.delete(id)).then(loadDiary)});
}
async function saveDiary(){
  const crop=($('#dCrop').value||'').trim(),text=($('#dText').value||'').trim(),date=$('#dDate').value||today(),qs=$('#dQty')?$('#dQty').value.trim().replace(',','.'):'',qty=qs?parseFloat(qs):0;
  if(qs&&!(qty>0&&isFinite(qty))){toast('Количество — число больше нуля, например 2,5');return}
  if(!crop&&!text&&!S8.dPhoto){toast('Напишите культуру или заметку, либо добавьте фото');return}
  const e={id:ID8(),gid:curG().id,ts:new Date(date+'T12:00:00').getTime()+Math.floor(Math.random()*1000),date:fmtDate(date)+' '+new Date(date+'T12:00:00').getFullYear(),type:S8.dType,crop,text,qty,photo:S8.dPhoto||null};
  try{await idb('readwrite',st=>st.put(e))}catch(err){toast('Не удалось сохранить запись: хранилище недоступно');return}
  toast('Записано в дневник');S8.dPhoto=null;
  $('#dCrop').value='';$('#dText').value='';if($('#dQty'))$('#dQty').value='';$('#dPrev').textContent='';
  loadDiary();
}

/* ---------- позвонить внуку ---------- */
const kin=()=>LS.get('pd_kin',{name:'',phone:'',tg:''});
const normPhone=s=>{s=String(s||'').trim();const d=s.replace(/\D/g,'');return d.length>=7?(s.startsWith('+')?'+':'')+d:''};
V.call=()=>{
  const k=kin(),ph=normPhone(k.phone),tg=(k.tg||'').replace(/^@/,'').trim();
  return `${swHtml()}<h1>📞 Позвонить внуку</h1>
  <div class="card"><h3>Контакт</h3>
  <input type="text" id="kName" placeholder="Имя (например, Саша)" value="${esc(k.name)}" autocomplete="off">
  <input type="tel" id="kPhone" placeholder="Телефон, например +7 900 123-45-67" value="${esc(k.phone)}" inputmode="tel" autocomplete="off">
  <input type="text" id="kTg" placeholder="Telegram: ник без @ (необязательно)" value="${esc(tg)}" autocomplete="off">
  <button class="btn sm" id="bKSave">💾 Сохранить</button>
  <p class="small">Номер и ник хранятся только на этом устройстве.</p></div>
  ${ph?`<a class="btn bigb" id="aKCall" href="tel:${esc(ph)}">📞 Позвонить${k.name?' — '+esc(k.name):''}</a>`:'<p class="mut">Сохраните номер — появится кнопка звонка.</p>'}
  <div class="card"><h3>Отправить фото и вопрос</h3>
  <textarea id="kText" rows="2" placeholder="Что случилось? Например: пожелтели листья у томатов"></textarea>
  <div class="row"><label class="btn sm sec filebtn" for="kFile">📷 Снять или выбрать фото</label><input type="file" id="kFile" accept="image/*" hidden><span id="kPrev" class="mut"></span></div>
  <button class="btn bigb" id="bKSend">📤 Отправить в Telegram или WhatsApp</button>
  ${(ph||tg)?`<div class="shops">${tg?`<a class="btn sm sec lnk" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">Открыть чат в Telegram</a>`:''}${ph?`<a class="btn sm sec lnk" href="https://wa.me/${esc(ph.replace(/\D/g,''))}" target="_blank" rel="noopener">Открыть чат в WhatsApp</a>`:''}</div>`:''}</div>`;
};
async function sendKin(){
  const k=kin(),txt=(($('#kText')||{}).value||'').trim()||'Помоги, пожалуйста, с растением.',text=`${txt}\n(из Растениума, огород «${curG().name}»)`;
  const f=S8.callFile;
  try{
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text,title:'Растениум'});return}
    if(navigator.share){await navigator.share({text,title:'Растениум'});if(f)toast('Фото в этом браузере не прикрепляется — отправьте его в чате вручную');return}
    if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(text);
    const ph=normPhone(k.phone).replace(/\D/g,''),tg=(k.tg||'').replace(/^@/,'');
    toast('Текст скопирован. Откроется чат — вставьте текст и прикрепите фото');
    const u=ph?'https://wa.me/'+ph+'?text='+encodeURIComponent(text):tg?'https://t.me/'+tg:null;if(u)window.open(u,'_blank','noopener');
  }catch(e){if(e&&e.name==='AbortError')return;toast('Не удалось отправить. Попробуйте ещё раз')}
}

/* ---------- заготовки ---------- */
function harvList(q){
  const n=nrm(q),mine=new Set(mineList().filter(mineVis).map(x=>x.gid).filter(Boolean));((curG().map||{}).objs||[]).forEach(o=>(o.c||[]).forEach(c=>mine.add(c)));
  return GARDEN.filter(g=>g.hm.length&&(!n||gardenText(g).includes(n))).sort((a,b)=>(mine.has(b.id)?1:0)-(mine.has(a.id)?1:0));
}
function harvItem(g){
  const h=HARV[g.id]||HCAT[g.cat.replace(/^\S+\s/,'').split(' ')[0]]||{w:g.h,s:'',p:[]};
  return `<details class="card hv"><summary>${g.e} <b>${esc(g.n)}</b> <small>сбор: ${rngM(g.hm)}</small></summary>
  <div class="param full"><b>🧺 Когда собирать</b><span class="v">${esc(h.w)}</span></div>
  ${h.s?`<div class="param full"><b>📦 Хранение</b><span class="v">${esc(h.s)}</span></div>`:''}
  ${(h.p||[]).length?`<div class="param full"><b>🫙 Заготовка</b><span class="v">${h.p.map(esc).join('<br>')}</span></div>`:''}</details>`;
}
V.harv=()=>`${swHtml()}<h1>🧺 Сбор и заготовки</h1>
  <div class="card safe"><b>⚠️ Безопасность заготовок</b><p>${esc(HSAFE)}</p></div>
  <input type="search" id="hSearch" placeholder="Поиск культуры: томат, яблоня…" value="${esc(S8.hq||'')}">
  <div id="hList">${harvList(S8.hq||'').map(harvItem).join('')||'<p class="mut">Ничего не найдено.</p>'}</div>`;

/* ---------- мои огороды ---------- */
V.gmgr=()=>{
  const l=gList(),mine=mineList();
  return `<h1>🌳 Мои огороды</h1>
  ${l.map(g=>`<div class="card"><input class="gname" data-gname="${g.id}" value="${esc(g.name)}" maxlength="30" aria-label="Название огорода">
  <div class="mut">Растений: ${mine.filter(x=>x.outdoor&&gOf(x)===g.id).length} · объектов на карте: ${((g.map||{}).objs||[]).length}${g.geo?' · 📍 место задано':''}</div>
  <button class="btn sm" data-gsw="${g.id}">${g.id===curG().id?'✓ Текущий — открыть':'Открыть'}</button><button class="btn sm danger" data-gdel="${g.id}" ${l.length<2?'disabled':''}>Удалить</button></div>`).join('')}
  <div class="card"><h3>Новый огород</h3><input type="text" id="gNew" placeholder="Например: Дача, Бабушкин, Балкон" maxlength="30" autocomplete="off"><button class="btn" id="bGAddG">＋ Создать</button></div>
  <p class="small">У каждого огорода свои координаты и погода, растения, карта, дневник и список устройств.</p>`;
};
async function delGarden(id){
  const l=gList();if(l.length<2)return;
  const g=l.find(x=>x.id===id);if(!g||!confirm(`Удалить огород «${g.name}»? Его растения, карта и записи дневника будут удалены.`))return;
  LS.set('pd_mine',mineList().filter(x=>!(x.outdoor&&gOf(x)===id)));
  try{const all=await idb('readonly',st=>st.getAll());await idb('readwrite',st=>{(all||[]).filter(e=>e.gid===id).forEach(e=>st.delete(e.id))})}catch(e){}
  LS.set(GKEY,l.filter(x=>x.id!==id));
  if(LS.get(GCUR,'')===id)switchG(gList()[0].id);else render();
  drawBadge();toast('Огород удалён');
}

/* ---------- карта участка ---------- */
const MT={bed:{n:'Грядка',e:'',w:1.2,h:3},gh:{n:'Теплица',e:'🪟',w:3,h:4},tree:{n:'Дерево',e:'🌳',w:1.5,h:1.5},bush:{n:'Куст',e:'🌿',w:1,h:1},house:{n:'Дом',e:'🏡',w:5,h:4},path:{n:'Дорожка',e:'',w:.8,h:5}};
const mapOf=g=>{if(!g.map)g.map={w:10,h:8,objs:[]};return g.map};
const snap=v=>Math.round(v*4)/4,clampN=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmtM=v=>String(Math.round(v*100)/100).replace('.',',');
const cropIcons=o=>(o.c||[]).map(c=>(GARDEN.find(x=>x.id===c)||{e:'🌱'}).e).join('');
function objStyle(o,m){return `left:${o.x/m.w*100}%;top:${o.y/m.h*100}%;width:${o.w/m.w*100}%;height:${o.h/m.h*100}%`}
function objInner(o){const T=MT[o.t];return `<span class="mi">${o.t==='bed'?cropIcons(o):T.e}</span><span class="mn">${esc(o.n||(o.t==='bed'||o.t==='path'?'':T.n))}</span><i class="rz" aria-label="Изменить размер"></i>`}
function objHtml(o,m){return `<div class="mo ${o.t}${S8.sel===o.id?' sel':''}" data-oid="${o.id}" style="${objStyle(o,m)}" title="${esc(MT[o.t].n)}">${objInner(o)}</div>`}
V.gmap=()=>{
  const g=curG(),m=g.map||{w:10,h:8,objs:[]};
  return `${swHtml()}<h1>🗺 Карта участка</h1>
  <div class="chips mapadd">${Object.keys(MT).map(t=>`<button class="chip" data-madd="${t}">＋ ${MT[t].e} ${MT[t].n}</button>`).join('')}</div>
  <div class="mapbox" id="mapBox" style="aspect-ratio:${m.w}/${m.h};background-size:${100/m.w}% ${100/m.h}%">${m.objs.map(o=>objHtml(o,m)).join('')}${m.objs.length?'':'<div class="mapempty">Добавьте грядку кнопкой выше</div>'}</div>
  <div class="mut mapinfo">Участок ${fmtM(m.w)} × ${fmtM(m.h)} м · клетка 1 м</div>
  <div id="mapPanel">${panelHtml()}</div>
  <div class="card"><h3>Размер участка, м</h3><div class="row"><input id="plW" inputmode="decimal" value="${fmtM(m.w)}" aria-label="Ширина, м"><input id="plH" inputmode="decimal" value="${fmtM(m.h)}" aria-label="Длина, м"></div><button class="btn sm sec" id="bPlot">Применить</button></div>`;
};
function resHtml(q,o){return gardenFind(q).slice(0,8).map(g=>`<button class="cand" data-mc="${g.id}"><div class="e">${g.e}</div><div class="t"><b>${esc(g.n)}</b></div><div class="e">${(o.c||[]).includes(g.id)?'✓':'＋'}</div></button>`).join('')||'<p class="mut">Не найдено</p>'}
function panelHtml(){
  const m=curG().map,o=m&&m.objs.find(x=>x.id===S8.sel);
  if(!o)return '<p class="mut nc">Тапните объект, чтобы изменить. Тяните пальцем, чтобы переместить; тапните грядку — назначить растения.</p>';
  const T=MT[o.t];
  return `<div class="card"><h3>${T.e} ${T.n}</h3>
  <input type="text" id="moName" placeholder="Название (необязательно)" value="${esc(o.n||'')}" maxlength="24" autocomplete="off">
  <div class="szr"><span>Ширина ${fmtM(o.w)} м</span><button data-sz="w-" aria-label="Уже">−</button><button data-sz="w+" aria-label="Шире">＋</button></div>
  <div class="szr"><span>Длина ${fmtM(o.h)} м</span><button data-sz="h-" aria-label="Короче">−</button><button data-sz="h+" aria-label="Длиннее">＋</button></div>
  ${o.t==='bed'?`<h3>Растения на грядке</h3><div class="chips" id="moCrops">${(o.c||[]).map(c=>{const g=GARDEN.find(x=>x.id===c);return g?`<button class="chip on" data-mrm="${c}">${g.e} ${esc(g.n)} ✕</button>`:''}).join('')||'<span class="mut">Пока нет</span>'}</div>
  <input type="search" id="moSearch" placeholder="Найти культуру: томат, морковь…" autocomplete="off"><div id="moRes">${resHtml('',o)}</div>`:''}
  <button class="btn sm danger" id="bMoDel">🗑 Удалить</button><button class="btn sm sec" id="bMoDone">Готово</button></div>`;
}
function freeSpot(m,w,h){
  for(let y=0;y<=m.h-h;y+=.5)for(let x=0;x<=m.w-w;x+=.5)if(!m.objs.some(o=>x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y))return{x,y};
  return{x:0,y:0};
}
function addObj(t){
  const g=curG(),m=mapOf(g),T=MT[t],w=Math.min(T.w,m.w),h=Math.min(T.h,m.h),p=freeSpot(m,w,h);
  const o={id:ID8(),t,x:p.x,y:p.y,w,h,n:'',c:[]};m.objs.push(o);saveG(g);S8.sel=o.id;render();
}
function refreshMapSel(){
  $$('#mapBox .mo').forEach(e=>e.classList.toggle('sel',e.dataset.oid===S8.sel));
  const p=$('#mapPanel');if(p){p.innerHTML=panelHtml();bindPanel()}
}
function bindPanel(){
  const g=curG(),m=mapOf(g),o=m.objs.find(x=>x.id===S8.sel);if(!o)return;
  const upd=()=>{const el=$(`#mapBox [data-oid="${o.id}"]`);if(el){el.style.cssText=objStyle(o,m);el.innerHTML=objInner(o)}saveG(g)};
  const nm=$('#moName');if(nm)nm.oninput=()=>{o.n=nm.value;upd()};
  on8('[data-sz]','click',function(){const k=this.dataset.sz;
    if(k==='w+')o.w=clampN(o.w+.5,.5,m.w-o.x);if(k==='w-')o.w=clampN(o.w-.5,.5,m.w);
    if(k==='h+')o.h=clampN(o.h+.5,.5,m.h-o.y);if(k==='h-')o.h=clampN(o.h-.5,.5,m.h);
    upd();const p=$('#mapPanel');p.innerHTML=panelHtml();bindPanel()});
  const rs=$('#moSearch');if(rs)rs.oninput=()=>{$('#moRes').innerHTML=resHtml(rs.value,o);bindRes()};
  const bindRes=()=>on8('[data-mc]','click',function(){const id=this.dataset.mc;o.c=o.c||[];const i=o.c.indexOf(id);if(i>=0)o.c.splice(i,1);else o.c.push(id);upd();
    const q=($('#moSearch')||{}).value||'';$('#moCrops').innerHTML=panelCrops(o);bindRm();$('#moRes').innerHTML=resHtml(q,o);bindRes()});
  const panelCrops=o=>(o.c||[]).map(c=>{const gg=GARDEN.find(x=>x.id===c);return gg?`<button class="chip on" data-mrm="${c}">${gg.e} ${esc(gg.n)} ✕</button>`:''}).join('')||'<span class="mut">Пока нет</span>';
  const bindRm=()=>on8('[data-mrm]','click',function(){o.c=(o.c||[]).filter(c=>c!==this.dataset.mrm);upd();$('#moCrops').innerHTML=panelCrops(o);bindRm();const q=($('#moSearch')||{}).value||'';$('#moRes').innerHTML=resHtml(q,o);bindRes()});
  if(o.t==='bed'){bindRes();bindRm()}
  const d=$('#bMoDel');if(d)d.onclick=()=>{if(confirm('Удалить объект с карты?')){m.objs=m.objs.filter(x=>x.id!==o.id);S8.sel=null;saveG(g);render()}};
  const dn=$('#bMoDone');if(dn)dn.onclick=()=>{S8.sel=null;refreshMapSel()};
}
function bindMap(){
  const box=$('#mapBox');if(!box)return;
  const g=curG(),m=mapOf(g),ppm=()=>box.getBoundingClientRect().width/m.w;
  const setVar=()=>box.style.setProperty('--ppm',ppm().toFixed(2));setVar();
  box.onpointerdown=e=>{if(e.target===box||e.target.classList.contains('mapempty')){S8.sel=null;refreshMapSel()}};
  box.querySelectorAll('.mo').forEach(el=>{
    el.onpointerdown=e=>{
      const o=m.objs.find(x=>x.id===el.dataset.oid);if(!o)return;
      e.preventDefault();e.stopPropagation();
      const rz=e.target.classList.contains('rz');
      try{el.setPointerCapture(e.pointerId)}catch(_){}
      const st={x:e.clientX,y:e.clientY,ox:o.x,oy:o.y,ow:o.w,oh:o.h,moved:false};
      const newSel=S8.sel!==o.id;if(newSel){S8.sel=o.id;$$('#mapBox .mo').forEach(x=>x.classList.toggle('sel',x===el))}
      el.onpointermove=ev=>{
        if(!st.moved&&Math.hypot(ev.clientX-st.x,ev.clientY-st.y)<5)return;st.moved=true;
        const dx=(ev.clientX-st.x)/ppm(),dy=(ev.clientY-st.y)/ppm();
        if(rz){o.w=clampN(snap(st.ow+dx),.5,m.w-o.x);o.h=clampN(snap(st.oh+dy),.5,m.h-o.y)}
        else{o.x=clampN(snap(st.ox+dx),0,m.w-o.w);o.y=clampN(snap(st.oy+dy),0,m.h-o.h)}
        el.style.cssText=objStyle(o,m);
      };
      const end=ev=>{el.onpointermove=null;el.onpointerup=null;el.onpointercancel=null;try{el.releasePointerCapture(ev.pointerId)}catch(_){}
        if(st.moved)saveG(g);
        refreshMapSel();
        if(!st.moved&&o.t==='bed'){const s=$('#moSearch');if(s&&s.scrollIntoView)s.scrollIntoView({block:'center',behavior:'smooth'})}};
      el.onpointerup=end;el.onpointercancel=end;
    };
  });
  on8('[data-madd]','click',function(){addObj(this.dataset.madd)});
  const pl=$('#bPlot');if(pl)pl.onclick=()=>{
    const w=parseFloat(String($('#plW').value).replace(',','.')),h=parseFloat(String($('#plH').value).replace(',','.'));
    if(!(w>=2&&w<=100&&h>=2&&h<=100)){toast('Размер участка — от 2 до 100 метров');return}
    m.w=Math.round(w*4)/4;m.h=Math.round(h*4)/4;
    m.objs.forEach(o=>{o.w=Math.min(o.w,m.w);o.h=Math.min(o.h,m.h);o.x=clampN(o.x,0,m.w-o.w);o.y=clampN(o.y,0,m.h-o.h)});
    saveG(g);render();
  };
  window.onresize=setVar;
  bindPanel();
}

/* ---------- настройки: функции ---------- */
function featCard(){
  const f=LS.get('pd_feat',{});
  return `<div class="card" id="featCard"><h3>Функции</h3><p class="mut">Снимите галочку — функция скроется из меню и экранов. Данные не удаляются.</p>
  ${FEATS.map(([id,lbl,par])=>{const off=par&&!feat(par);return `<label class="fr${par?' sub':''}${off?' off':''}"><input type="checkbox" data-feat="${id}" ${f[id]===false?'':'checked'} ${off?'disabled':''}> ${esc(lbl)}</label>`}).join('')}
  ${feat('big')?`<button class="btn sm sec" id="bBigAbout">🔍 ${isBig()?'Выключить':'Включить'} крупный режим</button>`:''}
  <button class="btn sm sec" id="bAsReset">🧑‍🌾 Показать подсказки помощника снова</button></div>`;
}
const _vAbout=V.about;
V.about=()=>{const h=_vAbout(),mk='<div class="card" id="keyCard">';return h.includes(mk)?h.replace(mk,featCard()+mk):h+featCard()};
const _vGarden=V.garden;
V.garden=()=>_vGarden().replace('</section>',`</section>${swHtml()}${hubTiles()}`);
const _vMine=V.mine;V.mine=()=>swHtml()+_vMine();

/* ---------- навигация и общий пост-рендер ---------- */
function navOf(v){
  if(['mine','about'].includes(v))return v;
  if(['grow','gcrop','gproj'].includes(v))return 'grow';
  if(v==='today'&&isBig())return 'today';
  if(['garden','gdn','today','shop','master','moon','diary','harv','call','gmap','gmgr'].includes(v))return 'garden';
  return 'home';
}
function buildNav(){
  const big=isBig(),vis={home:feat('photo'),mine:true,grow:feat('grow')&&!big,garden:feat('garden'),today:feat('garden')&&big,about:true};
  $$('#nav button').forEach(b=>{b.hidden=!vis[b.dataset.go];b.classList.toggle('on',b.dataset.go===navOf(S.view))});
}
function tidy(){
  // длинные примечания сворачиваем
  $$('#app p.small').forEach(p=>{
    if(p.closest('details')||p.classList.contains('nc')||p.textContent.length<80)return;
    const d=document.createElement('details');d.className='inf';d.innerHTML='<summary>ℹ️ Подробнее</summary>';p.replaceWith(d);d.appendChild(p);
  });
  // скрыть то, что выключено в настройках
  $$('#app [data-go]').forEach(e=>{const v=e.dataset.go;if(e.closest('#nav'))return;if(!viewOk(v))e.remove()});
  if(!feat('garden'))$$('#app [data-gd]').forEach(e=>{const b=e.closest('.banner');(b||e).remove()});
  if(!wxOn())$$('#app #wxCard').forEach(e=>e.remove());
  if(!feat('voice'))$$('#app #bMic,#app #bRead').forEach(e=>e.remove());
}
function post8(){
  document.body.classList.toggle('big',isBig());
  buildNav();
  const h=$('#helper');if(h&&!feat('assist')){h.hidden=true;h.classList.remove('on');AS.busy=false}
  clearTimeout(post8.t);post8.t=setTimeout(assistCheck,450);
}

/* ---------- обработчики ---------- */
function bind8(){
  tidy();
  on8('[data-gsw]','click',function(){const id=this.dataset.gsw;if(S.view==='gmgr'){switchG(id);go('garden')}else switchG(id)});
  on8('[data-al]','click',function(){const a={k:this.dataset.k,x:this.dataset.al};say({force:true,kind:a.k,text:wxShort(a),more:a.x})});
  on8('#bBigT,#bBigAbout','click',()=>{LS.set('pd_big',!isBig());const v=S.view;render();if(isBig()&&v==='home'&&feat('garden'))go('today')});
  on8('[data-feat]','change',function(){const f=LS.get('pd_feat',{});if(this.checked)delete f[this.dataset.feat];else f[this.dataset.feat]=false;LS.set('pd_feat',f);const y=window.scrollY;render();window.scrollTo(0,y)});
  on8('#bAsReset','click',()=>{LS.set('pd_assist',{});toast('Подсказки помощника покажутся снова')});
  // луна
  on8('#bMoP','click',()=>{S8.moonM--;render()});on8('#bMoN','click',()=>{S8.moonM++;render()});
  // сегодня
  on8('#bMic','click',listen);on8('#bRead','click',readPlan);
  on8('#bTWat','click',()=>{const l=mineList();l.filter(mineVis).forEach(x=>{if(diffDays(x.next.water,today())<=0)x.next.water=addDays(today(),(x.every&&x.every.water)||3)});saveMine(l);render();toast('Отмечено: полито')});
  // что докупить
  on8('[data-have]','click',function(){const g=curG();g.have=g.have||[];const i=g.have.indexOf(this.dataset.have);if(i>=0)g.have.splice(i,1);else g.have.push(this.dataset.have);saveG(g);const y=window.scrollY;render();window.scrollTo(0,y)});
  on8('[data-flag]','click',function(){const g=curG();g[this.dataset.flag]=!g[this.dataset.flag];saveG(g);render()});
  on8('#bShopMaster','click',()=>{S8.masterPre=recs().out.filter(x=>!x.opt&&!(curG().have||[]).includes(x.id)).map(x=>x.id);go('master')});
  // мастер
  on8('#bMSave','click',()=>{
    const items=$$('[data-mdev]:checked').map(c=>{const d=DEVICES.find(x=>x.id===c.dataset.mdev);return d.n}),note=$('#mNote').value.trim(),area=$('#mArea').value.trim(),phone=$('#mPhone').value.trim();
    if(!items.length&&!note){toast('Отметьте, что подключить, или напишите в поле «Другое»');return}
    if(!area){toast('Укажите район или посёлок');return}
    if(!normPhone(phone)){toast('Укажите телефон: не меньше 7 цифр');return}
    const l=ordersL();l.unshift({id:ID8(),items,note,area,phone,name:$('#mName').value.trim(),garden:curG().name,date:new Date().toLocaleDateString('ru-RU')});LS.set('pd_orders',l);S8.masterPre=[];toast('Заявка сохранена на этом устройстве');render();
  });
  on8('[data-oshare]','click',function(){const o=ordersL().find(x=>x.id===this.dataset.oshare);if(o)shareText(orderText(o),'Заявка мастеру')});
  on8('[data-odel]','click',function(){if(confirm('Удалить заявку?')){LS.set('pd_orders',ordersL().filter(x=>x.id!==this.dataset.odel));render()}});
  // дневник
  on8('[data-dt]','click',function(){S8.dType=this.dataset.dt;render()});
  const df=$('#dFile');if(df)df.onchange=async()=>{const f=df.files[0];if(!f)return;try{const r=await prepare(f);S8.dPhoto=r.blob;$('#dPrev').textContent='✓ фото добавлено'}catch(e){toast('Не удалось открыть фото')}};
  on8('#bDSave','click',saveDiary);
  if(S.view==='diary')loadDiary();
  // внук
  on8('#bKSave','click',()=>{const ph=$('#kPhone').value.trim();if(ph&&!normPhone(ph)){toast('Номер — не меньше 7 цифр');return}LS.set('pd_kin',{name:$('#kName').value.trim(),phone:ph,tg:$('#kTg').value.trim().replace(/^@/,'')});toast('Контакт сохранён');render()});
  const kf=$('#kFile');if(kf)kf.onchange=async()=>{const f=kf.files[0];S8.callFile=null;if(!f)return;try{const r=await prepare(f);S8.callFile=new File([r.blob],'plant.jpg',{type:'image/jpeg'});$('#kPrev').textContent='✓ фото выбрано'}catch(e){toast('Не удалось открыть фото')}};
  on8('#bKSend','click',sendKin);
  // заготовки
  const hs=$('#hSearch');if(hs)hs.oninput=()=>{S8.hq=hs.value;$('#hList').innerHTML=harvList(S8.hq).map(harvItem).join('')||'<p class="mut">Ничего не найдено.</p>'};
  // огороды
  on8('[data-gname]','change',function(){const v=this.value.trim(),g=gList().find(x=>x.id===this.dataset.gname);if(!g)return;if(!v){this.value=g.name;toast('Название не может быть пустым');return}g.name=v;saveG(g);toast('Переименовано')});
  on8('[data-gdel]','click',function(){delGarden(this.dataset.gdel)});
  on8('#bGAddG','click',()=>{const v=($('#gNew').value||'').trim();if(!v){toast('Введите название огорода');return}if(gList().length>=12){toast('Не больше 12 огородов');return}
    const l=gList();const g={id:ID8(),name:v,geo:null,map:null,have:[],gh:false,away:false};l.push(g);LS.set(GKEY,l);switchG(g.id);go('garden');toast('Огород создан: укажите место')});
  if(S.view==='gmap')bindMap();
}

/* ---------- подключение к приложению ---------- */
{
  const _bind=bind;bind=function(){_bind();bind8()};
  const _render=render;render=function(){_render();post8()};
  const _go=go;go=function(v){if(!viewOk(v))v=startView();if(v!==S.view&&AS.busy)asHide();_go(v);buildNav();if(['today','shop'].includes(v)&&wxOn())loadWx(false)};
  const _lw=loadWx;loadWx=function(f){if(!wxOn())return Promise.resolve();return _lw(f)};
  const _msg=toast;
  window.addEventListener('pagehide',()=>{try{speechSynthesis.cancel()}catch(e){}});
  gList();
  Object.assign(window.__app,{go,feat,curG,gList,MOON,say,S8,dayPlan,recs,HARV,DEVICES,switchG,viewOk,startView});
  if(typeof setNav==='function')setNav();
  go(startView());
}
