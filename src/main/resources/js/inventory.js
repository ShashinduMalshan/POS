// --- DATA STORE ---
let state = {
    inventory: [
        { name: 'Premium Coffee Beans', sku: 'COF-001', category: 'Beverages', stock: 50, reorderPoint: 20, price: 24.99, expiry: '2025-12-31' },
        { name: 'Iced Caramel Latte', sku: 'LAT-002', category: 'Beverages', stock: 15, reorderPoint: 30, price: 5.50, expiry: '2025-08-15' },
        { name: 'Artisan Dark Chocolate', sku: 'CHD-001', category: 'Food', stock: 8, reorderPoint: 10, price: 12.50, expiry: '2026-01-20' },
        { name: 'Gourmet Turkey Club', sku: 'SND-003', category: 'Food', stock: 25, reorderPoint: 15, price: 15.99, expiry: '2025-08-10' },
        { name: 'Branded Mug', sku: 'MUG-001', category: 'Merchandise', stock: 100, reorderPoint: 25, price: 18.00, expiry: null },
    ],
    suppliers: [
        { id: 1, name: 'Global Coffee Importers', email: 'orders@gci.com' },
        { id: 2, name: 'Fresh Food Distributors', email: 'contact@ffd.net' },
        { id: 3, name: 'Custom Merch Co.', email: 'sales@custommerch.co' },
    ],
    purchaseOrders: [
        { poNumber: 'PO-2025-001', supplierId: 1, date: '2025-07-28', items: [{sku: 'COF-001', qty: 20}], status: 'Received' },
        { poNumber: 'PO-2025-002', supplierId: 2, date: '2025-08-05', items: [{sku: 'SND-003', qty: 30}, {sku: 'CHD-001', qty: 15}], status: 'Ordered' },
    ],
    users: [
        { id: 1, name: 'Admin User', email: 'admin@propos.com', role: 'Admin' },
        { id: 2, name: 'Jane Doe', email: 'jane.d@propos.com', role: 'Manager' },
        { id: 3, name: 'John Smith', email: 'john.s@propos.com', role: 'Staff' },
    ]
};

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
    renderUserRolesTable();
    renderSuppliersTable();
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
    const title = pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-/g, ' ');
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

// --- DASHBOARD ---
function renderDashboard() {
    document.getElementById('totalItems').textContent = state.inventory.length;
    document.getElementById('totalStock').textContent = state.inventory.reduce((s, i) => s + i.stock, 0).toLocaleString();
    document.getElementById('lowStockItems').textContent = state.inventory.filter(i => i.stock <= i.reorderPoint).length;
    document.getElementById('expiredItems').textContent = state.inventory.filter(i => i.expiry && new Date(i.expiry) < new Date()).length;

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
            <td>${item.sku}</td><td>${item.category}</td><td>${item.stock}</td><td>${item.reorderPoint}</td>
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
    } else {
        document.getElementById('itemSku-edit').value = '';
    }
    openModal('itemModal');
}

function saveItem() {
    const skuToEdit = document.getElementById('itemSku-edit').value;
    const sku = document.getElementById('itemSku').value;
    if (!sku) { alert('SKU is required.'); return; }

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
    closeModal('itemModal');
    renderAll();
}

function deleteItem(sku) {
    showConfirmModal('Delete Item', `Are you sure you want to delete item with SKU: ${sku}? This cannot be undone.`, () => {
        state.inventory = state.inventory.filter(i => i.sku !== sku);
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
    supplierSelect.innerHTML = state.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    addPoItem(); // Start with one item row
    openModal('poModal');
}

function addPoItem() {
    const container = document.getElementById('poItemsContainer');
    const itemRow = document.createElement('div');
    itemRow.className = 'form-grid';
    itemRow.style.cssText = 'align-items: flex-end; margin-bottom: 1rem;';
    const itemOptions = state.inventory.map(i => `<option value="${i.sku}">${i.name} (${i.sku})</option>`).join('');
    itemRow.innerHTML = `<div class="form-group" style="margin:0;"><label class="form-label">Item</label><select class="form-select po-item-select">${itemOptions}</select></div><div class="form-group" style="margin:0;"><label class="form-label">Quantity</label><input type="number" class="form-input po-item-qty" value="1" min="1"></div>`;
    container.appendChild(itemRow);
}

function savePO() {
    const supplierId = parseInt(document.getElementById('poSupplier').value);
    const date = document.getElementById('poDate').value;
    if (!supplierId || !date) { alert('Please select a supplier and delivery date.'); return; }

    const items = Array.from(document.querySelectorAll('#poItemsContainer .form-grid')).map(row => ({
        sku: row.querySelector('.po-item-select').value,
        qty: parseInt(row.querySelector('.po-item-qty').value)
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
            }
        });
        po.status = 'Received';
        renderAll();
    });
}

// --- REPORTS ---
function renderReportsPage() {
    document.getElementById('reportDate').textContent = new Date().toLocaleString();

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
    valueTable.innerHTML = Object.entries(valueReport).map(([category, data]) => `<tr><td>${category}</td><td>${data.count}</td><td>$${data.value.toFixed(2)}</td></tr>`).join('');
}


// --- SETTINGS (USERS & SUPPLIERS) ---
function renderUserRolesTable() {
    const tableBody = document.querySelector('#userRolesTable tbody');
    tableBody.innerHTML = state.users.map(user => `<tr>
        <td><div class="td-primary">${user.name}</div></td><td>${user.email}</td>
        <td><span class="status-badge info">${user.role}</span></td>
        <td><select class="form-select" data-userid="${user.id}" onchange="changeUserRole(this)"><option value="Staff" ${user.role === 'Staff' ? 'selected' : ''}>Staff</option><option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option><option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option></select></td>
    </tr>`).join('');
}

function changeUserRole(selectElement) {
    const userId = parseInt(selectElement.dataset.userid);
    const newRole = selectElement.value;
    const user = state.users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        renderUserRolesTable();
    }
}

function renderSuppliersTable() {
    const tableBody = document.querySelector('#suppliersTable tbody');
    tableBody.innerHTML = state.suppliers.map(s => `<tr>
        <td>${s.name}</td><td>${s.email}</td>
        <td><div class="action-buttons">
            <button class="action-btn" title="Edit" onclick="openSupplierModal(${s.id})"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" title="Delete" onclick="deleteSupplier(${s.id})"><i class="fas fa-trash-alt"></i></button>
        </div></td>
    </tr>`).join('');
}

function openSupplierModal(id = null) {
    const form = document.getElementById('supplierForm');
    form.reset();
    document.getElementById('supplierModalTitle').textContent = id ? 'Edit Supplier' : 'Add New Supplier';

    if (id) {
        const supplier = state.suppliers.find(s => s.id === id);
        document.getElementById('supplierId-edit').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierEmail').value = supplier.email;
    } else {
        document.getElementById('supplierId-edit').value = '';
    }
    openModal('supplierModal');
}

function saveSupplier() {
    const idToEdit = document.getElementById('supplierId-edit').value;
    const newSupplierData = {
        id: idToEdit ? parseInt(idToEdit) : Date.now(),
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierEmail').value,
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
    showConfirmModal('Delete Supplier', `Are you sure you want to delete this supplier?`, () => {
        state.suppliers = state.suppliers.filter(s => s.id !== id);
        renderAll();
    });
}
