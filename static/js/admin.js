// Admin Panel State
let currentAdminUser = null;
let stats = null;
let products = [];
let orders = [];
let users = [];

// DOM Elements
const sidebarNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
const panels = document.querySelectorAll('.admin-panel');
const pageTitle = document.getElementById('page-title');

// Stats Elements
const statRevenue = document.getElementById('stat-revenue');
const statOrders = document.getElementById('stat-orders');
const statUsers = document.getElementById('stat-users');
const statProducts = document.getElementById('stat-products');
const recentOrdersList = document.getElementById('recent-orders-list');

// Product Panel Elements
const adminProductsList = document.getElementById('admin-products-list');
const addProductBtn = document.getElementById('add-product-btn');
const productSearchInput = document.getElementById('product-search');

// Order Panel Elements
const adminOrdersList = document.getElementById('admin-orders-list');
const orderSearchInput = document.getElementById('order-search');

// User Panel Elements
const adminUsersList = document.getElementById('admin-users-list');
const userSearchInput = document.getElementById('user-search');

// Modal Elements
const productFormModal = document.getElementById('product-form-modal');
const closeProductModalBtn = document.getElementById('close-product-form-modal');
const cancelProductBtn = document.getElementById('cancel-product-form-btn');
const productForm = document.getElementById('product-form');
const productModalTitle = document.getElementById('product-modal-title');

const orderDetailModal = document.getElementById('order-detail-modal');
const closeOrderDetailModalBtn = document.getElementById('close-order-detail-modal');
const orderDetailContent = document.getElementById('order-detail-content');

// Form inputs
const formProductId = document.getElementById('form-product-id');
const formName = document.getElementById('form-name');
const formCategory = document.getElementById('form-category');
const formPrice = document.getElementById('form-price');
const formRating = document.getElementById('form-rating');
const formImage = document.getElementById('form-image');
const formDescription = document.getElementById('form-description');
const formSpecs = document.getElementById('form-specs');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchCurrentUser();
    setupEventListeners();
    switchTab('dashboard');
});

// Event listeners setup
function setupEventListeners() {
    // Tab switching
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // View All Orders from Dashboard card CTA
    const viewAllOrdersBtn = document.getElementById('view-all-orders-btn');
    if (viewAllOrdersBtn) {
        viewAllOrdersBtn.addEventListener('click', () => {
            switchTab('orders');
        });
    }

    // Product search
    if (productSearchInput) {
        productSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
            renderProducts(filtered);
        });
    }

    // Order search
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = orders.filter(o => 
                o.order_id.toLowerCase().includes(query) ||
                o.customer_name.toLowerCase().includes(query) ||
                o.customer_email.toLowerCase().includes(query)
            );
            renderOrders(filtered);
        });
    }

    // User search
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = users.filter(u => 
                u.full_name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
            );
            renderUsers(filtered);
        });
    }

    // Modals setup
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }

    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', closeProductModal);
    }
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }

    // Form submit
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Order details close
    if (closeOrderDetailModalBtn) {
        closeOrderDetailModalBtn.addEventListener('click', () => {
            orderDetailModal.classList.remove('active');
        });
    }
}

// Fetch who is currently logged in
async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.logged_in) {
            currentAdminUser = data.user;
        }
    } catch (e) {
        console.error("Failed to fetch current admin info", e);
    }
}

// Tab routing logic
function switchTab(tabName) {
    // Active navigation item class update
    sidebarNavItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    // Active panel class update
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${tabName}`);
    });

    // Header Title change
    pageTitle.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);

    // Load tab contents
    if (tabName === 'dashboard') {
        fetchStats();
    } else if (tabName === 'products') {
        fetchProducts();
    } else if (tabName === 'orders') {
        fetchOrders();
    } else if (tabName === 'users') {
        fetchUsers();
    }
}

// Stats fetcher
async function fetchStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
            statRevenue.textContent = `$${data.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            statOrders.textContent = data.total_orders;
            statUsers.textContent = data.total_users;
            statProducts.textContent = data.total_products;
            
            renderRecentActivity(data.recent_orders);
        }
    } catch (e) {
        console.error("Error fetching stats:", e);
    }
}

// Render recent dashboard orders
function renderRecentActivity(recentOrders) {
    if (!recentOrders || recentOrders.length === 0) {
        recentOrdersList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No recent order activities.</td>
            </tr>
        `;
        return;
    }

    recentOrdersList.innerHTML = recentOrders.map(o => `
        <tr>
            <td style="font-weight: 600; color: var(--accent-color);">${o.order_id}</td>
            <td>
                <div>${o.customer_name}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${o.customer_email}</div>
            </td>
            <td>${o.created_at}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${o.items.length} items</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${o.order_id}')">
                    Details
                </button>
            </td>
        </tr>
    `).join('');
}

// Fetch all products
async function fetchProducts() {
    try {
        const res = await fetch('/api/admin/products');
        products = await res.json();
        renderProducts(products);
    } catch (e) {
        console.error("Error fetching products:", e);
    }
}

// Render products table
function renderProducts(productsList) {
    if (!productsList || productsList.length === 0) {
        adminProductsList.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No products found.</td>
            </tr>
        `;
        return;
    }

    adminProductsList.innerHTML = productsList.map(p => {
        const specsHTML = p.specs && p.specs.length > 0 
            ? `<div class="table-specs-list">${p.specs.map(s => `<span class="table-spec-pill">${s}</span>`).join('')}</div>`
            : `<span style="color: var(--text-muted); font-size: 0.8rem;">None</span>`;

        return `
            <tr>
                <td>
                    <img src="${p.image}" alt="${p.name}" class="table-prod-img" onerror="this.src='/static/images/hero_product.webp'">
                </td>
                <td>
                    <div class="table-product-name">${p.name}</div>
                    <div class="table-product-desc">${p.description}</div>
                </td>
                <td><span class="badge badge-role-user">${p.category}</span></td>
                <td style="font-weight: 600;">$${p.price.toFixed(2)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.25rem;">
                        <i data-lucide="star" style="width: 14px; height: 14px; fill: var(--rating-color); stroke: var(--rating-color);"></i>
                        <span>${p.rating.toFixed(1)}</span>
                    </div>
                </td>
                <td>${specsHTML}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn btn-secondary btn-icon-sm" onclick="openProductModal(${p.id})" title="Edit">
                            <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="btn btn-danger-outline btn-icon-sm" onclick="deleteProduct(${p.id})" title="Delete">
                            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    lucide.createIcons();
}

// Fetch all orders
async function fetchOrders() {
    try {
        const res = await fetch('/api/admin/orders');
        orders = await res.json();
        renderOrders(orders);
    } catch (e) {
        console.error("Error fetching orders:", e);
    }
}

// Render orders table
function renderOrders(ordersList) {
    if (!ordersList || ordersList.length === 0) {
        adminOrdersList.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No orders registered in the system.</td>
            </tr>
        `;
        return;
    }

    adminOrdersList.innerHTML = ordersList.map(o => `
        <tr>
            <td style="font-weight: 600; color: var(--accent-color);">${o.order_id}</td>
            <td>${o.customer_name}</td>
            <td>${o.customer_email}</td>
            <td>${o.created_at}</td>
            <td>$${o.subtotal.toFixed(2)}</td>
            <td style="font-weight: 600;">$${o.total.toFixed(2)}</td>
            <td>${o.items.length} items</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${o.order_id}')">
                    View Invoice
                </button>
            </td>
        </tr>
    `).join('');
}

// Fetch all users
async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users');
        users = await res.json();
        renderUsers(users);
    } catch (e) {
        console.error("Error fetching users:", e);
    }
}

// Render users table
function renderUsers(usersList) {
    if (!usersList || usersList.length === 0) {
        adminUsersList.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No users registered in the database.</td>
            </tr>
        `;
        return;
    }

    adminUsersList.innerHTML = usersList.map(u => {
        const isSelf = currentAdminUser && currentAdminUser.id === u.id;
        const roleBadge = u.is_admin 
            ? `<span class="badge badge-role-admin">Admin</span>`
            : `<span class="badge badge-role-user">Customer</span>`;

        const actionBtn = isSelf
            ? `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Current Account</span>`
            : `<button class="btn btn-accent-outline btn-sm" onclick="toggleAdminRole(${u.id})">
                 ${u.is_admin ? 'Revoke Admin' : 'Make Admin'}
               </button>`;

        return `
            <tr>
                <td>#${u.id}</td>
                <td style="font-weight: 600;">${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.created_at}</td>
                <td>${u.order_count} orders</td>
                <td>${roleBadge}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// Open Product Form Modal (Empty for add, prefilled for edit)
function openProductModal(productId = null) {
    productForm.reset();
    formProductId.value = '';
    
    if (productId) {
        productModalTitle.textContent = 'Edit Product';
        const prod = products.find(p => p.id === productId);
        if (prod) {
            formProductId.value = prod.id;
            formName.value = prod.name;
            formCategory.value = prod.category;
            formPrice.value = prod.price;
            formRating.value = prod.rating;
            formImage.value = prod.image;
            formDescription.value = prod.description;
            formSpecs.value = prod.specs ? prod.specs.join(', ') : '';
        }
    } else {
        productModalTitle.textContent = 'Add New Product';
        formRating.value = '4.5';
        formImage.value = '/static/images/product_';
    }
    
    productFormModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Product Form Modal
function closeProductModal() {
    productFormModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle product save submit
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const id = formProductId.value;
    const name = formName.value.trim();
    const category = formCategory.value;
    const price = parseFloat(formPrice.value);
    const rating = parseFloat(formRating.value);
    const image = formImage.value.trim();
    const description = formDescription.value.trim();
    
    // Parse specs from comma-separated input
    const specs = formSpecs.value
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

    const payload = { name, category, price, rating, image, description, specs };
    
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (result.success) {
            closeProductModal();
            fetchProducts();
        } else {
            alert(result.error || 'Failed to save product details.');
        }
    } catch (err) {
        console.error(err);
        alert('Network error occurred while saving.');
    }
}

// Delete product handler
async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product? This will unlink it from current purchase records.")) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            fetchProducts();
        } else {
            alert(data.error || "Failed to delete product.");
        }
    } catch (e) {
        console.error(e);
        alert("Network error occurred.");
    }
}

// Toggle user admin status
async function toggleAdminRole(userId) {
    const action = users.find(u => u.id === userId).is_admin ? "revoke admin status from" : "grant admin status to";
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
            method: 'PUT'
        });
        const data = await res.json();
        if (data.success) {
            fetchUsers();
        } else {
            alert(data.error || "Failed to update user role.");
        }
    } catch (e) {
        console.error(e);
        alert("Network error occurred.");
    }
}

// View Order invoice details modal
function viewOrderDetails(orderIdStr) {
    // Check in both dashboard or order tab cache
    let order = orders.find(o => o.order_id === orderIdStr);
    
    // Fallback: If not fetched in orders, call fetchStats to try stats cached list
    if (!order && stats && stats.recent_orders) {
        order = stats.recent_orders.find(o => o.order_id === orderIdStr);
    }
    
    if (!order) {
        alert("Order details not loaded in cache.");
        return;
    }

    // Generate Invoice HTML
    orderDetailContent.innerHTML = `
        <div class="order-detail-grid">
            <div class="order-info-section">
                <h4>Order Summary</h4>
                <p><strong>Order ID:</strong> <span style="color: var(--accent-color); font-weight: 600;">${order.order_id}</span></p>
                <p><strong>Order Date:</strong> ${order.created_at}</p>
                <p><strong>Items Ordered:</strong> ${order.items.length} units</p>
            </div>
            <div class="order-info-section">
                <h4>Shipping Address</h4>
                <p><strong>Customer Name:</strong> ${order.customer_name}</p>
                <p><strong>Email Address:</strong> ${order.customer_email}</p>
                <p><strong>Delivery Location:</strong><br>${order.shipping_address}<br>${order.city}, ${order.zip_code}</p>
            </div>
        </div>

        <div class="order-detail-items">
            <h4 class="order-info-section h4">Purchased Ecosystem Items</h4>
            <div class="table-responsive">
                <table class="admin-table" style="background: transparent;">
                    <thead>
                        <tr>
                            <th>Ecosystem Item</th>
                            <th>Unit Price</th>
                            <th class="text-center">Quantity</th>
                            <th style="text-align: right;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        ${item.product_image ? `<img src="${item.product_image}" style="width: 34px; height: 34px; border-radius: 4px; object-fit: cover;">` : ''}
                                        <span>${item.product_name}</span>
                                    </div>
                                </td>
                                <td>$${item.price_at_purchase.toFixed(2)}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td style="text-align: right; font-weight: 600;">$${item.line_total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="order-invoice-totals">
            <div>
                <span>Subtotal:</span>
                <span>$${order.subtotal.toFixed(2)}</span>
            </div>
            <div>
                <span>Shipping & handling:</span>
                <span class="free-shipping" style="color: var(--success-color);">FREE</span>
            </div>
            <div class="grand-total">
                <span>Grand Total:</span>
                <span>$${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;

    orderDetailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Global functions for inline HTML event bindings (since they are generated inside strings)
window.viewOrderDetails = viewOrderDetails;
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.toggleAdminRole = toggleAdminRole;
