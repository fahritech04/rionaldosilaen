const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz4gXBN1WqpwZYZwJZNUI6vn78EAeAaHrZqtbPZn3iPznxwrtDuoPNX3HxK6CjHGMMoOg/exec";

// ==========================================
// Tema & UI Logic
// ==========================================
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
updateToggleIcon(savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = htmlEl.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  htmlEl.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateToggleIcon(newTheme);
  updateChartsTheme(newTheme);
});

function updateToggleIcon(theme) {
  themeToggle.innerHTML = theme === "dark" ? '<span class="icon">☀️</span>' : '<span class="icon">🌙</span>';
}

// ==========================================
// MOBILE MENU LOGIC
// ==========================================
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navTabs = document.querySelector(".nav-tabs");

mobileMenuToggle.addEventListener("click", () => {
  mobileMenuToggle.classList.toggle("is-active");
  navTabs.classList.toggle("is-open");
});

// Close mobile menu when a link is clicked
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      mobileMenuToggle.classList.remove("is-active");
      navTabs.classList.remove("is-open");
    }
  });
});
// ==========================================
// SCROLL SPY — Active Nav Link
// ==========================================
const navLinks = document.querySelectorAll(".nav-link[data-section]");
const sections = document.querySelectorAll(".dashboard-section");

window.addEventListener(
  "scroll",
  () => {
    let currentSection = "";
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) currentSection = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === currentSection);
    });
  },
  { passive: true },
);

// ==========================================
// INTERSECTION OBSERVER — Reveal Animations
// ==========================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // Animate only once
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ==========================================
// CHART.JS — CONFIGURATION
// ==========================================
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
const activeCharts = [];

// Dynamic theme color palette
function getColors(theme) {
  const isDark = theme === "dark";
  return {
    text: isDark ? "#cbd5e1" : "#425069",
    primary: isDark ? "#ff2a75" : "#cc5f3d",
    accent: isDark ? "#00e5ff" : "#1f5f77",
    gray: isDark ? "#a855f7" : "#425069",
    grid: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(22, 37, 59, 0.1)",
    pieBorder: "transparent",
    ttBg: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
    ttText: isDark ? "#f8fafc" : "#16253b",
    ttBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(22, 37, 59, 0.1)",
  };
}

// Reusable tooltip config generator
function getTooltipConfig(colors) {
  return {
    backgroundColor: colors.ttBg,
    titleColor: colors.ttText,
    bodyColor: colors.ttText,
    titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: "bold" },
    bodyFont: { family: "'Space Grotesk', sans-serif", size: 13 },
    padding: 12,
    cornerRadius: 8,
    borderColor: colors.ttBorder,
    borderWidth: 1,
    usePointStyle: true,
    boxPadding: 8,
    callbacks: {
      labelPointStyle: function (context) {
        return { pointStyle: "rectRounded", rotation: 0 };
      },
    },
  };
}

// Hex to RGBA helper (for line chart fills)
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==========================================
// CHART DATA DEFINITIONS (Data-Driven, DRY)
// All data verified from Excel source file.
// ==========================================
const chartDefinitions = [
  // --- DASHBOARD SECTION ---
  {
    id: "sisaStokChart",
    type: "bar",
    data: {
      labels: [],
      datasets: [{ label: "Sisa Stok (kg)", data: [], colorKey: "accent", barThickness: 30, borderRadius: 6 }],
    },
    options: { indexAxis: "y", scales: { x: { max: 120 } } },
  },
  {
    id: "vpiChart",
    type: "pie",
    data: {
      labels: [],
      datasets: [{ data: [], colorKey: ["primary", "accent", "gray"], isPie: true }],
    },
    options: { layout: { padding: 20 } },
  },
  {
    id: "performaChart",
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Tepat Waktu", data: [], colorKey: "accent" },
        { label: "Total Pengiriman", data: [], colorKey: "primary" },
      ],
    },
    options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } },
  },
  {
    id: "pesananChart",
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Total Pesanan", data: [], colorKey: "accent" },
        { label: "Retur", data: [], colorKey: "primary" },
      ],
    },
    options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } },
  },
  // --- FIFO SECTION ---
  {
    id: "fifoChart",
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Total Gudang (kg)", data: [], colorKey: "accent", tension: 0.3, fill: true },
        { label: "Margin Kapasitas (kg)", data: [], colorKey: "primary", tension: 0.3, borderDash: [6, 4] },
      ],
    },
    options: { scales: { y: { beginAtZero: true, max: 500, ticks: { stepSize: 100 } } } },
  },
];

// ==========================================
// CHART INITIALIZATION (Single Reusable Loop)
// ==========================================
function initCharts() {
  const currentTheme = htmlEl.getAttribute("data-theme");
  const colors = getColors(currentTheme);
  Chart.defaults.color = colors.text;

  chartDefinitions.forEach((config) => {
    const ctx = document.getElementById(config.id).getContext("2d");

    // Process each dataset based on chart type
    const processedDatasets = config.data.datasets.map((ds) => {
      const bgColor = Array.isArray(ds.colorKey) ? ds.colorKey.map((k) => colors[k]) : colors[ds.colorKey];

      const baseDs = { data: ds.data, backgroundColor: bgColor };
      if (ds.label) baseDs.label = ds.label;

      if (ds.isPie) {
        // PIE: Clean glassmorphism shape without borders, smooth offset
        baseDs.borderWidth = 0;
        baseDs.hoverBorderWidth = 0;
        baseDs.hoverOffset = 8;
      } else if (config.type === "line") {
        // LINE: border color, tension, fill, points
        baseDs.borderColor = bgColor;
        baseDs.backgroundColor = ds.fill ? hexToRgba(bgColor, 0.15) : "transparent";
        baseDs.pointBackgroundColor = bgColor;
        baseDs.tension = ds.tension || 0.3;
        baseDs.fill = ds.fill || false;
        baseDs.pointRadius = 4;
        baseDs.pointHoverRadius = 6;
        baseDs.borderWidth = 2.5;
        if (ds.borderDash) baseDs.borderDash = ds.borderDash;
      } else {
        // BAR: radius, thickness
        baseDs.borderRadius = ds.borderRadius || 4;
        if (ds.barThickness) baseDs.barThickness = ds.barThickness;
        else {
          baseDs.barPercentage = 0.8;
          baseDs.categoryPercentage = 0.6;
        }
      }
      return baseDs;
    });

    // Build chart options
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart", // Non-bouncy to prevent cursor flicker
        delay: (context) => {
          let delay = 0;
          if (context.type === "data" && context.mode === "default" && !context.active) {
            delay = context.dataIndex * 150 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "rectRounded", boxWidth: 12, padding: 20, font: { family: "'Space Grotesk', sans-serif", size: 13 } } },
        tooltip: getTooltipConfig(colors),
      },
      ...config.options,
    };

    // Inject grid colors for axis-based charts
    if ((config.type === "bar" || config.type === "line") && baseOptions.scales) {
      Object.keys(baseOptions.scales).forEach((axis) => {
        const isHiddenGrid = (config.options.indexAxis === "y" && axis === "y") || (config.options.indexAxis !== "y" && axis === "x");
        baseOptions.scales[axis].grid = {
          color: colors.grid,
          display: !isHiddenGrid,
          drawBorder: false,
        };
      });
    }

    const chartInstance = new Chart(ctx, {
      type: config.type,
      data: { labels: config.data.labels, datasets: processedDatasets },
      options: baseOptions,
    });

    activeCharts.push({ instance: chartInstance, config });
  });
}

// ==========================================
// THEME UPDATER (Single Reusable Loop)
// ==========================================
function updateChartsTheme(theme) {
  const colors = getColors(theme);
  Chart.defaults.color = colors.text;

  activeCharts.forEach(({ instance: chart, config }) => {
    // Update dataset colors
    chart.data.datasets.forEach((ds, i) => {
      const origDs = config.data.datasets[i];
      const newColor = Array.isArray(origDs.colorKey) ? origDs.colorKey.map((k) => colors[k]) : colors[origDs.colorKey];

      ds.backgroundColor = newColor;

      if (origDs.isPie) {
        ds.borderColor = colors.pieBorder;
      } else if (config.type === "line") {
        ds.borderColor = newColor;
        ds.pointBackgroundColor = newColor;
        if (origDs.fill) ds.backgroundColor = hexToRgba(newColor, 0.15);
      }
    });

    // Update scales
    if (chart.options.scales) {
      ["x", "y"].forEach((axis) => {
        if (chart.options.scales[axis]) {
          chart.options.scales[axis].ticks.color = colors.text;
          if (chart.options.scales[axis].grid) chart.options.scales[axis].grid.color = colors.grid;
        }
      });
    }

    // Update plugins
    chart.options.plugins.legend.labels.color = colors.text;
    Object.assign(chart.options.plugins.tooltip, getTooltipConfig(colors));

    // Sync transition update (400ms CSS)
    const originalDuration = chart.options.animation.duration;
    chart.options.animation.duration = 400;
    chart.update();
    setTimeout(() => {
      chart.options.animation.duration = originalDuration;
    }, 450);
  });
}

// ==========================================
// DYNAMIC CHART UPDATER
// ==========================================
function updateChartData(chartId, newLabels, newDatasetsData, newDatasetLabels = null) {
  const chartObj = activeCharts.find((c) => c.config.id === chartId);
  if (!chartObj) return;
  const chart = chartObj.instance;

  chart.data.labels = newLabels;
  newDatasetsData.forEach((newData, index) => {
    if (chart.data.datasets[index]) {
      chart.data.datasets[index].data = newData;
      if (newDatasetLabels && newDatasetLabels[index]) {
        chart.data.datasets[index].label = newDatasetLabels[index];
      }
    }
  });
  chart.update();
}
// ==========================================
// START
initCharts();

// ==========================================
// TOAST NOTIFICATION LOGIC
// ==========================================
function showToast(message, type = "success", autoClose = true) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Hapus loading toast yang ada (jika ada)
  if (type !== "loading") {
    const existingLoadings = container.querySelectorAll(".toast.loading");
    existingLoadings.forEach((el) => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 400);
    });
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "";
  if (type === "success") {
    icon =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
  } else if (type === "error") {
    icon =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === "loading") {
    icon = '<svg class="toast-spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';
  }

  toast.innerHTML = `${icon} <span style="font-weight:500;">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  if (autoClose) {
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
}

// ==========================================
// UNIVERSAL PAGINATION LOGIC
// ==========================================
const paginationState = {};

function initPaginatedTable(config) {
  paginationState[config.id] = {
    data: config.data || [],
    currentPage: 1,
    itemsPerPage: config.itemsPerPage || 5,
    renderRow: config.renderRow,
  };
  renderTablePage(config.id);
}

function renderTablePage(id) {
  const state = paginationState[id];
  if (!state) return;
  const tbody = document.getElementById(`${id}-tbody`);
  if (!tbody) return;
  tbody.innerHTML = "";

  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const pageData = state.data.slice(startIndex, startIndex + state.itemsPerPage);

  pageData.forEach((row) => {
    tbody.innerHTML += state.renderRow(row);
  });
  renderPaginationControls(id);
}

function renderPaginationControls(id) {
  const state = paginationState[id];
  const container = document.getElementById(`${id}-pagination`);
  if (!container) return;

  container.innerHTML = "";
  const totalPages = Math.ceil(state.data.length / state.itemsPerPage);

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.classList.add("page-btn");
    if (i === state.currentPage) btn.classList.add("active");
    btn.innerText = i;
    btn.addEventListener("click", () => {
      state.currentPage = i;
      renderTablePage(id);
    });
    container.appendChild(btn);
  }
}

// ------------------------------------------
// MAIN FETCH DATA
// ------------------------------------------
async function fetchDashboardData() {
  if (!WEB_APP_URL) return;

  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("hidden");
    loader.style.display = "flex";
  }

  try {
    // Tambahkan parameter waktu untuk mencegah browser menggunakan Cache lama (Cache-Busting)
    const fetchUrl = WEB_APP_URL + (WEB_APP_URL.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
    const response = await fetch(fetchUrl);
    const data = await response.json();

    if (data.status === "success") {
      updateDashboardUI(data);
      showToast("Data berhasil disinkronisasi", "success");
    } else {
      showToast("Error Server: " + data.message, "error");
      console.error("Server error:", data.message);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("Error Fetch/CORS: " + error.message, "error");
    const vendorBestEl = document.querySelector(".vendor-best");
    if (vendorBestEl) vendorBestEl.innerText = "Offline / Error";
  } finally {
    if (loader) {
      loader.classList.add("hidden");
      // Hardcode hide just to be 100% sure
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }
  }
}

// ==========================================
// REUSABLE FORM SUBMISSION WITH SYNC
// ==========================================
async function submitFormWithSync(formElement, url, successMessage) {
  const formData = new FormData(formElement);
  const data = Object.fromEntries(formData.entries());

  showToast("Menyimpan data...", "loading");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });

    const result = await response.json();
    if (result.status === "success") {
      showToast(successMessage, "success");
      formElement.reset();

      // Jeda 1 detik agar user membaca "Berhasil Tersimpan", lalu loading sinkronisasi
      setTimeout(() => {
        showToast("Sinkronisasi data terbaru...", "loading");
        fetchDashboardData();
      }, 1200);

      return true;
    } else {
      showToast("Gagal menyimpan: " + result.message, "error");
      return false;
    }
  } catch (error) {
    showToast("Terjadi kesalahan jaringan", "error");
    console.error("Submit error:", error);
    return false;
  }
}

function updateDashboardUI(data) {
  const num = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
  const str = (v) => String(v || "").trim();

  // ================================================================
  // 1. VENDOR TERBAIK + VPI CHART + TABEL VPI
  // vpi_scoring_data: [Vendor, Quality, Delivery, Price, VPI, Ranking] — D23:I25
  // vpi_raw_data:     [Vendor, Qty Diterima, Qty Defect, Total Kirim, Tepat Waktu, Harga] — D8:I10
  // ================================================================
  if (data.vpi_scoring_data && data.vpi_scoring_data.length > 0) {
    // Vendor Terbaik = Ranking == 1 (kolom index 5)
    const best = data.vpi_scoring_data.find((r) => str(r[5]) === "1" || str(r[5]) === "1.0");
    if (best) document.querySelector(".vendor-best").innerText = str(best[0]);

    // VPI Chart — label: Vendor, nilai: skor VPI (kolom index 4)
    updateChartData(
      "vpiChart",
      data.vpi_scoring_data.map((r) => str(r[0])),
      [data.vpi_scoring_data.map((r) => num(r[4]))],
    );

    // Tabel VPI Scoring
    initPaginatedTable({
      id: "vpi-scoring",
      data: data.vpi_scoring_data,
      itemsPerPage: 5,
      renderRow: (r) => `<tr><td>${str(r[0])}</td><td>${str(r[1])}</td><td>${str(r[2])}</td><td>${str(r[3])}</td><td>${str(r[4])}</td><td>${str(r[5])}</td></tr>`,
    });
  }

  // Tabel VPI Raw
  if (data.vpi_raw_data && data.vpi_raw_data.length > 0) {
    initPaginatedTable({
      id: "vpi-raw",
      data: data.vpi_raw_data,
      itemsPerPage: 5,
      renderRow: (r) => `<tr><td>${str(r[0])}</td><td>${str(r[1])}</td><td>${str(r[2])}</td><td>${str(r[3])}</td><td>${str(r[4])}</td><td>${str(r[5])}</td></tr>`,
    });
  }

  // ================================================================
  // 2. SISA STOK GUDANG + CHART FIFO
  // fifo_stok_data:
  //   baris 0..N-1 = sisa stok [Nama, Masuk, Keluar, Sisa]
  //   baris N      = header detail ("Jenis (IN/OUT)", ...)
  //   baris N+1..  = detail transaksi FIFO
  // ================================================================
  if (data.fifo_stok_data && data.fifo_stok_data.length > 0) {
    const stockRows = data.fifo_stok_data; // Sudah murni data stok dari K8:N10

    // Update Judul FIFO sesuai Spreadsheet (D2)
    if (data.fifo_title) {
      const fifoTitleEl = document.querySelector("#fifo .section-title");
      if (fifoTitleEl) fifoTitleEl.innerText = data.fifo_title;
    }

    // Tabel sisa stok — header = nama material, nilai = sisa stok (dari spreadsheet)
    const stockThead = document.getElementById("stock-thead");
    const stockTbody = document.getElementById("stock-tbody");
    if (stockThead && stockTbody && stockRows.length > 0) {
      stockThead.innerHTML = stockRows.map((r) => `<th>${str(r[0])}</th>`).join("");
      stockTbody.innerHTML = stockRows.map((r) => `<td>${str(r[3])}</td>`).join("");
      updateChartData(
        "sisaStokChart",
        stockRows.map((r) => str(r[0])),
        [stockRows.map((r) => num(r[3]))],
      );
    }

    // Tabel FIFO Detail & Grafik Kapasitas
    if (data.fifo_detail_data && data.fifo_detail_data.length > 1) {
      const fifoDetailHeader = data.fifo_detail_data[0]; // B5:I5
      const detailRows = data.fifo_detail_data.slice(1).filter((r) => str(r[0]) !== ""); // Filter baris kosong

      // Update header tabel secara dinamis
      const fifoThead = document.querySelector("#fifo-tbody").previousElementSibling;
      if (fifoThead) {
        fifoThead.innerHTML = `<tr>${fifoDetailHeader
          .slice(0, 8)
          .map((h) => `<th>${str(h)}</th>`)
          .join("")}</tr>`;
      }

      // Chart FIFO (Grafik Kapasitas Gudang): X = Tanggal (r[0]), Y1 = Total Gudang (r[6]), Y2 = Margin Kapasitas (r[7])
      updateChartData(
        "fifoChart",
        detailRows.map((r) => str(r[0])), // Tanggal
        [detailRows.map((r) => num(r[6])), detailRows.map((r) => num(r[7]))],
        [`${str(fifoDetailHeader[6])}`, `${str(fifoDetailHeader[7])}`], // Override label dataset agar mengikuti spreadsheet
      );

      initPaginatedTable({
        id: "fifo",
        data: detailRows,
        itemsPerPage: 5,
        renderRow: (r) =>
          `<tr>${r
            .slice(0, 8)
            .map((c) => `<td>${str(c)}</td>`)
            .join("")}</tr>`,
      });
    }
  }

  // ================================================================
  // 3. PERFORMA & PESANAN CHART + TABEL DEFECT
  // defect_data: [Vendor, Material, TotalPesanan, ..., r[6]=Retur,
  //              ..., r[10]=TotalKirim, r[11]=Terlambat, r[12]=TepatWaktu]
  // ================================================================
  if (data.defect_data && data.defect_data.length > 1) {
    const defectHeader = data.defect_data[0]; // B6:N6
    const defectRows = data.defect_data.slice(1); // Baris data vendor

    const labels = defectRows.map((r) => str(r[0]));

    // Performa Chart: Total Kirim (index 10) vs Tepat Waktu (index 12)
    updateChartData("performaChart", labels, [defectRows.map((r) => num(r[12])), defectRows.map((r) => num(r[10]))]);

    // Pesanan Chart: Total Pesanan (index 2) vs Return (index 6)
    updateChartData("pesananChart", labels, [defectRows.map((r) => num(r[2])), defectRows.map((r) => num(r[6]))]);

    // --- Pemesanan & Cacat (Kolom 0 sampai 6) ---
    const pemesananThead = document.querySelector("#defect-pemesanan-tbody").previousElementSibling;
    if (pemesananThead) {
      pemesananThead.innerHTML = `<tr>${defectHeader
        .slice(0, 7)
        .map((h) => `<th>${str(h)}</th>`)
        .join("")}</tr>`;
    }
    initPaginatedTable({
      id: "defect-pemesanan",
      data: defectRows,
      itemsPerPage: 5,
      renderRow: (r) =>
        `<tr>${r
          .slice(0, 7)
          .map((c) => `<td>${str(c)}</td>`)
          .join("")}</tr>`,
    });

    // --- Pengiriman (Kolom 9 sampai 12) ---
    const pengirimanThead = document.querySelector("#defect-pengiriman-tbody").previousElementSibling;
    if (pengirimanThead) {
      pengirimanThead.innerHTML = `<tr>${defectHeader
        .slice(9, 13)
        .map((h) => `<th>${str(h)}</th>`)
        .join("")}</tr>`;
    }
    initPaginatedTable({
      id: "defect-pengiriman",
      data: defectRows,
      itemsPerPage: 5,
      renderRow: (r) =>
        `<tr>${r
          .slice(9, 13)
          .map((c) => `<td>${str(c)}</td>`)
          .join("")}</tr>`,
    });
  }

  // ================================================================
  // 5. RIWAYAT QC LOG
  // qc_data: langsung dari spreadsheet, semua kolom apa adanya
  // ================================================================
  if (data.qc_data && data.qc_data.length > 0) {
    // Filter baris kosong: cukup pastikan Tanggal ada isinya
    const validQC = data.qc_data
      .filter((r) => {
        const tgl = str(r[1]);
        return tgl !== "" && tgl !== "-";
      })
      .reverse();

    initPaginatedTable({
      id: "qc",
      data: validQC,
      itemsPerPage: 5,
      renderRow: (r) => {
        const badge = (v, okVal) => {
          const val = str(v);
          if (val === "" || val === "-") return `<td>${val}</td>`;
          return `<td class="${val.toLowerCase() === okVal ? "badge-lolos" : "badge-return"}">${val}</td>`;
        };
        return `<tr>
          <td>${str(r[0])}</td>
          <td>${str(r[1])}</td>
          <td>${str(r[2])}</td>
          <td>${str(r[3])}</td>
          <td>${str(r[4])}</td>
          <td>${str(r[5])}</td>
          <td>${str(r[6])}</td>
          <td>${str(r[7])}</td>
          <td>${str(r[8])}</td>
          <td>${str(r[9])}</td>
          <td>${str(r[10])}</td>
          ${badge(r[11], "lolos")}
          <td>${str(r[12])}</td>
          <td>${str(r[13])}</td>
          <td>${str(r[14])}</td>
          ${badge(r[15], "lolos")}
          <td>${str(r[16])}</td>
          <td>${str(r[17])}</td>
          ${badge(r[18], "tepat waktu")}
          <td>${str(r[19])}</td>
        </tr>`;
      },
    });
  }
}

// Panggil fetch awal jika URL sudah diset
fetchDashboardData();

// Footer: dynamic year
document.getElementById("footer-year").textContent = new Date().getFullYear();
