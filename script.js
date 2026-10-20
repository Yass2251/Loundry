/* ============================================================
   LaundryFlow — script.js
   Sistem Manajemen Laundry

   localStorage hanya menyimpan data pada browser dan perangkat
   yang sama. Aplikasi ini belum mendukung sinkronisasi antarperangkat.
   ============================================================ */

(function () {
  'use strict';

  // ── Storage Keys ────────────────────────────────────────
  const KEYS = {
    orders: 'lf_orders',
    payments: 'lf_payments',
    services: 'lf_services',
    settings: 'lf_settings',
    theme: 'lf_theme',
    initialized: 'lf_initialized',
  };

  // ── Helpers ─────────────────────────────────────────────

  /** Generate a unique ID */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Format number as Rupiah */
  function rupiah(n) {
    if (n == null || isNaN(n)) return 'Rp0';
    return 'Rp' + Math.round(Number(n)).toLocaleString('id-ID');
  }

  /** Format date to Indonesian locale */
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Format date long */
  function formatDateLong(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** Get today as YYYY-MM-DD */
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Get date string offset from today */
  function dateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Normalize name for grouping */
  function normalizeName(name) {
    return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  // ── Data Layer ──────────────────────────────────────────

  function loadData(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('LaundryFlow: data corrupt untuk key', key, e);
      localStorage.removeItem(key);
      return null;
    }
  }

  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getOrders() { return loadData(KEYS.orders) || []; }
  function setOrders(data) { saveData(KEYS.orders, data); }

  function getPayments() { return loadData(KEYS.payments) || []; }
  function setPayments(data) { saveData(KEYS.payments, data); }

  function getServices() { return loadData(KEYS.services) || []; }
  function setServices(data) { saveData(KEYS.services, data); }

  function getSettings() {
    return loadData(KEYS.settings) || {
      businessName: 'LaundryFlow',
      businessAddress: '',
      businessPhone: ''
    };
  }
  function setSettings(data) { saveData(KEYS.settings, data); }

  // ── Default Services ────────────────────────────────────

  const DEFAULT_SERVICES = [
    { id: uid(), name: 'Cuci Kering', pricePerKg: 6000, active: true },
    { id: uid(), name: 'Cuci Setrika', pricePerKg: 8000, active: true },
    { id: uid(), name: 'Setrika Saja', pricePerKg: 5000, active: true },
    { id: uid(), name: 'Express', pricePerKg: 12000, active: true },
  ];

  // ── Demo Data ───────────────────────────────────────────

  function generateDemoData() {
    var services = DEFAULT_SERVICES.map(function (s) { return Object.assign({}, s, { id: uid() }); });
    setServices(services);

    var today = todayStr();

    // Helper to build order number from date offset
    function makeOrderNum(daysAgo, seq) {
      var d = new Date();
      d.setDate(d.getDate() - daysAgo);
      var prefix = 'LF-' +
        d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0');
      return prefix + '-' + String(seq).padStart(3, '0');
    }

    var orders = [
      {
        id: uid(),
        orderNumber: makeOrderNum(2, 1),
        customerName: 'Andi Pratama',
        customerPhone: '081234567890',
        dateIn: dateOffset(-2),
        dateEstimate: dateOffset(1),
        serviceName: 'Cuci Setrika',
        weight: 3,
        pricePerKg: 8000,
        totalPrice: 24000,
        status: 'Dicuci',
        notes: '',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: uid(),
        orderNumber: makeOrderNum(1, 1),
        customerName: 'Siti Nurhaliza',
        customerPhone: '082198765432',
        dateIn: dateOffset(-1),
        dateEstimate: dateOffset(2),
        serviceName: 'Cuci Kering',
        weight: 2,
        pricePerKg: 6000,
        totalPrice: 12000,
        status: 'Menunggu',
        notes: 'Pakaian putih pisah',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: uid(),
        orderNumber: makeOrderNum(1, 2),
        customerName: 'Rizky Maulana',
        customerPhone: '085312345678',
        dateIn: dateOffset(-1),
        dateEstimate: today,
        serviceName: 'Express',
        weight: 1.5,
        pricePerKg: 12000,
        totalPrice: 18000,
        status: 'Siap Diambil',
        notes: '',
        createdAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      },
      {
        id: uid(),
        orderNumber: makeOrderNum(3, 1),
        customerName: 'Nisa Amelia',
        customerPhone: '',
        dateIn: dateOffset(-3),
        dateEstimate: dateOffset(-1),
        serviceName: 'Setrika Saja',
        weight: 2,
        pricePerKg: 5000,
        totalPrice: 10000,
        status: 'Selesai',
        notes: '',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    setOrders(orders);

    // Demo payments
    var payments = [
      {
        id: uid(),
        orderId: orders[0].id,
        amount: 10000,
        date: dateOffset(-1),
        note: 'DP awal',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: uid(),
        orderId: orders[2].id,
        amount: 18000,
        date: today,
        note: 'Lunas',
        createdAt: new Date().toISOString(),
      },
      {
        id: uid(),
        orderId: orders[3].id,
        amount: 10000,
        date: dateOffset(-1),
        note: 'Bayar tunai',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    setPayments(payments);
    localStorage.setItem(KEYS.initialized, 'true');
  }

  // ── Order Number Generator ──────────────────────────────

  function generateOrderNumber(existingOrders, date) {
    const d = date || new Date();
    const prefix = 'LF-' +
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0');

    let maxSeq = 0;
    existingOrders.forEach(o => {
      if (o.orderNumber && o.orderNumber.startsWith(prefix)) {
        const seq = parseInt(o.orderNumber.split('-').pop(), 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });

    return prefix + '-' + String(maxSeq + 1).padStart(3, '0');
  }

  // ── Payment Status Calculator ───────────────────────────

  function calculatePaymentStatus(order) {
    const payments = getPayments().filter(p => p.orderId === order.id);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = order.totalPrice - totalPaid;

    let status;
    if (totalPaid <= 0) {
      status = 'Belum Dibayar';
    } else if (remaining <= 0) {
      status = 'Lunas';
    } else {
      status = 'Dibayar Sebagian';
    }

    return { totalPaid, remaining: Math.max(0, remaining), status };
  }

  // ── Status Badge Helper ─────────────────────────────────

  function statusBadgeClass(status) {
    switch (status) {
      case 'Menunggu': return 'badge-gray';
      case 'Dicuci': return 'badge-blue';
      case 'Dikeringkan': return 'badge-orange';
      case 'Disetrika': return 'badge-purple';
      case 'Siap Diambil': return 'badge-green';
      case 'Selesai': return 'badge-teal';
      case 'Dibatalkan': return 'badge-danger';
      default: return 'badge-gray';
    }
  }

  function paymentBadgeClass(status) {
    switch (status) {
      case 'Lunas': return 'badge-green';
      case 'Dibayar Sebagian': return 'badge-orange';
      case 'Belum Dibayar': return 'badge-danger';
      default: return 'badge-gray';
    }
  }

  // ── Toast Notification ──────────────────────────────────

  function showToast(message, type) {
    type = type || 'success';
    const container = document.getElementById('toastContainer');

    const iconPaths = {
      success: '<circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/>',
      error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
      info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
      warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    };

    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML =
      '<svg class="toast-icon" viewBox="0 0 24 24">' + (iconPaths[type] || iconPaths.info) + '</svg>' +
      '<span class="toast-msg">' + escapeHtml(message) + '</span>' +
      '<button class="toast-close" aria-label="Tutup">' +
      '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    toast.querySelector('.toast-close').addEventListener('click', function () {
      removeToast(toast);
    });

    container.appendChild(toast);

    setTimeout(function () {
      removeToast(toast);
    }, 4000);
  }

  function removeToast(el) {
    if (!el || el.classList.contains('removing')) return;
    el.classList.add('removing');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  /** Escape HTML to prevent XSS */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Modal Helpers ───────────────────────────────────────

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.show').forEach(function (m) {
      m.classList.remove('show');
    });
    document.body.style.overflow = '';
  }

  // ── Confirm Dialog ──────────────────────────────────────

  let confirmCallback = null;

  function showConfirm(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = onConfirm;
    openModal('confirmModal');
  }

  // ── Navigation ──────────────────────────────────────────

  const pages = {
    dashboard: { title: 'Dashboard', section: 'pageDashboard' },
    orders: { title: 'Pesanan Laundry', section: 'pageOrders' },
    customers: { title: 'Pelanggan', section: 'pageCustomers' },
    services: { title: 'Layanan', section: 'pageServices' },
    reports: { title: 'Laporan', section: 'pageReports' },
    settings: { title: 'Pengaturan', section: 'pageSettings' },
  };

  let currentPage = 'dashboard';

  function navigateTo(page) {
    if (!pages[page]) return;
    currentPage = page;

    // Update nav active
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-page') === page);
    });

    // Update page sections
    document.querySelectorAll('.page-section').forEach(function (sec) {
      sec.classList.toggle('active', sec.id === pages[page].section);
    });

    // Update header
    document.getElementById('headerTitle').textContent = pages[page].title;

    // Close mobile sidebar
    closeSidebar();

    // Render page
    renderCurrentPage();
  }

  function renderCurrentPage() {
    switch (currentPage) {
      case 'dashboard': renderDashboard(); break;
      case 'orders': renderOrders(); break;
      case 'customers': renderCustomers(); break;
      case 'services': renderServices(); break;
      case 'reports': renderReports(); break;
      case 'settings': renderSettingsPage(); break;
    }
  }

  // ── Mobile Sidebar ──────────────────────────────────────

  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }

  // ── Render: Dashboard ───────────────────────────────────

  function renderDashboard() {
    const orders = getOrders();
    const payments = getPayments();
    const today = todayStr();

    // Stats
    const activeOrders = orders.filter(function (o) {
      return o.status !== 'Selesai' && o.status !== 'Dibatalkan';
    });
    const waitingOrders = orders.filter(function (o) { return o.status === 'Menunggu'; });
    const readyOrders = orders.filter(function (o) { return o.status === 'Siap Diambil'; });
    const todayRevenue = payments
      .filter(function (p) { return p.date === today; })
      .reduce(function (sum, p) { return sum + Number(p.amount); }, 0);

    document.getElementById('dashboardStats').innerHTML =
      renderStatCard('Pesanan Aktif', activeOrders.length, 'teal', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
      renderStatCard('Menunggu Diproses', waitingOrders.length, 'orange', '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>') +
      renderStatCard('Siap Diambil', readyOrders.length, 'green', '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>') +
      renderStatCard('Pendapatan Hari Ini', rupiah(todayRevenue), 'blue', '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', true);

    // Alerts
    renderDashboardAlerts(orders);

    // Recent orders
    renderRecentOrders(orders);
  }

  function renderStatCard(label, value, colorClass, iconSvg, isCurrency) {
    return '<div class="stat-card">' +
      '<div class="stat-icon ' + colorClass + '"><svg viewBox="0 0 24 24">' + iconSvg + '</svg></div>' +
      '<div class="stat-info">' +
      '<div class="stat-label">' + escapeHtml(label) + '</div>' +
      '<div class="stat-value' + (isCurrency ? ' currency' : '') + '">' + escapeHtml(String(value)) + '</div>' +
      '</div></div>';
  }

  function renderDashboardAlerts(orders) {
    const today = new Date(todayStr());

    const nearDeadline = orders.filter(function (o) {
      if (o.status === 'Selesai' || o.status === 'Dibatalkan') return false;
      const est = new Date(o.dateEstimate);
      const diff = (est - today) / 86400000;
      return diff >= 0 && diff <= 1;
    });

    const overdue = orders.filter(function (o) {
      if (o.status === 'Selesai' || o.status === 'Dibatalkan') return false;
      return new Date(o.dateEstimate) < today;
    });

    const ready = orders.filter(function (o) { return o.status === 'Siap Diambil'; });

    const container = document.getElementById('dashboardAlerts');

    if (nearDeadline.length === 0 && overdue.length === 0 && ready.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML =
      '<h3>Ringkasan Operasional</h3>' +
      '<div class="alert-cards">' +
      '<div class="alert-card warning">' +
      '<div class="alert-card-title">Mendekati Tenggat</div>' +
      '<div class="alert-card-value">' + nearDeadline.length + '</div>' +
      '<div class="alert-card-desc">pesanan harus segera diselesaikan</div>' +
      '</div>' +
      '<div class="alert-card danger">' +
      '<div class="alert-card-title">Terlambat</div>' +
      '<div class="alert-card-value">' + overdue.length + '</div>' +
      '<div class="alert-card-desc">pesanan melewati estimasi selesai</div>' +
      '</div>' +
      '<div class="alert-card success">' +
      '<div class="alert-card-title">Siap Diambil</div>' +
      '<div class="alert-card-value">' + ready.length + '</div>' +
      '<div class="alert-card-desc">pesanan menunggu pengambilan</div>' +
      '</div>' +
      '</div>';
  }

  function renderRecentOrders(orders) {
    const sorted = orders.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const recent = sorted.slice(0, 5);

    const tbody = document.getElementById('recentOrdersBody');
    const mobileDiv = document.getElementById('recentOrdersMobile');

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Belum ada pesanan</p></div></td></tr>';
      mobileDiv.innerHTML = '<div class="empty-state"><p>Belum ada pesanan</p></div>';
      return;
    }

    let tbodyHtml = '';
    let mobileHtml = '';

    recent.forEach(function (order) {
      const pay = calculatePaymentStatus(order);

      tbodyHtml +=
        '<tr>' +
        '<td><strong style="color:var(--clr-primary)">' + escapeHtml(order.orderNumber) + '</strong></td>' +
        '<td>' + escapeHtml(order.customerName) + '</td>' +
        '<td>' + escapeHtml(order.serviceName) + '</td>' +
        '<td>' + rupiah(order.totalPrice) + '</td>' +
        '<td><span class="badge ' + statusBadgeClass(order.status) + '">' + escapeHtml(order.status) + '</span></td>' +
        '<td><span class="badge ' + paymentBadgeClass(pay.status) + '">' + escapeHtml(pay.status) + '</span></td>' +
        '<td class="col-actions"><button class="btn btn-sm btn-secondary" onclick="window.LF.openDetail(\'' + order.id + '\')">Detail</button></td>' +
        '</tr>';

      mobileHtml += renderMobileOrderCard(order, pay);
    });

    tbody.innerHTML = tbodyHtml;
    mobileDiv.innerHTML = mobileHtml;
  }

  function renderMobileOrderCard(order, pay) {
    return '<div class="mobile-order-card">' +
      '<div class="mobile-order-card-header">' +
      '<div><div class="mobile-order-card-id">' + escapeHtml(order.orderNumber) + '</div>' +
      '<div class="mobile-order-card-customer">' + escapeHtml(order.customerName) + '</div></div>' +
      '<span class="badge ' + statusBadgeClass(order.status) + '">' + escapeHtml(order.status) + '</span>' +
      '</div>' +
      '<div class="mobile-order-card-meta">' +
      '<div>Layanan: <strong>' + escapeHtml(order.serviceName) + '</strong></div>' +
      '<div>Berat: <strong>' + order.weight + ' kg</strong></div>' +
      '<div>Total: <strong>' + rupiah(order.totalPrice) + '</strong></div>' +
      '<div>Bayar: <span class="badge ' + paymentBadgeClass(pay.status) + '">' + escapeHtml(pay.status) + '</span></div>' +
      '</div>' +
      '<div class="mobile-order-card-footer">' +
      '<span style="font-size:12px;color:var(--clr-text-secondary)">' + formatDate(order.dateIn) + '</span>' +
      '<button class="btn btn-sm btn-secondary" onclick="window.LF.openDetail(\'' + order.id + '\')">Detail</button>' +
      '</div></div>';
  }

  // ── Render: Orders Page ─────────────────────────────────

  const ORDERS_PER_PAGE = 10;
  let ordersCurrentPage = 1;

  function renderOrders() {
    let orders = getOrders();

    // Search
    const search = (document.getElementById('orderSearch').value || '').toLowerCase().trim();
    if (search) {
      orders = orders.filter(function (o) {
        return o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          (o.customerPhone || '').toLowerCase().includes(search);
      });
    }

    // Filter status
    const filterStatus = document.getElementById('filterStatus').value;
    if (filterStatus) {
      orders = orders.filter(function (o) { return o.status === filterStatus; });
    }

    // Filter payment
    const filterPayment = document.getElementById('filterPayment').value;
    if (filterPayment) {
      orders = orders.filter(function (o) {
        return calculatePaymentStatus(o).status === filterPayment;
      });
    }

    // Sort
    const sortVal = document.getElementById('sortOrder').value;
    orders.sort(function (a, b) {
      switch (sortVal) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'deadline': return new Date(a.dateEstimate) - new Date(b.dateEstimate);
        case 'price-desc': return b.totalPrice - a.totalPrice;
        case 'price-asc': return a.totalPrice - b.totalPrice;
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PER_PAGE));
    if (ordersCurrentPage > totalPages) ordersCurrentPage = totalPages;
    const start = (ordersCurrentPage - 1) * ORDERS_PER_PAGE;
    const pageOrders = orders.slice(start, start + ORDERS_PER_PAGE);

    const tbody = document.getElementById('ordersTableBody');
    const mobileDiv = document.getElementById('ordersMobileCards');

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><p>Tidak ada pesanan ditemukan</p></div></td></tr>';
      mobileDiv.innerHTML = '<div class="empty-state"><p>Tidak ada pesanan ditemukan</p></div>';
      document.getElementById('ordersPagination').innerHTML = '';
      return;
    }

    let tbodyHtml = '';
    let mobileHtml = '';

    pageOrders.forEach(function (order) {
      const pay = calculatePaymentStatus(order);

      tbodyHtml +=
        '<tr>' +
        '<td><strong style="color:var(--clr-primary)">' + escapeHtml(order.orderNumber) + '</strong></td>' +
        '<td>' + escapeHtml(order.customerName) + (order.customerPhone ? '<br><span style="font-size:11px;color:var(--clr-text-secondary)">' + escapeHtml(order.customerPhone) + '</span>' : '') + '</td>' +
        '<td>' + escapeHtml(order.serviceName) + '</td>' +
        '<td>' + order.weight + ' kg</td>' +
        '<td>' + formatDate(order.dateIn) + '</td>' +
        '<td>' + formatDate(order.dateEstimate) + '</td>' +
        '<td>' + rupiah(order.totalPrice) + '</td>' +
        '<td><span class="badge ' + statusBadgeClass(order.status) + '">' + escapeHtml(order.status) + '</span></td>' +
        '<td><span class="badge ' + paymentBadgeClass(pay.status) + '">' + escapeHtml(pay.status) + '</span></td>' +
        '<td class="col-actions">' +
        '<button class="btn btn-sm btn-secondary" onclick="window.LF.openDetail(\'' + order.id + '\')" title="Detail">Detail</button> ' +
        '<button class="btn btn-sm btn-ghost" onclick="window.LF.editOrder(\'' + order.id + '\')" title="Edit">' +
        '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        '</button>' +
        '</td></tr>';

      mobileHtml += renderMobileOrderCard(order, pay);
    });

    tbody.innerHTML = tbodyHtml;
    mobileDiv.innerHTML = mobileHtml;

    // Pagination
    renderPagination(document.getElementById('ordersPagination'), ordersCurrentPage, totalPages, function (p) {
      ordersCurrentPage = p;
      renderOrders();
    });
  }

  function renderPagination(container, current, total, onPage) {
    if (total <= 1) { container.innerHTML = ''; return; }

    let html = '';
    html += '<button class="page-btn" ' + (current <= 1 ? 'disabled' : '') + ' data-p="' + (current - 1) + '"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>';

    for (let i = 1; i <= total; i++) {
      if (total > 7) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
          html += '<button class="page-btn' + (i === current ? ' active' : '') + '" data-p="' + i + '">' + i + '</button>';
        } else if (i === current - 2 || i === current + 2) {
          html += '<span style="padding:0 4px;color:var(--clr-text-secondary)">…</span>';
        }
      } else {
        html += '<button class="page-btn' + (i === current ? ' active' : '') + '" data-p="' + i + '">' + i + '</button>';
      }
    }

    html += '<button class="page-btn" ' + (current >= total ? 'disabled' : '') + ' data-p="' + (current + 1) + '"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>';

    container.innerHTML = html;

    container.querySelectorAll('.page-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const p = parseInt(this.getAttribute('data-p'));
        if (!isNaN(p) && p >= 1 && p <= total) onPage(p);
      });
    });
  }

  // ── Order Form Modal ────────────────────────────────────

  function openOrderModal(editId) {
    const form = document.getElementById('orderForm');
    form.reset();
    document.getElementById('orderEditId').value = '';

    // Populate service dropdown
    const services = getServices();
    const select = document.getElementById('orderService');
    select.innerHTML = '<option value="">— Pilih Layanan —</option>';
    services.forEach(function (s) {
      if (s.active || editId) {
        select.innerHTML += '<option value="' + escapeHtml(s.name) + '" data-price="' + s.pricePerKg + '">' +
          escapeHtml(s.name) + ' (' + rupiah(s.pricePerKg) + '/kg)</option>';
      }
    });

    if (editId) {
      const order = getOrders().find(function (o) { return o.id === editId; });
      if (!order) return;

      document.getElementById('orderModalTitle').textContent = 'Edit Pesanan';
      document.getElementById('orderEditId').value = editId;
      document.getElementById('orderNumber').value = order.orderNumber;
      document.getElementById('orderCustomer').value = order.customerName;
      document.getElementById('orderPhone').value = order.customerPhone || '';
      document.getElementById('orderDateIn').value = order.dateIn;
      document.getElementById('orderDateEst').value = order.dateEstimate;
      document.getElementById('orderService').value = order.serviceName;
      document.getElementById('orderWeight').value = order.weight;
      document.getElementById('orderPricePerKg').value = order.pricePerKg;
      document.getElementById('orderNotes').value = order.notes || '';

      // Ensure the service is in the dropdown even if inactive
      if (!select.querySelector('option[value="' + order.serviceName + '"]')) {
        select.innerHTML += '<option value="' + escapeHtml(order.serviceName) + '">' + escapeHtml(order.serviceName) + '</option>';
        select.value = order.serviceName;
      }
    } else {
      document.getElementById('orderModalTitle').textContent = 'Pesanan Baru';
      document.getElementById('orderNumber').value = generateOrderNumber(getOrders(), new Date());
      document.getElementById('orderDateIn').value = todayStr();
      document.getElementById('orderDateEst').value = dateOffset(3);
    }

    updateTotalPreview();
    openModal('orderModal');
  }

  function updateTotalPreview() {
    const weight = parseFloat(document.getElementById('orderWeight').value) || 0;
    const price = parseFloat(document.getElementById('orderPricePerKg').value) || 0;
    const total = weight * price;
    document.getElementById('orderTotalPreview').textContent = rupiah(total);
  }

  function saveOrder() {
    // Validate
    const customer = document.getElementById('orderCustomer').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const dateIn = document.getElementById('orderDateIn').value;
    const dateEst = document.getElementById('orderDateEst').value;
    const serviceName = document.getElementById('orderService').value;
    const weight = parseFloat(document.getElementById('orderWeight').value);
    const pricePerKg = parseFloat(document.getElementById('orderPricePerKg').value);
    const notes = document.getElementById('orderNotes').value.trim();
    const editId = document.getElementById('orderEditId').value;

    if (!customer) { showToast('Nama pelanggan wajib diisi', 'error'); return; }
    if (!dateIn) { showToast('Tanggal masuk wajib diisi', 'error'); return; }
    if (!dateEst) { showToast('Estimasi selesai wajib diisi', 'error'); return; }
    if (dateEst < dateIn) { showToast('Estimasi selesai tidak boleh lebih awal dari tanggal masuk', 'error'); return; }
    if (!serviceName) { showToast('Layanan harus dipilih', 'error'); return; }
    if (!weight || weight <= 0) { showToast('Berat harus lebih besar dari nol', 'error'); return; }
    if (isNaN(pricePerKg) || pricePerKg < 0) { showToast('Harga harus berupa angka yang valid', 'error'); return; }

    const totalPrice = weight * pricePerKg;
    let orders = getOrders();

    if (editId) {
      // Edit existing
      orders = orders.map(function (o) {
        if (o.id === editId) {
          return Object.assign({}, o, {
            customerName: customer,
            customerPhone: phone,
            dateIn: dateIn,
            dateEstimate: dateEst,
            serviceName: serviceName,
            weight: weight,
            pricePerKg: pricePerKg,
            totalPrice: totalPrice,
            notes: notes,
          });
        }
        return o;
      });
      setOrders(orders);
      showToast('Pesanan berhasil diperbarui');
    } else {
      // New order
      const newOrder = {
        id: uid(),
        orderNumber: document.getElementById('orderNumber').value,
        customerName: customer,
        customerPhone: phone,
        dateIn: dateIn,
        dateEstimate: dateEst,
        serviceName: serviceName,
        weight: weight,
        pricePerKg: pricePerKg,
        totalPrice: totalPrice,
        status: 'Menunggu',
        notes: notes,
        createdAt: new Date().toISOString(),
      };
      orders.push(newOrder);
      setOrders(orders);
      showToast('Pesanan berhasil ditambahkan');
    }

    closeModal('orderModal');
    renderCurrentPage();
  }

  // ── Order Detail Modal ──────────────────────────────────

  function openDetail(orderId) {
    const order = getOrders().find(function (o) { return o.id === orderId; });
    if (!order) return;

    const pay = calculatePaymentStatus(order);
    const payments = getPayments().filter(function (p) { return p.orderId === orderId; });
    const settings = getSettings();

    document.getElementById('detailModalTitle').textContent = 'Detail Pesanan ' + order.orderNumber;

    let html = '<div class="detail-grid">';
    html += detailItem('No. Pesanan', order.orderNumber);
    html += detailItem('Pelanggan', order.customerName + (order.customerPhone ? ' (' + order.customerPhone + ')' : ''));
    html += detailItem('Tanggal Masuk', formatDate(order.dateIn));
    html += detailItem('Estimasi Selesai', formatDate(order.dateEstimate));
    html += detailItem('Layanan', order.serviceName);
    html += detailItem('Berat', order.weight + ' kg');
    html += detailItem('Harga/kg', rupiah(order.pricePerKg));
    html += detailItem('Total Harga', rupiah(order.totalPrice));
    html += '<div class="detail-divider"></div>';
    html += detailItem('Total Pembayaran', rupiah(pay.totalPaid));
    html += detailItem('Sisa Tagihan', rupiah(pay.remaining));
    html += detailItemBadge('Status Cucian', order.status, statusBadgeClass(order.status));
    html += detailItemBadge('Pembayaran', pay.status, paymentBadgeClass(pay.status));

    if (order.notes) {
      html += '<div class="detail-divider"></div>';
      html += '<div class="detail-item detail-full"><div class="dl">Catatan</div><div class="dv">' + escapeHtml(order.notes) + '</div></div>';
    }

    html += '</div>';

    // Status change
    html += '<div class="detail-status-select">';
    html += '<label>Ubah Status:</label>';
    html += '<select id="detailStatusSelect">';
    ['Menunggu', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Siap Diambil', 'Selesai', 'Dibatalkan'].forEach(function (s) {
      html += '<option value="' + s + '"' + (order.status === s ? ' selected' : '') + '>' + s + '</option>';
    });
    html += '</select>';
    html += '<button class="btn btn-sm btn-primary" id="btnChangeStatus">Simpan Status</button>';
    html += '</div>';

    // Payment history
    html += '<div class="payment-history">';
    html += '<h4>Riwayat Pembayaran</h4>';
    if (payments.length === 0) {
      html += '<div class="payment-empty">Belum ada pembayaran tercatat</div>';
    } else {
      payments.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      payments.forEach(function (p) {
        html += '<div class="payment-item">' +
          '<span class="pi-amount">' + rupiah(p.amount) + '</span>' +
          '<span class="pi-date">' + formatDate(p.date) + '</span>' +
          (p.note ? '<span class="pi-note">' + escapeHtml(p.note) + '</span>' : '') +
          '</div>';
      });
    }
    html += '</div>';

    document.getElementById('detailModalBody').innerHTML = html;

    // Footer buttons
    let footer = '';
    if (pay.status !== 'Lunas') {
      footer += '<button class="btn btn-primary" id="btnRecordPayment" data-id="' + order.id + '">Catat Pembayaran</button>';
    }
    footer += '<button class="btn btn-secondary" id="btnEditFromDetail" data-id="' + order.id + '">Edit</button>';
    footer += '<button class="btn btn-secondary" id="btnPrintReceipt" data-id="' + order.id + '">Cetak Nota</button>';
    footer += '<button class="btn btn-danger" id="btnDeleteOrder" data-id="' + order.id + '">Hapus</button>';

    document.getElementById('detailModalFooter').innerHTML = footer;

    // Event listeners for footer buttons
    const btnStatus = document.getElementById('btnChangeStatus');
    if (btnStatus) {
      btnStatus.addEventListener('click', function () {
        const newStatus = document.getElementById('detailStatusSelect').value;
        changeOrderStatus(order.id, newStatus);
      });
    }

    const btnPay = document.getElementById('btnRecordPayment');
    if (btnPay) {
      btnPay.addEventListener('click', function () {
        openPaymentModal(this.getAttribute('data-id'));
      });
    }

    const btnEdit = document.getElementById('btnEditFromDetail');
    if (btnEdit) {
      btnEdit.addEventListener('click', function () {
        closeModal('detailModal');
        editOrder(this.getAttribute('data-id'));
      });
    }

    const btnPrint = document.getElementById('btnPrintReceipt');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        printReceipt(this.getAttribute('data-id'));
      });
    }

    const btnDel = document.getElementById('btnDeleteOrder');
    if (btnDel) {
      btnDel.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        closeModal('detailModal');
        deleteOrder(id);
      });
    }

    openModal('detailModal');
  }

  function detailItem(label, value) {
    return '<div class="detail-item"><div class="dl">' + escapeHtml(label) + '</div><div class="dv">' + escapeHtml(String(value)) + '</div></div>';
  }

  function detailItemBadge(label, value, badgeClass) {
    return '<div class="detail-item"><div class="dl">' + escapeHtml(label) + '</div><div class="dv"><span class="badge ' + badgeClass + '">' + escapeHtml(value) + '</span></div></div>';
  }

  // ── Change Order Status ─────────────────────────────────

  function changeOrderStatus(orderId, newStatus) {
    let orders = getOrders();
    orders = orders.map(function (o) {
      if (o.id === orderId) {
        return Object.assign({}, o, { status: newStatus });
      }
      return o;
    });
    setOrders(orders);
    showToast('Status cucian berhasil diubah menjadi ' + newStatus);
    closeModal('detailModal');
    renderCurrentPage();
  }

  // ── Edit Order ──────────────────────────────────────────

  function editOrder(orderId) {
    openOrderModal(orderId);
  }

  // ── Delete Order ────────────────────────────────────────

  function deleteOrder(orderId) {
    showConfirm(
      'Hapus Pesanan',
      'Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.',
      function () {
        let orders = getOrders();
        orders = orders.filter(function (o) { return o.id !== orderId; });
        setOrders(orders);

        // Also remove related payments
        let payments = getPayments();
        payments = payments.filter(function (p) { return p.orderId !== orderId; });
        setPayments(payments);

        showToast('Data berhasil dihapus');
        renderCurrentPage();
      }
    );
  }

  // ── Payment Modal ───────────────────────────────────────

  function openPaymentModal(orderId) {
    const order = getOrders().find(function (o) { return o.id === orderId; });
    if (!order) return;

    const pay = calculatePaymentStatus(order);

    if (pay.status === 'Lunas') {
      showToast('Pesanan ini sudah lunas', 'warning');
      return;
    }

    document.getElementById('paymentOrderId').value = orderId;
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentDate').value = todayStr();
    document.getElementById('paymentNote').value = '';

    document.getElementById('paymentOrderInfo').innerHTML =
      '<strong>' + escapeHtml(order.orderNumber) + '</strong> — ' + escapeHtml(order.customerName) +
      '<br>Total: ' + rupiah(order.totalPrice) + ' | Dibayar: ' + rupiah(pay.totalPaid) +
      ' | <strong>Sisa: ' + rupiah(pay.remaining) + '</strong>';

    document.getElementById('paymentAmount').max = pay.remaining;

    openModal('paymentModal');
  }

  function recordPayment() {
    const orderId = document.getElementById('paymentOrderId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const date = document.getElementById('paymentDate').value;
    const note = document.getElementById('paymentNote').value.trim();

    if (!orderId) return;

    const order = getOrders().find(function (o) { return o.id === orderId; });
    if (!order) return;

    const pay = calculatePaymentStatus(order);

    if (!amount || amount <= 0) { showToast('Nominal harus lebih besar dari nol', 'error'); return; }
    if (amount > pay.remaining + 0.01) { showToast('Nominal tidak boleh melebihi sisa tagihan (' + rupiah(pay.remaining) + ')', 'error'); return; }
    if (!date) { showToast('Tanggal pembayaran wajib diisi', 'error'); return; }

    const payments = getPayments();
    payments.push({
      id: uid(),
      orderId: orderId,
      amount: Math.min(amount, pay.remaining),
      date: date,
      note: note,
      createdAt: new Date().toISOString(),
    });
    setPayments(payments);

    showToast('Pembayaran berhasil dicatat');
    closeModal('paymentModal');
    closeModal('detailModal');
    renderCurrentPage();
  }

  // ── Print Receipt ───────────────────────────────────────

  function printReceipt(orderId) {
    const order = getOrders().find(function (o) { return o.id === orderId; });
    if (!order) return;

    const pay = calculatePaymentStatus(order);
    const settings = getSettings();

    let html = '<h2>' + escapeHtml(settings.businessName || 'LaundryFlow') + '</h2>';
    if (settings.businessAddress) {
      html += '<div class="print-subtitle">' + escapeHtml(settings.businessAddress) + '</div>';
    }
    if (settings.businessPhone) {
      html += '<div class="print-subtitle">' + escapeHtml(settings.businessPhone) + '</div>';
    }
    html += '<hr class="print-divider">';
    html += '<table>';
    html += '<tr><td>No. Pesanan</td><td>' + escapeHtml(order.orderNumber) + '</td></tr>';
    html += '<tr><td>Pelanggan</td><td>' + escapeHtml(order.customerName) + '</td></tr>';
    html += '<tr><td>Tanggal Masuk</td><td>' + formatDate(order.dateIn) + '</td></tr>';
    html += '<tr><td>Estimasi Selesai</td><td>' + formatDate(order.dateEstimate) + '</td></tr>';
    html += '<tr><td>Layanan</td><td>' + escapeHtml(order.serviceName) + '</td></tr>';
    html += '<tr><td>Berat</td><td>' + order.weight + ' kg</td></tr>';
    html += '<tr><td>Harga/kg</td><td>' + rupiah(order.pricePerKg) + '</td></tr>';
    html += '</table>';
    html += '<hr class="print-divider">';
    html += '<table>';
    html += '<tr><td>Total Harga</td><td>' + rupiah(order.totalPrice) + '</td></tr>';
    html += '<tr><td>Pembayaran</td><td>' + rupiah(pay.totalPaid) + '</td></tr>';
    html += '<tr><td>Sisa Tagihan</td><td>' + rupiah(pay.remaining) + '</td></tr>';
    html += '<tr><td>Status Bayar</td><td>' + escapeHtml(pay.status) + '</td></tr>';
    html += '</table>';
    html += '<hr class="print-divider">';
    html += '<div class="print-footer">Terima kasih atas kepercayaan Anda!</div>';

    document.getElementById('printArea').innerHTML = html;

    // Small delay to ensure DOM is ready
    setTimeout(function () {
      window.print();
    }, 100);
  }

  // ── Render: Customers Page ──────────────────────────────

  function renderCustomers() {
    const orders = getOrders();
    const search = (document.getElementById('customerSearch').value || '').toLowerCase().trim();

    // Group by phone or normalized name
    const customerMap = {};
    orders.forEach(function (o) {
      const key = o.customerPhone ? o.customerPhone : normalizeName(o.customerName);
      if (!customerMap[key]) {
        customerMap[key] = {
          name: o.customerName,
          phone: o.customerPhone || '',
          orders: [],
          totalSpent: 0,
          lastOrder: null,
        };
      }
      const c = customerMap[key];
      // Use the most recent name
      if (!c.lastOrder || new Date(o.createdAt) > new Date(c.lastOrder.createdAt)) {
        c.name = o.customerName;
        if (o.customerPhone) c.phone = o.customerPhone;
        c.lastOrder = o;
      }
      c.orders.push(o);

      const pay = calculatePaymentStatus(o);
      c.totalSpent += pay.totalPaid;
    });

    let customers = Object.values(customerMap);

    if (search) {
      customers = customers.filter(function (c) {
        return c.name.toLowerCase().includes(search) || c.phone.toLowerCase().includes(search);
      });
    }

    customers.sort(function (a, b) {
      return b.orders.length - a.orders.length;
    });

    const container = document.getElementById('customerCards');

    if (customers.length === 0) {
      container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>Tidak ada pelanggan ditemukan</p></div>';
      return;
    }

    let html = '';
    customers.forEach(function (c) {
      const initials = c.name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
      const lastDate = c.lastOrder ? formatDate(c.lastOrder.dateIn) : '-';

      html += '<div class="customer-card">' +
        '<div class="customer-card-header">' +
        '<div class="customer-avatar">' + escapeHtml(initials) + '</div>' +
        '<div><div class="customer-card-name">' + escapeHtml(c.name) + '</div>' +
        '<div class="customer-card-phone">' + (c.phone ? escapeHtml(c.phone) : 'Telepon tidak tersedia') + '</div></div>' +
        '</div>' +
        '<div class="customer-stats">' +
        '<div class="customer-stat"><div class="cs-label">Jumlah Pesanan</div><div class="cs-value">' + c.orders.length + '</div></div>' +
        '<div class="customer-stat"><div class="cs-label">Total Transaksi</div><div class="cs-value">' + rupiah(c.totalSpent) + '</div></div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--clr-text-secondary);margin-bottom:var(--sp-sm);">Pesanan terakhir: ' + lastDate + '</div>' +
        '<button class="btn btn-sm btn-secondary" onclick="window.LF.showCustomerHistory(\'' + escapeHtml(c.phone || normalizeName(c.name)) + '\')">Lihat Riwayat</button>' +
        '</div>';
    });

    container.innerHTML = html;
  }

  function showCustomerHistory(key) {
    const orders = getOrders();
    const customerOrders = orders.filter(function (o) {
      if (o.customerPhone && o.customerPhone === key) return true;
      return normalizeName(o.customerName) === key;
    });

    if (customerOrders.length === 0) return;

    const name = customerOrders[0].customerName;
    document.getElementById('customerHistoryTitle').textContent = 'Riwayat — ' + name;

    customerOrders.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    let html = '<table class="data-table"><thead><tr><th>No. Pesanan</th><th>Layanan</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>';
    customerOrders.forEach(function (o) {
      const pay = calculatePaymentStatus(o);
      html += '<tr>' +
        '<td><strong style="color:var(--clr-primary)">' + escapeHtml(o.orderNumber) + '</strong></td>' +
        '<td>' + escapeHtml(o.serviceName) + '</td>' +
        '<td>' + rupiah(o.totalPrice) + '</td>' +
        '<td><span class="badge ' + statusBadgeClass(o.status) + '">' + escapeHtml(o.status) + '</span></td>' +
        '<td><button class="btn btn-sm btn-secondary" onclick="window.LF.closeModal(\'customerHistoryModal\');window.LF.openDetail(\'' + o.id + '\')">Detail</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    document.getElementById('customerHistoryBody').innerHTML = html;
    openModal('customerHistoryModal');
  }

  // ── Render: Services Page ───────────────────────────────

  function renderServices() {
    const services = getServices();
    const container = document.getElementById('serviceCards');

    if (services.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Belum ada layanan. Tambahkan layanan baru.</p></div>';
      return;
    }

    let html = '';
    services.forEach(function (s) {
      html += '<div class="service-card' + (s.active ? '' : ' inactive') + '">' +
        '<div class="service-card-name">' + escapeHtml(s.name) + '</div>' +
        '<div class="service-card-price">' + rupiah(s.pricePerKg) + ' <span>/kg</span></div>' +
        '<div class="service-card-status">' +
        '<span class="badge ' + (s.active ? 'badge-green' : 'badge-gray') + '">' + (s.active ? 'Aktif' : 'Nonaktif') + '</span>' +
        '</div>' +
        '<div class="service-card-actions">' +
        '<button class="btn btn-sm btn-secondary" onclick="window.LF.editService(\'' + s.id + '\')">Edit</button>' +
        '<button class="btn btn-sm btn-ghost" onclick="window.LF.toggleService(\'' + s.id + '\')">' + (s.active ? 'Nonaktifkan' : 'Aktifkan') + '</button>' +
        '</div></div>';
    });

    container.innerHTML = html;
  }

  function openServiceModal(editId) {
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceEditId').value = '';

    if (editId) {
      const s = getServices().find(function (sv) { return sv.id === editId; });
      if (!s) return;

      document.getElementById('serviceModalTitle').textContent = 'Edit Layanan';
      document.getElementById('serviceEditId').value = editId;
      document.getElementById('serviceName').value = s.name;
      document.getElementById('servicePrice').value = s.pricePerKg;
      document.getElementById('serviceActive').value = String(s.active);
    } else {
      document.getElementById('serviceModalTitle').textContent = 'Tambah Layanan';
    }

    openModal('serviceModal');
  }

  function saveService() {
    const editId = document.getElementById('serviceEditId').value;
    const name = document.getElementById('serviceName').value.trim();
    const price = parseFloat(document.getElementById('servicePrice').value);
    const active = document.getElementById('serviceActive').value === 'true';

    if (!name) { showToast('Nama layanan wajib diisi', 'error'); return; }
    if (isNaN(price) || price < 0) { showToast('Harga harus berupa angka yang valid', 'error'); return; }

    let services = getServices();

    if (editId) {
      services = services.map(function (s) {
        if (s.id === editId) {
          return Object.assign({}, s, { name: name, pricePerKg: price, active: active });
        }
        return s;
      });
      showToast('Layanan berhasil diperbarui');
    } else {
      services.push({ id: uid(), name: name, pricePerKg: price, active: active });
      showToast('Layanan berhasil ditambahkan');
    }

    setServices(services);
    closeModal('serviceModal');
    renderServices();
  }

  function toggleService(serviceId) {
    let services = getServices();
    services = services.map(function (s) {
      if (s.id === serviceId) {
        return Object.assign({}, s, { active: !s.active });
      }
      return s;
    });
    setServices(services);
    showToast('Layanan berhasil diperbarui');
    renderServices();
  }

  // ── Render: Reports Page ────────────────────────────────

  function renderReports() {
    const orders = getOrders();
    const payments = getPayments();
    const period = document.getElementById('reportPeriod').value;

    // Get period date range
    const today = new Date(todayStr());
    let startDate = null;

    switch (period) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'all':
        startDate = null;
        break;
    }

    // Filter payments by period
    const periodPayments = startDate
      ? payments.filter(function (p) { return new Date(p.date) >= startDate; })
      : payments;

    // Filter orders by creation date for counts
    const periodOrders = startDate
      ? orders.filter(function (o) { return new Date(o.dateIn) >= startDate; })
      : orders;

    const totalRevenue = periodPayments.reduce(function (sum, p) { return sum + Number(p.amount); }, 0);
    const totalOrderValue = periodOrders.reduce(function (sum, o) { return sum + o.totalPrice; }, 0);
    const orderCount = periodOrders.length;
    const completedCount = periodOrders.filter(function (o) { return o.status === 'Selesai'; }).length;
    const cancelledCount = periodOrders.filter(function (o) { return o.status === 'Dibatalkan'; }).length;

    // Calculate outstanding balance
    let outstanding = 0;
    periodOrders.forEach(function (o) {
      const pay = calculatePaymentStatus(o);
      outstanding += pay.remaining;
    });

    document.getElementById('reportStats').innerHTML =
      '<div class="report-stat"><div class="rs-label">Pendapatan Diterima</div><div class="rs-value primary">' + rupiah(totalRevenue) + '</div></div>' +
      '<div class="report-stat"><div class="rs-label">Total Nilai Pesanan</div><div class="rs-value">' + rupiah(totalOrderValue) + '</div></div>' +
      '<div class="report-stat"><div class="rs-label">Jumlah Pesanan</div><div class="rs-value">' + orderCount + '</div></div>' +
      '<div class="report-stat"><div class="rs-label">Tagihan Belum Lunas</div><div class="rs-value warning">' + rupiah(outstanding) + '</div></div>' +
      '<div class="report-stat"><div class="rs-label">Pesanan Selesai</div><div class="rs-value success">' + completedCount + '</div></div>' +
      '<div class="report-stat"><div class="rs-label">Pesanan Dibatalkan</div><div class="rs-value danger">' + cancelledCount + '</div></div>';

    // Revenue chart — last 7 days
    renderRevenueChart(payments);
  }

  function renderRevenueChart(allPayments) {
    const container = document.getElementById('revenueChart');
    const days = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dayPayments = allPayments.filter(function (p) { return p.date === dateStr; });
      const total = dayPayments.reduce(function (sum, p) { return sum + Number(p.amount); }, 0);
      days.push({
        label: dayNames[d.getDay()] + ' ' + d.getDate(),
        value: total,
        dateStr: dateStr,
      });
    }

    const maxVal = Math.max.apply(null, days.map(function (d) { return d.value; }));
    const hasData = days.some(function (d) { return d.value > 0; });

    let html = '<div class="chart-title">Pendapatan 7 Hari Terakhir</div>';

    if (!hasData) {
      html += '<div class="chart-empty">Tidak ada data pembayaran dalam 7 hari terakhir</div>';
    } else {
      html += '<div class="bar-chart">';
      days.forEach(function (d) {
        const pct = maxVal > 0 ? (d.value / maxVal * 100) : 0;
        html += '<div class="bar-group">';
        if (d.value > 0) {
          html += '<div class="bar-value">' + (d.value >= 1000 ? Math.round(d.value / 1000) + 'rb' : d.value) + '</div>';
        }
        html += '<div class="bar" style="height:' + Math.max(pct, 2) + '%"></div>';
        html += '<div class="bar-label">' + d.label + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;
  }

  // ── Export CSV ──────────────────────────────────────────

  function exportCSV() {
    const orders = getOrders();
    const payments = getPayments();

    if (orders.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const rows = [
      ['No. Pesanan', 'Pelanggan', 'Telepon', 'Tanggal Masuk', 'Estimasi Selesai', 'Layanan', 'Berat (kg)', 'Harga/kg', 'Total Harga', 'Status Cucian', 'Total Pembayaran', 'Sisa Tagihan', 'Status Pembayaran'],
    ];

    orders.forEach(function (o) {
      const pay = calculatePaymentStatus(o);
      rows.push([
        o.orderNumber,
        o.customerName,
        o.customerPhone || '',
        o.dateIn,
        o.dateEstimate,
        o.serviceName,
        o.weight,
        o.pricePerKg,
        o.totalPrice,
        o.status,
        pay.totalPaid,
        pay.remaining,
        pay.status,
      ]);
    });

    // BOM for UTF-8 support in Excel
    let csv = '\uFEFF';
    rows.forEach(function (row) {
      csv += row.map(function (cell) {
        const val = String(cell).replace(/"/g, '""');
        return '"' + val + '"';
      }).join(';') + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LaundryFlow_Laporan_' + todayStr() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('CSV berhasil disiapkan');
  }

  // ── Render: Settings ────────────────────────────────────

  function renderSettingsPage() {
    const settings = getSettings();
    document.getElementById('settingBusinessName').value = settings.businessName || '';
    document.getElementById('settingBusinessAddress').value = settings.businessAddress || '';
    document.getElementById('settingBusinessPhone').value = settings.businessPhone || '';

    // Theme buttons
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme-val') === currentTheme);
    });
  }

  function saveSettings() {
    const settings = {
      businessName: document.getElementById('settingBusinessName').value.trim() || 'LaundryFlow',
      businessAddress: document.getElementById('settingBusinessAddress').value.trim(),
      businessPhone: document.getElementById('settingBusinessPhone').value.trim(),
    };
    setSettings(settings);
    showToast('Pengaturan berhasil disimpan');
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEYS.theme, theme);
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme-val') === theme);
    });
  }

  // ── Global Search ───────────────────────────────────────

  function handleGlobalSearch(query) {
    const dropdown = document.getElementById('searchDropdown');
    query = (query || '').toLowerCase().trim();

    if (!query || query.length < 2) {
      dropdown.classList.remove('show');
      return;
    }

    const orders = getOrders();
    const results = orders.filter(function (o) {
      return o.orderNumber.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        (o.customerPhone || '').toLowerCase().includes(query);
    }).slice(0, 6);

    if (results.length === 0) {
      dropdown.innerHTML = '<div class="search-no-result">Tidak ditemukan</div>';
      dropdown.classList.add('show');
      return;
    }

    let html = '';
    results.forEach(function (o) {
      html += '<div class="search-result-item" data-id="' + o.id + '">' +
        '<div class="sr-order">' + escapeHtml(o.orderNumber) + '</div>' +
        '<div class="sr-name">' + escapeHtml(o.customerName) + '</div>' +
        '<div class="sr-meta">' + escapeHtml(o.serviceName) + ' • ' + formatDate(o.dateIn) + '</div>' +
        '</div>';
    });

    dropdown.innerHTML = html;
    dropdown.classList.add('show');

    dropdown.querySelectorAll('.search-result-item').forEach(function (item) {
      item.addEventListener('click', function () {
        dropdown.classList.remove('show');
        document.getElementById('globalSearch').value = '';
        openDetail(this.getAttribute('data-id'));
      });
    });
  }

  // ── Initialize ──────────────────────────────────────────

  function init() {
    // Load theme
    const savedTheme = localStorage.getItem(KEYS.theme);
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Initialize data if first time
    if (!localStorage.getItem(KEYS.initialized)) {
      generateDemoData();
    } else {
      // Ensure services exist
      if (!getServices().length) {
        setServices(DEFAULT_SERVICES.map(function (s) { return Object.assign({}, s, { id: uid() }); }));
      }
    }

    // Set header date
    document.getElementById('headerDate').textContent = formatDateLong(todayStr());

    // Render initial page
    renderDashboard();

    // ── Event Listeners ─────────────────────────────────

    // Navigation
    document.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        navigateTo(this.getAttribute('data-page'));
      });
    });

    // Mobile sidebar
    document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    // New order buttons
    document.getElementById('btnNewOrder').addEventListener('click', function () { openOrderModal(); });
    document.getElementById('btnNewOrderPage').addEventListener('click', function () { openOrderModal(); });

    // View all orders from dashboard
    document.getElementById('btnViewAllOrders').addEventListener('click', function () { navigateTo('orders'); });

    // Order form — service change
    document.getElementById('orderService').addEventListener('change', function () {
      const selected = this.options[this.selectedIndex];
      if (selected && selected.getAttribute('data-price')) {
        document.getElementById('orderPricePerKg').value = selected.getAttribute('data-price');
      }
      updateTotalPreview();
    });

    document.getElementById('orderWeight').addEventListener('input', updateTotalPreview);
    document.getElementById('orderPricePerKg').addEventListener('input', updateTotalPreview);

    // Order form save/cancel/close
    document.getElementById('orderModalSave').addEventListener('click', saveOrder);
    document.getElementById('orderModalCancel').addEventListener('click', function () { closeModal('orderModal'); });
    document.getElementById('orderModalClose').addEventListener('click', function () { closeModal('orderModal'); });

    // Detail modal close
    document.getElementById('detailModalClose').addEventListener('click', function () { closeModal('detailModal'); });

    // Payment modal
    document.getElementById('paymentModalSave').addEventListener('click', recordPayment);
    document.getElementById('paymentModalCancel').addEventListener('click', function () { closeModal('paymentModal'); });
    document.getElementById('paymentModalClose').addEventListener('click', function () { closeModal('paymentModal'); });

    // Confirm modal
    document.getElementById('confirmOk').addEventListener('click', function () {
      closeModal('confirmModal');
      if (typeof confirmCallback === 'function') {
        confirmCallback();
        confirmCallback = null;
      }
    });
    document.getElementById('confirmCancel').addEventListener('click', function () {
      closeModal('confirmModal');
      confirmCallback = null;
    });
    document.getElementById('confirmModalClose').addEventListener('click', function () {
      closeModal('confirmModal');
      confirmCallback = null;
    });

    // Service modal
    document.getElementById('btnAddService').addEventListener('click', function () { openServiceModal(); });
    document.getElementById('serviceModalSave').addEventListener('click', saveService);
    document.getElementById('serviceModalCancel').addEventListener('click', function () { closeModal('serviceModal'); });
    document.getElementById('serviceModalClose').addEventListener('click', function () { closeModal('serviceModal'); });

    // Customer history modal
    document.getElementById('customerHistoryClose').addEventListener('click', function () { closeModal('customerHistoryModal'); });

    // Orders page filters
    document.getElementById('orderSearch').addEventListener('input', function () { ordersCurrentPage = 1; renderOrders(); });
    document.getElementById('filterStatus').addEventListener('change', function () { ordersCurrentPage = 1; renderOrders(); });
    document.getElementById('filterPayment').addEventListener('change', function () { ordersCurrentPage = 1; renderOrders(); });
    document.getElementById('sortOrder').addEventListener('change', function () { ordersCurrentPage = 1; renderOrders(); });

    // Customer search
    document.getElementById('customerSearch').addEventListener('input', function () { renderCustomers(); });

    // Report period
    document.getElementById('reportPeriod').addEventListener('change', function () { renderReports(); });

    // Export CSV
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);

    // Settings
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(this.getAttribute('data-theme-val'));
      });
    });

    // Reset demo
    document.getElementById('btnResetDemo').addEventListener('click', function () {
      showConfirm('Reset Data Demo', 'Semua data saat ini akan dihapus dan diganti dengan data demo. Lanjutkan?', function () {
        localStorage.removeItem(KEYS.orders);
        localStorage.removeItem(KEYS.payments);
        localStorage.removeItem(KEYS.services);
        localStorage.removeItem(KEYS.initialized);
        generateDemoData();
        showToast('Data demo berhasil direset');
        renderCurrentPage();
      });
    });

    // Clear all data
    document.getElementById('btnClearAll').addEventListener('click', function () {
      showConfirm('Hapus Semua Data', 'Seluruh data pesanan, pembayaran, dan layanan akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?', function () {
        localStorage.removeItem(KEYS.orders);
        localStorage.removeItem(KEYS.payments);
        localStorage.removeItem(KEYS.services);
        localStorage.setItem(KEYS.initialized, 'true'); // Prevent demo data from loading
        showToast('Semua data berhasil dihapus');
        renderCurrentPage();
      });
    });

    // Global search
    document.getElementById('globalSearch').addEventListener('input', function () {
      handleGlobalSearch(this.value);
    });

    document.getElementById('globalSearch').addEventListener('focus', function () {
      if (this.value.length >= 2) handleGlobalSearch(this.value);
    });

    // Close search dropdown when clicking outside
    document.addEventListener('click', function (e) {
      const dropdown = document.getElementById('searchDropdown');
      const search = document.getElementById('globalSearch');
      if (!search.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.remove('show');
          document.body.style.overflow = '';
          confirmCallback = null;
        }
      });
    });

    // Keyboard: Escape to close modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllModals();
        confirmCallback = null;
      }
    });
  }

  // ── Public API (for onclick handlers) ───────────────────
  window.LF = {
    openDetail: openDetail,
    editOrder: editOrder,
    deleteOrder: deleteOrder,
    editService: openServiceModal,
    toggleService: toggleService,
    showCustomerHistory: showCustomerHistory,
    closeModal: closeModal,
  };

  // ── Boot ────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
