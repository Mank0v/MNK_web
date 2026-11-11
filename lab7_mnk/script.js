const screenEl = document.getElementById("screen");
const indicatorEl = document.getElementById("indicator");

const MAX_DIGITS = 12;
const OP_SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const state = {
  current: "0",       // число на экране (строка)
  accumulator: null,  // первый операнд
  operator: null,     // выбранная операция
  waiting: false,     // ждём ввода нового числа
  lastOperator: null, // для повторного нажатия "="
  lastOperand: null,
  error: false,
};

// Форматирование результата: убираем ошибки округления (0.1 + 0.2)
function format(num) {
  if (!isFinite(num)) {
    return null;
  }
  let rounded = parseFloat(num.toPrecision(MAX_DIGITS));
  let str = String(rounded);
  if (str.replace(/[-.]/g, "").length > MAX_DIGITS) {
    str = rounded.toExponential(6).replace(/\.?0+e/, "e");
  }
  return str;
}

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
  return b;
}

function setError() {
  resetAll();
  state.error = true;
  state.current = "Ошибка";
}

function setResult(num) {
  const str = format(num);
  if (str === null) {
    setError();
    return;
  }
  state.current = str;
  state.waiting = true;
}

function resetAll() {
  state.current = "0";
  state.accumulator = null;
  state.operator = null;
  state.waiting = false;
  state.lastOperator = null;
  state.lastOperand = null;
  state.error = false;
}

function currentValue() {
  return parseFloat(state.current);
}

// ---- Ввод ----

function inputDigit(d) {
  if (state.error) resetAll();
  if (state.waiting) {
    state.current = d;
    state.waiting = false;
    return;
  }
  if (state.current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
  if (state.current === "0") state.current = d;
  else if (state.current === "-0") state.current = "-" + d;
  else state.current += d;
}

function inputDot() {
  if (state.error) resetAll();
  if (state.waiting) {
    state.current = "0.";
    state.waiting = false;
    return;
  }
  if (!state.current.includes(".")) state.current += ".";
}

function backspace() {
  if (state.error) {
    resetAll();
    return;
  }
  if (state.waiting) return; // результат не редактируется
  let s = state.current.slice(0, -1);
  if (s === "" || s === "-") s = "0";
  state.current = s;
}

function clearEntry() {
  if (state.error) {
    resetAll();
    return;
  }
  state.current = "0";
  state.waiting = false;
}

// ---- Операции ----

function chooseOperator(op) {
  if (state.error) return;
  const value = currentValue();

  if (state.operator && !state.waiting) {
    const result = compute(state.accumulator, value, state.operator);
    setResult(result);
    if (state.error) return;
    state.accumulator = currentValue();
  } else if (!state.operator || state.accumulator === null) {
    state.accumulator = value;
  }
  // если ждём число — просто меняем операцию
  state.operator = op;
  state.waiting = true;
  state.lastOperator = null;
}

function equals() {
  if (state.error) return;

  if (state.operator) {
    const b = currentValue();
    const result = compute(state.accumulator, b, state.operator);
    state.lastOperator = state.operator;
    state.lastOperand = b;
    state.operator = null;
    state.accumulator = null;
    setResult(result);
  } else if (state.lastOperator) {
    // повторное "=" повторяет последнюю операцию: 2 + 3 = = = → 5, 8, 11
    const result = compute(currentValue(), state.lastOperand, state.lastOperator);
    setResult(result);
  }
}

function negate() {
  if (state.error) return;
  if (state.current === "0") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : "-" + state.current;
}

function inverse() {
  if (state.error) return;
  const v = currentValue();
  if (v === 0) {
    setError();
    return;
  }
  setResult(1 / v);
}

function sqrt() {
  if (state.error) return;
  const v = currentValue();
  if (v < 0) {
    setError();
    return;
  }
  setResult(Math.sqrt(v));
}

// Процент: 200 + 10% → 20 (10% от 200), затем "=" даёт 220.
// 200 × 10% → 0.1, затем "=" даёт 20. Без операции: 50% → 0.5
function percent() {
  if (state.error) return;
  const v = currentValue();
  if (state.operator === "+" || state.operator === "-") {
    setResult(state.accumulator * v / 100);
  } else {
    setResult(v / 100);
  }
}

// ---- Отображение ----

function render() {
  screenEl.textContent = state.current;
  const len = state.current.length;
  screenEl.classList.toggle("small", len > 10 && len <= 14);
  screenEl.classList.toggle("tiny", len > 14);
  indicatorEl.textContent = state.operator ? OP_SYMBOLS[state.operator] : "";
}

const actions = {
  "clear": resetAll,
  "clear-entry": clearEntry,
  "backspace": backspace,
  "dot": inputDot,
  "equals": equals,
  "negate": negate,
  "inverse": inverse,
  "sqrt": sqrt,
  "percent": percent,
};

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.digit !== undefined) inputDigit(btn.dataset.digit);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else if (btn.dataset.action) actions[btn.dataset.action]();

  btn.blur();
  render();
});

// ---- Клавиатура ----

const keyMap = {
  "Enter": '[data-action="equals"]',
  "=": '[data-action="equals"]',
  "Backspace": '[data-action="backspace"]',
  "Escape": '[data-action="clear"]',
  "Delete": '[data-action="clear-entry"]',
  ".": '[data-action="dot"]',
  ",": '[data-action="dot"]',
  "%": '[data-action="percent"]',
  "+": '[data-op="+"]',
  "-": '[data-op="-"]',
  "*": '[data-op="*"]',
  "/": '[data-op="/"]',
};

document.addEventListener("keydown", (e) => {
  let selector = keyMap[e.key];
  if (/^[0-9]$/.test(e.key)) selector = `[data-digit="${e.key}"]`;
  if (!selector) return;

  e.preventDefault();
  const btn = document.querySelector(selector);
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 100);
  btn.click();
});

render();
