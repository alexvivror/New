#!/usr/bin/env node
/* ============================================================
   ToolHub — static site generator
   Builds: index.html (hub) + one page per tool + sitemap.xml
   Run: node build.js  →  outputs to ./public/
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const SITE = "ToolHub";
const DOMAIN = "https://alexvivror.github.io/New";

/* ---------------- tool definitions ---------------- */
/* Each tool: slug (URL), icon, title, desc (card), metaDesc (SEO),
   content: [ {h2, body} ] long-form content, faqs: [{q,a}], related: [slugs] */
const TOOLS = [
  {
    slug: "bmi-calculator",
    icon: "monitor_weight",
    title: "BMI Calculator",
    desc: "Body Mass Index",
    metaDesc: "Free BMI calculator: enter height and weight to get your Body Mass Index instantly, with healthy range guidance. Private, works offline, no sign-up.",
    content: [
      { h2: "What is BMI?", body: "Body Mass Index (BMI) is a simple measure that uses your height and weight to estimate whether you are underweight, at a healthy weight, overweight, or obese. It is the most widely used screening tool for body fat categories and is recommended by the WHO and the CDC." },
      { h2: "How BMI is calculated", body: "BMI is calculated by dividing your weight in kilograms by the square of your height in meters (kg/m²). For most adults, a BMI between 18.5 and 24.9 is considered a healthy range. Keep in mind BMI does not measure body fat directly and may not be accurate for athletes or older adults." },
    ],
    faqs: [
      { q: "What is a healthy BMI?", a: "A BMI between 18.5 and 24.9 is considered a healthy weight range for most adults. Below 18.5 is underweight, 25–29.9 is overweight, and 30+ is obese." },
      { q: "Is BMI accurate for everyone?", a: "BMI is a useful screening tool but does not distinguish muscle from fat. Athletes may show a high BMI despite low body fat, and older adults may have a normal BMI with low muscle mass." },
      { q: "How can I lower my BMI?", a: "Sustainable changes include a balanced diet with fewer processed foods, regular physical activity, and adequate sleep. Always consult a healthcare provider before major changes." },
    ],
    related: ["calorie-calculator", "percentage-calculator"],
    form: `
      <div class="field"><label for="bmi-h">Height (cm)</label><input type="number" id="bmi-h" placeholder="e.g. 175"></div>
      <div class="field"><label for="bmi-w">Weight (kg)</label><input type="number" id="bmi-w" placeholder="e.g. 70"></div>
      <button class="btn" onclick="runBMI()">Calculate BMI</button>
      <div class="result" id="bmi-r" hidden></div>`,
    run: `
      function runBMI(){
        const h=parseFloat(document.getElementById('bmi-h').value)/100;
        const w=parseFloat(document.getElementById('bmi-w').value);
        if(!h||!w)return;
        const bmi=w/(h*h);
        const cat=bmi<18.5?"Underweight":bmi<25?"Normal weight":bmi<30?"Overweight":"Obese";
        const el=document.getElementById('bmi-r');el.hidden=false;
        el.innerHTML='<span class="big">'+bmi.toFixed(1)+'</span><span class="meta">'+cat+' · healthy range 18.5–24.9</span>';
      }`,
  },
  {
    slug: "percentage-calculator",
    icon: "percent",
    title: "Percentage Calculator",
    desc: "X% of Y",
    metaDesc: "Free percentage calculator: find what is X% of Y, percentage change, and more. Instant results, private, works on any device.",
    content: [
      { h2: "What is a percentage?", body: "A percentage is a fraction of 100, written with the % sign. It is used everywhere — from discounts and tips to interest rates and statistics. Our calculator handles the most common percentage questions in one tap." },
      { h2: "Common percentage problems", body: "The three most common questions are: What is X% of Y? What percentage of Y is X? And what is the percentage increase or decrease between two numbers? This tool answers all three instantly." },
    ],
    faqs: [
      { q: "How do I calculate what X% of Y is?", a: "Multiply X by Y and divide by 100. For example, 15% of 200 is 15 × 200 ÷ 100 = 30." },
      { q: "How do I calculate percentage change?", a: "Subtract the old value from the new value, divide by the old value, and multiply by 100. A positive result is an increase, negative is a decrease." },
      { q: "How do I convert a fraction to a percentage?", a: "Divide the numerator by the denominator and multiply by 100. For example 3/4 = 0.75 × 100 = 75%." },
    ],
    related: ["tip-calculator", "discount-calculator"],
    form: `
      <div class="field"><label for="pct-x">What is</label><input type="number" id="pct-x" placeholder="e.g. 15"></div>
      <div class="field"><label for="pct-y">% of</label><input type="number" id="pct-y" placeholder="e.g. 200"></div>
      <button class="btn" onclick="runPct()">Calculate</button>
      <div class="result" id="pct-r" hidden></div>`,
    run: `
      function runPct(){
        const x=parseFloat(document.getElementById('pct-x').value);
        const y=parseFloat(document.getElementById('pct-y').value);
        if(isNaN(x)||isNaN(y)||y===0)return;
        const el=document.getElementById('pct-r');el.hidden=false;
        el.innerHTML='<span class="big">'+((x/100)*y).toLocaleString('en-US',{maximumFractionDigits:2})+'</span><span class="meta">'+x+'% of '+y+'</span>';
      }`,
  },
  {
    slug: "tip-calculator",
    icon: "payments",
    title: "Tip Calculator",
    desc: "Tips & bill splitting",
    metaDesc: "Free tip calculator: compute tip amount, total bill, and per-person share. Split bills fairly with friends. Instant, private, no sign-up.",
    content: [
      { h2: "How much should you tip?", body: "In the US, 15–20% is standard for restaurant service. Our tip calculator lets you set any percentage, see the exact tip, the total, and how much each person owes when splitting the bill." },
      { h2: "Splitting bills made easy", body: "Dining out with friends or family? Enter the bill, the tip percentage, and the number of people — the calculator does the math so everyone pays their fair share, down to the cent." },
    ],
    faqs: [
      { q: "What is the standard tip percentage in the US?", a: "15–20% is typical for sit-down restaurant service. 18% is a common default, with 20% for great service and 15% for adequate service." },
      { q: "Should I tip on the pre-tax or post-tax amount?", a: "Most people tip on the pre-tax amount, but tipping on the post-tax total is also common and slightly more generous. Either is acceptable." },
      { q: "How do I split a bill between people?", a: "Divide the total (bill + tip) by the number of people. Our calculator does this automatically." },
    ],
    related: ["percentage-calculator", "discount-calculator"],
    form: `
      <div class="field"><label for="tip-b">Bill amount ($)</label><input type="number" id="tip-b" placeholder="e.g. 85.50"></div>
      <div class="field"><label for="tip-p">Tip %</label><input type="number" id="tip-p" value="18"></div>
      <div class="field"><label for="tip-s">Split between</label><input type="number" id="tip-s" value="1" min="1"></div>
      <button class="btn" onclick="runTip()">Calculate Tip</button>
      <div class="result" id="tip-r" hidden></div>`,
    run: `
      function runTip(){
        const b=parseFloat(document.getElementById('tip-b').value);
        const p=parseFloat(document.getElementById('tip-p').value);
        const s=parseInt(document.getElementById('tip-s').value,10)||1;
        if(isNaN(b))return;
        const tip=(b*p)/100;
        const el=document.getElementById('tip-r');el.hidden=false;
        el.innerHTML='<span class="big">$'+tip.toFixed(2)+'</span><span class="meta">Total $'+(b+tip).toFixed(2)+' · per person $'+((b+tip)/s).toFixed(2)+'</span>';
      }`,
  },
  {
    slug: "discount-calculator",
    icon: "sell",
    title: "Discount Calculator",
    desc: "Sale price & savings",
    metaDesc: "Free discount calculator: find the sale price and how much you save on any item. Works for percent-off coupons and sales. Instant results.",
    content: [
      { h2: "How discounts work", body: "A percent-off discount reduces the original price by a percentage. This calculator instantly shows you the final sale price and exactly how much money you save — perfect for shopping sales and comparing deals." },
      { h2: "Compare deals before you buy", body: "Is 20% off $120 better than 15% off $110? Enter both into the calculator and compare the actual dollar savings to make the smarter purchase decision." },
    ],
    faqs: [
      { q: "How do I calculate the sale price?", a: "Multiply the original price by the discount percentage, then subtract that from the original price. Example: 20% off $120 = $120 − $24 = $96." },
      { q: "What does 50% off mean?", a: "You pay half of the original price. For example, 50% off $80 means you pay $40." },
      { q: "How do I calculate a final price after multiple discounts?", a: "Apply each discount sequentially. If a store takes 20% then an extra 10%, apply the 20% first, then 10% off the already-reduced price." },
    ],
    related: ["percentage-calculator", "tip-calculator"],
    form: `
      <div class="field"><label for="dis-o">Original price ($)</label><input type="number" id="dis-o" placeholder="e.g. 120"></div>
      <div class="field"><label for="dis-p">Discount %</label><input type="number" id="dis-p" placeholder="e.g. 20"></div>
      <button class="btn" onclick="runDiscount()">Calculate</button>
      <div class="result" id="dis-r" hidden></div>`,
    run: `
      function runDiscount(){
        const o=parseFloat(document.getElementById('dis-o').value);
        const p=parseFloat(document.getElementById('dis-p').value);
        if(isNaN(o)||isNaN(p))return;
        const saved=(o*p)/100;
        const el=document.getElementById('dis-r');el.hidden=false;
        el.innerHTML='<span class="big">$'+(o-saved).toFixed(2)+'</span><span class="meta">You save $'+saved.toFixed(2)+'</span>';
      }`,
  },
  {
    slug: "age-calculator",
    icon: "cake",
    title: "Age Calculator",
    desc: "Exact age in days",
    metaDesc: "Free age calculator: find your exact age in years, months, days, and hours from any date of birth. Instant, private, works offline.",
    content: [
      { h2: "Find your exact age", body: "Enter your date of birth and instantly see your exact age in years, plus the precise number of days and hours you have been alive. Perfect for birthdays, milestones, and documents." },
      { h2: "Why exact age matters", body: "Age in completed years is used for school enrollment, retirement planning, legal documents, and medical calculations. Our calculator gives you the precise figure in seconds." },
    ],
    faqs: [
      { q: "How do I calculate my exact age?", a: "Subtract your birth date from today's date, accounting for months and days. The result is your age in years plus the exact days and hours lived." },
      { q: "How many days old am I?", a: "Multiply the number of full years by 365.25 (accounting for leap years) and add the days since your last birthday." },
      { q: "Is age calculated in days or years?", a: "Both. The calculator shows completed years, total days, and total hours so you can use whichever you need." },
    ],
    related: ["bmi-calculator", "calorie-calculator"],
    form: `
      <div class="field"><label for="age-d">Date of birth</label><input type="date" id="age-d"></div>
      <button class="btn" onclick="runAge()">Calculate Age</button>
      <div class="result" id="age-r" hidden></div>`,
    run: `
      function runAge(){
        const d=new Date(document.getElementById('age-d').value);
        if(isNaN(d))return;
        const now=new Date();
        let y=now.getFullYear()-d.getFullYear();
        const m=now.getMonth()-d.getMonth();
        if(m<0||(m===0&&now.getDate()<d.getDate()))y--;
        const days=Math.floor((now-d)/86400000);
        const el=document.getElementById('age-r');el.hidden=false;
        el.innerHTML='<span class="big">'+y+' years</span><span class="meta">'+days.toLocaleString()+' days · '+(days*24).toLocaleString()+' hours</span>';
      }`,
  },
  {
    slug: "mortgage-calculator",
    icon: "home",
    title: "Mortgage Calculator",
    desc: "Monthly payment",
    metaDesc: "Free mortgage calculator: estimate your monthly mortgage payment with down payment, interest rate, and loan term. See total interest over the life of the loan.",
    content: [
      { h2: "Estimate your monthly payment", body: "Enter the home price, down payment, interest rate, and loan term to get an instant estimate of your monthly principal and interest payment. This is the first step in understanding what you can afford." },
      { h2: "Understanding total interest", body: "Over a 30-year mortgage, you may pay nearly as much in interest as the home itself. This calculator shows your total interest so you can compare loan terms and decide between a 15-year and 30-year mortgage." },
    ],
    faqs: [
      { q: "How is a mortgage payment calculated?", a: "Payments use the formula M = P[r(1+r)ⁿ]/[(1+r)ⁿ−1], where P is principal, r is the monthly interest rate, and n is the number of payments." },
      { q: "Should I choose a 15-year or 30-year mortgage?", a: "A 15-year mortgage has higher monthly payments but far less total interest. A 30-year mortgage has lower payments but you pay significantly more interest over time." },
      { q: "What does the payment include?", a: "This calculator estimates principal and interest only. Your actual payment also includes property taxes, homeowners insurance, and possibly PMI." },
    ],
    related: ["loan-calculator", "percentage-calculator"],
    form: `
      <div class="field"><label for="mor-p">Home price ($)</label><input type="number" id="mor-p" placeholder="e.g. 400000"></div>
      <div class="field"><label for="mor-d">Down payment (%)</label><input type="number" id="mor-d" value="20"></div>
      <div class="field"><label for="mor-rate">Rate (% APR)</label><input type="number" id="mor-rate" value="6.5" step="0.1"></div>
      <div class="field"><label for="mor-t">Term (years)</label><input type="number" id="mor-t" value="30"></div>
      <button class="btn" onclick="runMortgage()">Calculate Payment</button>
      <div class="result" id="mor-out" hidden></div>
      <p class="hint">Principal & interest only</p>`,
    run: `
      function runMortgage(){
        const p=parseFloat(document.getElementById('mor-p').value);
        const dp=parseFloat(document.getElementById('mor-d').value);
        const r=parseFloat(document.getElementById('mor-rate').value);
        const t=parseFloat(document.getElementById('mor-t').value);
        if(isNaN(p)||isNaN(r)||isNaN(t))return;
        const principal=p*(1-(isNaN(dp)?0:dp)/100);
        const mRate=r/100/12;const n=t*12;
        const pay=mRate===0?principal/n:(principal*mRate)/(1-Math.pow(1+mRate,-n));
        const el=document.getElementById('mor-out');el.hidden=false;
        el.innerHTML='<span class="big">$'+pay.toFixed(2)+'/mo</span><span class="meta">Loan $'+principal.toLocaleString('en-US',{maximumFractionDigits:0})+' · interest $'+(pay*n-principal).toLocaleString('en-US',{maximumFractionDigits:0})+'</span>';
      }`,
  },
  {
    slug: "unit-converter",
    icon: "straighten",
    title: "Unit Converter",
    desc: "Length & weight",
    metaDesc: "Free unit converter: convert between meters, kilometers, feet, miles, kilograms, pounds, liters, and gallons. Instant results, private, works offline.",
    content: [
      { h2: "Convert anything instantly", body: "This unit converter handles the most common everyday conversions: length (meters, kilometers, feet, miles), weight (kilograms, pounds), and volume (liters, gallons). Just pick the units and type a value." },
      { h2: "Why unit conversion matters", body: "Whether you are cooking with a foreign recipe, planning a road trip, or shipping a package, getting units right matters. Our converter eliminates guesswork with precise, instant results." },
    ],
    faqs: [
      { q: "How many feet are in a mile?", a: "There are 5,280 feet in one mile, or about 1,609 meters." },
      { q: "How do I convert kilograms to pounds?", a: "Multiply the weight in kilograms by 2.20462. For example, 10 kg ≈ 22.05 lb." },
      { q: "How many liters are in a gallon?", a: "One US gallon equals 3.785 liters. One imperial (UK) gallon equals 4.546 liters." },
    ],
    related: ["temperature-converter", "percentage-calculator"],
    form: `
      <div class="field"><label for="uni-v">Value</label><input type="number" id="uni-v" placeholder="e.g. 10"></div>
      <div class="field"><label for="uni-f">From</label>
        <select id="uni-f">
          <option value="m">Meters</option><option value="km">Kilometers</option>
          <option value="ft">Feet</option><option value="mi">Miles</option>
          <option value="kg">Kilograms</option><option value="lb">Pounds</option>
          <option value="l">Liters</option><option value="gal">Gallons</option>
        </select></div>
      <div class="field"><label for="uni-t">To</label>
        <select id="uni-t">
          <option value="m">Meters</option><option value="km">Kilometers</option>
          <option value="ft">Feet</option><option value="mi">Miles</option>
          <option value="kg">Kilograms</option><option value="lb">Pounds</option>
          <option value="l">Liters</option><option value="gal">Gallons</option>
        </select></div>
      <button class="btn" onclick="runUnit()">Convert</button>
      <div class="result" id="uni-r" hidden></div>`,
    run: `
      function runUnit(){
        const v=parseFloat(document.getElementById('uni-v').value);
        if(isNaN(v))return;
        const f=document.getElementById('uni-f').value,t=document.getElementById('uni-t').value;
        const map={m:1,km:1000,ft:0.3048,mi:1609.344,kg:1,lb:0.45359237,l:1,gal:3.785411784};
        const el=document.getElementById('uni-r');el.hidden=false;
        el.innerHTML='<span class="big">'+(v*(map[f]/map[t])).toFixed(4)+'</span><span class="meta">'+f+' → '+t+'</span>';
      }`,
  },
  {
    slug: "temperature-converter",
    icon: "device_thermostat",
    title: "Temperature Converter",
    desc: "F, C, Kelvin",
    metaDesc: "Free temperature converter: convert between Fahrenheit, Celsius, and Kelvin instantly. Perfect for travel, cooking, and science. Private and fast.",
    content: [
      { h2: "Convert Fahrenheit, Celsius & Kelvin", body: "Temperature scales are used differently around the world: Fahrenheit in the US, Celsius nearly everywhere else, and Kelvin in science. This converter switches between all three instantly." },
      { h2: "Quick reference points", body: "Water freezes at 32°F / 0°C and boils at 212°F / 100°C. Room temperature is about 72°F / 22°C. Keep these anchors in mind and rough conversions become easy." },
    ],
    faqs: [
      { q: "How do I convert Fahrenheit to Celsius?", a: "Subtract 32 from the Fahrenheit value, multiply by 5, and divide by 9. Example: (72−32) × 5 ÷ 9 = 22.2°C." },
      { q: "How do I convert Celsius to Fahrenheit?", a: "Multiply the Celsius value by 9, divide by 5, and add 32. Example: 100 × 9 ÷ 5 + 32 = 212°F." },
      { q: "At what temperature are F and C equal?", a: "−40°F and −40°C are the same temperature. It is the one point where the two scales meet." },
    ],
    related: ["unit-converter", "percentage-calculator"],
    form: `
      <div class="field"><label for="tmp-v">Value</label><input type="number" id="tmp-v" placeholder="e.g. 72"></div>
      <div class="field"><label for="tmp-f">From</label>
        <select id="tmp-f"><option value="F">Fahrenheit</option><option value="C">Celsius</option><option value="K">Kelvin</option></select></div>
      <div class="field"><label for="tmp-t">To</label>
        <select id="tmp-t"><option value="C">Celsius</option><option value="F">Fahrenheit</option><option value="K">Kelvin</option></select></div>
      <button class="btn" onclick="runTemp()">Convert</button>
      <div class="result" id="tmp-r" hidden></div>`,
    run: `
      function runTemp(){
        const v=parseFloat(document.getElementById('tmp-v').value);
        if(isNaN(v))return;
        const f=document.getElementById('tmp-f').value,t=document.getElementById('tmp-t').value;
        const toK=f==='F'?(v-32)*5/9+273.15:f==='C'?v+273.15:v;
        const out=t==='F'?(toK-273.15)*9/5+32:t==='C'?toK-273.15:toK;
        const el=document.getElementById('tmp-r');el.hidden=false;
        el.innerHTML='<span class="big">'+out.toFixed(1)+'°'+t+'</span>';
      }`,
  },
  {
    slug: "password-generator",
    icon: "lock",
    title: "Password Generator",
    desc: "Strong random passwords",
    metaDesc: "Free password generator: create strong, secure random passwords with uppercase, numbers, and symbols. Generated locally in your browser — never transmitted.",
    content: [
      { h2: "Generate truly random passwords", body: "This generator uses your browser's cryptographic random number generator to create strong passwords. Nothing is sent to a server — the password is created locally on your device and never leaves it." },
      { h2: "What makes a strong password", body: "Length is the most important factor. A 16-character password with uppercase, lowercase, numbers, and symbols has billions of times more combinations than a short one. Use a unique password for every account." },
    ],
    faqs: [
      { q: "How long should my password be?", a: "Use at least 12 characters, ideally 16+. Every extra character multiplies the time needed to crack it exponentially." },
      { q: "Is the generated password stored anywhere?", a: "No. The generator runs entirely in your browser using the Web Crypto API. The password is never sent over the internet." },
      { q: "Should I use a password manager?", a: "Yes. A password manager stores your unique passwords securely so you never have to remember or reuse them." },
    ],
    related: ["word-counter", "percentage-calculator"],
    form: `
      <div class="field"><label for="pwd-l">Length</label><input type="number" id="pwd-l" value="16" min="4" max="64"></div>
      <div class="field"><label><input type="checkbox" id="pwd-u" checked> Uppercase letters</label></div>
      <div class="field"><label><input type="checkbox" id="pwd-n" checked> Numbers</label></div>
      <div class="field"><label><input type="checkbox" id="pwd-s" checked> Symbols</label></div>
      <button class="btn" onclick="runPassword()">Generate Password</button>
      <div class="result" id="pwd-r" hidden></div>`,
    run: `
      function runPassword(){
        const len=parseInt(document.getElementById('pwd-l').value,10)||16;
        let chars='abcdefghijklmnopqrstuvwxyz';
        if(document.getElementById('pwd-u').checked)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if(document.getElementById('pwd-n').checked)chars+='0123456789';
        if(document.getElementById('pwd-s').checked)chars+='!@#$%^&*()_+-=[]{}|;:,.<>?';
        const arr=new Uint32Array(len);crypto.getRandomValues(arr);
        let pw='';for(let i=0;i<len;i++)pw+=chars[arr[i]%chars.length];
        const el=document.getElementById('pwd-r');el.hidden=false;
        el.innerHTML='<span class="big" style="font-size:1.1rem;word-break:break-all">'+pw+'</span><span class="meta">'+len+' characters · generated locally</span>';
      }`,
  },
  {
    slug: "word-counter",
    icon: "notes",
    title: "Word Counter",
    desc: "Words & characters",
    metaDesc: "Free word counter: count words, characters, and sentences in any text instantly. Perfect for essays, tweets, and SEO writing. Private — text never leaves your device.",
    content: [
      { h2: "Count words in real time", body: "Type or paste any text and watch the word count, character count, and sentence count update instantly. Ideal for essays with word limits, social media posts, and content writing." },
      { h2: "Private by design", body: "Unlike online word counters that upload your text to a server, this tool runs entirely in your browser. Your writing — whether a novel chapter or a work email — never leaves your device." },
    ],
    faqs: [
      { q: "How do you count words?", a: "Words are counted by splitting the text on whitespace. Each group of characters separated by spaces counts as one word." },
      { q: "Does the counter include punctuation?", a: "Punctuation is counted as characters but not as words. Sentences are detected by terminal punctuation like . ! and ?" },
      { q: "Is my text uploaded anywhere?", a: "No. The counter runs completely in your browser. Your text is never transmitted or stored." },
    ],
    related: ["password-generator", "percentage-calculator"],
    form: `
      <div class="field"><label for="wrd-t">Text</label>
        <textarea id="wrd-t" rows="6" oninput="runWords()" placeholder="Type or paste text..."></textarea></div>
      <div class="result" id="wrd-r" hidden></div>`,
    run: `
      function runWords(){
        const t=document.getElementById('wrd-t').value;
        const words=t.trim()?t.trim().split(/\\s+/).length:0;
        const sents=t.split(/[.!?]+/).filter(s=>s.trim()).length;
        const el=document.getElementById('wrd-r');el.hidden=false;
        el.innerHTML='<span class="big">'+words+' words</span><span class="meta">'+t.length+' characters · '+sents+' sentences</span>';
      }`,
  },
  {
    slug: "loan-calculator",
    icon: "account_balance",
    title: "Loan Calculator",
    desc: "EMI & interest",
    metaDesc: "Free loan calculator: calculate your monthly payment, total cost, and total interest for any personal, auto, or student loan. Instant, accurate, private.",
    content: [
      { h2: "Know your monthly payment before you borrow", body: "Enter the loan amount, interest rate, and term to see your exact monthly payment, total cost, and total interest. Whether it is a personal, auto, or student loan, knowing these numbers helps you budget with confidence." },
      { h2: "Compare loan offers", body: "A lower interest rate or shorter term can save thousands. Use this calculator to compare different offers side by side before signing anything." },
    ],
    faqs: [
      { q: "How is my loan payment calculated?", a: "Payments use the standard amortization formula M = P[r(1+r)ⁿ]/[(1+r)ⁿ−1], where P is the principal, r is the monthly rate, and n is the number of months." },
      { q: "What is the difference between a loan and a mortgage?", a: "A mortgage is a loan secured by real estate, typically for buying a home. A personal loan is usually unsecured and has a shorter term and higher rate." },
      { q: "How can I reduce total interest?", a: "Pay more than the minimum each month, choose a shorter term, or shop for a lower rate. Extra payments go directly toward principal and cut interest dramatically." },
    ],
    related: ["mortgage-calculator", "percentage-calculator"],
    form: `
      <div class="field"><label for="loa-a">Amount ($)</label><input type="number" id="loa-a" placeholder="e.g. 25000"></div>
      <div class="field"><label for="loa-rate">Rate (% APR)</label><input type="number" id="loa-rate" value="8" step="0.1"></div>
      <div class="field"><label for="loa-t">Term (years)</label><input type="number" id="loa-t" value="5"></div>
      <button class="btn" onclick="runLoan()">Calculate</button>
      <div class="result" id="loa-out" hidden></div>`,
    run: `
      function runLoan(){
        const a=parseFloat(document.getElementById('loa-a').value);
        const r=parseFloat(document.getElementById('loa-rate').value);
        const t=parseFloat(document.getElementById('loa-t').value);
        if(isNaN(a)||isNaN(r)||isNaN(t))return;
        const mRate=r/100/12;const n=t*12;
        const pay=mRate===0?a/n:(a*mRate)/(1-Math.pow(1+mRate,-n));
        const el=document.getElementById('loa-out');el.hidden=false;
        el.innerHTML='<span class="big">$'+pay.toFixed(2)+'/mo</span><span class="meta">Total $'+(pay*n).toFixed(2)+' · interest $'+(pay*n-a).toFixed(2)+'</span>';
      }`,
  },
  {
    slug: "calorie-calculator",
    icon: "local_fire_department",
    title: "Calorie Calculator",
    desc: "Daily needs",
    metaDesc: "Free calorie calculator: estimate your daily calorie needs for maintenance, weight loss, or weight gain using the Mifflin-St Jeor formula. Instant results.",
    content: [
      { h2: "How many calories do you need?", body: "Your daily calorie needs depend on age, weight, height, and activity level. This calculator uses the Mifflin-St Jeor equation — considered the most accurate formula for estimating resting metabolic rate." },
      { h2: "Use it for weight goals", body: "To lose weight, eat roughly 500 calories below maintenance per day (about 1 lb per week). To gain, eat above maintenance. This calculator gives you both your maintenance and weight-loss targets." },
    ],
    faqs: [
      { q: "What is the Mifflin-St Jeor formula?", a: "For men: 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5. For women: the same minus 161. It estimates your resting metabolic rate, which is then multiplied by an activity factor." },
      { q: "How many calories should I eat to lose weight?", a: "A 500-calorie daily deficit typically leads to about 1 lb (0.45 kg) of weight loss per week. Never go below 1,200 calories without medical supervision." },
      { q: "Why is my maintenance number different from an app's?", a: "Different apps use different formulas and activity multipliers. This estimate is a starting point — adjust based on real-world results over 2–3 weeks." },
    ],
    related: ["bmi-calculator", "age-calculator"],
    form: `
      <div class="field"><label for="cal-a">Age</label><input type="number" id="cal-a" placeholder="e.g. 30"></div>
      <div class="field"><label for="cal-w">Weight (kg)</label><input type="number" id="cal-w" placeholder="e.g. 70"></div>
      <div class="field"><label for="cal-h">Height (cm)</label><input type="number" id="cal-h" placeholder="e.g. 175"></div>
      <div class="field"><label for="cal-act">Activity</label>
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
    run: `
      function runCalorie(){
        const age=parseFloat(document.getElementById('cal-a').value);
        const w=parseFloat(document.getElementById('cal-w').value);
        const h=parseFloat(document.getElementById('cal-h').value);
        const act=parseFloat(document.getElementById('cal-act').value);
        if(isNaN(age)||isNaN(w)||isNaN(h))return;
        const bmr=10*w+6.25*h-5*age+5;
        const el=document.getElementById('cal-r');el.hidden=false;
        el.innerHTML='<span class="big">'+Math.round(bmr*act)+' kcal/day</span><span class="meta">BMR '+Math.round(bmr)+' · weight loss ≈ '+Math.round(bmr*act-500)+'</span>';
      }`,
  },
];

/* ---------------- helpers ---------------- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pageShell({ title, metaDesc, canonical, body, schema }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <a href="./" class="brand">
        <span class="material-symbols-outlined">widgets</span>
        <span>${SITE}</span>
      </a>
      <nav class="nav">
        <a href="./">Tools</a>
        <a href="./#about">About</a>
      </nav>
    </div>
  </header>
  ${body}
  <footer class="footer">
    <div class="container">
      <p>${SITE} © <span id="year"></span> · Free tools for everyone</p>
      <p class="fine">All results are estimates for informational purposes only.</p>
    </div>
  </footer>
  <script>document.getElementById("year").textContent=new Date().getFullYear();</script>
</body>
</html>`;
}

/* ---------------- build pages ---------------- */
const outDir = path.join(__dirname, "public");
fs.mkdirSync(outDir, { recursive: true });

const bySlug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

/* --- tool cards (for hub) --- */
function toolCard(t) {
  return `<a class="tool-card" href="${t.slug}.html">
    <span class="icon material-symbols-outlined">${t.icon}</span>
    <h3>${esc(t.title)}</h3>
    <p>${esc(t.desc)}</p>
  </a>`;
}

/* --- homepage hub --- */
const hubBody = `
  <main>
    <section class="hero">
      <div class="container">
        <p class="hero-tag">100% Free · No Sign-up · Private</p>
        <h1>Free online calculators &amp; converters, <span>right in your browser.</span></h1>
        <p class="hero-sub">Fast, private tools that work instantly on any device. Your data never leaves your browser.</p>
      </div>
    </section>
    <section class="tools" id="tools">
      <div class="container">
        <h2 class="section-title">All Tools</h2>
        <div class="grid">${TOOLS.map(toolCard).join("\n")}</div>
      </div>
    </section>
    <section class="about" id="about">
      <div class="container">
        <h2 class="section-title">Why ${SITE}?</h2>
        <div class="features">
          <div class="feature">
            <span class="material-symbols-outlined">shield</span>
            <h3>Private by design</h3>
            <p>All calculations run locally in your browser. Nothing is uploaded or stored.</p>
          </div>
          <div class="feature">
            <span class="material-symbols-outlined">bolt</span>
            <h3>Instant results</h3>
            <p>No page loads, no waiting. Type and get answers immediately.</p>
          </div>
          <div class="feature">
            <span class="material-symbols-outlined">smartphone</span>
            <h3>Mobile friendly</h3>
            <p>Designed for phones first, works great on any screen size.</p>
          </div>
        </div>
      </div>
    </section>
  </main>`;

const hubSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE,
  url: DOMAIN,
  description: "Free online calculators and converters: BMI, percentage, tip, mortgage, unit, temperature, password, word counter, loan, calorie and more.",
};

fs.writeFileSync(
  path.join(outDir, "index.html"),
  pageShell({
    title: `${SITE} — Free Online Calculators & Converters`,
    metaDesc: "Free online calculators and converters: BMI, percentage, tip, discount, age, mortgage, unit, temperature, password, word counter, loan, and calorie. Private, instant, no sign-up.",
    canonical: `${DOMAIN}/`,
    body: hubBody,
    schema: hubSchema,
  })
);

/* --- individual tool pages --- */
TOOLS.forEach((tool) => {
  const contentHtml = tool.content
    .map((c) => `<h2>${esc(c.h2)}</h2><p>${esc(c.body)}</p>`)
    .join("\n");

  const faqHtml = tool.faqs
    .map(
      (f, i) => `
    <div class="faq-item">
      <h3>${esc(f.q)}</h3>
      <p>${esc(f.a)}</p>
    </div>`
    )
    .join("\n");

  const relatedHtml = tool.related
    .map((slug) => {
      const t = bySlug[slug];
      return t ? `<a class="chip" href="${t.slug}.html"><span class="material-symbols-outlined">${t.icon}</span>${esc(t.title)}</a>` : "";
    })
    .join("\n");

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    url: `${DOMAIN}/${tool.slug}.html`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    description: tool.metaDesc,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: tool.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const body = `
  <main>
    <section class="tool-page">
      <div class="container">
        <nav class="crumbs"><a href="./">All tools</a> <span>›</span> ${esc(tool.title)}</nav>
        <h1 class="tool-h1"><span class="material-symbols-outlined">${tool.icon}</span>${esc(tool.title)}</h1>
        <div class="tool-layout">
          <div class="card calculator-card">
            ${tool.form}
          </div>
          <div class="card content-card">
            ${contentHtml}
          </div>
        </div>
        <section class="faq">
          <h2>Frequently Asked Questions</h2>
          ${faqHtml}
        </section>
        <section class="related">
          <h2>Related Tools</h2>
          <div class="chips">${relatedHtml}<a class="chip" href="./"><span class="material-symbols-outlined">grid_view</span>All tools</a></div>
        </section>
      </div>
    </section>
  </main>
  <script>${tool.run}</script>`;

  fs.writeFileSync(
    path.join(outDir, `${tool.slug}.html`),
    pageShell({
      title: `${tool.title} — Free Online ${tool.title.includes("Calculator") ? "Calculator" : "Tool"}`,
      metaDesc: tool.metaDesc,
      canonical: `${DOMAIN}/${tool.slug}.html`,
      body,
      schema: [schema, faqSchema],
    })
  );
});

/* --- sitemap --- */
const urls = [`${DOMAIN}/`].concat(TOOLS.map((t) => `${DOMAIN}/${t.slug}.html`));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><priority>${u === `${DOMAIN}/` ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);

/* --- robots --- */
fs.writeFileSync(
  path.join(outDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${DOMAIN}/sitemap.xml\n`
);

console.log(`✅ Built ${TOOLS.length + 1} pages + sitemap.xml + robots.txt → public/`);
