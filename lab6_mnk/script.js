// Лабораторная работа 6. Проверка формы регистрации брака

const form = document.getElementById('marriage-form');
const result = document.getElementById('result');

// Сегодняшняя дата без времени
const today = new Date();
today.setHours(0, 0, 0, 0);


/* ---------- Вспомогательные функции ---------- */

// Дата -> строка "ГГГГ-ММ-ДД" (формат input type="date")
function toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

// Строка "ГГГГ-ММ-ДД" -> "ДД.ММ.ГГГГ"
function formatDate(value) {
    const parts = value.split('-');
    return parts[2] + '.' + parts[1] + '.' + parts[0];
}

// Сдвиг даты на нужное число лет и месяцев
function shiftDate(years, months) {
    const date = new Date(today);
    date.setFullYear(date.getFullYear() + years);
    date.setMonth(date.getMonth() + months);
    return date;
}

// Полных лет на сегодня
function getAge(birthValue) {
    const birth = new Date(birthValue + 'T00:00:00');
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Показать ошибку под полем
function showError(input, message) {
    input.classList.add('invalid');

    const container = input.closest('.field') || input.closest('.agree');
    let error = container.querySelector('.error');
    if (!error) {
        error = document.createElement('span');
        error.className = 'error';
        container.appendChild(error);
    }
    error.textContent = message;
}

// Убрать ошибку у поля
function clearError(input) {
    input.classList.remove('invalid');

    const container = input.closest('.field') || input.closest('.agree');
    const error = container.querySelector('.error');
    if (error) {
        error.remove();
    }
}

function clearAllErrors() {
    form.querySelectorAll('.invalid').forEach(clearError);
    const message = form.querySelector('.form-message');
    if (message) {
        message.remove();
    }
}


/* ---------- Ограничения для календарей ---------- */

const minAgeDate = toInputDate(shiftDate(-18, 0));   // не младше 18 лет
const minWedDate = toInputDate(shiftDate(0, 1));     // не раньше чем через месяц
const maxWedDate = toInputDate(shiftDate(1, 0));     // не позже чем через год

document.getElementById('groom-birth').max = minAgeDate;
document.getElementById('bride-birth').max = minAgeDate;
document.getElementById('wed-date').min = minWedDate;
document.getElementById('wed-date').max = maxWedDate;


/* ---------- Правила проверки ---------- */

// Только буквы (русские или латинские), допускается дефис: "Петров-Водкин"
const nameRegex = /^[А-ЯЁа-яёA-Za-z]+(-[А-ЯЁа-яёA-Za-z]+)?$/;
const passportRegex = /^\d{4} \d{6}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function checkName(value, required, what) {
    if (value === '') {
        return required ? 'Введите ' + what : '';
    }
    if (!nameRegex.test(value)) {
        return 'Только буквы и дефис, без пробелов и цифр';
    }
    if (value.length < 2 || value.length > 30) {
        return 'Длина должна быть от 2 до 30 символов';
    }
    return '';
}

function checkBirth(value) {
    if (value === '') {
        return 'Укажите дату рождения';
    }
    const birth = new Date(value + 'T00:00:00');
    if (isNaN(birth)) {
        return 'Некорректная дата';
    }
    if (birth > today) {
        return 'Дата рождения не может быть в будущем';
    }
    const age = getAge(value);
    if (age < 18) {
        return 'Брак можно зарегистрировать только с 18 лет';
    }
    if (age > 120) {
        return 'Проверьте год рождения';
    }
    return '';
}

function checkPassport(value) {
    if (value === '') {
        return 'Введите серию и номер паспорта';
    }
    if (!passportRegex.test(value)) {
        return 'Формат: 4 цифры, пробел, 6 цифр (0000 000000)';
    }
    return '';
}

function checkWedDate(value) {
    if (value === '') {
        return 'Выберите дату регистрации';
    }
    if (value < minWedDate) {
        return 'Не раньше ' + formatDate(minWedDate) + ' (заявление подаётся за месяц)';
    }
    if (value > maxWedDate) {
        return 'Не позже ' + formatDate(maxWedDate);
    }
    return '';
}

function checkGuests(value) {
    if (value === '') {
        return '';   // поле необязательное
    }
    const n = Number(value);
    if (!Number.isInteger(n)) {
        return 'Введите целое число';
    }
    if (n < 0 || n > 50) {
        return 'Количество гостей: от 0 до 50';
    }
    return '';
}

function checkPhone(value) {
    if (value === '') {
        return 'Введите номер телефона';
    }
    if (!/^[\d\s()+-]+$/.test(value)) {
        return 'Допустимы только цифры, пробелы, скобки, + и -';
    }
    // убираем всё, кроме цифр: +7 (900) 123-45-67 -> 79001234567
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11 || (digits[0] !== '7' && digits[0] !== '8')) {
        return 'Номер должен начинаться с +7 или 8 и содержать 11 цифр';
    }
    return '';
}

function checkEmail(value) {
    if (value === '') {
        return 'Введите email';
    }
    if (!emailRegex.test(value)) {
        return 'Некорректный email, пример: name@mail.ru';
    }
    return '';
}

function checkComment(value) {
    if (value.length > 500) {
        return 'Не более 500 символов (сейчас ' + value.length + ')';
    }
    return '';
}

// id поля -> функция проверки
const rules = {
    'groom-surname':    v => checkName(v, true, 'фамилию жениха'),
    'groom-name':       v => checkName(v, true, 'имя жениха'),
    'groom-patronymic': v => checkName(v, false),
    'groom-birth':      checkBirth,
    'groom-passport':   checkPassport,

    'bride-surname':    v => checkName(v, true, 'фамилию невесты'),
    'bride-name':       v => checkName(v, true, 'имя невесты'),
    'bride-patronymic': v => checkName(v, false),
    'bride-birth':      checkBirth,
    'bride-passport':   checkPassport,

    'office':           v => v === '' ? 'Выберите отдел ЗАГС' : '',
    'wed-date':         checkWedDate,
    'guests':           checkGuests,

    'phone':            checkPhone,
    'email':            checkEmail,
    'comment':          checkComment
};

// Проверка одного поля. Возвращает true, если ошибок нет
function validateField(id) {
    const input = document.getElementById(id);
    const message = rules[id](input.value.trim());

    if (message) {
        showError(input, message);
        return false;
    }
    clearError(input);
    return true;
}


/* ---------- Отправка формы ---------- */

form.addEventListener('submit', function (event) {
    event.preventDefault();   // страницу не перезагружаем
    clearAllErrors();

    let isValid = true;

    for (const id in rules) {
        if (!validateField(id)) {
            isValid = false;
        }
    }

    // Паспорта жениха и невесты не должны совпадать
    const groomPassport = document.getElementById('groom-passport');
    const bridePassport = document.getElementById('bride-passport');
    if (groomPassport.value.trim() !== '' &&
        groomPassport.value.trim() === bridePassport.value.trim()) {
        showError(bridePassport, 'Паспорт невесты совпадает с паспортом жениха');
        isValid = false;
    }

    // Согласие на обработку данных
    const agree = document.getElementById('agree');
    if (!agree.checked) {
        showError(agree, 'Необходимо дать согласие на обработку данных');
        isValid = false;
    } else {
        clearError(agree);
    }

    if (!isValid) {
        const message = document.createElement('div');
        message.className = 'form-message';
        message.textContent = 'Форма заполнена с ошибками. Исправьте выделенные поля.';
        form.querySelector('.buttons').before(message);

        // переходим к первому полю с ошибкой
        form.querySelector('.invalid').focus();
        return;
    }

    showResult();
    form.reset();
    clearAllErrors();
});

// Кнопка "Сбросить" также убирает сообщения об ошибках
form.addEventListener('reset', function () {
    clearAllErrors();
});

// Пока пользователь исправляет поле — убираем ошибку, если значение стало верным
for (const id in rules) {
    const input = document.getElementById(id);
    const eventName = input.tagName === 'SELECT' || input.type === 'date' ? 'change' : 'input';
    input.addEventListener(eventName, function () {
        if (input.classList.contains('invalid')) {
            validateField(id);
        }
    });
}

document.getElementById('agree').addEventListener('change', function () {
    if (this.checked) {
        clearError(this);
    }
});


/* ---------- Вывод данных ---------- */

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function getRadio(name) {
    return form.querySelector('input[name="' + name + '"]:checked').value;
}

function fullName(prefix) {
    return [getValue(prefix + '-surname'), getValue(prefix + '-name'), getValue(prefix + '-patronymic')]
        .filter(part => part !== '')
        .join(' ');
}

// Таблица "название — значение". textContent защищает от вставки HTML-кода
function makeSection(title, rows) {
    const section = document.createDocumentFragment();

    const h3 = document.createElement('h3');
    h3.textContent = title;
    section.appendChild(h3);

    const table = document.createElement('table');
    rows.forEach(function (row) {
        const tr = table.insertRow();
        tr.insertCell().textContent = row[0];
        tr.insertCell().textContent = row[1];
    });
    section.appendChild(table);

    return section;
}

function showResult() {
    result.innerHTML = '';

    const h2 = document.createElement('h2');
    h2.textContent = 'Заявление принято';
    result.appendChild(h2);

    result.appendChild(makeSection('Жених', [
        ['ФИО', fullName('groom')],
        ['Дата рождения', formatDate(getValue('groom-birth')) + ' (возраст: ' + getAge(getValue('groom-birth')) + ')'],
        ['Паспорт', getValue('groom-passport')]
    ]));

    result.appendChild(makeSection('Невеста', [
        ['ФИО', fullName('bride')],
        ['Дата рождения', formatDate(getValue('bride-birth')) + ' (возраст: ' + getAge(getValue('bride-birth')) + ')'],
        ['Паспорт', getValue('bride-passport')],
        ['Фамилия после брака', getRadio('surname')]
    ]));

    result.appendChild(makeSection('Регистрация', [
        ['Отдел ЗАГС', getValue('office')],
        ['Дата регистрации', formatDate(getValue('wed-date'))],
        ['Количество гостей', getValue('guests') || 'не указано'],
        ['Церемония', getRadio('ceremony')]
    ]));

    result.appendChild(makeSection('Контакты', [
        ['Телефон', getValue('phone')],
        ['Email', getValue('email')],
        ['Комментарий', getValue('comment') || 'нет']
    ]));

    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth' });
}
