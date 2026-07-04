#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXTENSIONS, SEEDS } from './vocab-extensions.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORDS_DIR = join(ROOT, 'data', 'words');
const ALPHABET_PATH = join(ROOT, 'data', 'alphabet.json');

/** @type {Record<string, number>} */
const FOLDER_TARGETS = {
  greetings: 120,
  numbers: 150,
  family: 180,
  food: 200,
  home: 180,
  clothes: 150,
  body: 180,
  city: 200,
  work: 180,
  nature: 180,
  emotions: 170,
  verbs: 250,
  adjectives: 200,
  phrases: 200,
};

/** @typedef {[string, string, string, string, string[]?, string?, string?, string?]} VocabTuple */

const ONES = ['zero', 'mek', 'erku', 'yerek', 'chors', 'hing', 'vec', 'yot', 'ut', 'inn'];
const ONES_RU = ['Ноль', 'Один', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять'];
const ONES_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TENS = ['', 'tas', 'qsan', 'yereqsan', 'qarasun', 'hisun', 'varsun', 'yotnusun', 'utsun', 'innusun'];
const TENS_RU = ['', 'Десять', 'Двадцать', 'Тридцать', 'Сорок', 'Пятьдесят', 'Шестьдесят', 'Семьдесят', 'Восемьдесят', 'Девяносто'];
const TENS_EN = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const ORDINALS = [
  ['Первый', 'First', 'arajn', 'arajn'],
  ['Второй', 'Second', 'erkrord', 'erkrord'],
  ['Третий', 'Third', 'yerrord', 'yerrord'],
  ['Четвёртый', 'Fourth', 'chorsord', 'chorsord'],
  ['Пятый', 'Fifth', 'hingord', 'hingord'],
  ['Шестой', 'Sixth', 'vecord', 'vecord'],
  ['Седьмой', 'Seventh', 'yotord', 'yotord'],
  ['Восьмой', 'Eighth', 'utord', 'utord'],
  ['Девятый', 'Ninth', 'innord', 'innord'],
  ['Десятый', 'Tenth', 'tasord', 'tasord'],
];

/** @param {number} n */
function cardinalHy(n) {
  if (n < 0) return String(n);
  if (n < 10) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hundred = h === 1 ? 'haryur' : `${ONES[h]}-haryur`;
    if (rest === 0) return hundred;
    return `${hundred} ${cardinalHy(rest)}`;
  }
  if (n < 10000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    const thousand = th === 1 ? 'hazar' : `${cardinalHy(th)} hazar`;
    if (rest === 0) return thousand;
    return `${thousand} ${cardinalHy(rest)}`;
  }
  return String(n);
}

const TEENS_RU = ['Десять', 'Одиннадцать', 'Двенадцать', 'Тринадцать', 'Четырнадцать', 'Пятнадцать', 'Шестнадцать', 'Семнадцать', 'Восемнадцать', 'Девятнадцать'];
const TEENS_EN = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

/** @param {number} i @returns {[string, string]} */
function numberLabels(i) {
  if (i < 10) return [ONES_RU[i], ONES_EN[i]];
  if (i < 20) return [TEENS_RU[i - 10], TEENS_EN[i - 10]];
  const t = Math.floor(i / 10);
  const o = i % 10;
  if (o === 0) return [TENS_RU[t], TENS_EN[t]];
  return [`${TENS_RU[t]} ${ONES_RU[o].toLowerCase()}`, `${TENS_EN[t]}-${ONES_EN[o].toLowerCase()}`];
}

/** @returns {VocabTuple[]} */
function generateNumbersEntries() {
  /** @type {VocabTuple[]} */
  const entries = [];
  for (let i = 0; i <= 99; i++) {
    const [ru, en] = numberLabels(i);
    entries.push([ru, en, cardinalHy(i), cardinalHy(i)]);
  }
  entries.push(['Сто', 'One hundred', 'haryur', 'haryur']);
  entries.push(['Двести', 'Two hundred', 'erku-haryur', 'erku-haryur']);
  entries.push(['Триста', 'Three hundred', 'yerek-haryur', 'yerek-haryur']);
  entries.push(['Тысяча', 'One thousand', 'hazar', 'hazar']);
  entries.push(['Две тысячи', 'Two thousand', 'erku hazar', 'erku hazar']);
  entries.push(['Миллион', 'Million', 'milion', 'milion']);
  for (const ord of ORDINALS) entries.push(/** @type {VocabTuple} */ (ord));
  const timeWords = /** @type {VocabTuple[]} */ ([
    ['Час', 'Hour', 'jam', 'jam'],
    ['Минута', 'Minute', 'rope', 'rope'],
    ['Секунда', 'Second', 'vayrkyan', 'vayrkyan'],
    ['День', 'Day', 'or', 'or'],
    ['Неделя', 'Week', 'shabat', 'shabat'],
    ['Месяц', 'Month', 'amis', 'amis'],
    ['Год', 'Year', 'tari', 'tari'],
    ['Утро', 'Morning', 'luis', 'luis'],
    ['Вечер', 'Evening', 'yerekon', 'yerekon'],
    ['Ночь', 'Night', 'gisher', 'gisher'],
    ['Сегодня', 'Today', 'aysor', 'aysor'],
    ['Завтра', 'Tomorrow', 'vagh', 'vagh'],
    ['Вчера', 'Yesterday', 'yerek', 'yerek'],
    ['Понедельник', 'Monday', 'yerkushapti', 'yerkushapti'],
    ['Вторник', 'Tuesday', 'yerekshapti', 'yerekshapti'],
    ['Среда', 'Wednesday', 'choreqshapti', 'choreqshapti'],
    ['Четверг', 'Thursday', 'hingshapti', 'hingshapti'],
    ['Пятница', 'Friday', 'urbat', 'urbat'],
    ['Суббота', 'Saturday', 'shabat', 'shabat'],
    ['Воскресенье', 'Sunday', 'kiraki', 'kiraki'],
    ['Время', 'Time', 'zhamanak', 'zhamanak'],
    ['Сколько?', 'How much?', 'qani?', 'qani?'],
    ['Сколько стоит?', 'How much does it cost?', 'qani e arzhe?', 'qani e arzhe?'],
    ['Сколько времени?', 'What time is it?', 'qani e zhamanaky?', 'qani e zhamanaky?'],
    ['Сколько тебе лет?', 'How old are you?', 'qani tarekan es?', 'qani tarekan es?'],
    ['Половина', 'Half', 'kes', 'kes'],
    ['Четверть', 'Quarter', 'chork', 'chork'],
    ['Всегда', 'Always', 'misht', 'misht'],
    ['Никогда', 'Never', 'yerbeq', 'yerbeq'],
    ['Иногда', 'Sometimes', 'yerbemer', 'yerbemer'],
    ['Часто', 'Often', 'hachax', 'hachax'],
    ['Редко', 'Rarely', 'qich', 'qich'],
    ['Рано', 'Early', 'shur', 'shur'],
    ['Поздно', 'Late', 'us', 'us'],
    ['Весна', 'Spring', 'garun', 'garun'],
    ['Лето', 'Summer', 'amran', 'amran'],
    ['Осень', 'Autumn', 'ashun', 'ashun'],
    ['Зима', 'Winter', 'dzyun', 'dzyun'],
    ['Январь', 'January', 'hunvar', 'hunvar'],
    ['Февраль', 'February', 'petvar', 'petvar'],
    ['Март', 'March', 'mart', 'mart'],
    ['Апрель', 'April', 'april', 'april'],
    ['Май', 'May', 'mayis', 'mayis'],
    ['Июнь', 'June', 'hunis', 'hunis'],
    ['Июль', 'July', 'hulis', 'hulis'],
    ['Август', 'August', 'ogostos', 'ogostos'],
    ['Сентябрь', 'September', 'september', 'september'],
    ['Октябрь', 'October', 'oktember', 'oktember'],
    ['Ноябрь', 'November', 'noyember', 'noyember'],
    ['Декабрь', 'December', 'dektember', 'dektember'],
    ['Номер', 'Number', 'hamar', 'hamar'],
    ['Цена', 'Price', 'gin', 'gin'],
    ['Процент', 'Percent', 'tokos', 'tokos'],
    ['Плюс', 'Plus', 'gavel', 'gavel'],
    ['Минус', 'Minus', 'hanel', 'hanel'],
    ['Равно', 'Equals', 'havasar', 'havasar'],
    ['Считать', 'Count', 'hashvel', 'hashvel'],
    ['Чётный', 'Even', 'zuyg', 'zuyg'],
    ['Нечётный', 'Odd', 'kent', 'kent'],
    ['Много', 'Many', 'shat', 'shat'],
    ['Мало', 'Few', 'qich', 'qich'],
    ['Пара', 'Pair', 'zug', 'zug'],
    ['Раз', 'Once', 'angam', 'angam'],
    ['Два раза', 'Twice', 'erku angam', 'erku angam'],
    ['Каждый день', 'Every day', 'amen or', 'amen or'],
    ['Полдень', 'Noon', 'tsgayn', 'tsgayn'],
    ['Полночь', 'Midnight', 'gisheri kes', 'gisheri kes'],
    ['Рассвет', 'Dawn', 'arevot', 'arevot'],
    ['Закат', 'Sunset', 'arevmut', 'arevmut'],
    ['Век', 'Century', 'dar', 'dar'],
    ['Десятилетие', 'Decade', 'tasnamak', 'tasnamak'],
    ['Килограмм', 'Kilogram', 'kilogram', 'kilogram'],
    ['Грамм', 'Gram', 'gram', 'gram'],
    ['Литр', 'Liter', 'litr', 'litr'],
    ['Метр', 'Meter', 'metr', 'metr'],
    ['Километр', 'Kilometer', 'kilometr', 'kilometr'],
    ['Градус', 'Degree', 'astichan', 'astichan'],
    ['Температура', 'Temperature', 'temperatura', 'temperatura'],
    ['Бесплатно', 'Free', 'anvjar', 'anvjar'],
    ['Дорого', 'Expensive', 'tank', 'tank'],
    ['Дёшево', 'Cheap', 'ej', 'ej'],
    ['Примерно', 'Approximately', 'mekin', 'mekin'],
    ['Точно', 'Exactly', 'hushak', 'hushak'],
    ['Больше', 'More', 'avel', 'avel'],
    ['Меньше', 'Less', 'poqr', 'poqr'],
    ['Равный', 'Equal', 'havasar', 'havasar'],
    ['Достаточно', 'Enough', 'bavarar', 'bavarar'],
    ['Несколько', 'Several', 'miqich', 'miqich'],
    ['Первое', 'First (neut.)', 'aradzin', 'aradzin'],
    ['Последний', 'Last', 'verjin', 'verjin'],
    ['Следующий', 'Next', 'hajord', 'hajord'],
    ['Предыдущий', 'Previous', 'naxord', 'naxord'],
    ['Утром', 'In the morning', 'aravotyan', 'aravotyan'],
    ['Вечером', 'In the evening', 'erekoyan', 'erekoyan'],
    ['Ночью', 'At night', 'gisheryan', 'gisheryan'],
    ['Днём', 'During the day', 'ormyan', 'ormyan'],
    ['На этой неделе', 'This week', 'ays shabat', 'ays shabat'],
    ['Прошлый год', 'Last year', 'ancac tari', 'ancac tari'],
    ['Следующий год', 'Next year', 'hajord tari', 'hajord tari'],
    ['Мне ... лет', 'I am ... years old', '... tarekan em', '... tarekan em'],
    ['Один раз', 'One time', 'mi angam', 'mi angam'],
    ['Три раза', 'Three times', 'yerek angam', 'yerek angam'],
    ['Каждый час', 'Every hour', 'amen jam', 'amen jam'],
    ['Ежедневно', 'Daily', 'amen or', 'amen or'],
    ['Еженедельно', 'Weekly', 'amen shabat', 'amen shabat'],
    ['Ежемесячно', 'Monthly', 'amen amis', 'amen amis'],
    ['Ежегодно', 'Yearly', 'amen tari', 'amen tari'],
    ['Навсегда', 'Forever', 'anhajox', 'anhajox'],
    ['Временно', 'Temporarily', 'zhamanakavor', 'zhamanakavor'],
    ['Срок', 'Term / deadline', 'jamket', 'jamket'],
    ['График', 'Schedule', 'granc', 'granc'],
    ['Расписание', 'Timetable', 'granc', 'granc'],
    ['Перерыв', 'Break', 'dnd', 'dnd'],
    ['Выходной', 'Day off', 'argel', 'argel'],
    ['Праздник', 'Holiday', 'ton', 'ton'],
    ['Каникулы', 'Vacation', 'aragh', 'aragh'],
    ['Сумма', 'Sum', 'gum', 'gum'],
    ['Количество', 'Quantity', 'qanak', 'qanak'],
    ['Размер', 'Size', 'chap', 'chap'],
    ['Скидка', 'Discount', 'zexch', 'zexch'],
    ['Счёт', 'Bill', 'hashvark', 'hashvark'],
    ['Дата', 'Date', 'amis', 'amis'],
    ['Миг', 'Moment', 'vayrkyan', 'vayrkyan'],
    ['Вовремя', 'On time', 'zhamanak', 'zhamanak'],
    ['С опозданием', 'Late', 'us', 'us'],
    ['Заранее', 'In advance', 'naxk', 'naxk'],
    ['Недавно', 'Recently', 'verev', 'verev'],
    ['Давно', 'Long ago', 'shat', 'shat'],
    ['Уже', 'Already', 'ardyoq', 'ardyoq'],
    ['Ещё', 'Still / more', 'el', 'el'],
    ['Сейчас', 'Right now', 'hima', 'hima'],
    ['Скоро', 'Soon', 'shur', 'shur'],
    ['Потом', 'Later', 'heto', 'heto'],
    ['До', 'Until', 'minchev', 'minchev'],
    ['После', 'After', 'heto', 'heto'],
    ['Между', 'Between', 'mij', 'mij'],
    ['Около', 'About', 'mot', 'mot'],
    ['С ... до ...', 'From ... to ...', 'ic minchev', 'ic minchev'],
    ['С начала', 'From the start', 'skizbic', 'skizbic'],
    ['До конца', 'Until the end', 'ver minchev', 'ver minchev'],
    ['Два миллиона', 'Two million', 'erku milion', 'erku milion'],
    ['Миллиард', 'Billion', 'miliar', 'miliar'],
    ['Дюжина', 'Dozen', 'tas-erku', 'tas-erku'],
    ['Сотня', 'Hundred (group)', 'haryur', 'haryur'],
    ['Двойной', 'Double', 'erkrord', 'erkrord'],
    ['Тройной', 'Triple', 'yerrord', 'yerrord'],
    ['Одинокий', 'Single', 'miayn', 'miayn'],
    ['Слишком много', 'Too much', 'shat shat', 'shat shat'],
    ['Слишком мало', 'Too little', 'shat qich', 'shat qich'],
    ['Половина цены', 'Half price', 'gini kes', 'gini kes'],
    ['Рабочий день', 'Workday', 'ashkhatanqayin or', 'ashkhatanqayin or'],
    ['Ночная смена', 'Night shift', 'gisheri pox', 'gisheri pox'],
    ['Дневная смена', 'Day shift', 'ori pox', 'ori pox'],
    ['Обеденный перерыв', 'Lunch break', 'jashin dnd', 'jashin dnd'],
    ['Час пик', 'Rush hour', 'peak jam', 'peak jam'],
    ['Будильник', 'Alarm clock', 'zhamanak', 'zhamanak'],
    ['Часы (наручные)', 'Watch', 'zhamanak', 'zhamanak'],
    ['Календарь', 'Calendar', 'amis', 'amis'],
    ['Столетие', 'Century', 'dar', 'dar'],
    ['Эпоха', 'Era', 'dar', 'dar'],
    ['Период', 'Period', 'zhamanak', 'zhamanak'],
    ['Интервал', 'Interval', 'mijak', 'mijak'],
    ['Длина', 'Length', 'erkarutyun', 'erkarutyun'],
    ['Ширина', 'Width', 'lajnutyun', 'lajnutyun'],
    ['Высота', 'Height', 'barzrutyun', 'barzrutyun'],
    ['Вес', 'Weight', 'qash', 'qash'],
    ['Сантиметр', 'Centimeter', 'santimetr', 'santimetr'],
    ['Умножить', 'Multiply', 'bazmapatk', 'bazmapatk'],
    ['Разделить', 'Divide', 'bajnak', 'bajnak'],
    ['Сложить', 'Add', 'gum', 'gum'],
    ['Вычесть', 'Subtract', 'hanel', 'hanel'],
  ]);
  entries.push(...timeWords);
  return entries;
}

/** @param {VocabTuple[]} pool @param {number} target */
function takeUnique(pool, target) {
  /** @type {VocabTuple[]} */
  const result = [];
  const seen = new Set();
  for (const entry of pool) {
    if (result.length >= target) break;
    const key = `${entry[0]}|${entry[1]}|${entry[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }
  if (result.length < target) {
    throw new Error(`Not enough unique vocabulary: need ${target}, got ${result.length}`);
  }
  return result.slice(0, target);
}

/** @param {VocabTuple} tuple @param {string} folderId @param {number} index */
function toWord(tuple, folderId, index) {
  const [ru, en, te, tl, tags, exampleRu, exampleEn, exampleTe] = tuple;
  /** @type {Record<string, unknown>} */
  const word = {
    id: `${folderId}-${String(index + 1).padStart(4, '0')}`,
    folderId,
    ru,
    en,
    transcription_eastern: te,
    transcription_lori: tl,
  };
  if (tags?.length) word.tags = tags;
  if (exampleRu) word.example_ru = exampleRu;
  if (exampleEn) word.example_en = exampleEn;
  if (exampleTe) word.example_transcription_eastern = exampleTe;
  return word;
}

function buildAlphabet() {
  const letterData = [
    ['Ա', 'այբ', 'a'], ['Բ', 'բեն', 'b'], ['Գ', 'գիմ', 'g'], ['Դ', 'դա', 'd'],
    ['Ե', 'եչ', 'ye'], ['Զ', 'զա', 'z'], ['Է', 'ը', 'e'], ['Ը', 'ըթ', 'ə'],
    ['Թ', 'թօ', 't\''], ['Ժ', 'ժե', 'zh'], ['Ի', 'ինի', 'i'], ['Լ', 'լյուն', 'l'],
    ['Խ', 'խե', 'kh'], ['Ծ', 'ցա', 'ts'], ['Կ', 'կեն', 'k'], ['Հ', 'հո', 'h'],
    ['Ձ', 'ձա', 'dz'], ['Ղ', 'ղա', 'gh'], ['Ճ', 'չե', 'tch'], ['Մ', 'մեն', 'm'],
    ['Յ', 'յի', 'y'], ['Ն', 'նո', 'n'], ['Շ', 'շա', 'sh'], ['Ո', 'վо', 'vo'],
    ['Չ', 'չա', 'ch\''], ['Պ', 'պե', 'p'], ['Ջ', 'ջե', 'j'], ['Ռ', 'րա', 'rr'],
    ['Ս', 'սե', 's'], ['Վ', 'վև', 'v'], ['Տ', 'տյուն', 't'], ['Ր', 'րե', 'r'],
    ['Ց', 'ցո', 'ts\''], ['Ւ', 'հիւն', 'w'], ['Փ', 'փիւր', 'p\''], ['Ք', 'քե', 'k\''],
    ['Օ', 'օ', 'o'], ['Ֆ', 'ֆի', 'f'],
  ];

  const letters = letterData.map(([letter, name, transcription], i) => ({
    id: `letter-${String(i + 1).padStart(2, '0')}`,
    letter,
    name,
    transcription,
    order: i + 1,
  }));

  const syllableData = [
    ['բա', 'ba'], ['գա', 'ga'], ['դա', 'da'], ['մա', 'ma'], ['նա', 'na'],
    ['րա', 'ra'], ['սա', 'sa'], ['վա', 'va'], ['տա', 'ta'], ['կա', 'ka'],
    ['լա', 'la'], ['հա', 'ha'], ['պա', 'pa'], ['ծա', 'tsa'], ['չա', 'cha'],
    ['շա', 'sha'], ['ժա', 'zha'], ['խա', 'kha'], ['ձա', 'dza'], ['ջա', 'ja'],
    ['ղա', 'gha'], ['փա', 'pa'], ['քա', 'ka'], ['օա', 'oa'], ['ֆա', 'fa'],
    ['բե', 'be'], ['գե', 'ge'], ['դե', 'de'], ['մե', 'me'], ['նե', 'ne'],
  ];

  const syllables = syllableData.map(([syllable, transcription], i) => ({
    id: `syllable-${String(i + 1).padStart(2, '0')}`,
    syllable,
    transcription,
    order: i + 1,
  }));

  return { letters, syllables };
}

async function main() {
  await mkdir(WORDS_DIR, { recursive: true });

  /** @type {Record<string, number>} */
  const counts = {};
  let total = 0;

  for (const [folderId, target] of Object.entries(FOLDER_TARGETS)) {
    let pool;
    if (folderId === 'numbers') {
      pool = generateNumbersEntries();
    } else {
      pool = [...(SEEDS[folderId] ?? []), ...(EXTENSIONS[folderId] ?? [])];
    }
    const tuples = takeUnique(pool, target);
    const words = tuples.map((t, i) => toWord(t, folderId, i));
    const outPath = join(WORDS_DIR, `${folderId}.json`);
    await writeFile(outPath, `${JSON.stringify(words, null, 2)}\n`, 'utf8');
    counts[folderId] = words.length;
    total += words.length;
  }

  const alphabet = buildAlphabet();
  await writeFile(ALPHABET_PATH, `${JSON.stringify(alphabet, null, 2)}\n`, 'utf8');

  console.log('Generated vocabulary:');
  for (const [folderId, count] of Object.entries(counts)) {
    console.log(`  ${folderId}: ${count}`);
  }
  console.log(`  alphabet: ${alphabet.letters.length} letters, ${alphabet.syllables.length} syllables`);
  console.log(`Total words: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
