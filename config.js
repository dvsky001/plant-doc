// Конфигурация. Здесь НЕТ секретов: ключ Pl@ntNet предназначен для браузера и работает только
// с доменов из списка «Authorized domains» в настройках ключа (my.plantnet.org → Settings → API key).
window.PLANT_CONFIG={
  PLANTNET_KEY:'',            // ← вставьте публичный ключ Pl@ntNet (пусто = демо-режим без распознавания по фото)
  PLANTNET_PROJECT:'all',
  PLANTNET_LANG:'ru',
  FREE_PER_DAY:3,             // бесплатных фото в день (счётчик в localStorage; жёсткий лимит — только через прокси/сервер)
  // Регионы: климат/сезоны (месяцы 0–11, для северного полушария), магазины (заглушки: поисковые ссылки; {q} — запрос),
  // валюта и цены подписки (заглушка). Набор культур от региона НЕ зависит.
  REGIONS:{
    ru:{n:'Россия',flag:'🇷🇺',cur:'₽',lang:'ru',warm:[3,4,5,6,7,8],heat:[9,10,11,0,1,2,3],dark:[10,11,0,1],kdark:1.15,
      climate:'Умеренный/континентальный: тёплый сезон апрель–сентябрь, отопительный октябрь–апрель, зимой светового дня мало.',
      prices:{month:'199 ₽ / мес',year:'1 190 ₽ / год'},
      shops:[{id:'ozon',name:'Ozon',color:'#005BFF',url:'https://www.ozon.ru/search/?text={q}'},{id:'wb',name:'Wildberries',color:'#CB11AB',url:'https://www.wildberries.ru/catalog/0/search.aspx?search={q}'},{id:'ym',name:'Яндекс Маркет',color:'#FFCC00',url:'https://market.yandex.ru/search?text={q}'}]},
    kz:{n:'Казахстан',flag:'🇰🇿',cur:'₸',lang:'ru',warm:[3,4,5,6,7,8,9],heat:[9,10,11,0,1,2,3],dark:[11,0],kdark:1.1,
      climate:'Резко континентальный: жаркое сухое лето, холодная зима; в отопительный сезон (окт–апр) воздух очень сухой; на юге весна начинается раньше.',
      prices:{month:'990 ₸ / мес',year:'5 990 ₸ / год'},
      shops:[{id:'kaspi',name:'Kaspi',color:'#F14635',url:'https://kaspi.kz/shop/search/?text={q}'},{id:'ozon',name:'Ozon',color:'#005BFF',url:'https://ozon.kz/search/?text={q}'},{id:'wb',name:'Wildberries',color:'#CB11AB',url:'https://www.wildberries.kz/catalog/0/search.aspx?search={q}'}]},
    other:{n:'Другой регион',flag:'🌍',cur:'$',lang:'ru',warm:[3,4,5,6,7,8],heat:[],dark:[11,0],kdark:1.1,
      climate:'Умеренный климат (для южного полушария сезоны сдвигаются на полгода — выберите полушарие). Отопительный сезон не учитывается.',
      prices:{month:'$2.99 / mo',year:'$17.99 / yr'},
      shops:[{id:'amz',name:'Amazon',color:'#FF9900',url:'https://www.amazon.com/s?k={q}'},{id:'ali',name:'AliExpress',color:'#E62E04',url:'https://www.aliexpress.com/wholesale?SearchText={q}'}]}
  },
  AFFILIATE_PLACEHOLDER:true
};
