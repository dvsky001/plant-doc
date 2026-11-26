// Конфигурация. Здесь НЕТ секретов: ключ Pl@ntNet предназначен для браузера и работает только
// с доменов из списка «Authorized domains» в настройках ключа (my.plantnet.org → Settings → API key).
window.PLANT_CONFIG={
  PLANTNET_KEY:'',            // ← вставьте публичный ключ Pl@ntNet (пусто = демо-режим без распознавания по фото)
  PLANTNET_PROJECT:'all',
  PLANTNET_LANG:'ru',
  FREE_PER_DAY:3,             // бесплатных фото в день (счётчик в localStorage; жёсткий лимит — только через прокси/сервер)
  // Партнёрские ссылки: заглушки. {q} — поисковая фраза. Когда появятся партнёрские аккаунты — подставить свои шаблоны.
  SHOPS:[
    {id:'ozon',name:'Ozon',color:'#005BFF',url:'https://www.ozon.ru/search/?text={q}'+'' /* + &partner=ВАШ_ID */},
    {id:'wb',name:'Wildberries',color:'#CB11AB',url:'https://www.wildberries.ru/catalog/0/search.aspx?search={q}'},
    {id:'ym',name:'Яндекс Маркет',color:'#FFCC00',url:'https://market.yandex.ru/search?text={q}'}
  ],
  AFFILIATE_PLACEHOLDER:true, // true = показывать пометку «ссылки-заглушки, не партнёрские»
  PRICES:{month:'199 ₽ / мес',year:'1 190 ₽ / год'}  // заглушка тарифов
};
