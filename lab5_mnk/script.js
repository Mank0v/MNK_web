// Лабораторная работа 5, вариант 7

// ---------- Задание 1 ----------
// Последовательность 100101102...199 (числа от 100 до 199 подряд, 300 цифр).
// Вернуть k-ю цифру (k от 1 до 300).
function kthDigit(k) {
    if (!Number.isInteger(k) || k < 1 || k > 300) {
        return null;
    }
    const index = k - 1;
    const number = 100 + Math.floor(index / 3); // каждое число даёт 3 цифры
    const position = index % 3;                 // какая цифра внутри числа
    return Number(String(number)[position]);
}

// ---------- Задание 2, часть А ----------
// Сумма элементов от первого элемента, у которого cos > 0, до конца массива.
// Без методов объекта Array.
function sumFromFirstPositiveCos(arr) {
    let start = -1;
    for (let i = 0; i < arr.length; i++) {
        if (Math.cos(arr[i]) > 0) {
            start = i;
            break;
        }
    }
    if (start === -1) {
        return null; // подходящего элемента нет
    }
    let sum = 0;
    for (let i = start; i < arr.length; i++) {
        sum += arr[i];
    }
    return { index: start, sum: sum };
}

// ---------- Задание 2, часть Б ----------
// Цифры числа образуют возрастающую арифметическую прогрессию:
// цифр не меньше двух, разность соседних цифр одинакова и больше нуля.
// Например: 12, 135, 2468, 369.
function isIncreasingProgression(n) {
    const digits = String(n).split('').map(Number);
    if (digits.length < 2) {
        return false;
    }
    const d = digits[1] - digits[0];
    if (d <= 0) {
        return false;
    }
    return digits.every((digit, i) => i === 0 || digit - digits[i - 1] === d);
}

// Удалить элементы, у которых модуль целой части — такое число.
// Используются методы объекта Array.
function removeProgressions(arr) {
    return arr.filter(x => !isIncreasingProgression(Math.abs(Math.trunc(x))));
}

// ---------- Задание 4 ----------
// Проверить, что первая буква каждого слова равна последней букве предыдущего.
// Регистр не учитывается. Возвращает индекс первого слова, где цепочка рвётся,
// или -1, если условие выполнено.
function checkWordChain(words) {
    for (let i = 1; i < words.length; i++) {
        const prev = words[i - 1].toLowerCase();
        const curr = words[i].toLowerCase();
        if (prev[prev.length - 1] !== curr[0]) {
            return i;
        }
    }
    return -1;
}

// ---------- Вспомогательное ----------
function parseNumbers(text) {
    return text
        .split(/[\s,;]+/)
        .filter(s => s !== '')
        .map(s => Number(s.replace(',', '.')));
}

function parseWords(text) {
    return text.split(/[\s,;]+/).filter(s => s !== '');
}

// ---------- Работа со страницей ----------
if (typeof document !== 'undefined') {
    const show = (id, html, ok = true) => {
        const el = document.getElementById(id);
        el.innerHTML = html;
        el.className = 'result ' + (ok ? 'ok' : 'bad');
    };

    document.getElementById('btn1').addEventListener('click', () => {
        const k = Number(document.getElementById('k').value);
        const digit = kthDigit(k);
        if (digit === null) {
            show('res1', 'Введите целое число k от 1 до 300', false);
            return;
        }
        const number = 100 + Math.floor((k - 1) / 3);
        const msg = `${k}-я цифра последовательности: <b>${digit}</b> (из числа ${number})`;
        console.log(msg.replace(/<[^>]+>/g, ''));
        show('res1', msg);
    });

    document.getElementById('btn2a').addEventListener('click', () => {
        const arr = parseNumbers(document.getElementById('arr').value);
        if (arr.length === 0 || arr.some(Number.isNaN)) {
            show('res2a', 'Введите числа через пробел или запятую', false);
            return;
        }
        const r = sumFromFirstPositiveCos(arr);
        if (r === null) {
            show('res2a', 'В массиве нет элемента с положительным косинусом', false);
            return;
        }
        const msg = `Первый элемент с cos &gt; 0: ${arr[r.index]} (индекс ${r.index}), ` +
                    `cos = ${Math.cos(arr[r.index]).toFixed(4)}<br>` +
                    `Сумма от него до конца: <b>${+r.sum.toFixed(10)}</b>`;
        console.log('Задание 2А:', r);
        show('res2a', msg);
    });

    document.getElementById('btn2b').addEventListener('click', () => {
        const arr = parseNumbers(document.getElementById('arr').value);
        if (arr.length === 0 || arr.some(Number.isNaN)) {
            show('res2b', 'Введите числа через пробел или запятую', false);
            return;
        }
        const result = removeProgressions(arr);
        const removed = arr.filter(x => !result.includes(x));
        const msg = `Удалены: ${removed.length ? removed.join(', ') : 'ничего'}<br>` +
                    `Результат: <b>[${result.join(', ')}]</b>`;
        console.log('Задание 2Б:', result);
        show('res2b', msg);
    });

    document.getElementById('btn4').addEventListener('click', () => {
        const words = parseWords(document.getElementById('words').value);
        if (words.length < 2) {
            show('res4', 'Введите хотя бы два слова', false);
            return;
        }
        const bad = checkWordChain(words);
        if (bad === -1) {
            show('res4', '<b>Условие выполняется</b>: ' + words.join(' → '));
        } else {
            const prev = words[bad - 1];
            show('res4', `<b>Условие не выполняется</b>: «${prev}» заканчивается на «${prev[prev.length - 1]}», ` +
                         `а «${words[bad]}» начинается на «${words[bad][0]}»`, false);
        }
        console.log('Задание 4:', bad === -1 ? 'выполняется' : 'не выполняется');
    });
}

if (typeof module !== 'undefined') {
    module.exports = { kthDigit, sumFromFirstPositiveCos, isIncreasingProgression, removeProgressions, checkWordChain };
}
