/* GigPi full SPA — script.js
   - stores gigs/shops/deliveries in localStorage
   - uses Leaflet for map + geolocation
   - supports multi-step forms, map-based location picking, payments (mock), rating
*/

/* ---------- Utilities ---------- */
const uid = (prefix='id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, fallback=[]) => {
  try { return JSON.parse(localStorage.getItem(k)) || fallback } catch(e){ return fallback }
};
const now = () => Date.now();
const notify = (msg, type='info') => {
  const box = document.getElementById('notification');
  box.innerText = msg;
  box.style.background = (type==='error') ? '#ef4444' : (type==='success' ? '#16a34a' : '#111827');
  box.style.color = '#fff';
  box.style.display = 'block';
  setTimeout(()=> box.style.display = 'none', 3000);
};

/* ---------- Data ---------- */
let gigs = load('gigs', []);
let shops = load('shops', []);
let deliveries = load('deliveries', []);

const saveAll = () => { save('gigs', gigs); save('shops', shops); save('deliveries', deliveries); };

/* ---------- Map ---------- */
const map = L.map('map', { zoomControl: true }).setView([20,0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const gigLayer = L.layerGroup().addTo(map);
const shopLayer = L.layerGroup().addTo(map);
let mapSelectCallback = null;
let tempSelectMarker = null;
let userLocation = null;

function centerToUser() {
  if (!navigator.geolocation) { notify('Geolocation not available', 'error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude, lng = pos.coords.longitude;
    userLocation = {lat,lng};
    map.setView([lat,lng], 13);
    L.circle([lat,lng], { radius: 60, color:'#ffcc00', fillColor:'#fffbeb', fillOpacity:0.6 }).addTo(map);
    notify('Centered to your location');
  }, err => notify('Could not get location: ' + err.message, 'error'));
}

document.getElementById('btnLocate').addEventListener('click', centerToUser);

/* map click handler for selecting location in forms */
map.on('click', (e) => {
  if (typeof mapSelectCallback === 'function') {
    if (tempSelectMarker) { map.removeLayer(tempSelectMarker); tempSelectMarker = null; }
    tempSelectMarker = L.marker(e.latlng).addTo(map);
    mapSelectCallback(e.latlng);
    mapSelectCallback = null;
    notify('Location selected on map');
  }
});

/* ---------- Render functions ---------- */
function clearLayers() {
  gigLayer.clearLayers();
  shopLayer.clearLayers();
}

function renderMarkers(filterTerm='') {
  clearLayers();
  const q = (filterTerm||'').toLowerCase();

  // gigs
  gigs.forEach(g=>{
    if (q && !((g.title||'').toLowerCase().includes(q) || (g.locationText||'').toLowerCase().includes(q))) return;
    if (!g.coords && !userLocation) return; // cannot place marker
    const latlng = g.coords ? [g.coords.lat, g.coords.lng] : [userLocation.lat, userLocation.lng];
    const m = L.marker(latlng).addTo(gigLayer);
    const paidBadge = g.paid ? `<div style="color:var(--success);font-weight:700">PAID</div>` : '';
    const popup = `
      <div style="min-width:160px">
        <strong>${escapeHtml(g.title)}</strong><br/>
        ${g.price || 0} Pi<br/>
        <small>${escapeHtml(g.locationText || '')}</small><br/>
        ${paidBadge}
        <div style="margin-top:6px">
          <button onclick="payGig('${g.id}')" style="padding:6px;border-radius:6px;border:0;background:#ffd814;cursor:pointer">Pay</button>
        </div>
      </div>`;
    m.bindPopup(popup);
  });

  // shops
  shops.forEach(s=>{
    if (q && !((s.name||'').toLowerCase().includes(q) || (s.category||'').toLowerCase().includes(q) || (s.services||'').toLowerCase().includes(q))) return;
    if (!s.coords && !userLocation) return;
    const latlng = s.coords ? [s.coords.lat, s.coords.lng] : [userLocation.lat, userLocation.lng];
    const m = L.marker(latlng, {icon: defaultIcon('#febd69')}).addTo(shopLayer);
    const popup = `
      <div style="min-width:160px">
        <strong>${escapeHtml(s.name)}</strong><br/>
        <small>${escapeHtml(s.category)} — ${escapeHtml(s.services || '')}</small><br/>
        <div style="margin-top:6px">
          <button onclick="hireShop('${s.id}')" style="padding:6px;border-radius:6px;border:0;background:#ffd814;cursor:pointer">Hire</button>
        </div>
      </div>`;
    m.bindPopup(popup);
  });
}

/* helper icon */
function defaultIcon(color='#2b6cb0'){
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="34" viewBox="0 0 24 24"><path fill="${color}" d="M12 2C8 2 5 5 5 9c0 6 7 13 7 13s7-7 7-13c0-4-3-7-7-7z"/></svg>`,
    className: '',
    iconSize: [28,34],
    iconAnchor: [14,34]
  });
}

/* escape html for popup */
function escapeHtml(text=''){
  return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* render list of gigs */
function renderGigsList(filterTerm='') {
  const el = document.getElementById('gig-list');
  const q = (filterTerm||'').toLowerCase();
  const filtered = gigs.filter(g=>{
    if (!q) return true;
    return (g.title||'').toLowerCase().includes(q) || (g.locationText||'').toLowerCase().includes(q);
  });

  let html = `<h3>Available Gigs <small class="small">(${filtered.length})</small></h3>`;
  if (!filtered.length) html += `<p class="small">No gigs found.</p>`;
  filtered.forEach(g=>{
    html += `
      <div class="card-item">
        <div>
          <div style="font-weight:700">${escapeHtml(g.title)}</div>
          <div class="small">${escapeHtml(g.locationText || '')}</div>
          <div class="small">Posted: ${new Date(g.timestamp).toLocaleString()}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800">${g.price || 0} Pi</div>
          <div style="margin-top:8px">
            <button onclick="payGig('${g.id}')" class="btn small-btn">${g.paid ? 'Paid' : 'Pay'}</button>
          </div>
          ${g.rating ? `<div class="small">Rated: ${g.rating} ★</div>` : ''}
        </div>
      </div>`;
  });
  el.innerHTML = html;
}

/* render shop profile (latest shop) */
function renderShopProfile(filterTerm='') {
  const el = document.getElementById('shop-profile');
  const q = (filterTerm||'').toLowerCase();
  const filtered = shops.filter(s=>{
    if (!q) return true;
    return (s.name||'').toLowerCase().includes(q) || (s.category||'').toLowerCase().includes(q) || (s.services||'').toLowerCase().includes(q);
  });
  const latest = filtered.slice().sort((a,b)=>b.timestamp - a.timestamp)[0];
  if (!latest) {
    el.innerHTML = `<h3>Shop Profile</h3><p class="small">No shops registered yet.</p>`;
    return;
  }
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>${escapeHtml(latest.name)}</h3>
      <div class="badge">${escapeHtml(latest.category)}</div>
    </div>
    <p class="small">${escapeHtml(latest.services)}</p>
    <p class="small">${escapeHtml(latest.locationText || '')}</p>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn" onclick="hireShop('${latest.id}')">Hire</button>
      <button class="btn btn-secondary" onclick="viewShopOnMap('${latest.id}')">View on Map</button>
    </div>
  `;
}

/* render deliveries */
function renderDeliveries() {
  const el = document.getElementById('deliveries');
  let html = `<h3>Active Deliveries</h3>`;
  if (!deliveries.length) html += `<p class="small">No active delivery blocks.</p>`;
  deliveries.forEach(d=>{
    const end = new Date(d.endTime);
    html += `<div class="card-item"><div>
      <div style="font-weight:700">${d.block} — ${d.price} Pi</div>
      <div class="small">Started: ${new Date(d.startTime).toLocaleString()}</div>
      <div class="small">Ends: ${end.toLocaleString()}</div>
      </div>
      <div style="text-align:right">
        <div class="small">Status: ${d.status}</div>
        <div style="margin-top:8px">
          <button class="btn btn-secondary" onclick="cancelDelivery('${d.id}')">Cancel</button>
        </div>
      </div></div>`;
  });
  el.innerHTML = html;
}

/* initial render */
function refreshAll() {
  saveAll();
  renderMarkers(document.getElementById('search').value);
  renderGigsList(document.getElementById('search').value);
  renderShopProfile(document.getElementById('search').value);
  renderDeliveries();
}
refreshAll();

/* ---------- Search ---------- */
document.getElementById('search').addEventListener('input', (e)=>{
  const q = e.target.value;
  renderMarkers(q);
  renderGigsList(q);
  renderShopProfile(q);
});

/* ---------- Demo data loader ---------- */
document.getElementById('btnLoadDemo').addEventListener('click', ()=>{
  if (confirm('Load demo gigs & shops? This will append sample data.')) {
    const sampleGigs = [
      { id: uid('g'), title:'Deliver groceries', price:5, locationText:'City Center', timestamp:now(), coords: null, paid:false },
      { id: uid('g'), title:'Pick up laundry', price:3, locationText:'North Market', timestamp:now(), coords: null, paid:false },
      { id: uid('g'), title:'Assemble furniture', price:15, locationText:'West Ave', timestamp:now(), coords: null, paid:false }
    ];
    const sampleShops = [
      { id:uid('s'), name:'Bob Auto', category:'auto', services:'Repair, Oil change', locationText:'Main Road', timestamp:now(), coords: null },
      { id:uid('s'), name:"Fresh Mart", category:'supermarket', services:'Grocery, Vegs', locationText:'Corner Street', timestamp:now(), coords: null }
    ];
    gigs = gigs.concat(sampleGigs);
    shops = shops.concat(sampleShops);
    saveAll();
    refreshAll();
    notify('Demo data added');
  }
});

/* ---------- Gig form logic ---------- */
const modalGig = document.getElementById('modalGig');
const gigStep1 = document.getElementById('gigStep1');
const gigStep2 = document.getElementById('gigStep2');
const gigStepLabel = document.getElementById('gigStepLabel');
let gigDraft = {};

document.getElementById('btnPostGig').addEventListener('click', ()=> openGigModal());
document.getElementById('cancelGig1').addEventListener('click', ()=> closeGigModal());
document.getElementById('nextGig').addEventListener('click', ()=> {
  const title = document.getElementById('gigTitle').value.trim();
  if (!title) { notify('Please add a title', 'error'); return; }
  gigDraft.title = title;
  gigStep1.style.display='none';
  gigStep2.style.display='block';
  gigStepLabel.innerText = 'Step 2/2';
});
document.getElementById('prevGig').addEventListener('click', ()=> {
  gigStep2.style.display='none';
  gigStep1.style.display='block';
  gigStepLabel.innerText = 'Step 1/2';
});
document.getElementById('submitGig').addEventListener('click', ()=> {
  const priceVal = parseFloat(document.getElementById('gigPrice').value || 0);
  if (isNaN(priceVal) || priceVal < 0) { notify('Enter valid price', 'error'); return; }
  gigDraft.price = priceVal;
  gigDraft.locationText = document.getElementById('gigLocationText').value.trim();
  gigDraft.timestamp = now();
  gigDraft.id = uid('g');
  gigDraft.paid = false;
  // coords if chosen earlier (mapSelect) were set on gigDraft.coords
  gigs.unshift(gigDraft);
  gigDraft = {};
  // reset modal fields
  document.getElementById('gigTitle').value='';
  document.getElementById('gigPrice').value='';
  document.getElementById('gigLocationText').value='';
  closeGigModal();
  refreshAll();
  notify('Gig posted!');
});

document.getElementById('useMyLocGig').addEventListener('click', ()=>{
  if (!navigator.geolocation) return notify('No geolocation found', 'error');
  navigator.geolocation.getCurrentPosition(pos=>{
    gigDraft.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    document.getElementById('gigLocationText').value = document.getElementById('gigLocationText').value || 'Near my location';
    notify('Location added to gig');
  }, err => notify('Could not get location', 'error'));
});

document.getElementById('pickOnMapGig').addEventListener('click', ()=>{
  notify('Click on the map to pick gig location');
  mapSelectCallback = (latlng) => {
    gigDraft.coords = { lat: latlng.lat, lng: latlng.lng };
    document.getElementById('gigLocationText').value = document.getElementById('gigLocationText').value || `(${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;
  };
});

/* show/hide gig modal */
function openGigModal() {
  modalGig.setAttribute('aria-hidden','false'); modalGig.style.display='flex';
  gigStep1.style.display='block'; gigStep2.style.display='none'; gigStepLabel.innerText='Step 1/2';
}
function closeGigModal(){
  modalGig.setAttribute('aria-hidden','true'); modalGig.style.display='none';
  if (tempSelectMarker) { map.removeLayer(tempSelectMarker); tempSelectMarker=null; }
  mapSelectCallback = null;
  gigDraft = {};
}

/* ---------- Shop modal logic (2-step) ---------- */
const modalShop = document.getElementById('modalShop');
let shopDraft = {};
document.getElementById('btnRegisterShop').addEventListener('click', ()=> openShopModal());
document.getElementById('cancelShop1').addEventListener('click', ()=> closeShopModal());
document.getElementById('nextShop').addEventListener('click', ()=> {
  const name = document.getElementById('shopName').value.trim();
  if (!name) { notify('Add shop name', 'error'); return; }
  shopDraft.name = name;
  document.getElementById('shopStep1').style.display='none';
  document.getElementById('shopStep2').style.display='block';
  document.getElementById('shopStepLabel').innerText='Step 2/2';
});
document.getElementById('prevShop').addEventListener('click', ()=> {
  document.getElementById('shopStep2').style.display='none';
  document.getElementById('shopStep1').style.display='block';
  document.getElementById('shopStepLabel').innerText='Step 1/2';
});
document.getElementById('submitShop').addEventListener('click', ()=> {
  const category = document.getElementById('shopCategory').value;
  const services = document.getElementById('shopServices').value.trim();
  shopDraft.category = category;
  shopDraft.services = services;
  shopDraft.locationText = document.getElementById('shopLocationText').value.trim();
  shopDraft.timestamp = now();
  shopDraft.id = uid('s');
  shops.unshift(shopDraft);
  shopDraft = {};
  // clear fields
  document.getElementById('shopName').value='';
  document.getElementById('shopServices').value='';
  document.getElementById('shopLocationText').value='';
  closeShopModal();
  refreshAll();
  notify('Shop registered!');
});

document.getElementById('useMyLocShop').addEventListener('click', ()=>{
  if (!navigator.geolocation) return notify('No geolocation found', 'error');
  navigator.geolocation.getCurrentPosition(pos=>{
    shopDraft.coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    document.getElementById('shopLocationText').value = document.getElementById('shopLocationText').value || 'Near my location';
    notify('Location added to shop');
  }, err => notify('Could not get location', 'error'));
});

document.getElementById('pickOnMapShop').addEventListener('click', ()=>{
  notify('Click on the map to pick shop location');
  mapSelectCallback = (latlng) => {
    shopDraft.coords = { lat: latlng.lat, lng: latlng.lng };
    document.getElementById('shopLocationText').value = document.getElementById('shopLocationText').value || `(${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`;
  };
});

function openShopModal(){ modalShop.setAttribute('aria-hidden','false'); modalShop.style.display='flex'; document.getElementById('shopStep1').style.display='block'; document.getElementById('shopStep2').style.display='none'; }
function closeShopModal(){ modalShop.setAttribute('aria-hidden','true'); modalShop.style.display='none'; mapSelectCallback=null; if (tempSelectMarker) { map.removeLayer(tempSelectMarker); tempSelectMarker=null; } shopDraft={}; }

/* ---------- Delivery modal ---------- */
const modalDelivery = document.getElementById('modalDelivery');
document.getElementById('btnDelivery').addEventListener('click', ()=> { modalDelivery.setAttribute('aria-hidden','false'); modalDelivery.style.display='flex'; });
document.getElementById('cancelDelivery').addEventListener('click', ()=> closeDeliveryModal());
document.getElementById('startDelivery').addEventListener('click', ()=> {
  const block = document.getElementById('deliveryBlock').value;
  const price = block === '3h' ? 10 : 20;
  const start = now();
  const ms = block === '3h' ? 3*3600*1000 : 6*3600*1000;
  const delivery = { id: uid('d'), block, price, startTime: start, endTime: start+ms, status: 'active' };
  deliveries.unshift(delivery);
  closeDeliveryModal();
  refreshAll();
  notify(`Delivery block started — ${block} for ${price} Pi`);
});
function closeDeliveryModal(){ modalDelivery.setAttribute('aria-hidden','true'); modalDelivery.style.display='none'; }

/* cancel delivery */
function cancelDelivery(id) {
  if (!confirm('Cancel this delivery block?')) return;
  deliveries = deliveries.filter(d=>d.id !== id);
  save('deliveries', deliveries);
  refreshAll();
  notify('Delivery cancelled');
}

/* ---------- Payment & rating flows (mock) ---------- */
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
let activePaymentTarget = null; // {type:'gig'|'shop', id}

function showOverlay(text='Processing...') {
  overlay.setAttribute('aria-hidden','false');
  overlay.style.display='flex';
  overlayText.innerText = text;
}
function hideOverlay(){ overlay.setAttribute('aria-hidden','true'); overlay.style.display='none'; }

/* pay gig (global for popup onclick) */
window.payGig = function(id) {
  const gig = gigs.find(g=>g.id===id);
  if (!gig) return notify('Gig not found','error');
  if (gig.paid) {
    if (confirm('This gig is already paid. Rate again?')) {
      showRatingModal('gig', id);
    }
    return;
  }
  if (!confirm(`Confirm payment of ${gig.price} Pi for "${gig.title}"?`)) return;
  // mock payment
  activePaymentTarget = { type:'gig', id };
  showOverlay('Processing Pi payment...');
  setTimeout(()=> {
    hideOverlay();
    // mark paid
    gig.paid = true;
    gig.paidAt = now();
    save('gigs', gigs);
    refreshAll();
    notify('Payment success ✅', 'success');
    showRatingModal('gig', id);
  }, 1800);
};

/* hire shop (global) */
window.hireShop = function(id) {
  const shop = shops.find(s=>s.id===id);
  if (!shop) return notify('Shop not found','error');
  // default price ask (mock)
  const price = prompt('Enter price in Pi to pay this shop (mock):', '15');
  const pVal = parseFloat(price);
  if (isNaN(pVal) || pVal <= 0) return notify('Invalid amount','error');
  if (!confirm(`Pay ${pVal} Pi to hire "${shop.name}"?`)) return;
  activePaymentTarget = { type:'shop', id, amount: pVal };
  showOverlay('Processing Pi payment to shop...');
  setTimeout(()=> {
    hideOverlay();
    // mark as hired (append hire history)
    shop.lastHired = now();
    shop.lastHireAmount = pVal;
    save('shops', shops);
    refreshAll();
    notify('Shop hired — payment done ✅', 'success');
    showRatingModal('shop', id);
  }, 2000);
};

/* view shop on map */
window.viewShopOnMap = function(id) {
  const shop = shops.find(s=>s.id===id);
  if (!shop) return notify('Shop not found', 'error');
  if (shop.coords) map.setView([shop.coords.lat, shop.coords.lng], 14);
  else notify('Shop has no coordinates to center', 'error');
};

/* rating modal */
const modalRating = document.getElementById('modalRating');
let ratingTarget = null; // {type, id}
function showRatingModal(type, id) {
  ratingTarget = { type, id };
  document.getElementById('ratingSelect').value = '5';
  modalRating.setAttribute('aria-hidden','false');
  modalRating.style.display='flex';
}
document.getElementById('cancelRating').addEventListener('click', ()=> closeRating
