// Global in-memory token
let accessToken = null;

// ✅ Try to refresh token when page loads
async function initializeAuthentication() {
    try {
        const res = await $.ajax({
            url: 'http://localhost:8080/auth/refresh',
            method: 'POST',
            xhrFields: { withCredentials: true } // send refresh cookie automatically
        });

        accessToken = res.accessToken; // keep in memory
        console.log("🔑 Session restored. New token:", accessToken);
        return true;

    } catch (e) {
        console.warn("❌ No valid refresh token. Redirecting to login...");
        window.location.href = 'http://localhost:63343/resources/signIn.html';
        return false;
    }
}

// Run as soon as the page loads
$(document).ready(async function () {
    await initializeAuthentication();
    // ⬆️ If this fails, user is redirected.
    // If success, you can now safely call your APIs with accessToken.
    await loadAllCustomers();
    renderAll();
});


function refreshAccessToken() {
    return $.ajax({
        url: 'http://localhost:8080/auth/refresh',
        method: 'POST',
        xhrFields: { withCredentials: true },
    }).then(res => {
        localStorage.setItem("accessToken", res.accessToken);
        console.log("♻️ Token refreshed:", res.accessToken);
        return true; // ✅ signal success
    }).catch(err => {
        console.warn("❌ Refresh failed, please login.");
        return false; // ✅ signal failure
    });
}

//server down create - start
// Server Down Modal Class - Add to your existing JavaScript
class ServerDownModal {
    constructor() {
        this.modal = document.getElementById('serverDownModal');
        this.retrySection = document.getElementById('serverRetrySection');
        this.successState = document.getElementById('serverSuccessState');
        this.retrySpinner = document.getElementById('serverRetrySpinner');
        this.retryText = document.getElementById('serverRetryText');
        this.retryCountdown = document.getElementById('serverRetryCountdown');
        this.attemptsList = document.getElementById('serverAttemptsList');

        this.isVisible = false;
        this.retryInterval = null;
        this.countdownInterval = null;
        this.attempts = 0;
        this.maxAttempts = 10;
        this.retryDelaySeconds = 5;
        this.currentCountdown = this.retryDelaySeconds;
        this.serverUpCallback = null;
    }

    show(serverCheckCallback, onServerUp) {
        this.isVisible = true;
        this.serverCheckCallback = serverCheckCallback;
        this.serverUpCallback = onServerUp;
        this.attempts = 0;
        this.currentCountdown = this.retryDelaySeconds;

        this.modal.classList.add('active');
        this.retrySection.style.display = 'block';
        this.successState.classList.remove('active');

        this.updateAttemptsDisplay();
        this.startRetryProcess();
    }

    hide() {
        this.isVisible = false;
        this.modal.classList.remove('active');
        this.stopRetryProcess();
    }

    startRetryProcess() {
        this.stopRetryProcess();
        this.startCountdown();

        this.retryInterval = setTimeout(() => {
            this.attemptConnection();
        }, this.retryDelaySeconds * 1000);
    }

    startCountdown() {
        this.currentCountdown = this.retryDelaySeconds;
        this.updateCountdownDisplay();

        this.countdownInterval = setInterval(() => {
            this.currentCountdown--;
            this.updateCountdownDisplay();

            if (this.currentCountdown <= 0) {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    async attemptConnection() {
        if (!this.isVisible) return;

        this.attempts++;
        this.retryText.textContent = `Attempting connection (${this.attempts}/${this.maxAttempts})...`;
        this.retrySpinner.classList.remove('hidden');

        this.updateAttemptsDisplay();

        try {
            const isServerUp = await this.serverCheckCallback();

            if (isServerUp) {
                this.onConnectionSuccess();
                return;
            }

            throw new Error('Server still down');

        } catch (error) {
            console.log('Connection attempt failed:', error);
            this.onConnectionFailed();
        }
    }

    onConnectionSuccess() {
        this.retrySpinner.classList.add('hidden');
        this.retrySection.style.display = 'none';
        this.successState.classList.add('active');

        if (this.serverUpCallback) {
            this.serverUpCallback();
        }

        setTimeout(() => {
            this.hide();
        }, 3000);
    }

    onConnectionFailed() {
        this.retrySpinner.classList.add('hidden');

        if (this.attempts >= this.maxAttempts) {
            this.retryText.textContent = 'Max attempts reached. Please try again later.';
            return;
        }

        this.retryText.textContent = 'Connection failed. Retrying in...';
        this.startCountdown();

        this.retryInterval = setTimeout(() => {
            this.attemptConnection();
        }, this.retryDelaySeconds * 1000);
    }

    updateCountdownDisplay() {
        this.retryCountdown.textContent = this.currentCountdown;
    }

    updateAttemptsDisplay() {
        this.attemptsList.innerHTML = '';

        for (let i = 0; i < this.maxAttempts; i++) {
            const dot = document.createElement('div');
            dot.className = 'attempt-dot';

            if (i < this.attempts - 1) {
                dot.classList.add('failed');
            } else if (i === this.attempts - 1) {
                dot.classList.add('current');
            }

            this.attemptsList.appendChild(dot);
        }
    }

    stopRetryProcess() {
        if (this.retryInterval) {
            clearTimeout(this.retryInterval);
            this.retryInterval = null;
        }

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    manualRetry() {
        this.stopRetryProcess();
        this.attemptConnection();
    }
}

// Global instance
const serverModal = new ServerDownModal();

// Server check function
async function checkServerStatus() {
    try {
        const token = localStorage.getItem('accessToken'); // ✅ read latest token
        await $.ajax({
            url: 'http://localhost:8080/auth/me',
            method: 'GET',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                if (token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                }
            },
            xhrFields: { withCredentials: true }
        });
        return true;
    } catch (xhr) {
        if (xhr.status === 401) {
            console.warn("⚠️ Token expired, trying refresh...");
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                console.warn("❌ Refresh failed, redirecting to login.");
                window.location.href = 'http://localhost:63343/resources/signIn.html';
                return;
            }
            return await checkServerStatus(); // Retry with new token
        } else {
            console.error("❌ Auth failed:", xhr);
            throw xhr;
        }
        return false;
    }
}

// Public functions for your application
function showServerDownModal() {
    serverModal.show(checkServerStatus, () => {
        console.log("✅ Server is back online!");
    });
}

function hideServerDownModal() {
    serverModal.hide();
}

//server down - end

// --- STATE MANAGEMENT ---
let selectedPaymentMethod = null;
let currentTotal = 0;
let cart = {};
let selectedCustomer = null;
let editingCustomerId = null;
let editingItemId = null;
let orderHistory = [];
const defaultCustomerImage = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';
const defaultItemImage = 'https://static.vecteezy.com/system/resources/previews/004/141/669/non_2x/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';
let products = { 'coffee-beans': { name: 'Premium Coffee Beans', price: 24.99, stock: 4, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=140&h=140&fit=crop' }, 'caramel-latte': { name: 'Iced Caramel Latte', price: 5.50, stock: 32, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=140&h=140&fit=crop' }, 'artisan-chocolate': { name: 'Artisan Dark Chocolate', price: 12.50, stock: 3, image: 'https://images.unsplash.com/photo-1549007994-cb92caefc54b?w=140&h=140&fit=crop' }, 'gourmet-sandwich': { name: 'Gourmet Turkey Club', price: 15.99, stock: 22, image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=140&h=140&fit=crop' } };
let customers = {};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    renderAll();
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    document.getElementById('billItems').addEventListener('change', handleBillQtyChange);
    checkLowStock();
    setInterval(checkLowStock, 30000); // Check every 30 seconds
});

// --- PAYMENT DRAWER FUNCTIONS ---

// Add thermal bill printing function
function printThermalBill(orderData) {
    const printWindow = window.open(
        '',
        '_blank',
        'width=900,height=700,left=0,top=20px,scrollbars=yes,resizable=yes'
    );

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt</title>
    <style>
        /*@media print { @page { size: 80mm auto; margin: 0; } }*/
        @media print {
      
      @page {
      size: auto;
      margin: 10mm;
    }
    
    body {
      zoom: 2.5; /* Scale up the preview */
    }


    }
    body { font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.3; margin: 0; padding: 12px; width: auto; max-width: 400px; }
    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
    .store-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .store-info { font-size: 11px; line-height: 1.4; }
    .receipt-info { margin: 12px 0; font-size: 11px; background: #f5f5f5; padding: 8px; border-radius: 4px; }
    .items { border-bottom: 2px dashed #000; padding-bottom: 12px; margin-bottom: 12px; }
    .item { display: flex; justify-content: space-between; margin: 4px 0; }
    .item-name { flex: 1; font-weight: bold; }
    .item-qty { width: 40px; text-align: center; }
    .item-price { width: 60px; text-align: right; font-weight: bold; }
    .item-details { font-size: 10px; color: #666; margin-left: 0; margin-bottom: 4px; }
    .totals { margin: 12px 0; }
    .total-row { display: flex; justify-content: space-between; margin: 4px 0; padding: 2px 0; }
    .total-row.grand { font-weight: bold; border-top: 2px dashed #000; padding-top: 8px; font-size: 16px; }
    .payment-info { margin: 12px 0; border-top: 2px dashed #000; padding-top: 12px; background: #f9f9f9; padding: 12px; border-radius: 4px; }
    .footer { text-align: center; margin-top: 20px; font-size: 11px; border-top: 2px dashed #000; padding-top: 12px; }
    .thank-you { font-weight: bold; font-size: 14px; margin-bottom: 8px; }
</style>
        </head>
        <body>
            <div class="header">
                <div class="store-name">ProPOS Store</div>
                <div class="store-info">123 Business St<br>City, State 12345<br>Tel: (555) 123-4567</div>
            </div>
            
            <div class="receipt-info">
                <div>Receipt #: ${orderData.id}</div>
                <div>Date: ${orderData.date.toLocaleString()}</div>
                <div>Cashier: Jane Doe</div>
                <div>Customer: ${orderData.customer}</div>
            </div>
            
            <div class="items">
                ${Object.entries(orderData.items).map(([id, qty]) => {
        const product = products[id];
        const itemTotal = product.price * qty;
        return `
                        <div class="item">
                            <span class="item-name">${product.name}</span>
                            <span class="item-qty">${qty}x</span>
                            <span class="item-price">$${itemTotal.toFixed(2)}</span>
                        </div>
                        <div style="font-size: 10px; color: #666; margin-left: 0;">
                            @ $${product.price.toFixed(2)} each
                        </div>
                    `;
    }).join('')}
            </div>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${(orderData.total / 1.085).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (8.5%):</span>
                    <span>$${(orderData.total - (orderData.total / 1.085)).toFixed(2)}</span>
                </div>
                <div class="total-row grand">
                    <span>TOTAL:</span>
                    <span>$${orderData.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="payment-info">
                <div class="total-row">
                    <span>Payment Method:</span>
                    <span>${orderData.paymentMethod.toUpperCase()}</span>
                </div>
                ${orderData.paymentMethod === 'cash' ? `
                    <div class="total-row">
                        <span>Cash Received:</span>
                        <span>$${orderData.cashReceived.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Change:</span>
                        <span>$${orderData.change.toFixed(2)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <div class="thank-you">Thank You for Your Business!</div>
                <div>Please Come Again</div>
                <div style="margin-top: 8px;">
                    Return Policy: 30 days with receipt<br>
                    Customer Service: (555) 123-4567
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function confirmInventorySwitch() {
    document.getElementById('inventoryConfirmation').classList.add('active');
}

function closeInventoryConfirmation() {
    document.getElementById('inventoryConfirmation').classList.remove('active');
}

function activateInventorySystem() {
    closeInventoryConfirmation();

    // Show success notification
    showNotification(
        'Inventory Management System activated successfully! Advanced features are now available.',
        'System Activated',
        'success'
    );

    // Open the current item modal (you can replace this later with actual inventory system)
    setTimeout(() => {
        openItemModal();
    }, 1000);
}

function logout() {
    if (Object.keys(cart).length > 0) {
        if (!confirm('You have items in your cart. Are you sure you want to logout?')) {
            return;
        }
    }
    if (confirm('Are you sure you want to logout?')) {
        // Clear all data
        cart = {};
        selectedCustomer = null;
        document.getElementById('customerSelect').value = '';
        renderAll();
        alert('Logged out successfully!');
        // You can add actual logout logic here

        $.ajax({
            url: 'http://localhost:8080/auth/logout',
            method: 'POST',
            xhrFields: { withCredentials: true }, // <-- this is required to send cookies!
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).done(function() {
            console.log("✅ Logged out");
            accessToken = null; // clear access token too
            window.location.href = 'http://localhost:63343/resources/signIn.html';
        });

    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        const completeBtn = document.getElementById('completePaymentBtn');
        if (!completeBtn.disabled) {
            completePayment();
        }
    }
}

function openPaymentDrawer() {
    const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products[id].price * qty), 0);
    const tax = subtotal * 0.085;
    const total = subtotal + tax;

    document.getElementById('paymentSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('paymentTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('paymentTotal').textContent = `$${total.toFixed(2)}`;

    document.getElementById('paymentDrawer').classList.add('active');
    resetPaymentDrawer();
}

function closePaymentDrawer() {
    document.getElementById('paymentDrawer').classList.remove('active');
    resetPaymentDrawer();
}

function resetPaymentDrawer() {
    selectedPaymentMethod = null;
    document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('cashPaymentSection').classList.remove('active');
    document.getElementById('changeDisplay').classList.remove('active');
    document.getElementById('cashAmountInput').value = '';
    document.getElementById('completePaymentBtn').disabled = true;
    document.getElementById('paymentSuccess').classList.remove('active');
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-method-btn').forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');

    if (method === 'cash') {
        document.getElementById('cashPaymentSection').classList.add('active');
        document.getElementById('cashAmountInput').focus();
    } else {
        document.getElementById('cashPaymentSection').classList.remove('active');
        document.getElementById('changeDisplay').classList.remove('active');
        document.getElementById('completePaymentBtn').disabled = false;
    }
}

// Update the calculateChange function to include auto-scroll:
function calculateChange() {
    const cashAmount = parseFloat(document.getElementById('cashAmountInput').value) || 0;
    const total = currentTotal;
    const change = cashAmount - total;

    const changeDisplay = document.getElementById('changeDisplay');
    const changeAmount = document.getElementById('changeAmount');
    const completeBtn = document.getElementById('completePaymentBtn');

    if (cashAmount >= total && cashAmount > 0) {
        changeAmount.textContent = `$${change.toFixed(2)}`;
        changeDisplay.classList.add('active');
        completeBtn.disabled = false;

        // Auto-scroll to complete payment button
        setTimeout(() => {
            const paymentActions = document.querySelector('.payment-actions');
            paymentActions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    } else {
        changeDisplay.classList.remove('active');
        completeBtn.disabled = true;
    }
}

function setQuickCash(amount) {
    document.getElementById('cashAmountInput').value = amount.toFixed(2);
    calculateChange();
}

function setExactAmount() {
    document.getElementById('cashAmountInput').value = currentTotal.toFixed(2);
    calculateChange();
}

function clearCashInput() {
    document.getElementById('cashAmountInput').value = '';
    document.getElementById('changeDisplay').classList.remove('active');
    document.getElementById('completePaymentBtn').disabled = true;
}

function completePayment() {
    if (!selectedPaymentMethod) return;

    // Show success animation
    document.getElementById('paymentSuccess').classList.add('active');

    const cashAmount = parseFloat(document.getElementById('cashAmountInput').value) || currentTotal;
    const change = selectedPaymentMethod === 'cash' ? (cashAmount - currentTotal).toFixed(2) : '0.00';

    document.getElementById('successDetails').textContent =
        selectedPaymentMethod === 'cash'
            ? `Cash: $${cashAmount.toFixed(2)} | Change: $${change}`
            : `${selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1)} payment processed`;

    // Complete the actual checkout after animation
    setTimeout(() => {
        const order = {
            id: `ORD-${Date.now()}`,
            date: new Date(),
            customer: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
            items: { ...cart },
            total: currentTotal,
            paymentMethod: selectedPaymentMethod,
            cashReceived: selectedPaymentMethod === 'cash' ? cashAmount : currentTotal,
            change: selectedPaymentMethod === 'cash' ? parseFloat(change) : 0
        };

        orderHistory.push(order);
        Object.entries(cart).forEach(([id, qty]) => { if (products[id]) products[id].stock -= qty; });
        cart = {};
        selectedCustomer = null;
        document.getElementById('customerSelect').value = '';
        renderAll();

        printThermalBill(order);

        setTimeout(() => {
            closePaymentDrawer();
            showNotification(`Payment of $${currentTotal.toFixed(2)} successful!`, 'Checkout Complete', 'success');
            checkLowStock();
        }, 1500);
    }, 2000);
}

function renderAll() { renderProducts(); renderCustomerDropdown(); updateBill(); updateCustomerInfo(); renderCustomerTable(); renderItemTable(); }

// --- THEME MANAGEMENT ---
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelector('#theme-toggle-btn i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.querySelector('#theme-toggle-btn i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// --- NOTIFICATION SYSTEM ---
function showNotification(message, title = 'Alert', type = 'warning') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `toast-notification`;
    notification.style.borderLeftColor = `var(--${type})`;
    const icon = type === 'warning' ? 'fa-triangle-exclamation' : 'fa-check-circle';
    notification.innerHTML = `
      <div class="toast-header">
        <span class="toast-title"><i class="fas ${icon}"></i> ${title}</span>
        <button class="toast-close-btn">&times;</button>
      </div>
      <div class="toast-body">${message}</div>`;
    notification.querySelector('.toast-close-btn').onclick = () => {
        notification.classList.add('closing');
        setTimeout(() => notification.remove(), 500);
    };
    container.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('closing');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

function checkLowStock() {
    const lowStockItems = Object.values(products).filter(p => p.stock > 0 && p.stock < 5);
    if (lowStockItems.length > 0) {
        const itemNames = lowStockItems.map(p => `${p.name} (${p.stock} left)`).join(', ');
        showNotification(`Items running low: ${itemNames}`, 'Low Stock Warning', 'warning');
    }
}

// --- RENDER FUNCTIONS ---
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    Object.entries(products).forEach(([id, product]) => {
        if (product.stock <= 0) return;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = (e) => { if (e.target.tagName !== 'BUTTON') updateQuantity(id, 1, productCard); };
        productCard.innerHTML = `<div class="product-image" style="background-image: url('${product.image}')"><div class="stock-badge">${product.stock} in stock</div></div><div class="product-info"><div class="product-name">${product.name}</div><div class="product-price">$${product.price.toFixed(2)}</div></div><div class="quantity-controls"><button class="qty-btn" onclick="updateQuantity('${id}', -1)" ${(!cart[id] || cart[id] <= 0) ? 'disabled' : ''}>-</button><span class="qty-display">${cart[id] || 0}</span><button class="qty-btn" onclick="updateQuantity('${id}', 1)" ${(cart[id] || 0) >= product.stock ? 'disabled' : ''}>+</button></div>`;
        grid.appendChild(productCard);
    });
}

function updateBill() {
    const billItems = document.getElementById('billItems');
    if (Object.keys(cart).length === 0) {
        billItems.innerHTML = `<div class="empty-cart"><div class="empty-cart-icon"><i class="fas fa-shopping-cart"></i></div><div>Your cart is empty</div></div>`;
    } else {
        billItems.innerHTML = Object.entries(cart).map(([id, quantity]) => {
            const product = products[id]; const itemTotal = product.price * quantity;
            return `<div class="bill-item" data-product-id="${id}"><img src="${product.image}" class="bill-item-img" alt="${product.name}"><div class="item-details"><div class="item-name">${product.name}</div><div class="item-quantity-editor"><input type="number" class="bill-item-qty-input" value="${quantity}" min="1" max="${product.stock}" data-product-id="${id}"><span class="item-price-per-unit">@ $${product.price.toFixed(2)}</span></div></div><div class="item-total-price">$${itemTotal.toFixed(2)}</div><button class="remove-item" onclick="removeItemFromCart('${id}')" title="Remove"><i class="fas fa-trash-alt"></i></button></div>`;
        }).join('');

        // Auto-scroll to bottom of bill items when new items are added
        const panelBody = document.querySelector('.panel-body');
        setTimeout(() => {
            panelBody.scrollTop = panelBody.scrollHeight;
        }, 100);
    }
    updateTotals();
    updateCheckoutButton();
}

function updateTotals() {
    const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products[id].price * qty), 0);
    const tax = subtotal * 0.085; const total = subtotal + tax;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function updateCheckoutButton() { document.getElementById('checkoutBtn').disabled = Object.keys(cart).length === 0; }

// --- INTERACTION LOGIC ---
function updateQuantity(productId, change, cardElement) {
    const product = products[productId]; if (!product) return;
    const currentQty = cart[productId] || 0;
    const newQty = currentQty + change;
    if (newQty <= 0) { delete cart[productId]; }
    else if (newQty <= product.stock) {
        cart[productId] = newQty;
        if (change > 0 && cardElement) { cardElement.classList.add('added-to-cart'); setTimeout(() => cardElement.classList.remove('added-to-cart'), 500); }
    }
    renderProducts(); updateBill();
}

function handleBillQtyChange(event) {
    if (event.target.classList.contains('bill-item-qty-input')) {
        const productId = event.target.dataset.productId;
        const product = products[productId];
        let newQty = parseInt(event.target.value, 10);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (newQty > product.stock) newQty = product.stock;
        cart[productId] = newQty;
        renderProducts(); updateBill();
    }
}

function removeItemFromCart(productId) { delete cart[productId]; renderProducts(); updateBill(); }

function processCheckout() {
    if (document.getElementById('checkoutBtn').disabled) return;
    const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products[id].price * qty), 0);
    const tax = subtotal * 0.085;
    currentTotal = subtotal + tax;
    openPaymentDrawer();
}

// --- MODAL & FORM LOGIC ---
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }
function previewImage(input, previewId) { if (input.files && input.files[0]) { const reader = new FileReader(); reader.onload = (e) => { document.getElementById(previewId).src = e.target.result; }; reader.readAsDataURL(input.files[0]); } }
function openCustomerModal() { openModal('customerModal'); }
function closeCustomerModal() { closeModal('customerModal'); clearCustomerForm(); }
function clearCustomerForm() { editingCustomerId = null; document.getElementById('editingCustomerId').value = ''; document.getElementById('customerNameInput').value = ''; document.getElementById('customerEmailInput').value = ''; document.getElementById('customerPhoneInput').value = ''; document.getElementById('customerPhotoInput').value = ''; document.getElementById('customerImagePreview').src = defaultCustomerImage; document.getElementById('customerModalTitle').textContent = 'Add New Customer'; }


// ✅ Get a fresh token before doing anything
async function ensureAccessToken() {

        try {
            const res = await $.ajax({
                url: 'http://localhost:8080/auth/refresh',
                method: 'POST',
                xhrFields: { withCredentials: true } // refresh cookie is sent automatically
            });
            accessToken = res.accessToken; // keep it only in memory
            console.log("♻️ Got new token:", accessToken);
        } catch (e) {
            console.warn("❌ Refresh failed. Redirecting to login...");
            window.location.href = 'http://localhost:63343/resources/signIn.html';
        }
}

// ✅ Save customer to DB
async function saveCustomer() {
    try {
        await ensureAccessToken(); // always make sure token exists

        const formData = new FormData();
        formData.append("customer", new Blob([JSON.stringify({
            name: $('#customerNameInput').val(),
            email: $('#customerEmailInput').val(),
            phone: $('#customerPhoneInput').val()
        })], { type: "application/json" }));

        const fileInput = $('#customerPhotoInput')[0];
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append("image", fileInput.files[0]);
        }

        const response = await $.ajax({
            url: "http://localhost:8080/customer/save",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function (xhr) {
                if (accessToken) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                }
            },
            xhrFields: { withCredentials: true }
        });

        alert("✅ Customer saved successfully!");
        clearCustomerForm();
        renderCustomerDropdown();
        closeCustomerModal();

        await loadAllCustomers();

    } catch (xhr) {
        if (xhr.status === 0) {
            console.error("🚫 Server unreachable");
            showServerDownModal();
            return;
        }
        if (xhr.status === 401) {
            console.warn("⚠️ Token expired, refreshing...");
            accessToken = null; // reset so ensureAccessToken() fetches again
            await ensureAccessToken();
            return await saveCustomer(); // retry
        } else {
            console.error("❌ Save failed:", xhr);
            alert("Error: " + (xhr.responseText || "Failed to save customer"));
        }
    }
}

// ✅ Load all customers from backend
async function loadAllCustomers() {
    try {
        await ensureAccessToken(); // always make sure token exists

        const response = await $.ajax({
            url: "http://localhost:8080/customer/all",
            type: "GET",
            beforeSend: function (xhr) {
                if (accessToken) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                }
            },
            xhrFields: { withCredentials: true }
        });

        // Convert array to object with index as key for compatibility
        customers = {};
        response.forEach((customer, index) => {
            customers[index] = {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                image: customer.imagePath || 'default-avatar.png' // fallback image
            };
        });

        console.log("✅ Customers loaded:", customers);
        renderCustomerTable();
        renderCustomerDropdown();

    } catch (xhr) {
        if (xhr.status === 0) {
            console.error("🚫 Server unreachable");
            showServerDownModal();
            return;
        }
        if (xhr.status === 401) {
            console.warn("⚠️ Token expired, refreshing...");
            accessToken = null; // reset so ensureAccessToken() fetches again
            await ensureAccessToken();
            return await loadAllCustomers(); // retry
        } else {
            console.error("⌛ Load failed:", xhr);
            alert("Error: " + (xhr.responseText || "Failed to load customers"));
        }
    }
}

// ✅ Render customer table (updated to handle image paths correctly)
function renderCustomerTable() {
    const tableBody = document.getElementById('customerTableBody');
    if (!tableBody) {
        console.warn("customerTableBody element not found");
        return;
    }

    tableBody.innerHTML = '';
    Object.entries(customers).forEach(([id, customer]) => {
        const row = document.createElement('tr');

        // Handle image path - if it starts with uploads/, prepend server URL
        let imageUrl = customer.image;
        if (imageUrl && imageUrl.startsWith('uploads/')) {
            imageUrl = `http://localhost:8080/${imageUrl}`;
        } else if (!imageUrl || imageUrl === 'default-avatar.png') {
            imageUrl = 'assets/default-avatar.png'; // local fallback
        }

        row.innerHTML = `
            <td>
                <img src="${imageUrl}" 
                     alt="${customer.name}" 
                     class="customer-avatar"
                     onerror="this.src='assets/default-avatar.png'">
            </td>
            <td>
                <div class="customer-name">${customer.name}</div>
                <div class="customer-email-modal">${customer.email}</div>
            </td>
            <td>${customer.phone}</td>
            <td class="action-buttons">
                <button title="Edit" onclick="editCustomer('${id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button title="Delete" class="delete-btn" onclick="deleteCustomer('${id}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// ✅ Render customer dropdown (for other forms that might need customer selection)
function renderCustomerDropdown() {
    const select = document.getElementById('customerSelect');
    const currentValue = select.value;
    select.innerHTML = '<option value="">Walk-in Customer</option>';
    Object.entries(customers).forEach(([id, customer]) => {
        const option = document.createElement('option');
        option.value = id; option.textContent = customer.name; select.appendChild(option);
    });
    select.value = currentValue;
}


//function saveCustomer() { const name = document.getElementById('customerNameInput').value.trim(); const email = document.getElementById('customerEmailInput').value.trim(); const phone = document.getElementById('customerPhoneInput').value.trim(); const imagePreview = document.getElementById('customerImagePreview').src; if (!name || !email) { alert('Name and Email are required.'); return; } const id = editingCustomerId || name.toLowerCase().replace(/\s+/g, '') + Date.now(); customers[id] = { name, email, phone, image: imagePreview }; renderAll(); closeCustomerModal(); }
function editCustomer(id) { const customer = customers[id]; if (!customer) return; clearCustomerForm(); editingCustomerId = id; document.getElementById('customerNameInput').value = customer.name; document.getElementById('customerEmailInput').value = customer.email; document.getElementById('customerPhoneInput').value = customer.phone; document.getElementById('customerImagePreview').src = customer.image; document.getElementById('customerModalTitle').textContent = 'Edit Customer'; openCustomerModal(); }
function deleteCustomer(id) { if (confirm(`Delete ${customers[id].name}?`)) { delete customers[id]; renderAll(); } }
function openItemModal() { openModal('itemModal'); }
function closeItemModal() { closeModal('itemModal'); clearItemForm(); }
function clearItemForm() { editingItemId = null; document.getElementById('itemNameInput').value = ''; document.getElementById('itemPriceInput').value = ''; document.getElementById('itemStockInput').value = ''; document.getElementById('itemPhotoInput').value = ''; document.getElementById('itemImagePreview').src = defaultItemImage; document.getElementById('itemModalTitle').textContent = 'Add New Item'; }
function saveItem() { const name = document.getElementById('itemNameInput').value.trim(); const price = parseFloat(document.getElementById('itemPriceInput').value); const stock = parseInt(document.getElementById('itemStockInput').value, 10); const imagePreview = document.getElementById('itemImagePreview').src; if (!name || isNaN(price) || isNaN(stock)) { alert('Please fill all fields correctly.'); return; } const id = editingItemId || name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''); products[id] = { name, price, stock, image: imagePreview }; renderAll(); closeItemModal(); }
function editItem(id) { const item = products[id]; if (!item) return; clearItemForm(); editingItemId = id; document.getElementById('itemNameInput').value = item.name; document.getElementById('itemPriceInput').value = item.price; document.getElementById('itemStockInput').value = item.stock; document.getElementById('itemImagePreview').src = item.image; document.getElementById('itemModalTitle').textContent = 'Edit Item'; openItemModal(); }
function deleteItem(id) { if (confirm(`Delete ${products[id].name}?`)) { delete products[id]; if (cart[id]) { delete cart[id]; } renderAll(); } }
function openOrderHistoryModal() { renderOrderHistoryTable(); openModal('orderHistoryModal'); }
function closeOrderHistoryModal() { closeModal('orderHistoryModal'); }
function renderOrderHistoryTable() {
    const tableBody = document.querySelector('#orderHistoryTable tbody');
    tableBody.innerHTML = '';
    if (orderHistory.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No order history found.</td></tr>';
        return;
    }
    orderHistory.slice().reverse().forEach(order => {
        const row = document.createElement('tr');
        const itemCount = Object.values(order.items).reduce((sum, qty) => sum + qty, 0);
        row.innerHTML = `<td>${order.id}</td><td>${order.date.toLocaleString()}</td><td>${order.customer}</td><td>${itemCount}</td><td>$${order.total.toFixed(2)}</td>`;
        tableBody.appendChild(row);
    });
}
function selectCustomer() { const customerId = document.getElementById('customerSelect').value; selectedCustomer = customerId ? { id: customerId, ...customers[customerId] } : null; updateCustomerInfo(); }
function updateCustomerInfo() {
    const infoBox = document.getElementById('selectedCustomerInfo');
    if (selectedCustomer) {
        infoBox.innerHTML = `<img src="${selectedCustomer.image}" alt="${selectedCustomer.name}" class="customer-info-avatar"><div><div class="customer-name">${selectedCustomer.name}</div><div class="customer-email">${selectedCustomer.email}</div></div>`;
        infoBox.classList.add('active');
    } else { infoBox.innerHTML = ``; infoBox.classList.remove('active'); }
}
function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('.product-name').textContent.toLowerCase();
        card.style.display = name.includes(term) ? 'flex' : 'none';
    });
}



// Simplified renderCustomerTable functions from previous snippets.
// function renderCustomerTable() {
//     const tableBody = document.getElementById('customerTableBody');
//     tableBody.innerHTML = '';
//     Object.entries(customers).forEach(([id, customer]) => {
//         const row = document.createElement('tr');
//         row.innerHTML = `<td><img src="${customer.image}" alt="${customer.name}" class="customer-avatar"></td><td><div class="customer-name">${customer.name}</div><div class="customer-email-modal">${customer.email}</div></td><td>${customer.phone}</td><td class="action-buttons"><button title="Edit" onclick="editCustomer('${id}')"><i class="fas fa-edit"></i></button><button title="Delete" class="delete-btn" onclick="deleteCustomer('${id}')"><i class="fas fa-trash-alt"></i></button></td>`;
//         tableBody.appendChild(row);
//     });
// }

function renderItemTable() {
    const tableBody = document.getElementById('itemTableBody');
    tableBody.innerHTML = '';
    Object.entries(products).forEach(([id, item]) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><img src="${item.image}" alt="${item.name}" class="item-thumb"></td><td><strong class="item-name-modal">${item.name}</strong></td><td>${item.price.toFixed(2)}</td><td>${item.stock}</td><td class="action-buttons"><button title="Edit" onclick="editItem('${id}')"><i class="fas fa-edit"></i></button><button title="Delete" class="delete-btn" onclick="deleteItem('${id}')"><i class="fas fa-trash-alt"></i></button></td>`;
        tableBody.appendChild(row);
    });
}



// ===== MAKE FUNCTIONS GLOBALLY ACCESSIBLE =====
// This is the key fix - expose all functions to the global window object
// so they can be called from HTML onclick attributes

window.processCheckout = processCheckout;
window.logout = logout;
window.openOrderHistoryModal = openOrderHistoryModal;
window.confirmInventorySwitch = confirmInventorySwitch;
window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;
window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.closeOrderHistoryModal = closeOrderHistoryModal;
window.closeInventoryConfirmation = closeInventoryConfirmation;
window.activateInventorySystem = activateInventorySystem;
window.selectPaymentMethod = selectPaymentMethod;
window.calculateChange = calculateChange;
window.setQuickCash = setQuickCash;
window.setExactAmount = setExactAmount;
window.clearCashInput = clearCashInput;
window.completePayment = completePayment;
window.closePaymentDrawer = closePaymentDrawer;
window.handleEnterKey = handleEnterKey;
window.updateQuantity = updateQuantity;
window.removeItemFromCart = removeItemFromCart;
window.previewImage = previewImage;
window.saveCustomer = saveCustomer;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.clearCustomerForm = clearCustomerForm;
window.saveItem = saveItem;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.clearItemForm = clearItemForm;
window.selectCustomer = selectCustomer;
window.filterProducts = filterProducts;