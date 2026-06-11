// App State
let products = [];
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'featured';
let currentUser = null; // null = guest

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoryLinks = document.querySelectorAll('.nav-link, .footer-cat-link');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const themeToggleBtn = document.getElementById('theme-toggle');

// Cart DOM Elements
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartBadge = document.getElementById('cart-badge');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const cartFooter = document.getElementById('cart-footer');
const checkoutBtn = document.getElementById('checkout-btn');

// Modals DOM Elements
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalProductDetail = document.getElementById('modal-product-detail');

// Checkout DOM Elements
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutBtn = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const checkoutItemsList = document.getElementById('checkout-items-list');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutTotal = document.getElementById('checkout-total');
const placeOrderBtn = document.getElementById('place-order-btn');

// Success DOM Elements
const successModal = document.getElementById('success-modal');
const successDoneBtn = document.getElementById('success-done-btn');
const confirmedOrderId = document.getElementById('confirmed-order-id');

// Auth DOM Elements
const accountBtn = document.getElementById('account-btn');
const accountDropdown = document.getElementById('account-dropdown');
const dropdownName = document.getElementById('dropdown-name');
const dropdownEmail = document.getElementById('dropdown-email');
const logoutBtn = document.getElementById('logout-btn');
const viewOrdersBtn = document.getElementById('view-orders-btn');
const authModal = document.getElementById('auth-modal');
const closeAuthModalBtn = document.getElementById('close-auth-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loginSubmitBtn = document.getElementById('login-submit-btn');
const registerSubmitBtn = document.getElementById('register-submit-btn');

// Orders DOM Elements
const ordersModal = document.getElementById('orders-modal');
const closeOrdersModalBtn = document.getElementById('close-orders-modal');
const ordersList = document.getElementById('orders-list');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchProducts();
    loadCartFromStorage();
    checkAuthState();
    setupEventListeners();
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const theme = systemPrefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    // Re-trigger icon updates if needed
    lucide.createIcons();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add brief animation to icon
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.style.transform = 'scale(0.85)';
    setTimeout(() => {
        themeBtn.style.transform = 'none';
    }, 150);
}

// --- Fetch Products Data ---
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
        
        // Initial render
        renderProducts();
        
        // Trigger quick view from Hero CTA if it exists
        const heroQuickViewBtn = document.getElementById('hero-quick-view');
        if (heroQuickViewBtn) {
            heroQuickViewBtn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-product-id'));
                openProductDetail(id);
            });
        }
    } catch (error) {
        console.error('Error fetching products catalog:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <p>Failed to load the product ecosystem. Please check back later.</p>
            </div>
        `;
    }
}

// --- Render Catalog ---
function renderProducts() {
    // Filter
    let filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Sort
    if (currentSort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

    // Output HTML
    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <i data-lucide="info" size="32" style="margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No gear matches your search criteria.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    productsGrid.innerHTML = filtered.map(p => `
        <article class="product-card" data-id="${p.id}">
            <div class="product-card-image-wrapper">
                <span class="product-card-badge">${p.category}</span>
                <img src="${p.image}" alt="${p.name}" class="product-card-image" loading="lazy">
            </div>
            <div class="product-card-rating">
                <i data-lucide="star"></i>
                <span>${p.rating.toFixed(1)}</span>
            </div>
            <h3 class="product-card-title">${p.name}</h3>
            <p class="product-card-desc">${p.description}</p>
            <div class="product-card-footer">
                <span class="product-card-price">$${p.price.toFixed(2)}</span>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary btn-icon quick-view-btn" data-id="${p.id}" title="Quick View" aria-label="Quick View">
                        <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
                    </button>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${p.id}">
                        Add to Bag
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    lucide.createIcons();
    
    // Wire card action events
    document.querySelectorAll('.quick-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            openProductDetail(id);
        });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            addToCart(id);
            animateCartTrigger();
        });
    });
}

// --- Cart Logic ---
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('aetherio_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

function saveCartToStorage() {
    localStorage.setItem('aetherio_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.product.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }
    
    saveCartToStorage();
    updateCartUI();
    
    // Open drawer on add
    openCart();
}

function updateCartQuantity(productId, delta) {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.product.id !== productId);
    }
    
    saveCartToStorage();
    updateCartUI();
}

function removeCartItem(productId) {
    cart = cart.filter(i => i.product.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;
    cartCount.textContent = totalCount;

    // Toggle Badge Visibility
    if (totalCount === 0) {
        cartBadge.style.display = 'none';
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i data-lucide="shopping-bag" style="width: 40px; height: 40px; stroke-width: 1.5; color: var(--text-muted);"></i>
                <p>Your bag is empty.</p>
                <a href="#catalog" class="btn btn-secondary close-cart-link">Browse Products</a>
            </div>
        `;
        cartFooter.style.display = 'none';
        
        // Setup listener on empty cart action button
        const browseLink = cartItemsContainer.querySelector('.close-cart-link');
        if (browseLink) {
            browseLink.addEventListener('click', closeCart);
        }
    } else {
        cartBadge.style.display = 'flex';
        cartFooter.style.display = 'block';

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.product.price * item.quantity;
            subtotal += itemTotal;
            return `
                <div class="cart-item">
                    <div class="cart-item-image-wrapper">
                        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.product.name}</h4>
                        <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn dec-qty" data-id="${item.product.id}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-qty" data-id="${item.product.id}">+</button>
                        </div>
                        <button class="remove-item-btn" data-id="${item.product.id}">
                            <i data-lucide="trash-2"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        cartTotal.textContent = `$${subtotal.toFixed(2)}`;
        
        // Attach click handlers
        cartItemsContainer.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                updateCartQuantity(id, -1);
            });
        });

        cartItemsContainer.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                updateCartQuantity(id, 1);
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                removeCartItem(id);
            });
        });
    }

    lucide.createIcons();
}

function openCart() {
    cartDrawer.classList.add('active');
    cartDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
}

function closeCart() {
    cartDrawer.classList.remove('active');
    cartDrawerOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scroll
}

function animateCartTrigger() {
    cartBtn.style.transform = 'scale(1.2) rotate(-10deg)';
    cartBtn.style.borderColor = 'var(--accent-color)';
    setTimeout(() => {
        cartBtn.style.transform = 'none';
        cartBtn.style.borderColor = '';
    }, 300);
}

// --- Product Modal Quick View ---
function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalProductDetail.innerHTML = `
        <div class="product-detail-layout">
            <div class="modal-gallery-side">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="modal-info-side">
                <div class="product-card-rating">
                    <i data-lucide="star"></i>
                    <span>${product.rating.toFixed(1)} Rating</span>
                </div>
                <h2 class="modal-title">${product.name}</h2>
                <div class="modal-price">$${product.price.toFixed(2)}</div>
                
                <p class="modal-description">${product.description}</p>
                
                <h4 class="modal-section-title">Technical Specifications</h4>
                <div class="specs-list">
                    ${product.specs.map(spec => `<div class="spec-item">${spec}</div>`).join('')}
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary add-to-cart-modal-btn" data-id="${product.id}">Add to Bag</button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hook add-to-cart on modal button
    modalProductDetail.querySelector('.add-to-cart-modal-btn').addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        addToCart(id);
        closeModal();
        animateCartTrigger();
    });
}

function closeModal() {
    productModal.classList.remove('active');
    if (!cartDrawer.classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

// --- Checkout System ---
function openCheckout() {
    closeCart();
    
    // Fill checkout summary
    let subtotal = 0;
    checkoutItemsList.innerHTML = cart.map(item => {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.9rem;">
                <div style="max-width: 180px;">
                    <strong style="display: block; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.product.name}</strong>
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">Qty: ${item.quantity}</span>
                </div>
                <span style="font-family: 'Outfit'; font-weight: 600;">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    checkoutTotal.textContent = `$${subtotal.toFixed(2)}`;
    placeOrderBtn.textContent = `Place Order ($${subtotal.toFixed(2)})`;

    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Disable button to prevent multi-submits and show mock state
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = `<span class="pulse-dot" style="background-color:#fff;"></span> Processing...`;

    // Gather shipping/checkout inputs
    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;
    const address = document.getElementById('checkout-address').value;
    const city = document.getElementById('checkout-city').value;
    const zip = document.getElementById('checkout-zip').value;

    // Build cart data format: [{productId: X, quantity: Y}]
    const cartPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
    }));

    const payload = {
        name,
        email,
        address,
        city,
        zip,
        cart: cartPayload
    };

    // Make AJAX request to Flask backend
    fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Server error occurred during checkout'); });
        }
        return response.json();
    })
    .then(data => {
        if (data.success && data.order_id) {
            closeCheckout();
            
            // Reset state
            cart = [];
            saveCartToStorage();
            updateCartUI();
            
            // Display actual database-generated Order ID
            confirmedOrderId.textContent = data.order_id;
            
            // Reset form
            checkoutForm.reset();
            placeOrderBtn.disabled = false;
            
            // Show success modal
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            throw new Error(data.error || 'Unexpected response format');
        }
    })
    .catch(error => {
        console.error('Checkout error:', error);
        alert('Checkout Failed: ' + error.message);
        
        // Re-enable placement button and restore text
        placeOrderBtn.disabled = false;
        // Recompute price label
        const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        placeOrderBtn.textContent = `Place Order ($${subtotal.toFixed(2)})`;
    });
}

// --- Input Formatting Helpers ---
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += value[i];
    }
    e.target.value = formatted;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
        e.target.value = value;
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Cart overlay & buttons
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartDrawerOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', openCheckout);

    // Detail Modal closing
    closeModalBtn.addEventListener('click', closeModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    // Checkout Modal closing
    closeCheckoutBtn.addEventListener('click', closeCheckout);
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckout();
    });

    // Checkout actions
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Format Checkout Inputs
    const cardInput = document.getElementById('checkout-card');
    const expiryInput = document.getElementById('checkout-expiry');
    cardInput.addEventListener('input', formatCardNumber);
    expiryInput.addEventListener('input', formatExpiry);

    // Success button closing
    successDoneBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Filtering category links
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = e.currentTarget.getAttribute('data-category');
            
            // Update UI class state
            categoryLinks.forEach(c => c.classList.remove('active'));
            
            // Handle links in header vs footer (if they exist)
            document.querySelectorAll(`.nav-link[data-category="${cat}"]`).forEach(el => el.classList.add('active'));

            activeCategory = cat;
            renderProducts();

            // Smooth scroll to catalog section if coming from header/footer
            const catalogSection = document.getElementById('catalog');
            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Search bar filtering
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProducts();
    });

    // Sort Selection dropdown
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });

    // --- Account / Auth Listeners ---

    // Toggle dropdown on account button click
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser) {
            accountDropdown.classList.toggle('active');
        } else {
            openAuthModal('login');
        }
    });

    // Close dropdown when clicking anywhere outside
    document.addEventListener('click', () => {
        accountDropdown.classList.remove('active');
    });
    accountDropdown.addEventListener('click', (e) => e.stopPropagation());

    // Auth modal close
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            switchAuthTab(target);
        });
    });

    // Login form submit
    loginForm.addEventListener('submit', handleLogin);

    // Register form submit
    registerForm.addEventListener('submit', handleRegister);

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // View orders button
    viewOrdersBtn.addEventListener('click', () => {
        accountDropdown.classList.remove('active');
        openOrdersModal();
    });

    // Orders modal close
    closeOrdersModalBtn.addEventListener('click', closeOrdersModal);
    ordersModal.addEventListener('click', (e) => {
        if (e.target === ordersModal) closeOrdersModal();
    });
}

// ============================================================
// Auth Functions
// ============================================================

function checkAuthState() {
    fetch('/api/me')
        .then(r => r.json())
        .then(data => {
            if (data.logged_in) {
                currentUser = data.user;
                updateAccountUI();
            } else {
                currentUser = null;
                updateAccountUI();
            }
        })
        .catch(() => { currentUser = null; });
}

function updateAccountUI() {
    let adminLink = document.getElementById('admin-panel-link');
    if (currentUser) {
        dropdownName.textContent = currentUser.full_name;
        dropdownEmail.textContent = currentUser.email;
        // Show a filled user icon when logged in
        accountBtn.style.borderColor = 'var(--accent-color)';
        accountBtn.style.color = 'var(--accent-color)';
        
        // Inject admin link if user is admin and link doesn't exist yet
        if (currentUser.is_admin) {
            if (!adminLink) {
                adminLink = document.createElement('a');
                adminLink.href = '/admin';
                adminLink.className = 'dropdown-item';
                adminLink.id = 'admin-panel-link';
                adminLink.innerHTML = '<i data-lucide="shield-alert"></i> Admin Panel';
                
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.parentNode.insertBefore(adminLink, logoutBtn);
                } else {
                    accountDropdown.appendChild(adminLink);
                }
                lucide.createIcons();
            }
        } else {
            if (adminLink) adminLink.remove();
        }
    } else {
        accountBtn.style.borderColor = '';
        accountBtn.style.color = '';
        if (adminLink) adminLink.remove();
    }
}

function openAuthModal(tab = 'login') {
    switchAuthTab(tab);
    loginError.textContent = '';
    registerError.textContent = '';
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === tab);
    });
    document.getElementById('panel-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('panel-register').classList.toggle('hidden', tab !== 'register');
}

function handleLogin(e) {
    e.preventDefault();
    loginError.textContent = '';
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.textContent = 'Signing in...';

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            updateAccountUI();
            closeAuthModal();
            loginForm.reset();
        } else {
            loginError.textContent = data.error || 'Login failed.';
        }
    })
    .catch(() => { loginError.textContent = 'Network error. Please try again.'; })
    .finally(() => {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Sign In';
    });
}

function handleRegister(e) {
    e.preventDefault();
    registerError.textContent = '';
    registerSubmitBtn.disabled = true;
    registerSubmitBtn.textContent = 'Creating account...';

    const full_name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            currentUser = data.user;
            updateAccountUI();
            closeAuthModal();
            registerForm.reset();
        } else {
            registerError.textContent = data.error || 'Registration failed.';
        }
    })
    .catch(() => { registerError.textContent = 'Network error. Please try again.'; })
    .finally(() => {
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = 'Create Account';
    });
}

function handleLogout() {
    accountDropdown.classList.remove('active');
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            updateAccountUI();
        });
}

// ============================================================
// Order History Functions
// ============================================================

function openOrdersModal() {
    ordersModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    ordersList.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">Loading orders...</div>`;

    fetch('/api/orders')
        .then(r => {
            if (r.status === 401) throw new Error('not_authenticated');
            return r.json();
        })
        .then(orders => renderOrdersList(orders))
        .catch(err => {
            if (err.message === 'not_authenticated') {
                closeOrdersModal();
                openAuthModal('login');
            } else {
                ordersList.innerHTML = `<div class="orders-empty"><i data-lucide="alert-circle"></i><p>Could not load orders.</p></div>`;
                lucide.createIcons();
            }
        });
}

function closeOrdersModal() {
    ordersModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderOrdersList(orders) {
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div class="orders-empty">
                <i data-lucide="package"></i>
                <p>No orders yet. Start shopping to see your order history here!</p>
                <button class="btn btn-primary" onclick="closeOrdersModal(); document.getElementById('catalog').scrollIntoView({behavior:'smooth'});">Browse Products</button>
            </div>`;
        lucide.createIcons();
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <div>
                    <div class="order-card-id">${order.order_id}</div>
                    <div class="order-card-date">${order.created_at}</div>
                </div>
                <div class="order-card-total">$${order.total.toFixed(2)}</div>
            </div>
            <div class="order-card-items">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <img src="${item.product_image}" alt="${item.product_name}" class="order-item-img">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.product_name}</div>
                            <div class="order-item-qty">Qty: ${item.quantity}</div>
                        </div>
                        <div class="order-item-price">$${item.line_total.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}
