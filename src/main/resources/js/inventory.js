// --- DATA STORE ---
// Temp variable for supplier modal
let tempSupplierSkus = [];

let state = {
    settings: {
        currency: '$',
        defaultReorder: 10,
    },
    inventory: [
        { name: 'Premium Coffee Beans', sku: 'COF-001', category: 'Beverages', stock: 50, reorderPoint: 20, price: 24.99, expiry: '2025-12-31' },
        { name: 'Iced Caramel Latte', sku: 'LAT-002', category: 'Beverages', stock: 15, reorderPoint: 30, price: 5.50, expiry: '2025-08-15' },
        { name: 'Artisan Dark Chocolate', sku: 'CHD-001', category: 'Food', stock: 8, reorderPoint: 10, price: 12.50, expiry: '2026-01-20' },
        { name: 'Gourmet Turkey Club', sku: 'SND-003', category: 'Food', stock: 25, reorderPoint: 15, price: 15.99, expiry: '2025-08-10' },
        { name: 'Branded Mug', sku: 'MUG-001', category: 'Merchandise', stock: 100, reorderPoint: 25, price: 18.00, expiry: null },
    ],
    suppliers: [
        { id: 1, name: 'Global Coffee Importers', email: 'orders@gci.com', phone: '555-1234', address: '123 Coffee Row', suppliedSkus: ['COF-001', 'LAT-002'] },
        { id: 2, name: 'Fresh Food Distributors', email: 'contact@ffd.net', phone: '555-5678', address: '456 Produce Ave', suppliedSkus: ['CHD-001', 'SND-003'] },
        { id: 3, name: 'Custom Merch Co.', email: 'sales@custommerch.co', phone: '555-9012', address: '789 Design St', suppliedSkus: ['MUG-001'] },
    ],
    purchaseOrders: [
        { poNumber: 'PO-2025-001', supplierId: 1, date: '2025-07-28', items: [{sku: 'COF-001', qty: 20, price: 20.00}], status: 'Received' },
        { poNumber: 'PO-2025-002', supplierId: 2, date: '2025-08-05', items: [{sku: 'SND-003', qty: 30, price: 10.00}, {sku: 'CHD-001', qty: 15, price: 8.00}], status: 'Ordered' },
    ],
    users: [
        { id: 1, username: 'admin', role: 'Admin', phone: '123-456-7890', email: 'admin@propos.com', hireDate: '2023-01-01', password: 'admin123' },
        { id: 2, username: 'jane_doe', role: 'Manager', phone: '555-222-1111', email: 'jane.d@propos.com', hireDate: '2024-04-15', password: 'manager2024' },
    ],
    customers: [
        { id: 1, name: 'Walk-in Customer', email: '', phone: ''},
        { id: 2, name: 'Alice Green', email: 'alice@web.com', phone: '555-1111'},
        { id: 3, name: 'Bob Brown', email: 'bob@mail.com', phone: '555-2222'},
    ],
    transactions: [
        { id: 'T-1001', date: '2025-08-01', customerId: 2, items: [{sku: 'COF-001', qty: 1, price: 24.99}], total: 24.99 },
        { id: 'T-1002', date: new Date().toISOString().split('T')[0], customerId: 1, items: [{sku: 'LAT-002', qty: 2, price: 5.50}], total: 11.00 },
        { id: 'T-1003', date: new Date().toISOString().split('T')[0], customerId: 3, items: [{sku: 'MUG-001', qty: 1, price: 18.00}, {sku: 'CHD-001', qty: 2, price: 12.50}], total: 43.00 },
    ]
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount) => {
    return `${state.settings.currency}${Number(amount).toFixed(2)}`;
}
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getStartOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    renderAll();
    setupEventListeners();
});

function renderAll() {
    // This function re-renders all dynamic parts of the UI
    renderDashboard();
    renderInventoryTable();
    renderPOTable();
    renderSuppliersTable(); // New
    renderCustomersTable(); // New
    renderTransactionsTable(); // New
    renderUserRolesTable();
    renderUsersTable();
    renderSettingsPage();
    renderReportsPage();
}

function setupEventListeners() {
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleSidebar);
    document.getElementById('mobileOverlay').addEventListener('click', toggleSidebar);
}

// --- THEME & LAYOUT ---
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
    renderDashboard(); // Re-render chart with new theme colors
}

function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById(`${pageId}-page`).style.display = 'block';
    let title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, ' ');
    if (title === 'Purchase orders') title = 'Purchase Orders';
    document.getElementById('pageTitle').textContent = title;
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.nav-link[onclick="showPage('${pageId}')"]`).classList.add('active');
    if (window.innerWidth <= 992) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('mobileOverlay').classList.remove('active');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('mobileOverlay').classList.toggle('active');
}

// --- MODAL MANAGEMENT ---
function openModal(modalId) { document.getElementById(modalId).classList.remove('hidden'); }
function closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

function showConfirmModal(title, text, onConfirm) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalText').textContent = text;
    const confirmBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.onclick = () => {
        onConfirm();
        closeModal('confirmModal');
    };
    cancelBtn.onclick = () => closeModal('confirmModal');
    openModal('confirmModal');
}

// --- DASHBOARD & METRICS ---
function getDashboardMetrics() {
    const today = getTodayDate();
    const startOfMonth = getStartOfMonth();

    const dailyIncome = state.transactions
        .filter(t => t.date === today)
        .reduce((sum, t) => sum + t.total, 0);

    const monthlyIncome = state.transactions
        .filter(t => t.date >= startOfMonth)
        .reduce((sum, t) => sum + t.total, 0);

    const supplierSpend = state.purchaseOrders
        .filter(po => po.status === 'Received')
        .reduce((sum, po) => {
            const poTotal = po.items.reduce((itemSum, item) => {
                const cost = item.price || 0;
                return itemSum + (cost * item.qty);
            }, 0);
            return sum + poTotal;
        }, 0);

    const pendingOrders = state.purchaseOrders.filter(po => po.status === 'Ordered').length;

    return {
        totalItems: state.inventory.length,
        totalStock: state.inventory.reduce((s, i) => s + i.stock, 0),
        lowStockItems: state.inventory.filter(i => i.stock <= i.reorderPoint).length,
        expiredItems: state.inventory.filter(i => i.expiry && new Date(i.expiry) < new Date()).length,
        dailyIncome,
        monthlyIncome,
        totalTransactions: state.transactions.length,
        totalCustomers: state.customers.length,
        supplierSpend,
        pendingOrders,
    };
}

function renderDashboard() {
    const metrics = getDashboardMetrics();

    document.getElementById('totalItems').textContent = metrics.totalItems;
    document.getElementById('totalStock').textContent = metrics.totalStock.toLocaleString();
    document.getElementById('lowStockItems').textContent = metrics.lowStockItems;
    document.getElementById('expiredItems').textContent = metrics.expiredItems;

    document.getElementById('dailyIncome').textContent = formatCurrency(metrics.dailyIncome);
    document.getElementById('monthlyIncome').textContent = formatCurrency(metrics.monthlyIncome);
    document.getElementById('totalTransactions').textContent = metrics.totalTransactions;
    document.getElementById('totalCustomers').textContent = metrics.totalCustomers;
    document.getElementById('supplierSpend').textContent = formatCurrency(metrics.supplierSpend);
    document.getElementById('pendingOrders').textContent = metrics.pendingOrders;

    if (window.inventoryChart instanceof Chart) window.inventoryChart.destroy();
    createInventoryChart();
}

function createInventoryChart() {
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const categoryValue = state.inventory.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.stock * item.price);
        return acc;
    }, {});
    window.inventoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryValue),
            datasets: [{
                data: Object.values(categoryValue),
                backgroundColor: ['hsla(195, 70%, 55%, 0.7)', 'hsla(45, 90%, 60%, 0.7)', 'hsla(260, 60%, 65%, 0.7)'],
                borderColor: isDarkMode ? '#1f2937' : '#ffffff',
                borderWidth: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: isDarkMode ? '#f3f4f6' : '#4b5563', font: { family: "'Inter', sans-serif" } } } },
            cutout: '70%',
        }
    });
}

// --- NEW: DASHBOARD MODALS ---
function showDashboardDetails(cardType) {
    const modalTitle = document.getElementById('detailsModalTitle');
    const modalBody = document.getElementById('detailsModalBody');
    modalBody.innerHTML = ''; // Clear previous content

    let tableHtml = '<div class="table-wrapper"><table>';
    const today = getTodayDate();
    const startOfMonth = getStartOfMonth();

    switch(cardType) {
        case 'dailyIncome':
            modalTitle.textContent = "Today's Transactions";
            const todaysTransactions = state.transactions.filter(t => t.date === today);
            tableHtml += '<thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th></tr></thead><tbody>';
            if (todaysTransactions.length > 0) {
                todaysTransactions.forEach(t => {
                    const customer = state.customers.find(c => c.id === t.customerId);
                    const itemSummary = t.items.map(item => `${item.qty} x ${item.sku}`).join(', ');
                    tableHtml += `<tr><td>${t.id}</td><td>${customer?.name || 'N/A'}</td><td>${itemSummary}</td><td>${formatCurrency(t.total)}</td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="4" style="text-align:center;">No transactions today.</td></tr>';
            }
            break;

        case 'monthlyIncome':
            modalTitle.textContent = "Monthly Income (Day by Day)";
            const monthlyTransactions = state.transactions.filter(t => t.date >= startOfMonth);
            const dailyTotals = monthlyTransactions.reduce((acc, t) => {
                acc[t.date] = (acc[t.date] || 0) + t.total;
                return acc;
            }, {});
            tableHtml += '<thead><tr><th>Date</th><th>Total Income</th></tr></thead><tbody>';
            if (Object.keys(dailyTotals).length > 0) {
                Object.entries(dailyTotals).sort().reverse().forEach(([date, total]) => {
                    tableHtml += `<tr><td>${new Date(date).toLocaleDateString()}</td><td>${formatCurrency(total)}</td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="2" style="text-align:center;">No transactions this month.</td></tr>';
            }
            break;

        case 'lowStockItems':
            modalTitle.textContent = "Low Stock Items";
            const lowStockItems = state.inventory.filter(i => i.stock <= i.reorderPoint);
            tableHtml += '<thead><tr><th>Item</th><th>SKU</th><th>Stock</th><th>Reorder Point</th></tr></thead><tbody>';
            if (lowStockItems.length > 0) {
                lowStockItems.forEach(i => {
                    tableHtml += `<tr><td>${i.name}</td><td>${i.sku}</td><td>${i.stock}</td><td>${i.reorderPoint}</td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="4" style="text-align:center;">No low stock items.</td></tr>';
            }
            break;

        case 'expiredItems':
            modalTitle.textContent = "Expired Items";
            const expiredItems = state.inventory.filter(i => i.expiry && new Date(i.expiry) < new Date());
            tableHtml += '<thead><tr><th>Item</th><th>SKU</th><th>Expiry Date</th></tr></thead><tbody>';
            if (expiredItems.length > 0) {
                expiredItems.forEach(i => {
                    tableHtml += `<tr><td>${i.name}</td><td>${i.sku}</td><td>${new Date(i.expiry).toLocaleDateString()}</td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="3" style="text-align:center;">No expired items.</td></tr>';
            }
            break;

        case 'supplierSpend':
            modalTitle.textContent = "Received Purchase Orders (Total Spend)";
            const receivedPOs = state.purchaseOrders.filter(po => po.status === 'Received');
            tableHtml += '<thead><tr><th>PO Number</th><th>Supplier</th><th>Date</th><th>Total Value</th></tr></thead><tbody>';
            if (receivedPOs.length > 0) {
                receivedPOs.forEach(po => {
                    const supplier = state.suppliers.find(s => s.id === po.supplierId);
                    const totalValue = po.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
                    tableHtml += `<tr><td>${po.poNumber}</td><td>${supplier?.name || 'N/A'}</td><td>${new Date(po.date).toLocaleDateString()}</td><td>${formatCurrency(totalValue)}</td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="4" style="text-align:center;">No received purchase orders.</td></tr>';
            }
            break;

        case 'pendingOrders':
            modalTitle.textContent = "Pending Purchase Orders";
            const pendingPOs = state.purchaseOrders.filter(po => po.status === 'Ordered');
            tableHtml += '<thead><tr><th>PO Number</th><th>Supplier</th><th>Expected Date</th><th>Status</th></tr></thead><tbody>';
            if (pendingPOs.length > 0) {
                pendingPOs.forEach(po => {
                    const supplier = state.suppliers.find(s => s.id === po.supplierId);
                    tableHtml += `<tr><td>${po.poNumber}</td><td>${supplier?.name || 'N/A'}</td><td>${new Date(po.date).toLocaleDateString()}</td><td><span class="status-badge info">${po.status}</span></td></tr>`;
                });
            } else {
                tableHtml += '<tr><td colspan="4" style="text-align:center;">No pending purchase orders.</td></tr>';
            }
            break;

        default:
            tableHtml = '<p>Details not available.</p>';
    }

    if (cardType !== 'default') {
        tableHtml += '</tbody></table></div>';
        modalBody.innerHTML = tableHtml;
    }
    openModal('detailsModal');
}

// --- INVENTORY CRUD ---
function renderInventoryTable() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    tableBody.innerHTML = state.inventory.map(item => {
        const isExpired = item.expiry && new Date(item.expiry) < new Date();
        const isLowStock = item.stock <= item.reorderPoint;
        let statusBadge = `<span class="status-badge success">In Stock</span>`;
        if (isExpired) statusBadge = `<span class="status-badge danger">Expired</span>`;
        else if (isLowStock) statusBadge = `<span class="status-badge warning">Low Stock</span>`;

        return `<tr>
            <td><div class="td-primary">${item.name}</div><div class="td-secondary">${item.category}</div></td>
            <td>${item.sku}</td>
            <td>${item.category}</td>
            <td>${item.stock}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${item.reorderPoint}</td>
            <td>${statusBadge}</td>
            <td><div class="action-buttons">
                <button class="action-btn" title="Edit" onclick="openItemModal('${item.sku}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deleteItem('${item.sku}')"><i class="fas fa-trash-alt"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

function openItemModal(sku = null) {
    const form = document.getElementById('itemForm');
    form.reset();
    document.getElementById('itemModalTitle').textContent = sku ? 'Edit Item' : 'Add New Item';
    document.getElementById('itemSku').disabled = !!sku;

    // Populate Supplier dropdown
    const supplierSelect = document.getElementById('itemSupplier');
    supplierSelect.innerHTML = '<option value="">-- None --</option>' + state.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    if (sku) {
        const item = state.inventory.find(i => i.sku === sku);
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemSku').value = item.sku;
        document.getElementById('itemSku-edit').value = item.sku;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemStock').value = item.stock;
        document.getElementById('itemReorder').value = item.reorderPoint;
        document.getElementById('itemExpiry').value = item.expiry;

        // Find supplier by SKU and select them
        const supplier = state.suppliers.find(s => s.suppliedSkus.includes(item.sku));
        document.getElementById('itemSupplier').value = supplier ? supplier.id : '';

    } else {
        document.getElementById('itemSku-edit').value = '';
        document.getElementById('itemReorder').value = state.settings.defaultReorder;
    }
    openModal('itemModal');
}

function saveItem() {
    const skuToEdit = document.getElementById('itemSku-edit').value;
    const sku = document.getElementById('itemSku').value;
    if (!sku) { alert('SKU is required.'); return; }

    // This is just a fallback. The *real* supplier/SKU link
    // is managed in the supplier modal. This is just for display.
    const selectedSupplierId = parseInt(document.getElementById('itemSupplier').value) || null;

    const newItemData = {
        name: document.getElementById('itemName').value,
        sku: sku,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        stock: parseInt(document.getElementById('itemStock').value),
        reorderPoint: parseInt(document.getElementById('itemReorder').value),
        expiry: document.getElementById('itemExpiry').value || null,
    };

    if (skuToEdit) {
        const itemIndex = state.inventory.findIndex(i => i.sku === skuToEdit);
        state.inventory[itemIndex] = newItemData;
    } else {
        if (state.inventory.some(i => i.sku === sku)) {
            alert('An item with this SKU already exists.');
            return;
        }
        state.inventory.push(newItemData);
    }

    // Update supplier link
    if (selectedSupplierId) {
        const supplier = state.suppliers.find(s => s.id === selectedSupplierId);
        if (supplier && !supplier.suppliedSkus.includes(sku)) {
            supplier.suppliedSkus.push(sku);
        }
    }

    closeModal('itemModal');
    renderAll();
}

function deleteItem(sku) {
    showConfirmModal('Delete Item', `Are you sure you want to delete item with SKU: ${sku}? This cannot be undone.`, () => {
        state.inventory = state.inventory.filter(i => i.sku !== sku);
        // Also remove from any supplier lists
        state.suppliers.forEach(s => {
            s.suppliedSkus = s.suppliedSkus.filter(sSku => sSku !== sku);
        });
        renderAll();
    });
}

// --- PURCHASE ORDER CRUD ---
function renderPOTable() {
    const tableBody = document.querySelector('#poTable tbody');
    tableBody.innerHTML = state.purchaseOrders.slice().reverse().map(po => {
        const supplier = state.suppliers.find(s => s.id === po.supplierId);
        const totalItems = po.items.reduce((sum, item) => sum + item.qty, 0);
        const isReceived = po.status.toLowerCase() === 'received';
        let statusBadge = isReceived ? `<span class="status-badge success">Received</span>` : `<span class="status-badge info">Ordered</span>`;

        return `<tr>
            <td><div class="td-primary">${po.poNumber}</div></td>
            <td><div>${supplier?.name || 'N/A'}</div><div class="td-secondary">${supplier?.email || ''}</div></td>
            <td>${new Date(po.date).toLocaleDateString()}</td>
            <td>${totalItems}</td>
            <td>${statusBadge}</td>
            <td><div class="action-buttons">
                <button class="action-btn" title="Mark as Received" onclick="receivePO('${po.poNumber}')" ${isReceived ? 'disabled' : ''}><i class="fas fa-check-circle"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deletePO('${po.poNumber}')"><i class="fas fa-trash-alt"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

function openPOModal(poNumber = null) { // For now, only supports adding
    document.getElementById('poForm').reset();
    document.getElementById('poModalTitle').textContent = 'Create Purchase Order';
    document.getElementById('poItemsContainer').innerHTML = '';

    const supplierSelect = document.getElementById('poSupplier');
    supplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>' + state.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    // NEW: Add event listener to filter items
    supplierSelect.onchange = updatePoItemDropdowns;

    document.getElementById('poDate').value = getTodayDate();

    addPoItem(); // Start with one item row
    updatePoItemDropdowns(); // Filter it
    openModal('poModal');
}

// NEW: Filter PO item dropdowns based on supplier
function updatePoItemDropdowns() {
    const supplierId = parseInt(document.getElementById('poSupplier').value);
    const supplier = state.suppliers.find(s => s.id === supplierId);

    let itemOptions = '<option value="">-- Select Item --</option>';

    if (supplier) {
        // Filter inventory to only items this supplier provides
        const supplierItems = state.inventory.filter(i => supplier.suppliedSkus.includes(i.sku));
        itemOptions = supplierItems.map(i => `<option value="${i.sku}" data-price="${i.price}">${i.name} (${i.sku})</option>`).join('');
        if(supplierItems.length === 0) itemOptions = '<option value="">-- No items linked to this supplier --</option>';
    } else {
        // Show all items if no supplier is selected (or default)
        // itemOptions = state.inventory.map(i => `<option value="${i.sku}" data-price="${i.price}">${i.name} (${i.sku})</option>`).join('');
    }

    // Update all existing dropdowns
    document.querySelectorAll('#poItemsContainer .po-item-select').forEach(select => {
        select.innerHTML = itemOptions;
        // Auto-select first item if list is new
        if (select.innerHTML !== '') select.selectedIndex = 0;
        updatePoItemCost(select); // Update cost field
    });
}

// NEW: Helper to update cost when item selection changes
function updatePoItemCost(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const priceInput = selectElement.closest('.form-grid').querySelector('.po-item-price');

    if (selectedOption && selectedOption.dataset.price) {
        const salePrice = parseFloat(selectedOption.dataset.price);
        // Guess cost is 70% of sale price
        priceInput.value = (salePrice * 0.7).toFixed(2);
    } else {
        priceInput.value = '';
    }
}


function addPoItem() {
    const container = document.getElementById('poItemsContainer');
    const itemRow = document.createElement('div');
    itemRow.className = 'form-grid';
    itemRow.style.cssText = 'grid-template-columns: 1fr 1fr 1fr 50px; align-items: flex-end; margin-bottom: 1rem;';

    itemRow.innerHTML = `
        <div class="form-group" style="margin:0;">
            <label class="form-label">Item</label>
            <select class="form-select po-item-select" onchange="updatePoItemCost(this)"></select>
        </div>
        <div class="form-group" style="margin:0;">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-input po-item-qty" value="1" min="1">
        </div>
        <div class="form-group" style="margin:0;">
            <label class="form-label">Cost per Item</label>
            <input type="number" class="form-input po-item-price" step="0.01" placeholder="Cost">
        </div>
        <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()" style="padding: 0.6rem; height: 46px; margin-bottom: 0.1rem;"><i class="fas fa-trash-alt"></i></button>
    `;
    container.appendChild(itemRow);
    updatePoItemDropdowns(); // Populate the new row with correct items
}

function savePO() {
    const supplierId = parseInt(document.getElementById('poSupplier').value);
    const date = document.getElementById('poDate').value;
    if (!supplierId || !date) { alert('Please select a supplier and delivery date.'); return; }

    const items = Array.from(document.querySelectorAll('#poItemsContainer .form-grid')).map(row => ({
        sku: row.querySelector('.po-item-select').value,
        qty: parseInt(row.querySelector('.po-item-qty').value),
        price: parseFloat(row.querySelector('.po-item-price').value) || 0 // Store cost price
    })).filter(item => item.sku && item.qty > 0);

    if (items.length === 0) { alert('Please add at least one item.'); return; }

    const newPO = {
        poNumber: `PO-${Date.now()}`,
        supplierId, date, items, status: 'Ordered'
    };
    state.purchaseOrders.push(newPO);
    renderAll();
    closeModal('poModal');
}

function deletePO(poNumber) {
    showConfirmModal('Delete Purchase Order', `Are you sure you want to delete PO #${poNumber}?`, () => {
        state.purchaseOrders = state.purchaseOrders.filter(po => po.poNumber !== poNumber);
        renderAll();
    });
}

function receivePO(poNumber) {
    const po = state.purchaseOrders.find(p => p.poNumber === poNumber);
    if (!po || po.status === 'Received') return;

    showConfirmModal('Receive Order', `Mark PO #${poNumber} as received? This will add items to your stock.`, () => {
        po.items.forEach(orderItem => {
            const inventoryItem = state.inventory.find(invItem => invItem.sku === orderItem.sku);
            if (inventoryItem) {
                inventoryItem.stock += orderItem.qty;
                // This is where you would update average cost, etc.
            }
        });
        po.status = 'Received';
        renderAll();
    });
}

// --- NEW: SUPPLIERS CRUD ---
function renderSuppliersTable() {
    const tableBody = document.querySelector('#suppliersTable tbody');
    tableBody.innerHTML = state.suppliers.map(s => {
        const suppliedItems = s.suppliedSkus.join(', ');

        return `<tr>
            <td><div class="td-primary">${s.name}</div></td>
            <td>${s.phone || '-'}</td>
            <td>${s.email || '-'}</td>
            <td>${s.address || '-'}</td>
            <td><div class="td-secondary" style="white-space: normal; max-width: 200px;">${suppliedItems || 'None'}</div></td>
            <td><div class="action-buttons">
                <button class="action-btn" title="Edit" onclick="openSupplierModal(${s.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" title="Delete" onclick="deleteSupplier(${s.id})"><i class="fas fa-trash-alt"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

function openSupplierModal(id = null) {
    const form = document.getElementById('supplierForm');
    form.reset();
    document.getElementById('supplierModalTitle').textContent = id ? 'Edit Supplier' : 'Add New Supplier';
    tempSupplierSkus = []; // Reset temp list

    if (id) {
        const supplier = state.suppliers.find(s => s.id === id);
        document.getElementById('supplierId-edit').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierEmail').value = supplier.email;
        document.getElementById('supplierAddress').value = supplier.address;
        // Load current SKUs into the temp list for editing
        tempSupplierSkus = [...supplier.suppliedSkus];
    } else {
        document.getElementById('supplierId-edit').value = '';
    }
    renderSupplierSkuList(); // Render the list
    openModal('supplierModal');
}

// NEW: Render the list of SKUs in the supplier modal
function renderSupplierSkuList() {
    const listContainer = document.getElementById('supplierSkuList');
    listContainer.innerHTML = '';
    if (tempSupplierSkus.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 1rem;">No products added.</p>';
        return;
    }
    tempSupplierSkus.forEach(sku => {
        const item = state.inventory.find(i => i.sku === sku);
        listContainer.innerHTML += `
            <div class="sku-list-item">
                <div>
                    <div class="sku-name">${item?.name || 'Unknown Item'}</div>
                    <div class="sku-id">${sku}</div>
                </div>
                <button type="button" class="action-btn delete" title="Remove" onclick="removeSupplierSku('${sku}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
}

// NEW: Add SKU (simulated scan)
function addSupplierSku() {
    const input = document.getElementById('supplierSkuInput');
    const spinner = document.getElementById('scannerSpinner');
    const sku = input.value.trim().toUpperCase();

    if (!sku) return;

    // 1. Check if SKU exists in inventory
    const itemExists = state.inventory.some(i => i.sku === sku);
    if (!itemExists) {
        alert('Error: SKU not found in Item Catalog. Please add the item to the catalog first.');
        return;
    }

    // 2. Check if already in temp list
    if (tempSupplierSkus.includes(sku)) {
        alert('This SKU is already added to this supplier.');
        input.value = '';
        return;
    }

    // 3. Simulate scan/add
    spinner.style.display = 'inline-block';
    setTimeout(() => {
        tempSupplierSkus.push(sku);
        renderSupplierSkuList();
        input.value = '';
        spinner.style.display = 'none';
    }, 500); // 0.5 sec animation
}

// NEW: Remove SKU from temp list
function removeSupplierSku(sku) {
    tempSupplierSkus = tempSupplierSkus.filter(s => s !== sku);
    renderSupplierSkuList();
}

function saveSupplier() {
    const idToEdit = document.getElementById('supplierId-edit').value;
    const newSupplierData = {
        id: idToEdit ? parseInt(idToEdit) : Date.now(),
        name: document.getElementById('supplierName').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value,
        suppliedSkus: [...tempSupplierSkus] // Save from the temp list
    };

    if (idToEdit) {
        const index = state.suppliers.findIndex(s => s.id === parseInt(idToEdit));
        state.suppliers[index] = newSupplierData;
    } else {
        state.suppliers.push(newSupplierData);
    }
    closeModal('supplierModal');
    renderAll();
}

function deleteSupplier(id) {
    // Check if supplier is tied to POs first
    const pos = state.purchaseOrders.filter(po => po.supplierId === id);
    if (pos.length > 0) {
        alert('Cannot delete supplier. They are associated with purchase orders. Please delete or re-assign POs first.');
        return;
    }

    showConfirmModal('Delete Supplier', `Are you sure you want to delete this supplier? This will also remove their associated item links.`, () => {
        state.suppliers = state.suppliers.filter(s => s.id !== id);
        renderAll();
    });
}

// --- NEW: CUSTOMERS CRUD ---
function renderCustomersTable() {
    const tableBody = document.querySelector('#customersTable tbody');
    tableBody.innerHTML = state.customers.map(c => {
        const totalSpent = state.transactions
            .filter(t => t.customerId === c.id)
            .reduce((sum, t) => sum + t.total, 0);

        return `<tr>
            <td><div class="td-primary">${c.name}</div></td>
            <td>${c.email || '-'}</td>
            <td>${c.phone || '-'}</td>
            <td>${formatCurrency(totalSpent)}</td>
            <td><div class="action-buttons">
                <button class="action-btn" title="Edit" onclick="openCustomerModal(${c.id})"><i class="fas fa-edit"></i></button>
                ${c.id !== 1 ? `<button class="action-btn delete" title="Delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div></td>
        </tr>`;
    }).join('');
}

function openCustomerModal(id = null) {
    const form = document.getElementById('customerForm');
    form.reset();
    document.getElementById('customerModalTitle').textContent = id ? 'Edit Customer' : 'Add New Customer';

    if (id) {
        const customer = state.customers.find(c => c.id === id);
        document.getElementById('customerId-edit').value = customer.id;
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerEmail').value = customer.email;
        document.getElementById('customerPhone').value = customer.phone;
        // Don't allow editing "Walk-in Customer"
        document.getElementById('customerName').disabled = (id === 1);
    } else {
        document.getElementById('customerId-edit').value = '';
        document.getElementById('customerName').disabled = false;
    }
    openModal('customerModal');
}

function saveCustomer() {
    const idToEdit = document.getElementById('customerId-edit').value;
    if (idToEdit && parseInt(idToEdit) === 1) { // Prevent editing "Walk-in"
        closeModal('customerModal');
        return;
    }
    const newCustomer = {
        id: idToEdit ? parseInt(idToEdit) : Date.now(),
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
    };

    if (idToEdit) {
        const index = state.customers.findIndex(c => c.id === parseInt(idToEdit));
        state.customers[index] = newCustomer;
    } else {
        state.customers.push(newCustomer);
    }
    closeModal('customerModal');
    renderAll();
}

function deleteCustomer(id) {
    if (id === 1) { // Prevent deleting "Walk-in"
        alert('Cannot delete the default "Walk-in Customer".');
        return;
    }
    // Check if customer has transactions
    const transactions = state.transactions.filter(t => t.customerId === id);
    if (transactions.length > 0) {
        alert('Cannot delete customer. They have past transactions. You can anonymize them by editing their details.');
        return;
    }

    showConfirmModal('Delete Customer', `Are you sure you want to delete this customer?`, () => {
        state.customers = state.customers.filter(c => c.id !== id);
        renderAll();
    });
}

// --- NEW: TRANSACTIONS (No Add Function) ---
function renderTransactionsTable() {
    const tableBody = document.querySelector('#transactionsTable tbody');
    tableBody.innerHTML = state.transactions.slice().reverse().map(t => {
        const customer = state.customers.find(c => c.id === t.customerId);
        const itemSummary = t.items.map(item => `${item.qty} x ${item.sku}`).join(', ');

        return `<tr>
            <td><div class="td-primary">${t.id}</div></td>
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td>${customer?.name || 'N/A'}</td>
            <td><div class="td-secondary" style="white-space: normal; max-width: 300px;">${itemSummary}</div></td>
            <td>${formatCurrency(t.total)}</td>
            <td><div class="action-buttons">
                </div></td>
        </tr>`;
    }).join('');
}
// All other transaction functions (openTransactionModal, saveTransaction, etc.) removed as requested.


// --- REPORTS ---
function renderReportsPage() {
    document.getElementById('reportDate').textContent = new Date().toLocaleString();
    const metrics = getDashboardMetrics();

    // Summary Cards
    document.getElementById('reportDailyIncome').textContent = formatCurrency(metrics.dailyIncome);
    document.getElementById('reportMonthlyIncome').textContent = formatCurrency(metrics.monthlyIncome);
    document.getElementById('reportTotalSales').textContent = metrics.totalTransactions;
    document.getElementById_('reportSupplierSpend').textContent = formatCurrency(metrics.supplierSpend);

    // PO Report Table
    const poReportTable = document.querySelector('#poReportTable tbody');
    poReportTable.innerHTML = state.purchaseOrders.map(po => {
        const supplier = state.suppliers.find(s => s.id === po.supplierId);
        const totalValue = po.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        return `<tr>
            <td>${po.poNumber}</td>
            <td>${supplier?.name || 'N/A'}</td>
            <td>${new Date(po.date).toLocaleDateString()}</td>
            <td>${po.status}</td>
            <td>${formatCurrency(totalValue)}</td>
        </tr>`;
    }).join('');
    if (state.purchaseOrders.length === 0) poReportTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">No purchase orders found.</td></tr>`;

    // Sales Report Table
    const salesReportTable = document.querySelector('#salesReportTable tbody');
    salesReportTable.innerHTML = state.transactions.map(t => {
        const customer = state.customers.find(c => c.id === t.customerId);
        const items = t.items.reduce((sum, i) => sum + i.qty, 0);
        return `<tr>
            <td>${t.id}</td>
            <td>${customer?.name || 'N/A'}</td>
            <td>${new Date(t.date).toLocaleDateString()}</td>
            <td>${items}</td>
            <td>${formatCurrency(t.total)}</td>
        </tr>`;
    }).join('');
    if (state.transactions.length === 0) salesReportTable.innerHTML = `<tr><td colspan="5" style="text-align:center;">No sales transactions found.</td></tr>`;

    // Low Stock Report
    const lowStockItems = state.inventory.filter(i => i.stock <= i.reorderPoint);
    const lowStockTable = document.querySelector('#lowStockReportTable tbody');
    lowStockTable.innerHTML = lowStockItems.map(item => `<tr><td>${item.name}</td><td>${item.sku}</td><td>${item.stock}</td><td>${item.reorderPoint}</td></tr>`).join('');
    if (lowStockItems.length === 0) lowStockTable.innerHTML = `<tr><td colspan="4" style="text-align:center;">No low stock items.</td></tr>`;

    // Inventory Value Report
    const valueReport = state.inventory.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = { count: 0, value: 0 };
        acc[item.category].count++;
        acc[item.category].value += item.stock * item.price;
        return acc;
    }, {});
    const valueTable = document.querySelector('#inventoryValueReportTable tbody');
    valueTable.innerHTML = Object.entries(valueReport).map(([category, data]) => `<tr><td>${category}</td><td>${data.count}</td><td>${formatCurrency(data.value)}</td></tr>`).join('');
}

// NEW: Print Report Section
function printReportSection(sectionId) {
    const body = document.body;
    if (sectionId === 'reportContainer') {
        // Printing ALL
        body.classList.remove('printing-active');
        document.querySelectorAll('.report-section').forEach(el => el.classList.remove('printing-section'));
    } else {
        // Printing one section
        body.classList.add('printing-active');
        document.querySelectorAll('.report-section').forEach(el => el.classList.remove('printing-section'));
        document.getElementById(sectionId).classList.add('printing-section');
    }

    window.print();

    // Clean up classes after print dialog closes
    setTimeout(() => {
        body.classList.remove('printing-active');
        document.querySelectorAll('.report-section').forEach(el => el.classList.remove('printing-section'));
    }, 500);
}


// --- SETTINGS (USERS & APP) ---
function renderUserRolesTable() {
    const tableBody = document.querySelector('#userRolesTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = state.users.slice(0, 5).map(user => `<tr>
        <td><div class="td-primary">${user.username}</div></td><td>${user.email}</td>
        <td><span class="status-badge info">${user.role}</span></td>
        <td><select class="form-select" data-userid="${user.id}" onchange="changeUserRole(this)" style="width: 100%; min-width: 150px;">
            <option value="Staff" ${user.role === 'Staff' ? 'selected' : ''}>Staff</option>
            <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
            <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
        </select></td>
    </tr>`).join('');
}

function changeUserRole(selectElement) {
    const userId = parseInt(selectElement.dataset.userid);
    const newRole = selectElement.value;
    const user = state.users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        renderAll(); // Re-render to ensure all tables are consistent
    }
}

function renderSettingsPage() {
    document.getElementById('settingCurrency').value = state.settings.currency;
    document.getElementById('settingReorder').value = state.settings.defaultReorder;
}

function saveSettings() {
    state.settings.currency = document.getElementById('settingCurrency').value;
    state.settings.defaultReorder = parseInt(document.getElementById('settingReorder').value);
    alert('Settings saved!');
    renderAll(); // Re-render to apply new currency symbol etc.
}

// --- USERS CRUD (Full page) ---
function renderUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    tbody.innerHTML = state.users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td><div class="td-primary">${user.username}</div></td>
      <td><span class="status-badge info">${user.role}</span></td>
      <td>${user.phone || '-'}</td>
      <td>${user.email}</td>
      <td>${user.hireDate || '-'}</td>
      <td>******</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" title="Edit" onclick="openUserModal(${user.id})"><i class="fas fa-edit"></i></button>
          <button class="action-btn delete" title="Delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash-alt"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openUserModal(id = null) {
    const form = document.getElementById('userForm');
    form.reset();
    document.getElementById('userModalTitle').textContent = id ? 'Edit User' : 'Add User';
    document.getElementById('userPassword').placeholder = id ? 'Leave blank to keep same password' : 'Required';

    if (id) {
        const user = state.users.find(u => u.id === id);
        document.getElementById('userId-edit').value = user.id;
        document.getElementById('userName').value = user.username;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userPhone').value = user.phone;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userHireDate').value = user.hireDate;
        document.getElementById('userPassword').value = ''; // Don't show password
    } else {
        document.getElementById('userId-edit').value = '';
    }
    openModal('userModal');
}

function saveUser() {
    const idToEdit = document.getElementById('userId-edit').value;
    const password = document.getElementById('userPassword').value;

    let user;
    if (idToEdit) {
        user = state.users.find(u => u.id === parseInt(idToEdit));
        if (!user) return;
    } else {
        user = { id: Date.now() }; // Create new user object
    }

    // Update fields
    user.username = document.getElementById('userName').value;
    user.role = document.getElementById('userRole').value;
    user.phone = document.getElementById('userPhone').value;
    user.email = document.getElementById('userEmail').value;
    user.hireDate = document.getElementById('userHireDate').value;
    if (password) { // Only update password if one was entered
        user.password = password;
    } else if (!idToEdit) { // New user must have a password
        alert('Password is required for new users.');
        return;
    }

    if (!idToEdit) {
        state.users.push(user); // Add new user to state
    }
    // If editing, the user object in state is already updated by reference

    closeModal('userModal');
    renderAll(); // Re-render both user tables
}

function deleteUser(id) {
    if (id === 1) { // Prevent deleting admin
        alert('Cannot delete the primary admin user.');
        return;
    }
    showConfirmModal('Delete User', 'Are you sure you want to delete this user?', () => {
        state.users = state.users.filter(u => u.id !== id);
        renderAll();
    });
}