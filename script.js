// Configuration
const API_BASE = 'http://localhost:8001/api'; // Change this to your backend URL

// Global variables
let currentPaymentItem = null;
let currentRatingItem = null;
let currentRating = 5;
let gigs = [];
let shops = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSearch();
    initializeForms();
    initializeModals();
    loadInitialData();
});

// Tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            filterItems(searchTerm);
        }, 300);
    });
}

// Filter items based on search term
function filterItems(searchTerm) {
    const filteredGigs = gigs.filter(gig => 
        gig.title.toLowerCase().includes(searchTerm) ||
        gig.description.toLowerCase().includes(searchTerm) ||
        gig.category.toLowerCase().includes(searchTerm)
    );
    
    const filteredShops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchTerm) ||
        shop.services.toLowerCase().includes(searchTerm) ||
        shop.category.toLowerCase().includes(searchTerm)
    );
    
    renderGigs(filteredGigs);
    renderShops(filteredShops);
}
// Initialize forms
function initializeForms() {
    // Gig form
    document.getElementById('gigForm').addEventListener('submit', handleGigSubmit);
    
    // Shop form
    document.getElementById('shopForm').addEventListener('submit', handleShopSubmit);
    
    // Delivery form
    document.getElementById('deliveryForm').addEventListener('submit', handleDeliverySubmit);
}

// Initialize modals
function initializeModals() {
    // Rating stars
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStarDisplay();
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModals();
            }
        });
    });
}

// Load initial data
async function loadInitialData() {
    await Promise.all([
        loadGigs(),
        loadShops()
    ]);
}

// API Functions
async function loadGigs() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/gigs`);
        if (response.ok) {
            gigs = await response.json();
            renderGigs(gigs);
        } else {
            throw new Error('Failed to load gigs');
        }
    } catch (error) {
        console.error('Error loading gigs:', error);
        showToast('Failed to load gigs', 'error');
        gigs = []; // Fallback to empty array
        renderGigs(gigs);
    } finally {
        showLoading(false);
    }
}
async function loadShops() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/shops`);
        if (response.ok) {
            shops = await response.json();
            renderShops(shops);
        } else {
            throw new Error('Failed to load shops');
        }
    } catch (error) {
        console.error('Error loading shops:', error);
        showToast('Failed to load shops', 'error');
        shops = []; // Fallback to empty array
        renderShops(shops);
    } finally {
        showLoading(false);
    }
}

// Render functions
function renderGigs(gigsToRender) {
    const gigsList = document.getElementById('gigsList');
    const gigsCount = document.getElementById('gigsCount');
    
    gigsCount.textContent = `${gigsToRender.length} gigs`;
    
    if (gigsToRender.length === 0) {
        gigsList.innerHTML = '<div class="empty-state">No gigs available</div>';
        return;
    }
    
    gigsList.innerHTML = gigsToRender.map(gig => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <div class="item-title">${gig.title}</div>
                </div>
                <div class="pi-badge">
                    <i class="fas fa-coins"></i>
                    ${gig.price} Pi
                </div>
            </div>
            <div class="item-description">${gig.description}</div>
            <div class="item-meta">
                <div class="item-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${gig.location}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        ${formatDateTime(gig.created_at)}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="openPaymentModal('${gig.id}', 'gig', '${gig.title}', ${gig.price})">
                    Accept Gig
                </button>
            </div>
        </div>
    `).join('');
}
function renderShops(shopsToRender) {
    const shopsList = document.getElementById('shopsList');
    const shopsCount = document.getElementById('shopsCount');
    
    shopsCount.textContent = `${shopsToRender.length} shops`;
    
    if (shopsToRender.length === 0) {
        shopsList.innerHTML = '<div class="empty-state">No shops available</div>';
        return;
    }
    
    shopsList.innerHTML = shopsToRender.map(shop => `
        <div class="item-card">
            <div class="shop-header">
                <div class="shop-info">
                    <h3>${shop.name}</h3>
                    <div class="category-badge">${shop.category}</div>
                </div>
                ${shop.total_ratings > 0 ? `
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${shop.rating}</span>
                        <span class="rating-count">(${shop.total_ratings})</span>
                    </div>
                ` : ''}
            </div>
            <div class="services"><strong>Services:</strong> ${shop.services}</div>
            ${shop.description ? `<div class="item-description">${shop.description}</div>` : ''}
            <div class="item-meta">
                <div class="item-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${shop.location}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-store"></i>
                        Since ${formatDate(shop.created_at)}
                    </div>
                </div>
                <button class="btn btn-outline" onclick="openPaymentModal('${shop.id}', 'shop', '${shop.name}', 15)">
                    Hire Shop
                </button>
            </div>
        </div>
    `).join('');
}

// Form handlers
async function handleGigSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('gigTitle').value,
        description: document.getElementById('gigDescription').value,
        price: parseFloat(document.getElementById('gigPrice').value),
        location: document.getElementById('gigLocation').value,
        category: document.getElementById('gigCategory').value || 'general'
    };
  try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/gigs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Gig posted successfully!', 'success');
            document.getElementById('gigForm').reset();
            await loadGigs();
        } else {
            throw new Error('Failed to post gig');
        }
    } catch (error) {
        console.error('Error posting gig:', error);
        showToast('Failed to post gig', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleShopSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('shopName').value,
        category: document.getElementById('shopCategory').value,
        services: document.getElementById('shopServices').value,
        location: document.getElementById('shopLocation').value,
        description: document.getElementById('shopDescription').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/shops`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Shop registered successfully!', 'success');
            document.getElementById('shopForm').reset();
            await loadShops();
        } else {
            throw new Error('Failed to register shop');
        }
    } catch (error) {
        console.error('Error registering shop:', error);
        showToast('Failed to register shop', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleDeliverySubmit(e) {
    e.preventDefault();
    
    const formData = {
        duration: document.getElementById('deliveryDuration').value,
        start_time: new Date(document.getElementById('deliveryStartTime').value).toISOString()
    };
  try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/delivery-blocks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Delivery block created successfully!', 'success');
            document.getElementById('deliveryForm').reset();
        } else {
            throw new Error('Failed to create delivery block');
        }
    } catch (error) {
        console.error('Error creating delivery block:', error);
        showToast('Failed to create delivery block', 'error');
    } finally {
        showLoading(false);
    }
}

// Payment modal functions
function openPaymentModal(itemId, itemType, itemName, price) {
    currentPaymentItem = { id: itemId, type: itemType, name: itemName, price: price };
    
    document.getElementById('paymentItemName').textContent = itemName;
    document.getElementById('paymentAmount').textContent = price;
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    currentPaymentItem = null;
}

async function processPayment() {
    if (!currentPaymentItem) return;
    
    try {
        showLoading(true);
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(`${API_BASE}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                item_type: currentPaymentItem.type,
                item_id: currentPaymentItem.id,
                amount: currentPaymentItem.price
            })
        });
      if (response.ok) {
            showToast(`Payment of ${currentPaymentItem.price} Pi successful!`, 'success');
            closePaymentModal();
            
            // Open rating modal
            currentRatingItem = currentPaymentItem;
            openRatingModal();
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        showToast('Payment failed', 'error');
    } finally {
        showLoading(false);
    }
}

// Rating modal functions
function openRatingModal() {
    if (!currentRatingItem) return;
    
    document.getElementById('ratingItemName').textContent = currentRatingItem.name;
    currentRating = 5;
    updateStarDisplay();
    document.getElementById('ratingComment').value = '';
    document.getElementById('ratingModal').classList.add('active');
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
    currentRatingItem = null;
    currentRating = 5;
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('.rating-stars i');
    stars.forEach((star, index) => {
        if (index < currentRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

async function submitRating() {
    if (!currentRatingItem) return;
    
    const comment = document.getElementById('ratingComment').value;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                item_type: currentRatingItem.type,
                item_id: currentRatingItem.id,
                rating: currentRating,
                comment: comment
            })
        });
      if (response.ok) {
            showToast('Rating submitted successfully!', 'success');
            closeRatingModal();
            
            // Reload shops if rating was for a shop
            if (currentRatingItem.type === 'shop') {
                await loadShops();
            }
        } else {
            throw new Error('Failed to submit rating');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showToast('Failed to submit rating', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function closeModals() {
    closePaymentModal();
    closeRatingModal();
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Error handling for network issues
window.addEventListener('online', () => {
    showToast('Connection restored', 'success');
    loadInitialData();
});

window.addEventListener('offline', () => {
    showToast('Connection lost', 'error');
});
