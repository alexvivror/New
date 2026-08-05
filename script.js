/* ============ USATools — Tool Logic (100% client-side) ============ */
"use strict";

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

function fmt(n, digits = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function openModal(title, html) {
  modalBody.innerHTML = `<h2>${title}</h2>${html}`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const firstInput = modalBody.querySelector("input, select");
  if (firstInput) firstInput.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  modalBody.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ---------- Tool definitions ---------- */

function bmiTool() {
  openModal("BMI Calculator", `
    <label>Height (cm)</label><input type="number" id="bmi-h" placeholder="e.g. 175" min="50" max="250">
    <label>Weight (kg)</label><input type="number" id="bmi-w" placeholder="e.g. 70" min="20" max="400">
    <button class="btn" onclick="calcBMI()">Calculate BMI</button>
    <div id="bmi-out" class="result" style="display:none"></div>
    <p class="hint">BMI = weight ÷ height²</p>
  `);
}

function calcBMI() {
  const h = parseFloat(document.getElementById("bmi-h").value) / 100;
  const w = parseFloat(document.getElementById("bmi-w").value);
  const out = document.getElementById("bmi-out");
  if (!h || !w) { out.textContent = "Enter height and weight."; out.style.display = "block"; return; }
  const bmi = w / (h * h);
  const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese";
  out.innerHTML = `<span class="big">${fmt(bmi, 1)}</span> ${cat}<small>Healthy range: 18.5 – 24.9</small>`;
  out.style.display = "block";
}

function percentageTool() {
  openModal("Percentage Calculator", `
    <label>What is</label><input type="number" id="pct-x" placeholder="e.g. 15">
    <label>% of</label><input type="number" id="pct-y" placeholder="e.g. 200">
    <button class="btn" onclick="calcPct()">Calculate</button>
    <div id="pct-out" class="result" style="display:none"></div>
    <p class="hint">Also handles: X is what % of Y, % change, % off</p>
  `);
}

function calcPct() {
  const x = parseFloat(document.getElementById("pct-x").value);
  const y = parseFloat(document.getElementById("pct-y").value);
  const out = document.getElementById("pct-out");
  if (isNaN(x) || isNaN(y) || y === 0) { out.textContent = "Enter valid numbers."; out.style.display = "block"; return; }
  out.innerHTML = `<span class="big">${fmt(x)}% of ${fmt(y)} = ${fmt((x / 100) * y)}</span>`;
  out.style.display = "block";
}

function tipTool() {
  openModal("Tip Calculator", `
    <label>Bill amount ($)</label><input type="number" id="tip-b" placeholder="e.g. 85.50" min="0">
    <label>Tip %</label><input type="number" id="tip-p" value="18" min="0" max="100">
    <label>Split between (people)</label><input type="number" id="tip-s" value="1" min="1">
    <button class="btn" onclick="calcTip()">Calculate</button>
    <div id="tip-out" class="result" style="display:none"></div>
  `);
}

function calcTip() {
  const b = parseFloat(document.getElementById("tip-b").value);
  const p = parseFloat(document.getElementById("tip-p").value);
  const s = parseInt(document.getElementById("tip-s").value, 10) || 1;
  const out = document.getElementById("tip-out");
  if (isNaN(b)) { out.textContent = "Enter a bill amount."; out.style.display = "block"; return; }
  const tip = (b * p) / 100;
  out.innerHTML = `Tip: <span class="big">$${fmt(tip)}</span>
    <small>Total: $${fmt(b + tip)} · Per person: $${fmt((b + tip) / s)}</small>`;
  out.style.display = "block";
}

function discountTool() {
  openModal("Discount Calculator", `
    <label>Original price ($)</label><input type="number" id="dis-o" placeholder="e.g. 120" min="0">
    <label>Discount %</label><input type="number" id="dis-p" placeholder="e.g. 20" min="0" max="100">
    <button class="btn" onclick="calcDiscount()">Calculate</button>
    <div id="dis-out" class="result" style="display:none"></div>
  `);
}

function calcDiscount() {
  const o = parseFloat(document.getElementById("dis-o").value);
  const p = parseFloat(document.getElementById("dis-p").value);
  const out = document.getElementById("dis-out");
  if (isNaN(o) || isNaN(p)) { out.textContent = "Enter valid numbers."; out.style.display = "block"; return; }
  const saved = (o * p) / 100;
  out.innerHTML = `You pay: <span class="big">$${fmt(o - saved)}</span><small>You save: $${fmt(saved)}</small>`;
  out.style.display = "block";
}

function ageTool() {
  openModal("Age Calculator", `
    <label>Date of birth</label><input type="date" id="age-d">
    <button class="btn" onclick="calcAge()">Calculate Age</button>
    <div id="age-out" class="result" style="display:none"></div>
  `);
}

function calcAge() {
  const d = new Date(document.getElementById("age-d").value);
  const out = document.getElementById("age-out");
  if (isNaN(d)) { out.textContent = "Pick a date."; out.style.display = "block"; return; }
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  const days = Math.floor((now - d) / 86400000);
  out.innerHTML = `Age: <span class="big">${years} years</span><small>${fmt(days, 0)} days · ${fmt(days * 24, 0)} hours</small>`;
  out.style.display = "block";
}

function mortgageTool() {
  openModal("Mortgage Calculator", `
    <label>Home price ($)</label><input type="number" id="mort-p" placeholder="e.g. 400000" min="0">
    <label>Down payment (%)</label><input type="number" id="mort-d" value="20" min="0" max="100">
    <label>Interest rate (% APR)</label><input type="number" id="mort-r" value="6.5" min="0" step="0.1">
    <label>Loan term (years)</label><input type="number" id="mort-t" value="30" min="1" max="40">
    <button class="btn" onclick="calcMortgage()">Calculate</button>
    <div id="mort-out" class="result" style="display:none"></div>
    <p class="hint">Principal & interest only — excludes taxes & insurance.</p>
  `);
}

function calcMortgage() {
  const p = parseFloat(document.getElementById("mort-p").value);
  const dp = parseFloat(document.getElementById("mort-d").value);
  const r = parseFloat(document.getElementById("mort-r").value);
  const t = parseFloat(document.getElementById("mort-t").value);
  const out = document.getElementById("mort-out");
  if (isNaN(p) || isNaN(r) || isNaN(t)) { out.textContent = "Enter valid numbers."; out.style.display = "block"; return; }
  const principal = p * (1 - (isNaN(dp) ? 0 : dp) / 100);
  const monthly = r / 100 / 12;
  const n = t * 12;
  const payment = monthly === 0 ? principal / n : (principal * monthly) / (1 - Math.pow(1 + monthly, -n));
  out.innerHTML = `Monthly payment: <span class="big">$${fmt(payment)}</span><small>Loan amount: $${fmt(principal)} · Total interest: $${fmt(payment * n - principal)}</small>`;
  out.style.display = "block";
}

function unitTool() {
  openModal("Unit Converter", `
    <label>Value</label><input type="number" id="unit-v" placeholder="e.g. 10" step="any">
    <label>From</label>
    <select id="unit-f">
      <option value="m">Meters</option><option value="km">Kilometers</option>
      <option value="ft">Feet</option><option value="mi">Miles</option>
      <option value="kg">Kilograms</option><option value="lb">Pounds</option>
      <option value="l">Liters</option><option value="gal">Gallons</option>
    </select>
    <label>To</label>
    <select id="unit-t">
      <option value="m">Meters</option><option value="km">Kilometers</option>
      <option value="ft">Feet</option><option value="mi">Miles</option>
      <option value="kg">Kilograms</option><option value="lb">Pounds</option>
      <option value="l">Liters</option><option value="gal">Gallons</option>
    </select>
    <button class="btn" onclick="calcUnit()">Convert</button>
    <div id="unit-out" class="result" style="display:none"></div>
  `);
}

const UNIT_MAP = {
  m: 1, km: 1000, ft: 0.3048, mi: 1609.344,
  kg: 1, lb: 0.45359237, l: 1, gal: 3.785411784,
};

function calcUnit() {
  const v = parseFloat(document.getElementById("unit-v").value);
  const f = document.getElementById("unit-f").value;
  const t = document.getElementById("unit-t").value;
  const out = document.getElementById("unit-out");
  if (isNaN(v)) { out.textContent = "Enter a value."; out.style.display = "block"; return; }
  const result = v * (UNIT_MAP[f] / UNIT_MAP[t]);
  out.innerHTML = `<span class="big">${fmt(result, 4)}</span><small>${f} → ${t}</small>`;
  out.style.display = "block";
}

function tempTool() {
  openModal("Temperature Converter", `
    <label>Temperature</label><input type="number" id="temp-v" placeholder="e.g. 72" step="any">
    <label>From</label>
    <select id="temp-f"><option value="F">°Fahrenheit</option><option value="C">°Celsius</option><option value="K">Kelvin</option></select>
    <label>To</label>
    <select id="temp-t"><option value="C">°Celsius</option><option value="F">°Fahrenheit</option><option value="K">Kelvin</option></select>
    <button class="btn" onclick="calcTemp()">Convert</button>
    <div id="temp-out" class="result" style="display:none"></div>
  `);
}

function toKelvin(v, unit) {
  if (unit === "F") return ((v - 32) * 5) / 9 + 273.15;
  if (unit === "C") return v + 273.15;
  return v;
}
function fromKelvin(k, unit) {
  if (unit === "F") return ((k - 273.15) * 9) / 5 + 32;
  if (unit === "C") return k - 273.15;
  return k;
}

function calcTemp() {
  const v = parseFloat(document.getElementById("temp-v").value);
  const f = document.getElementById("temp-f").value;
  const t = document.getElementById("temp-t").value;
  const out = document.getElementById("temp-out");
  if (isNaN(v)) { out.textContent = "Enter a temperature."; out.style.display = "block"; return; }
  out.innerHTML = `<span class="big">${fmt(fromKelvin(toKelvin(v, f), t), 1)}°${t}</span>`;
  out.style.display = "block";
}

function passwordTool() {
  openModal("Password Generator", `
    <label>Length</label><input type="number" id="pw-l" value="16" min="4" max="64">
    <label><input type="checkbox" id="pw-u" checked> Uppercase (A-Z)</label>
    <label><input type="checkbox" id="pw-n" checked> Numbers (0-9)</label>
    <label><input type="checkbox" id="pw-s" checked> Symbols (!@#)</label>
    <button class="btn" onclick="genPassword()">Generate</button>
    <div id="pw-out" class="result" style="display:none"></div>
  `);
}

function genPassword() {
  const len = parseInt(document.getElementById("pw-l").value, 10) || 16;
  const useU = document.getElementById("pw-u").checked;
  const useN = document.getElementById("pw-n").checked;
  const useS = document.getElementById("pw-s").checked;
  const lower = "abcdefghijklmnopqrstuvwxyz";
  let chars = lower;
  if (useU) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useN) chars += "0123456789";
  if (useS) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (chars.length === 0) chars = lower;
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let pw = "";
  for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
  const out = document.getElementById("pw-out");
  out.innerHTML = `<span class="big" style="font-size:1.1rem;word-break:break-all">${pw}</span><small>${len} characters</small>`;
  out.style.display = "block";
}

function wordsTool() {
  openModal("Word Counter", `
    <label>Your text</label>
    <textarea id="wc-t" rows="6" style="width:100%;padding:10px;background:var(--bg2);color:var(--text);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-family:inherit;resize:vertical" placeholder="Paste or type text here..." oninput="countWords()"></textarea>
    <div id="wc-out" class="result" style="display:none"></div>
  `);
}

function countWords() {
  const t = document.getElementById("wc-t").value;
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const chars = t.length;
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim()).length;
  const out = document.getElementById("wc-out");
  out.innerHTML = `<span class="big">${fmt(words, 0)} words</span><small>${fmt(chars, 0)} characters · ${fmt(sentences, 0)} sentences</small>`;
  out.style.display = "block";
}

function loanTool() {
  openModal("Loan Calculator", `
    <label>Loan amount ($)</label><input type="number" id="loan-a" placeholder="e.g. 25000" min="0">
    <label>Interest rate (% APR)</label><input type="number" id="loan-r" value="8" min="0" step="0.1">
    <label>Term (years)</label><input type="number" id="loan-t" value="5" min="1" max="30">
    <button class="btn" onclick="calcLoan()">Calculate</button>
    <div id="loan-out" class="result" style="display:none"></div>
  `);
}

function calcLoan() {
  const a = parseFloat(document.getElementById("loan-a").value);
  const r = parseFloat(document.getElementById("loan-r").value);
  const t = parseFloat(document.getElementById("loan-t").value);
  const out = document.getElementById("loan-out");
  if (isNaN(a) || isNaN(r) || isNaN(t)) { out.textContent = "Enter valid numbers."; out.style.display = "block"; return; }
  const monthly = r / 100 / 12;
  const n = t * 12;
  const payment = monthly === 0 ? a / n : (a * monthly) / (1 - Math.pow(1 + monthly, -n));
  out.innerHTML = `Monthly payment: <span class="big">$${fmt(payment)}</span><small>Total paid: $${fmt(payment * n)} · Interest: $${fmt(payment * n - a)}</small>`;
  out.style.display = "block";
}

function calorieTool() {
  openModal("Daily Calorie Needs", `
    <label>Age</label><input type="number" id="cal-age" placeholder="e.g. 30" min="10" max="100">
    <label>Weight (kg)</label><input type="number" id="cal-w" placeholder="e.g. 70" min="20" max="400">
    <label>Height (cm)</label><input type="number" id="cal-h" placeholder="e.g. 175" min="100" max="250">
    <label>Activity level</label>
    <select id="cal-act">
      <option value="1.2">Sedentary (little exercise)</option>
      <option value="1.375">Light (1-3 days/week)</option>
      <option value="1.55" selected>Moderate (3-5 days/week)</option>
      <option value="1.725">Active (6-7 days/week)</option>
      <option value="1.9">Very active (athlete)</option>
    </select>
    <button class="btn" onclick="calcCalorie()">Estimate Calories</button>
    <div id="cal-out" class="result" style="display:none"></div>
    <p class="hint">Mifflin-St Jeor formula. Estimate only.</p>
  `);
}

function calcCalorie() {
  const age = parseFloat(document.getElementById("cal-age").value);
  const w = parseFloat(document.getElementById("cal-w").value);
  const h = parseFloat(document.getElementById("cal-h").value);
  const act = parseFloat(document.getElementById("cal-act").value);
  const out = document.getElementById("cal-out");
  if (isNaN(age) || isNaN(w) || isNaN(h)) { out.textContent = "Enter valid numbers."; out.style.display = "block"; return; }
  const bmr = 10 * w + 6.25 * h - 5 * age + 5; // male formula
  out.innerHTML = `Maintenance: <span class="big">${fmt(bmr * act, 0)} kcal/day</span><small>BMR: ${fmt(bmr, 0)} kcal · For weight loss: ~${fmt(bmr * act - 500, 0)} kcal</small>`;
  out.style.display = "block";
}

/* ---------- Wire up grid ---------- */

const toolFns = {
  bmi: bmiTool, percentage: percentageTool, tip: tipTool, discount: discountTool,
  age: ageTool, mortgage: mortgageTool, unit: unitTool, temp: tempTool,
  password: passwordTool, words: wordsTool, loan: loanTool, calorie: calorieTool,
};

document.querySelectorAll(".tool-card").forEach((card) => {
  card.addEventListener("click", () => {
    const fn = toolFns[card.dataset.tool];
    if (fn) fn();
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
