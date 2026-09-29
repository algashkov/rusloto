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
const x = l => `<span class="rb-cross">${l}</span>`;
const inside = (big, small) => `<div class="rb-inside${big === big.toLowerCase() ? '' : ' up'}"><span class="big">${big}</span><span class="small">${small}</span></div>`;
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
  const proverbTiles = [
    ['dom','🏠'],['el','🌲'],['lozhka','🥄'],['ochki','👓'],['mukha','🪰'],['ananas','🍍'],['syr','🧀'],['tort','🎂'],['enot','🦝'],
    ['ryba','🐠'],['apelsin','🍊'],['babochka','🦋'],['okno','🪟'],['igla','🪡'],['telefon','☎️'],['sobaka','🐕'],['yabloko','🍏'],
  ];
  const Q = [
    { cat:'anagram', q: anagram('стук','stuk','✊'), a: reveal('КУСТ','kust','🌳') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${inside('е','сна')}</div>`,
      a: reveal('ВЕСНА','vesna','🌷','в·Е·сна — «сна» внутри «е»') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«У»</em> — на мне сидят,<br>С буквой <em>«О»</em> — за мной едят.</div>`,
      a: `<div class="pair">${pic('stul','🪑')}<b>ст<u>у</u>л</b></div><div class="pair">${pic('stol','🍽️')}<b>ст<u>о</u>л</b></div>` },
    { cat:'tricky',  q: `<p>Отгадай загадку:</p><div class="poem">Какой аппетит у зайца,<br>который очень давно не ел?</div>`,
      a: reveal('ВОЛЧИЙ!','zayac','🐰','«Волчий аппетит» — очень сильный голод') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Без труда…</div>`,
      a: `<div class="poem">…не вынешь и рыбку из пруда!</div>${pic('ryba','🐠','big')}` },
    { cat:'sentence',q: `<p>Сколько звуков <b class="snd">[в]</b> в этих предложениях?</p>
        <div class="poem">На дворе трава, на траве дрова.<br>Не руби дрова на траве двора.</div>`,
      a: `<div class="answer-word">5</div><div class="poem">На д<mark>в</mark>оре тра<mark>в</mark>а, на траве дро<mark>в</mark>а.<br>Не руби дро<mark>в</mark>а на траве д<mark>в</mark>ора.</div>
        <p class="note">А в слове «траве» — мягкий звук [в’], это другой звук!</p>` },
    { cat:'quiz',    q: `<div class="poem">Сколько букв в русском алфавите?</div>`, a: reveal('33','abc','🔤') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><span class="rb-letters">ЯЯЯЯЯЯЯ</span></div>`,
      a: reveal('СЕМЬЯ','semya','👨‍👩‍👧‍👦','Семь «Я» — СЕМЬ·Я') },

    { cat:'anagram', q: anagram('пио́н','pion','🌸'), a: reveal('ПО́НИ','poni','🐴') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«Б»</em> — я одноногий,<br>и стою я у дороги.<br>А без <em>«Б»</em> — ног аж четыре,<br>и стою в твоей квартире.</div>`,
      a: `<div class="pair">${pic('stolb','🚏')}<b>стол<u>б</u></b></div><div class="pair">${pic('stol','🍽️')}<b>стол</b></div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус — это пословица! Читай по первым буквам.</p>
        <div class="tiles">${proverbTiles.map(([k, e]) => `<div class="tile">${pic(k, e)}</div>`).join('')}</div>`,
      a: `<div class="answer-word small">ДЕЛО МАСТЕРА БОИТСЯ</div>
        <p class="note">Дом · Ель · Ложка · Очки · Муха · Ананас · Сыр · Торт · Енот · Рыба · Апельсин · Бабочка · Окно · Игла · Телефон · Собака · Яблоко</p>` },
    { cat:'tricky',  q: `<p>Какое слово получится, если произнести <u>звуки</u> слова <b>ЛОБ</b> в обратном порядке?</p>`,
      a: `<div class="answer-word">ПОЛ</div><p class="note">ЛОБ звучит как [лоп] → наоборот [пол]</p>${pic('pol','🧹','big')}` },
    { cat:'quiz',    q: `<div class="poem">Какие две буквы не обозначают звука?</div>`,
      a: `<div class="answer-word">Ь и Ъ</div><p class="note">Мягкий и твёрдый знаки</p>` },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Семь раз отмерь…</div>`,
      a: `<div class="poem">…один раз отрежь!</div>${pic('nozhnicy','✂️','big')}` },
    { cat:'sentence',q: `<p>Какое выделенное слово употреблено в <b>переносном</b> значении?</p>
        <div class="poem">Собак верёвкой <em>привязывают</em>,<br>Сидеть спокойно приказывают.<br>Но если их любят, оказывается,<br>Сами они <em>привязываются</em>.</div>`,
      a: `<div class="answer-word small">привязываются</div><p class="note">Значит — начинают любить, дружить</p>${pic('sobaka','🐕','big')}` },
    { cat:'anagram', q: anagram('сорт','sort','🍎'), a: reveal('РОСТ','rost','📏') },

    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${inside('а','тык')}</div>`,
      a: reveal('ТЫКВА','tykva','🎃','«тык» в «а» — ТЫК·В·А') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«Д»</em> — вас в дом пускает,<br>С буквой <em>«З»</em> — рычит, кусает.</div>`,
      a: `<div class="pair">${pic('dver','🚪')}<b><u>д</u>верь</b></div><div class="pair">${pic('zver','🐯')}<b><u>з</u>верь</b></div>` },
    { cat:'quiz',    q: `<div class="poem">Кто из героев народных сказок похож на мяч?</div>`, a: reveal('КОЛОБОК','kolobok','🟡') },
    { cat:'tricky',  q: `<p>Закончи стишок:</p><div class="poem">С пальмы вниз, на пальму снова,<br>Ловко прыгает…</div>`,
      a: `<div class="poem">…не корова, а <b>ОБЕЗЬЯНА</b>! 😄</div>${pic('obezyana','🐒','big')}` },
    { cat:'sentence',q: `<p>Вставь подходящее слово: <b>одёрнуть</b> или <b>отдёрнуть</b>?</p>
        <div class="poem">Рубашку на малыше нужно …<br>Руку от огня нужно быстро …</div>`,
      a: `<div class="poem">Рубашку на малыше нужно <mark>одёрнуть</mark>.<br>Руку от огня нужно быстро <mark>отдёрнуть</mark>.</div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${cm(1)}${pic('tuchi','🌧️')}<span class="rb-letter red">Т</span>${pic('el','🌲')}</div>`,
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
    { cat:'tricky',  q: `<p>Запиши правильно названия сказок:</p>
        <div class="poem cols">«Гусли-лебеди»<br>«Гладкий утёнок»<br>«Полк и семеро козлят»<br>«Шурочка Ряба»<br>«Нежная королева»<br>«Крот в сапогах»</div>`,
      a: `<div class="poem cols">«Гуси-лебеди»<br>«Гадкий утёнок»<br>«Волк и семеро козлят»<br>«Курочка Ряба»<br>«Снежная королева»<br>«Кот в сапогах»</div>` },
    { cat:'sentence',q: `<p>Какое слово подходит по смыслу?</p>
        <div class="poem">Утром к дому прилетела небольшая<br>(стая, стайка, стадо) воробьёв.</div>`,
      a: reveal('СТАЙКА','vorobi','🐦','Небольшая стая — стайка. Стадо — у коров!') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${izyumSvg()}</div>`,
      a: reveal('ИЗЮМ','izyum','🍇','М сделана из Ю — ИЗ·Ю·М') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Учение — свет…</div>`,
      a: `<div class="poem">…а неученье — тьма!</div>${pic('lampa','💡','big')}` },
    { cat:'quiz',    q: `<p>Найди способ прочитать написанное:</p>
        <div class="cipher">QWУNЧLИZТJЬZHСVЯ — ВNIСDЕ4ГVДZA SПGРYRИ WWГО FДNИТRWСQЯ</div>`,
      a: `<div class="answer-word small">УЧИТЬСЯ ВСЕГДА ПРИГОДИТСЯ</div><p class="note">Читаем только русские буквы!</p>` },

    { cat:'anagram', q: anagram('опла́та','oplata','👛'), a: reveal('ЛОПА́ТА','lopata','⛏️') },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${pic('molotok','🔨')}${cm(3)}${pic('kot','🐈')}${cm(1)}</div>`,
      a: reveal('МОЛОКО','moloko','🥛','МОЛОТОК без «ток» + КОТ без «т» → МОЛО + КО') },
    { cat:'sharada', q: `<div class="poem">С буквой <em>«К»</em> — фигура без углов,<br>С буквой <em>«Д»</em> — дружить с тобой готов.</div>`,
      a: `<div class="pair">${pic('krug','⭕')}<b><u>к</u>руг</b></div><div class="pair">${pic('drug','🧒')}<b><u>д</u>руг</b></div>` },
    { cat:'sentence',q: `<p>Найди и исправь ошибки:</p>
        <div class="poem">Луна освещяла лисную чящю.<br>В трове трищяли кузнечики.<br>На дачи жывёт маленкая сабачька.<br>В чяще щебечют птицы.</div>`,
      a: `<div class="poem">Луна освещ<mark>а</mark>ла л<mark>е</mark>сную ч<mark>а</mark>щ<mark>у</mark>.<br>В тр<mark>а</mark>ве тр<mark>е</mark>щ<mark>а</mark>ли кузнечики.<br>На дач<mark>е</mark> ж<mark>и</mark>вёт мален<mark>ь</mark>кая с<mark>о</mark>ба<mark>чк</mark>а.<br>В ч<mark>а</mark>ще щебеч<mark>у</mark>т птицы.</div>` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus"><span class="rb-letter cyan">УЧ</span>${cm(1)}${pic('venik','🧹')}</div>`,
      a: reveal('УЧЕНИК','uchenik','🧑‍🎓','УЧ + ВЕНИК без первой буквы → УЧ + ЕНИК') },
    { cat:'tricky',  q: `<p>Подумай, о чём идёт речь?</p>
        <div class="poem">Его вешают, приходя в уныние;<br>его задирают зазнайки;<br>его суют не в своё дело.</div>`,
      a: reveal('НОС','nos','👃') },
    { cat:'proverb', q: `<p>Доскажи пословицу:</p><div class="poem">Кончил дело…</div>`,
      a: `<div class="poem">…гуляй смело!</div>${pic('gulyat','🎈','big')}` },
    { cat:'rebus',   q: `<p>Разгадай ребус</p><div class="rebus">${pic('morkov','🥕')}${cm(4)}<span class="rb-letter brown">ОЗ</span></div>`,
      a: reveal('МОРОЗ','moroz','❄️','МОРКОВЬ без 4 последних букв → МОР + ОЗ') },
  ];
  return Q;
}
