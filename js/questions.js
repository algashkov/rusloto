// Вопросы игры «РусЛото». Порядок в массиве = номер бочонка (1..40).
// q / a — HTML. Хелперы: pic(ключ, эмодзи) — картинка из img/ (если сгенерирована) или эмодзи;
// cm(n) — n запятых ребуса; x(буква) — зачёркнутая буква.

const CATS = {
  anagram: { name: 'Анаграммы',       color: '#3b82f6', icon: '🔀' },
  rebus:   { name: 'Ребусы',          color: '#22c55e', icon: '🧩' },
  sharada: { name: 'Шарады',          color: '#ec4899', icon: '🎭' },
  sentence:{ name: 'Предложения',     color: '#14b8a6', icon: '✏️' },
  tricky:  { name: 'Хитрые вопросы',  color: '#f97316', icon: '🦊' },
  proverb: { name: 'Пословицы',       color: '#a855f7', icon: '📜' },
  quiz:    { name: 'Знатоки',         color: '#eab308', icon: '🎓' },
};

function pic(key, emoji, cls = '') {
  const src = (window.GEN_IMAGES || {})[key];
  return src
    ? `<img class="pic ${cls}" src="${src}" alt="" draggable="false">`
    : `<span class="pic emoji ${cls}">${emoji}</span>`;
}
const cm = n => `<span class="rb-comma">${','.repeat(n)}</span>`;
// Картинка с «приклеенными» запятыми: before — слева сверху, after — справа сверху
const withCommas = (picHtml, before = 0, after = 0) =>
  `<span class="rb-item" style="--nb:${before};--na:${after}">${before ? `<span class="rb-comma-at left">${','.repeat(before)}</span>` : ''}${picHtml}${after ? `<span class="rb-comma-at right">${','.repeat(after)}</span>` : ''}</span>`;
const x = l => `<span class="rb-cross">${l}</span>`;
// Ребус «слово внутри буквы»: буква растянута по ширине, слово стоит точно в её пустом месте.
// Координаты подобраны под шрифт Rubik 500 (замер по пикселям).
const INSIDE = {
  'е': { fs: 560, by: 330, wx: 205, wy: 137, ws: 46, color: '#5b8fd9', vb: '10 30 380 320' },
  'а': { fs: 560, by: 340, wx: 184, wy: 266, ws: 42, color: '#f39a2b', vb: '10 40 380 320' },
  'О': { fs: 440, by: 360, wx: 200, wy: 224, ws: 54, color: '#3f6fb0', vb: '10 40 380 335' },
};
const inside = (big, small) => {
  const c = INSIDE[big];
  return `<svg class="rb-inside" viewBox="${c.vb}">
    <text x="200" y="${c.by}" font-size="${c.fs}" fill="${c.color}" text-anchor="middle" transform="translate(200 0) scale(1.3 1) translate(-200 0)">${big}</text>
    <text x="${c.wx}" y="${c.wy}" font-size="${c.ws}" class="rb-inside-word" text-anchor="middle">${small}</text></svg>`;
};
const anagram = (word, wPic, wEmoji) =>
  `<p>Переставь буквы в слове так, чтобы получилось новое слово.</p>
   <div class="word-card">${pic(wPic, wEmoji)}<b>${word}</b></div>`;
const reveal = (word, key, emoji, note = '') =>
  `<div class="answer-word">${word}</div>${pic(key, emoji, 'big')}${note ? `<p class="note">${note}</p>` : ''}`;

function izyumSvg() {
  // Буква «М», выложенная буквами «Ю»
  const pts = [[10,10],[10,30],[10,50],[10,70],[10,90],[24,20],[34,36],[44,52],[54,66],[64,52],[74,36],[84,20],[98,10],[98,30],[98,50],[98,70],[98,90]];
  return `<svg class="rb-svg" viewBox="0 0 110 104">${pts.map(([px, py]) =>
    `<text x="${px}" y="${py + 10}" text-anchor="middle">Ю</text>`).join('')}</svg>`;
}

function buildQuestions() {
  // Каждое слово пословицы — отдельная строка картинок
  const proverbRows = [
    [['dom','🏠','Д'],['el','🌲','Е'],['lozhka','🥄','Л'],['ochki','👓','О']],
    [['mukha','🪰','М'],['ananas','🍍','А'],['syr','🧀','С'],['tort','🎂','Т'],['enot','🦝','Е'],['ryba','🐠','Р'],['apelsin','🍊','А']],
    [['babochka','🦋','Б'],['okno','🪟','О'],['igla','🪡','И'],['telefon','☎️','Т'],['sobaka','🐕','С'],['yabloko','🍏','Я']],
  ];
  const tilesHtml = withLetters => `<div class="tiles">${proverbRows.map(row =>
    `<div class="tiles-row">${row.map(([k, e, l]) =>
      `<div class="tile">${pic(k, e)}${withLetters ? `<b>${l}</b>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
  const Q = [
    { cat:'anagram', q: anagram('стук','stuk','✊'), a: reveal('КУСТ','kust','🌳') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${inside('е','сна')}</div>`,
      a: reveal('ВЕСНА','vesna','🌷','в·Е·сна — «сна» внутри «е»') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«У»</em> — на мне сидят,<br>С буквой <em>«О»</em> — за мной едят.</div>`,
      a: `<div class="pair">${pic('stul','🪑')}<b>ст<u>у</u>л</b></div><div class="pair">${pic('stol','🍽️')}<b>ст<u>о</u>л</b></div>` },
    { cat:'quiz',    q: `<div class="poem">Какой знак препинания чаще всего<br>ставится в конце предложения?</div>`,
      a: `<div class="answer-word">ТОЧКА</div><div class="big-dot">.</div><p class="note">Мама мыла раму<b>.</b></p>` },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Без труда…</div>`,
      a: `<div class="poem">…не вынешь и рыбку из пруда!</div>${pic('ryba','🐠','big')}` },
    { cat:'quiz',    q: `<div class="poem">Сколько гласных звуков<br>в русском языке?</div>`,
      a: `<div class="answer-word">6</div><div class="sounds">${['а','о','у','ы','и','э'].map(v => `<span>[${v}]</span>`).join('')}</div>
        <p class="note">А гласных букв — 10!</p>` },
    { cat:'quiz',    q: `<div class="poem">Сколько букв в русском алфавите?</div>`, a: reveal('33','azbuka','📘') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><span class="rb-letters">ЯЯЯЯЯЯЯ</span></div>`,
      a: reveal('СЕМЬЯ','semya','👨‍👩‍👧‍👦','Семь «Я» — СЕМЬ·Я') },

    { cat:'anagram', q: anagram('пио́н','pion','🌸'), a: reveal('ПО́НИ','poni','🐴') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Тяжело в учении…</div>`,
      a: `<div class="poem">…легко в бою!</div>${pic('bogatyr','🛡️','big')}` },
    { cat:'rebus',   q: `<p>Разгадай ребус — это пословица! Читай по первым буквам.</p>
        ${tilesHtml(false)}`,
      a: `<div class="answer-word phrase">ДЕЛО МАСТЕРА БОИТСЯ</div>${tilesHtml(true)}` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><span class="rb-letter green">ШО</span>${pic('rot','👄')}${pic('rot','👄','flip')}</div>`,
      a: reveal('ШОРТЫ','shorty','🩳','ШО + РТЫ (два рта) = ШОРТЫ') },
    { cat:'quiz',    q: `<div class="poem">Какие две буквы не обозначают звука?</div>`,
      a: `<div class="answer-word">Ь и Ъ</div><p class="note">Мягкий и твёрдый знаки</p>` },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Семь раз отмерь…</div>`,
      a: `<div class="poem">…один раз отрежь!</div>${pic('nozhnicy','✂️','big')}` },
    { cat:'sentence',q: `<p>Найди и исправь ошибки <span class="err-count">(4 ошибки)</span>:</p><div class="poem">Луна освещяла лисную чящю.</div>${pic('luna','🌙')}`,
      a: `<div class="poem">Луна освещ<mark>а</mark>ла л<mark>е</mark>сную ч<mark>а</mark>щ<mark>у</mark>.</div>` },
    { cat:'anagram', q: anagram('сорт','sort','🍎'), a: reveal('РОСТ','rost','📏') },

    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${inside('а','тык')}</div>`,
      a: reveal('ТЫКВА','tykva','🎃','«тык» в «а» — ТЫК·В·А') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«Д»</em> — вас в дом пускает,<br>С буквой <em>«З»</em> — рычит, кусает.</div>`,
      a: `<div class="pair">${pic('dver','🚪')}<b><u>д</u>верь</b></div><div class="pair">${pic('zver','🐯')}<b><u>з</u>верь</b></div>` },
    { cat:'quiz',    q: `<div class="poem">Кто из героев народных сказок похож на мяч?</div>`, a: reveal('КОЛОБОК','kolobok','🟡') },
    { cat:'tricky',  q: `<p>Закончи стишок:</p><div class="poem">С пальмы вниз, на пальму снова,<br>Ловко прыгает…</div>`,
      a: `<div class="poem">…не корова, а <b>ОБЕЗЬЯНА</b>! 😄</div>${pic('obezyana','🐒','big')}` },
    { cat:'sentence',q: `<p>Найди и исправь ошибки <span class="err-count">(3 ошибки)</span>:</p><div class="poem">В трове трищяли кузнечики.</div>${pic('kuznechik','🦗')}`,
      a: `<div class="poem">В тр<mark>а</mark>ве тр<mark>е</mark>щ<mark>а</mark>ли кузнечики.</div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus nowrap"><span class="rb-item" style="--nb:1;--na:0"><span class="rb-comma-at left">,</span><span class="clouds">${pic('tucha','☁️')}${pic('tucha','☁️')}${pic('tucha','☁️')}</span></span><span class="rb-letter red">Т</span>${pic('el','🌲')}</div>`,
      a: reveal('УЧИТЕЛЬ','uchitel','👩‍🏫','ТУЧИ без первой буквы → УЧИ + Т + ЕЛЬ') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Не имей сто рублей…</div>`,
      a: `<div class="poem">…а имей сто друзей!</div>${pic('druzya','🤝','big')}` },
    { cat:'anagram', q: anagram('актёр','akter','🎭'), a: reveal('ТЁРКА','terka','🧀') },

    { cat:'sharada', q: `<div class="poem">С буквой <em>«Р»</em> — я задом пячусь,<br>С буквой <em>«М»</em> — я в булке прячусь.</div>`,
      a: `<div class="pair">${pic('rak','🦞')}<b><u>р</u>ак</b></div><div class="pair">${pic('mak','🥯')}<b><u>м</u>ак</b></div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${inside('О','рона')}</div>`,
      a: reveal('ВОРОНА','vorona','🐦‍⬛','«рона» в «О» — В·О·РОНА') },
    { cat:'quiz',    q: `<div class="poem">Чем заканчиваются<br>день и ночь?</div>`,
      a: `<div class="answer-word">Ь</div><p class="note">Мягким знаком: ден<b>ь</b>, ноч<b>ь</b> 😉</p>` },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Любишь кататься…</div>`,
      a: `<div class="poem">…люби и саночки возить!</div>${pic('sanki','🛷','big')}` },
    { cat:'sentence',q: `<p>Найди и исправь ошибки <span class="err-count">(5 ошибок)</span>:</p><div class="poem">На дачи жывёт маленкая сабачька.</div>${pic('sobaka','🐕')}`,
      a: `<div class="poem">На дач<mark>е</mark> ж<mark>и</mark>вёт мален<mark>ь</mark>кая с<mark>о</mark>ба<mark>чк</mark>а.</div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${izyumSvg()}</div>`,
      a: reveal('ИЗЮМ','izyum','🍇','М сделана из Ю — ИЗ·Ю·М') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Учение — свет…</div>`,
      a: `<div class="poem">…а неученье — тьма!</div>${pic('lampa','💡','big')}` },
    { cat:'quiz',    q: `<p>Найди способ прочитать написанное:</p>
        <div class="cipher">QWУNЧLИZТJЬZHСVЯ<br>ВNIСDЕ4ГVДZA<br>SПGРYRИWWГОFДNИТRWСQЯ</div>`,
      a: `<div class="answer-word small">УЧИТЬСЯ ВСЕГДА ПРИГОДИТСЯ</div><p class="note">Читаем только русские буквы!</p>` },

    { cat:'anagram', q: anagram('опла́та','oplata','👛'), a: reveal('ЛОПА́ТА','lopata','⛏️') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${withCommas(pic('molotok','🔨'), 0, 3)}${withCommas(pic('kot','🐈'), 0, 1)}</div>`,
      a: reveal('МОЛОКО','moloko','🥛','МОЛОТОК без «ток» + КОТ без «т» → МОЛО + КО') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«К»</em> — фигура без углов,<br>С буквой <em>«Д»</em> — дружить с тобой готов.</div>`,
      a: `<div class="pair">${pic('krug','⭕')}<b><u>к</u>руг</b></div><div class="pair">${pic('drug','🧒')}<b><u>д</u>руг</b></div>` },
    { cat:'sentence',q: `<p>Найди и исправь ошибки <span class="err-count">(2 ошибки)</span>:</p><div class="poem">В чяще щебечют птицы.</div>${pic('vorobi','🐦')}`,
      a: `<div class="poem">В ч<mark>а</mark>ще щебеч<mark>у</mark>т птицы.</div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><span class="rb-letter cyan">УЧ</span>${withCommas(pic('venik','🧹'), 1)}</div>`,
      a: reveal('УЧЕНИК','uchenik','🧑‍🎓','УЧ + ВЕНИК без первой буквы → УЧ + ЕНИК') },
    { cat:'tricky',  q: `<p>Подумай, о чём идёт речь?</p>
        <div class="poem">Его вешают, приходя в уныние;<br>его задирают зазнайки;<br>его суют не в своё дело.</div>`,
      a: reveal('НОС','nos','👃') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Сделал дело…</div>`,
      a: `<div class="poem">…гуляй смело!</div>${pic('gulyat','🎈','big')}` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><div class="rb-box">Р1А</div></div>`,
      a: reveal('РОДИНА','rodina','🏞️','Р + ОДИН + А = РОДИНА') },
  ];
  return Q;
}
