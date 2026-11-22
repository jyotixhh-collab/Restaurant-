<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>रेस्टोरेंट ऑर्डरिंग डेमो</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; background: #f4f4f4; }
  nav { background: #222; padding: 10px; display: flex; gap: 8px; }
  nav button { flex: 1; padding: 12px; border: 0; border-radius: 6px; background: #555; color: #fff; font-size: 16px; }
  nav button.active { background: #e67e22; }
  .page { display: none; padding: 16px; }
  .page.show { display: block; }
  .card { background: #fff; border-radius: 8px; padding: 12px; margin: 10px 0; box-shadow: 0 1px 3px #0003; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  button.main { background: #27ae60; color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; font-size: 16px; }
  button.small { background: #e67e22; color: #fff; border: 0; padding: 6px 12px; border-radius: 6px; }
  select { padding: 10px; font-size: 16px; width: 100%; }
  .ready { background: #d5f5e3; }
</style>
</head>
<body>

<nav>
  <button id="b-cust" class="active" onclick="show('cust')">ग्राहक</button>
  <button id="b-kit" onclick="show('kit')">किचन</button>
  <button id="b-wait" onclick="show('wait')">वेटर</button>
  <button id="b-bill" onclick="show('bill')">बिलिंग</button>
</nav>

<!-- ग्राहक पेज -->
<div id="cust" class="page show">
  <h2>अपना टेबल चुनें</h2>
  <select id="tableSel"></select>
  <h2>मेन्यू</h2>
  <div id="menu"></div>
  <div class="card">
    <h3>आपकी टोकरी</h3>
    <div id="cart">कुछ नहीं चुना</div>
    <h3>कुल बिल: ₹<span id="total">0</span></h3>
    <button class="main" onclick="placeOrder()">ऑर्डर प्लेस करें</button>
  </div>
</div>

<!-- किचन पेज -->
<div id="kit" class="page">
  <h2>किचन ऑर्डर</h2>
  <button class="small" onclick="enableSound()">आवाज़ चालू करें</button>
  <div id="kitList"></div>
</div>

<!-- वेटर पेज -->
<div id="wait" class="page">
  <h2>वेटर - खाना तैयार है</h2>
  <div id="waitList"></div>
</div>

<!-- बिलिंग पेज -->
<div id="bill" class="page">
  <h2>बिलिंग काउंटर</h2>
  <div id="billList"></div>
</div>

<script>
// ---------- डेमो मेन्यू ----------
const MENU = [
  { id: 1, name: "पनीर बटर मसाला", price: 220 },
  { id: 2, name: "दाल तड़का", price: 150 },
  { id: 3, name: "बटर नान", price: 40 },
  { id: 4, name: "वेज बिरयानी", price: 180 },
  { id: 5, name: "मसाला डोसा", price: 120 },
  { id: 6, name: "लस्सी", price: 60 }
];
const TABLES = 10;

// ---------- डेटा (ब्राउज़र की मेमोरी में) ----------
let cart = {};
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let soundOn = false;

function save() { localStorage.setItem('orders', JSON.stringify(orders)); }

// ---------- पेज बदलना ----------
function show(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('show'));
  document.getElementById(name).classList.add('show');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('b-' + name).classList.add('active');
  render();
}

// ---------- ग्राहक ----------
const sel = document.getElementById('tableSel');
for (let i = 1; i <= TABLES; i++) sel.innerHTML += `<option value="${i}">टेबल नंबर ${i}</option>`;

function renderMenu() {
  document.getElementById('menu').innerHTML = MENU.map(m => `
    <div class="card row">
      <div>${m.name}<br>₹${m.price}</div>
      <div>
        <button class="small" onclick="chg(${m.id}, -1)">-</button>
        <b> ${cart[m.id] || 0} </b>
        <button class="small" onclick="chg(${m.id}, 1)">+</button>
      </div>
    </div>`).join('');
  let total = 0, lines = [];
  MENU.forEach(m => { if (cart[m.id]) { total += cart[m.id] * m.price; lines.push(`${m.name} x ${cart[m.id]}`); } });
  document.getElementById('cart').innerHTML = lines.length ? lines.join('<br>') : 'कुछ नहीं चुना';
  document.getElementById('total').textContent = total;
}

function chg(id, d) {
  cart[id] = Math.max(0, (cart[id] || 0) + d);
  renderMenu();
}

function placeOrder() {
  const items = MENU.filter(m => cart[m.id]).map(m => ({ name: m.name, qty: cart[m.id], price: m.price }));
  if (!items.length) { alert('पहले कुछ चुनिए'); return; }
  const table = Number(sel.value);
  if (!confirm(`आप टेबल नंबर ${table} से ऑर्डर कर रहे हैं। ठीक है?`)) return;
  orders.push({ id: Date.now(), table, items, status: 'new', paid: false });
  save();
  cart = {};
  renderMenu();
  const bill = billForTable(table);
  alert(`ऑर्डर चला गया! अब तक का कुल बिल: ₹${bill}`);
}

// एक टेबल का कुल बिल (सारे ऑर्डर जोड़कर)
function billForTable(t) {
  let sum = 0;
  orders.filter(o => o.table === t && !o.paid).forEach(o => o.items.forEach(i => sum += i.qty * i.price));
  return sum;
}

// ---------- आवाज़ ----------
function enableSound() { soundOn = true; speak('आवाज़ चालू हो गई'); }
function speak(text) {
  if (!soundOn) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hi-IN';
  speechSynthesis.speak(u);
}

// ---------- किचन ----------
function renderKitchen() {
  const list = orders.filter(o => o.status === 'new');
  document.getElementById('kitList').innerHTML = list.length ? list.map(o => `
    <div class="card">
      <h3>टेबल नंबर ${o.table}</h3>
      ${o.items.map(i => `${i.name} x ${i.qty}`).join('<br>')}
      <br><br><button class="main" onclick="markReady(${o.id})">रेडी</button>
    </div>`).join('') : '<p>कोई नया ऑर्डर नहीं</p>';
}

function markReady(id) {
  const o = orders.find(x => x.id === id);
  o.status = 'ready';
  save();
  render();
}


function renderWaiter() {
  const list = orders.filter(o => o.status === 'ready');
  document.getElementById('waitList').innerHTML = list.length ? list.map(o => `
    <div class="card ready">
      <h3>टेबल नंबर ${o.table} का खाना तैयार है</h3>
      ${o.items.map(i => `${i.name} x ${i.qty}`).join('<br>')}
      <br><br><button class="main" onclick="served(${o.id})">परोस दिया</button>
    </div>`).join('') : '<p>अभी कुछ तैयार नहीं</p>';
}

function served(id) {
  const o = orders.find(x => x.id === id);
  o.status = 'served';
  save();
  render();
}

// ---------- बिलिंग ----------
function renderBilling() {
  // बिल तब दिखेगा जब किचन ने कम से कम एक ऑर्डर रेडी कर दिया हो
  const tables = [...new Set(orders.filter(o => !o.paid && o.status !== 'new').map(o => o.table))];
  document.getElementById('billList').innerHTML = tables.length ? tables.map(t => `
    <div class="card row">
      <div><b>टेबल नंबर ${t}</b><br>कुल बिल: ₹${billForTable(t)}</div>
      <button class="main" onclick="pay(${t})">पेमेंट हो गया</button>
    </div>`).join('') : '<p>अभी कोई बिल नहीं</p>';
}

function pay(t) {
  orders.filter(o => o.table === t).forEach(o => o.paid = true);
  save();
  render();
}

// ---------- सब दोबारा बनाना ----------
let lastNewCount = orders.filter(o => o.status === 'new').length;
function render() {
  renderMenu(); renderKitchen(); renderWaiter(); renderBilling();
  const newOrders = orders.filter(o => o.status === 'new');
  if (newOrders.length > lastNewCount) {
    speak(`टेबल नंबर ${newOrders[newOrders.length - 1].table} से ऑर्डर आया है`);
  }
  lastNewCount = newOrders.length;
}

// दूसरी टैब में बदलाव हो तो अपने आप अपडेट
window.addEventListener('storage', () => {
  orders = JSON.parse(localStorage.getItem('orders') || '[]');
  render();
});

render();
</script>
</body>
</html>
