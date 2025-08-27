// Map Initialization
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
const markers = [
  L.marker([51.5, -0.09]).bindPopup('Bob’s Auto Shop, 15 Pi, auto <span class="verified"><i class="fas fa-check-circle"></i> Verified</span>'),
  L.marker([51.51, -0.08]).bindPopup('Alice’s Supermarket, 3 Pi, supermarket <span class="verified"><i class="fas fa-check-circle"></i> Verified</span>')
];
markers.forEach(marker => marker.addTo(map));

// Load Data from Local Storage
let gigs = JSON.parse(localStorage.getItem('gigs')) || [];
let shops = JSON.parse(localStorage.getItem('shops')) || [];
updateGigList();
updateShopProfile();

// Navigation Functions
function nextStep(type) {
  document.getElementById(`${type}Step1`).style.display = 'none';
  document.getElementById(`${type}Step2`).style.display = 'block';
}
function prevStep(type) {
  document.getElementById(`${type}Step1`).style.display = 'block';
  document.getElementById(`${type}Step2`).style.display = 'none';
}

// Gig Posting
function postGig() {
  const title = document.getElementById('gigTitle').value;
  const price = document.getElementById('gigPrice').value;
  const location = document.getElementById('gigLocation').value;
  if (!title || !price || !location) { alert('Please fill all fields!'); return; }
  const gig = { title, price, location, timestamp: Date.now() };
  gigs.push(gig);
  localStorage.setItem('gigs', JSON.stringify(gigs));
  L.marker([51.5 + Math.random() * 0.01, -0.09 + Math.random() * 0.01])
    .addTo(map).bindPopup(`${title}, ${price} Pi, gig`);
  showNotification('Gig posted successfully!');
  document.getElementById('gigStep2').style.display = 'none';
  document.getElementById('gigStep1').style.display = 'block';
  document.getElementById('gigTitle').value = '';
  document.getElementById('gigPrice').value = '';
  document.getElementById('gigLocation').value = '';
  updateGigList();
}

// Shop Registration
function registerShop() {
  const name = document.getElementById('shopName').value;
  const category = document.getElementById('shopCategory').value;
  const services = document.getElementById('shopServices').value;
  const location = document.getElementById('shopLocation').value;
  if (!name || !category || !services || !location) { alert('Please fill all fields!'); return; }
  const shop = { name, category, services, location, timestamp: Date.now() };
  shops.push(shop);
  localStorage.setItem('shops', JSON.stringify(shops));
  document.getElementById('shopDetails').innerHTML = `Name: ${name}<br>Category: ${category}<br>Services: ${services}<br>Location: ${location}<br><span class="verified"><i class="fas fa-check-circle"></i> Verified</span>`;
  L.marker([51.5 + Math.random() * 0.01, -0.09 + Math.random() * 0.01])
    .addTo(map).bindPopup(`${name}, ${services}, ${category} <span class="verified"><i class="fas fa-check-circle"></i> Verified</span>`);
  showNotification('Shop registered successfully!');
  document.getElementById('shopStep2').style.display = 'none';
  document.getElementById('shopStep1').style.display = 'block';
  document.getElementById('shopName').value = '';
  document.getElementById('shopCategory').value = 'supermarket';
  document.getElementById('shopServices').value = '';
  document.getElementById('shopLocation').value = '';
}

// Delivery Blocks
function selectBlock() {
  const block = document.getElementById('deliveryBlock').value;
  showNotification(`Delivery block selected: ${block}. Start delivering!`);
}

// Gig List Update
function updateGigList() {
  const list = document.getElementById('gigList');
  list.innerHTML = '<h3>Available Gigs</h3>';
  gigs.sort((a, b) => b.timestamp - a.timestamp).forEach((gig, index) => {
    const div = document.createElement('div');
    div.className = 'gig-item';
    div.innerHTML = `${gig.title} - ${gig.price} Pi at ${gig.location} <button onclick="payGig(${index})">Pay</button>`;
    list.appendChild(div);
  });
}

// Shop Profile Update
function updateShopProfile() {
  if (shops.length) {
    const latestShop = shops[shops.length - 1];
    document.getElementById('shopDetails').innerHTML = `Name: ${latestShop.name}<br>Category: ${latestShop.category}<br>Services: ${latestShop.services}<br>Location: ${latestShop.location}<br><span class="verified"><i class="fas fa-check-circle"></i> Verified</span>`;
  }
}

// Payment and Rating
function payGig(index) {
  const gig = gigs[index];
  showNotification(`Escrow started: ${gig.price} Pi for ${gig.title}. Verifying...`);
  setTimeout(() => {
    showNotification(`Verified! ${gig.price} Pi paid for ${gig.title}.`);
    document.getElementById('ratingSection').style.display = 'block';
  }, 2000);
}
function updateStars() {
  const rating = document.getElementById('rating').value;
  document.getElementById('starRating').innerHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);
}
function submitRating() {
  showNotification(`Rating submitted: ${document.getElementById('rating').value}/5. Thanks!`);
  document.getElementById('ratingSection').style.display = 'none';
}

// Location
function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 13);
      L.marker([pos.coords.latitude, pos.coords.longitude]).addTo(map).bindPopup('Your Location').openPopup();
    }, () => showNotification('Location access denied.'));
  } else {
    showNotification('Geolocation not supported.');
  }
}

// Search and Filter
function filterContent() {
  const input = document.getElementById('searchBar').value.toLowerCase();
  const gigs = document.getElementById('gigList').getElementsByClassName('gig-item');
  for (let i = 0; i < gigs.length; i++) {
    const text = gigs[i].innerText.toLowerCase();
    gigs[i].style.display = text.includes(input) ? 'flex' : 'none';
  }
}

// Notifications
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => notification.style.display = 'none', 3000);
}

// Initial Load
updateGigList();
