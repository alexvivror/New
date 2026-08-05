/* ============ ToolHub — Tool Logic (from scratch, 100% client-side) ============ */
"use strict";

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

/* ---------- helpers ---------- */
function fmt(n, d = 2) {
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: d });
}

function field(id) {
  return document.getElementById(id);
}

function showResult(id, big, meta = "") {
  const el = field(id);
  el.innerHTML = `<span class="big">${big}</span>${meta ? `<span class="meta">${meta}</span>` : ""}`;
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  modalBody.innerHTML = "";
}

/* ---------- modal controls ---------- */
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------- tool definitions ---------- */
const TOOLS = [
  {
    id: "bmi", icon: "monitor_weight", title: "BMI Calculator", desc: "Body Mass Index",
    html: `
      <div class="field"><label>Height (cm)</label><input type="number" id="bmi-h" placeholder="e.g. 175"></div>
      <div class="field"><label>Weight (kg)</label><input type="number" id="bmi-w" placeholder="e.g. 70"></div>
      <button class="btn" onclick="runBMI()">Calculate</button>
      <div class="result" id="bmi-r" hidden></div>`,
    run() {
      const h = parseFloat(field("bmi-h").value) / 100;
      const w = parseFloat(field("bmi-w").value);
      if (!h || !w) return;
      const bmi = w / (h * h);
      const cat = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : "Obese";
      field("bmi-r").hidden = false;
      showResult("bmi-r", fmt(bmi, 1), `${cat} · healthy range 18.5–24.9`);
    },
  },
  {
    id: "pct", icon: "percent", title: "Percentage Calculator", desc: "X% of Y",
    html: `
      <div class="field"><label>What is</label><input type="number" id="pct-x" placeholder="e.g. 15"></div>
      <div class="field"><label>% of</label><input type="number" id="pct-y" placeholder="e.g. 200"></div>
      <button class="btn" onclick="runPct()">Calculate</button>
      <div class="result" id="pct-r" hidden></div>`,
    run() {
      const x = parseFloat(field("pct-x").value);
      const y = parseFloat(field("pct-y").value);
      if (isNaN(x) || isNaN(y) || y === 0) return;
      field("pct-r").hidden = false;
      showResult("pct-r", fmt((x / 100) * y), `${fmt(x)}% of ${fmt(y)}`);
    },
  },
  {
    id: "tip", icon: "payments", title: "Tip Calculator", desc: "Tips & bill splitting",
    html: `
      <div class="field"><label>Bill amount ($)</label><input type="number" id="tip-b" placeholder="e.g. 85.50"></div>
      <div class="field"><label>Tip %</label><input type="number" id="tip-p" value="18"></div>
      <div class="field"><label>Split between</label><input type="number" id="tip-s" value="1" min="1"></div>
      <button class="btn" onclick="runTip()">Calculate</button>
      <div class="result" id="tip-r" hidden></div>`,
    run() {
      const b = parseFloat(field("tip-b").value);
      const p = parseFloat(field("tip-p").value);
      const s = parseInt(field("tip-s").value, 10) || 1;
      if (isNaN(b)) return;
      const tip = (b * p) / 100;
      field("tip-r").hidden = false;
      showResult("tip-r", `$${fmt(tip)}`, `Total $${fmt(b + tip)} · per person $${fmt((b + tip) / s)}`);
    },
  },
  {
    id: "discount", icon: "sell", title: "Discount Calculator", desc: "Sale price & savings",
    html: `
      <div class="field"><label>Original price ($)</label><input type="number" id="dis-o" placeholder="e.g. 120"></div>
      <div class="field"><label>Discount %</label><input type="number" id="dis-p" placeholder="e.g. 20"></div>
      <button class="btn" onclick="runDiscount()">Calculate</button>
      <div class="result" id="dis-r" hidden></div>`,
    run() {
      const o = parseFloat(field("dis-o").value);
      const p = parseFloat(field("dis-p").value);
      if (isNaN(o) || isNaN(p)) return;
      const saved = (o * p) / 100;
      field("dis-r").hidden = false;
      showResult("dis-r", `$${fmt(o - saved)}`, `You save $${fmt(saved)}`);
    },
  },
  {
    id: "age", icon: "cake", title: "Age Calculator", desc: "Exact age in days",
    html: `
      <div class="field"><label>Date of birth</label><input type="date" id="age-d"></div>
      <button class="btn" onclick="runAge()">Calculate</button>
      <div class="result" id="age-r" hidden></div>`,
    run() {
      const d = new Date(field("age-d").value);
      if (isNaN(d)) return;
      const now = new Date();
      let y = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) y--;
      const days = Math.floor((now - d) / 86400000);
      field("age-r").hidden = false;
      showResult("age-r", `${y} years`, `${fmt(days, 0)} days · ${fmt(days * 24, 0)} hours`);
    },
  },
  {
    id: "mortgage", icon: "home", title: "Mortgage Calculator", desc: "Monthly payment",
    html: `
      <div class="field"><label>Home price ($)</label><input type="number" id="mor-p" placeholder="e.g. 400000"></div>
      <div class="field"><label>Down payment (%)</label><input type="number" id="mor-d" value="20"></div>
      <div class="field"><label>Rate (% APR)</label><input type="number" id="mor-rate" value="6.5" step="0.1"></div>
      <div class="field"><label>Term (years)</label><input type="number" id="mor-t" value="30"></div>
      <button class="btn" onclick="runMortgage()">Calculate</button>
      <div class="result" id="mor-out" hidden></div>
      <p class="hint">Principal & interest only</p>`,
    run() {
      const p = parseFloat(field("mor-p").value);
      const dp = parseFloat(field("mor-d").value);
      const r = parseFloat(field("mor-rate").value);
      const t = parseFloat(field("mor-t").value);
      if (isNaN(p) || isNaN(r) || isNaN(t)) return;
      const principal = p * (1 - (isNaN(dp) ? 0 : dp) / 100);
      const mRate = r / 100 / 12;
      const n = t * 12;
      const pay = mRate === 0 ? principal / n : (principal * mRate) / (1 - Math.pow(1 + mRate, -n));
      field("mor-out").hidden = false;
      showResult("mor-out", `$${fmt(pay)}/mo`, `Loan $${fmt(principal)} · interest $${fmt(pay * n - principal)}`);
    },
  },
  {
    id: "unit", icon: "straighten", title: "Unit Converter", desc: "Length & weight",
    html: `
      <div class="field"><label>Value</label><input type="number" id="uni-v" placeholder="e.g. 10"></div>
      <div class="field"><label>From</label>
        <select id="uni-f">
          <option value="m">Meters</option><option value="km">Kilometers</option>
          <option value="ft">Feet</option><option value="mi">Miles</option>
          <option value="kg">Kilograms</option><option value="lb">Pounds</option>
          <option value="l">Liters</option><option value="gal">Gallons</option>
        </select></div>
      <div class="field"><label>To</label>
        <select id="uni-t">
          <option value="m">Meters</option><option value="km">Kilometers</option>
          <option value="ft">Feet</option><option value="mi">Miles</option>
          <option value="kg">Kilograms</option><option value="lb">Pounds</option>
          <option value="l">Liters</option><option value="gal">Gallons</option>
        </select></div>
      <button class="btn" onclick="runUnit()">Convert</button>
      <div class="result" id="uni-r" hidden></div>`,
    run() {
      const v = parseFloat(field("uni-v").value);
      if (isNaN(v)) return;
      const f = field("uni-f").value, t = field("uni-t").value;
      const map = { m: 1, km: 1000, ft: 0.3048, mi: 1609.344, kg: 1, lb: 0.45359237, l: 1, gal: 3.785411784 };
      field("uni-r").hidden = false;
      showResult("uni-r", fmt(v * (map[f] / map[t]), 4), `${f} → ${t}`);
    },
  },
  {
    id: "temp", icon: "device_thermostat", title: "Temperature Converter", desc: "F, C, Kelvin",
    html: `
      <div class="field"><label>Value</label><input type="number" id="tmp-v" placeholder="e.g. 72"></div>
      <div class="field"><label>From</label>
        <select id="tmp-f"><option value="F">Fahrenheit</option><option value="C">Celsius</option><option value="K">Kelvin</option></select></div>
      <div class="field"><label>To</label>
        <select id="tmp-t"><option value="C">Celsius</option><option value="F">Fahrenheit</option><option value="K">Kelvin</option></select></div>
      <button class="btn" onclick="runTemp()">Convert</button>
      <div class="result" id="tmp-r" hidden></div>`,
    run() {
      const v = parseFloat(field("tmp-v").value);
      if (isNaN(v)) return;
      const f = field("tmp-f").value, t = field("tmp-t").value;
      const toK = f === "F" ? (v - 32) * 5 / 9 + 273.15 : f === "C" ? v + 273.15 : v;
      const out = t === "F" ? (toK - 273.15) * 9 / 5 + 32 : t === "C" ? toK - 273.15 : toK;
      field("tmp-r").hidden = false;
      showResult("tmp-r", `${fmt(out, 1)}°${t}`);
    },
  },
  {
    id: "password", icon: "lock", title: "Password Generator", desc: "Strong random passwords",
    html: `
      <div class="field"><label>Length</label><input type="number" id="pwd-l" value="16" min="4" max="64"></div>
      <div class="field"><label><input type="checkbox" id="pwd-u" checked> Uppercase</label></div>
      <div class="field"><label><input type="checkbox" id="pwd-n" checked> Numbers</label></div>
      <div class="field"><label><input type="checkbox" id="pwd-s" checked> Symbols</label></div>
      <button class="btn" onclick="runPassword()">Generate</button>
      <div class="result" id="pwd-r" hidden></div>`,
    run() {
      const len = parseInt(field("pwd-l").value, 10) || 16;
      let chars = "abcdefghijklmnopqrstuvwxyz";
      if (field("pwd-u").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (field("pwd-n").checked) chars += "0123456789";
      if (field("pwd-s").checked) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const arr = new Uint32Array(len);
      crypto.getRandomValues(arr);
      let pw = "";
      for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
      field("pwd-r").hidden = false;
      showResult("pwd-r", pw, `${len} characters`);
    },
  },
  {
    id: "words", icon: "notes", title: "Word Counter", desc: "Words & characters",
    html: `
      <div class="field"><label>Text</label>
        <textarea id="wrd-t" rows="6" oninput="runWords()" placeholder="Type or paste text..."></textarea></div>
      <div class="result" id="wrd-r" hidden></div>`,
    run() {
      const t = field("wrd-t").value;
      const words = t.trim() ? t.trim().split(/\s+/).length : 0;
      const sents = t.split(/[.!?]+/).filter((s) => s.trim()).length;
      field("wrd-r").hidden = false;
      showResult("wrd-r", `${fmt(words, 0)} words`, `${fmt(t.length, 0)} characters · ${fmt(sents, 0)} sentences`);
    },
  },
  {
    id: "loan", icon: "account_balance", title: "Loan Calculator", desc: "EMI & interest",
    html: `
      <div class="field"><label>Amount ($)</label><input type="number" id="loa-a" placeholder="e.g. 25000"></div>
      <div class="field"><label>Rate (% APR)</label><input type="number" id="loa-rate" value="8" step="0.1"></div>
      <div class="field"><label>Term (years)</label><input type="number" id="loa-t" value="5"></div>
      <button class="btn" onclick="runLoan()">Calculate</button>
      <div class="result" id="loa-out" hidden></div>`,
    run() {
      const a = parseFloat(field("loa-a").value);
      const r = parseFloat(field("loa-rate").value);
      const t = parseFloat(field("loa-t").value);
      if (isNaN(a) || isNaN(r) || isNaN(t)) return;
      const mRate = r / 100 / 12;
      const n = t * 12;
      const pay = mRate === 0 ? a / n : (a * mRate) / (1 - Math.pow(1 + mRate, -n));
      field("loa-out").hidden = false;
      showResult("loa-out", `$${fmt(pay)}/mo`, `Total $${fmt(pay * n)} · interest $${fmt(pay * n - a)}`);
    },
  },
  {
    id: "calorie", icon: "local_fire_department", title: "Calorie Calculator", desc: "Daily needs",
    html: `
      <div class="field"><label>Age</label><input type="number" id="cal-a" placeholder="e.g. 30"></div>
      <div class="field"><label>Weight (kg)</label><input type="number" id="cal-w" placeholder="e.g. 70"></div>
      <div class="field"><label>Height (cm)</label><input type="number" id="cal-h" placeholder="e.g. 175"></div>
      <div class="field"><label>Activity</label>
        <select id="cal-act">
          <option value="1.2">Sedentary</option>
          <option value="1.375">Light (1–3 days)</option>
          <option value="1.55" selected>Moderate (3–5 days)</option>
          <option value="1.725">Active (6–7 days)</option>
          <option value="1.9">Very active</option>
        </select></div>
      <button class="btn" onclick="runCalorie()">Calculate</button>
      <div class="result" id="cal-r" hidden></div>
      <p class="hint">Mifflin-St Jeor estimate</p>`,
    run() {
      const age = parseFloat(field("cal-a").value);
      const w = parseFloat(field("cal-w").value);
      const h = parseFloat(field("cal-h").value);
      const act = parseFloat(field("cal-act").value);
      if (isNaN(age) || isNaN(w) || isNaN(h)) return;
      const bmr = 10 * w + 6.25 * h - 5 * age + 5;
      field("cal-r").hidden = false;
      showResult("cal-r", `${fmt(bmr * act, 0)} kcal/day`, `BMR ${fmt(bmr, 0)} · weight loss ≈ ${fmt(bmr * act - 500, 0)}`);
    },
  },
];

/* ---------- render grid ---------- */
const grid = document.getElementById("tool-grid");
TOOLS.forEach((tool) => {
  const card = document.createElement("button");
  card.className = "tool-card";
  card.innerHTML = `
    <span class="icon material-symbols-outlined">${tool.icon}</span>
    <h3>${tool.title}</h3>
    <p>${tool.desc}</p>`;
  card.addEventListener("click", () => {
    modalBody.innerHTML = `<h2>${tool.title}</h2>${tool.html}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const first = modalBody.querySelector("input, select, textarea");
    if (first) first.focus();
  });
  grid.appendChild(card);
});

/* ---------- expose run functions globally ---------- */
window.runBMI = TOOLS[0].run;
window.runPct = TOOLS[1].run;
window.runTip = TOOLS[2].run;
window.runDiscount = TOOLS[3].run;
window.runAge = TOOLS[4].run;
window.runMortgage = TOOLS[5].run;
window.runUnit = TOOLS[6].run;
window.runTemp = TOOLS[7].run;
window.runPassword = TOOLS[8].run;
window.runWords = TOOLS[9].run;
window.runLoan = TOOLS[10].run;
window.runCalorie = TOOLS[11].run;

document.getElementById("year").textContent = new Date().getFullYear();
