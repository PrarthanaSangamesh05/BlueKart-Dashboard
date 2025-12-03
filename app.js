const $ = sel => document.querySelector(sel);
const $all = sel => Array.from(document.querySelectorAll(sel));

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

let state = {
  products: JSON.parse(localStorage.getItem('bk_products')||'[]'),
  orders: JSON.parse(localStorage.getItem('bk_orders')||'[]'),
  customers: JSON.parse(localStorage.getItem('bk_customers')||'[]')
};

function save(){
  localStorage.setItem('bk_products', JSON.stringify(state.products));
  localStorage.setItem('bk_orders', JSON.stringify(state.orders));
  localStorage.setItem('bk_customers', JSON.stringify(state.customers));
}

let salesChart = null;
let ordersChart = null;

$all('.sidebar nav button').forEach(btn =>
  btn.addEventListener('click', ()=>{
    $all('.sidebar nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    showSection(btn.dataset.section);
  })
);

function showSection(id){
  $all('.section').forEach(s=>s.classList.remove('active'));
  const sec = $('#'+id);
  if(sec) sec.classList.add('active');

  const topSearch = $('#topSearchWrap');
  if(id === 'products') topSearch.style.display = '';
  else topSearch.style.display = 'none';

  render();
}

function renderCards(){
  const totalSales = state.orders.reduce((s,o)=>s+Number(o.total||0),0);
  $('#totalSales').textContent = fmt.format(totalSales);
  $('#totalOrders').textContent = state.orders.length;
  $('#totalProducts').textContent = state.products.length;
  $('#totalCustomers').textContent = state.customers.length;
  $('#notifCount').textContent = Math.max(0, state.orders.filter(o=>o.status==='Processing').length);
}

function renderRecentOrders(){
  const tbody = $('#recentOrdersTable tbody'); tbody.innerHTML='';
  state.orders.slice().reverse().slice(0,6).forEach(o=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>#${o.id}</td><td>${o.customer}</td><td>${fmt.format(Number(o.total))}</td><td>${o.status}</td>`;
    tbody.appendChild(tr);
  });
}

function renderProductsTable(){
  const tbody = $('#productsTable tbody'); tbody.innerHTML='';
  state.products.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${fmt.format(Number(p.price))}</td>
      <td>${p.stock}</td>
      <td>
        <button class="btn" data-id="${p.id}" data-action="edit-prod">Edit</button>
        <button class="btn" data-id="${p.id}" data-action="del-prod">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderOrdersTable(){
  const tbody = $('#ordersTable tbody'); tbody.innerHTML='';
  state.orders.forEach(o=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>#${o.id}</td>
      <td>${o.customer}</td>
      <td>${fmt.format(Number(o.total))}</td>
      <td>${o.status}</td>
      <td>${o.date}</td>
      <td>
        <button class="btn" data-id="${o.id}" data-action="edit-order">Edit</button>
        <button class="btn" data-id="${o.id}" data-action="del-order">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderCustomersTable(){
  const tbody = $('#customersTable tbody'); tbody.innerHTML='';
  state.customers.forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.orders}</td>
      <td>${c.status}</td>
      <td>
        <button class="btn" data-id="${c.id}" data-action="edit-cust">Edit</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function drawChartsIfNeeded(){
  const overviewActive = $('#overview').classList.contains('active');
  if(!overviewActive) return;

  try {
    const salesCanvas = document.getElementById('salesChart');
    if(salesCanvas){
      const ctx = salesCanvas.getContext('2d');
      if(salesChart) { try { salesChart.destroy(); } catch(_){} }
      const monthly = [45000, 62000, 53000, 78000, 69000, 85000];
      salesChart = new Chart(ctx, {
        type: 'line',
        data: { labels:['Jun','Jul','Aug','Sep','Oct','Nov'], datasets:[{label:'Sales (₹)', data: monthly, fill:true, tension:0.3}] },
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ ticks:{ callback: val => '₹' + Number(val).toLocaleString('en-IN') } } } }
      });
    }
  } catch(err){
    console.error('Error drawing salesChart', err);
  }

  try {
    const ordersCanvas = document.getElementById('ordersChart');
    if(ordersCanvas){
      const ctx2 = ordersCanvas.getContext('2d');
      if(ordersChart) { try { ordersChart.destroy(); } catch(_){} }
      ordersChart = new Chart(ctx2, {
        type:'bar',
        data: { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{label:'Orders', data:[12,18,14,22,19,25,10]}] },
        options: { responsive:true, plugins:{legend:{display:false}} }
      });
    }
  } catch(err){
    console.error('Error drawing ordersChart', err);
  }
}

const productModal = $('#productModal');
const productForm = $('#productForm');
let editingProductId = null;

$('#addProductBtn').addEventListener('click', ()=> openProductModal());
$('#cancelProduct').addEventListener('click', ()=> closeProductModal());

function openProductModal(id){
  editingProductId = id || null;
  productModal.setAttribute('aria-hidden','false');
  if(editingProductId){
    const p = state.products.find(x=>x.id==editingProductId);
    $('#productModalTitle').textContent = 'Edit Product';
    $('#p_name').value = p.name;
    $('#p_price').value = p.price;
    $('#p_stock').value = p.stock;
  } else {
    $('#productModalTitle').textContent = 'Add Product';
    productForm.reset();
  }
}
function closeProductModal(){ productModal.setAttribute('aria-hidden','true'); }

productForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#p_name').value.trim();
  const price = Number($('#p_price').value);
  const stock = Number($('#p_stock').value);
  if(editingProductId){
    const p = state.products.find(x=>x.id==editingProductId);
    p.name = name; p.price = price; p.stock = stock;
  } else {
    const id = state.products.length ? Math.max(...state.products.map(p=>p.id))+1 : 1;
    state.products.push({id,name,price,stock});
  }
  save(); closeProductModal(); render();
});

const orderModal = $('#orderModal');
const orderForm = $('#orderForm');
let editingOrderId = null;
$('#addOrderBtn').addEventListener('click', ()=> openOrderModal());

$('#cancelOrder').addEventListener('click', ()=> closeOrderModal());

function populateOrderCustomerSelect(){
  const sel = $('#o_customer'); sel.innerHTML = '';
  state.customers.forEach(c => {
    const opt = document.createElement('option'); opt.value = c.name; opt.textContent = `${c.name} (${c.email})`;
    sel.appendChild(opt);
  });
  if(state.customers.length === 0){
    const opt = document.createElement('option'); opt.value='Guest'; opt.textContent='Guest'; sel.appendChild(opt);
  }
}

function openOrderModal(id){
  editingOrderId = id || null;
  populateOrderCustomerSelect();
  orderModal.setAttribute('aria-hidden','false');
  if(editingOrderId){
    const o = state.orders.find(x=>x.id==editingOrderId);
    $('#orderModalTitle').textContent = 'Edit Order';
    $('#o_id').value = o.id;
    $('#o_customer').value = o.customer;
    $('#o_total').value = o.total;
    $('#o_status').value = o.status;
    const d = o.date.includes('-') && o.date.split('-')[0].length===4 ? o.date : convertDateToISO(o.date);
    $('#o_date').value = d;
  } else {
    $('#orderModalTitle').textContent = 'Add Order';
    orderForm.reset();
    $('#o_id').value = state.orders.length ? Math.max(...state.orders.map(o=>o.id))+1 : 3001;
    const todayISO = new Date().toISOString().slice(0,10);
    $('#o_date').value = todayISO;
  }
}
function closeOrderModal(){ orderModal.setAttribute('aria-hidden','true'); }

orderForm.addEventListener('submit', e=>{
  e.preventDefault();
  const id = Number($('#o_id').value);
  const customer = $('#o_customer').value;
  const total = Number($('#o_total').value);
  const status = $('#o_status').value;
  const date = $('#o_date').value;
  if(editingOrderId){
    const o = state.orders.find(x=>x.id==editingOrderId);
    o.customer = customer; o.total = total; o.status = status; o.date = date;
  } else {
    state.orders.push({id, customer, total, status, date});
    const cust = state.customers.find(c=>c.name===customer);
    if(cust) cust.orders = Number(cust.orders||0) + 1;
  }
  save(); closeOrderModal(); render();
});

const customerModal = $('#customerModal');
const customerForm = $('#customerForm');
let editingCustomerId = null;
$('#cancelCustomer').addEventListener('click', ()=> closeCustomerModal());

function openCustomerModal(id){
  editingCustomerId = id;
  customerModal.setAttribute('aria-hidden','false');
  const c = state.customers.find(x=>x.id==editingCustomerId);
  $('#c_id').value = c.id;
  $('#c_name').value = c.name;
  $('#c_email').value = c.email;
  $('#c_orders').value = c.orders;
  $('#c_status').value = c.status || 'Active';
}
function closeCustomerModal(){ customerModal.setAttribute('aria-hidden','true'); }

customerForm.addEventListener('submit', e=>{
  e.preventDefault();
  const id = Number($('#c_id').value);
  const name = $('#c_name').value.trim();
  const email = $('#c_email').value.trim();
  const orders = Number($('#c_orders').value);
  const status = $('#c_status').value;
  const c = state.customers.find(x=>x.id==id);
  c.name = name; c.email = email; c.orders = orders; c.status = status;
  save(); closeCustomerModal(); render();
});

function convertDateToISO(s){
  if(!s) return '';
  const parts = s.split('-');
  if(parts.length===3 && parts[0].length===4) return s;
  if(parts.length===3) {
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  }
  return s;
}

document.addEventListener('click', e=>{
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if(action === 'edit-prod') openProductModal(id);
  if(action === 'del-prod'){
    if(confirm('Delete product?')){
      state.products = state.products.filter(p => p.id !== id);
      save(); render();
    }
  }

  if(action === 'edit-order') openOrderModal(id);
  if(action === 'del-order'){
    if(confirm('Delete order?')){
      const ord = state.orders.find(o=>o.id===id);
      const cust = state.customers.find(c=>c.name===ord.customer);
      if(cust) cust.orders = Math.max(0, cust.orders - 1);
      state.orders = state.orders.filter(o=>o.id!==id);
      save(); render();
    }
  }

  if(action === 'edit-cust') openCustomerModal(id);
});

$('#searchInput').addEventListener('input', e=>{
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#productsTable tbody tr').forEach(tr=>{
    tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

function render(){
  renderCards();
  renderRecentOrders();
  renderProductsTable();
  renderOrdersTable();
  renderCustomersTable();
  drawChartsIfNeeded();
  populateOrderCustomerSelect();
}

function populateOrderCustomerSelect(){
  const sel = $('#o_customer');
  if(!sel) return;
  const current = sel.value;
  sel.innerHTML = '';
  state.customers.forEach(c=>{
    const opt = document.createElement('option'); opt.value = c.name; opt.textContent = `${c.name} (${c.email})`;
    sel.appendChild(opt);
  });
  if(current) sel.value = current;
}

window.addEventListener('DOMContentLoaded', ()=>{
  const active = document.querySelector('.sidebar nav button.active')?.dataset.section || 'overview';
  showSection(active);
});
