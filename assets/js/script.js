document.addEventListener("contextmenu", (event) => event.preventDefault());
document.onkeydown = function (e) {
  if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83))) {
    return false;
  }
};
setInterval(() => {
  debugger;
}, 500);

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwFg2HubxgMsHzSrVVLXpiZbU-W5kn0mIAbsXkfw3juA_YhnPfxnaKyfVBRQghWpScZMQ/exec";

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

// Logika Menu Mobile
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navTabs = document.querySelector(".nav-tabs");

mobileMenuToggle.addEventListener("click", () => {
  mobileMenuToggle.classList.toggle("is-active");
  navTabs.classList.toggle("is-open");
});

// Tutup menu mobile ketika link diklik
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      mobileMenuToggle.classList.remove("is-active");
      navTabs.classList.remove("is-open");
    }
  });
});
// Deteksi scroll untuk navigasi link aktif
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

// Deteksi elemen masuk ke layar untuk animasi muncul
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // Jalankan animasi hanya sekali
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Konfigurasi Chart.js
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
const activeCharts = [];

// Palet warna tema dinamis
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

// Pembuat konfigurasi tooltip berulang
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

// Konversi warna Hex ke RGBA
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Definisi Konfigurasi Grafik
const chartDefinitions = [
  // --- Bagian Dashboard ---
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
        { label: "Jumlah Pengiriman", data: [], colorKey: "accent" },
        { label: "Total Pengiriman Delay", data: [], colorKey: "primary" },
      ],
    },
    options: { scales: { y: { max: 8, ticks: { stepSize: 2 } } } },
  },
  {
    id: "pesananChart",
    type: "bar",
    data: {
      labels: [],
      datasets: [
        { label: "Jumlah Pemesanan", data: [], colorKey: "accent" },
        { label: "Jumlah Return", data: [], colorKey: "primary" },
      ],
    },
    options: { scales: { y: { max: 8, ticks: { stepSize: 2 } } } },
  },
];

// Inisialisasi Seluruh Grafik
function initCharts() {
  const currentTheme = htmlEl.getAttribute("data-theme");
  const colors = getColors(currentTheme);
  Chart.defaults.color = colors.text;

  chartDefinitions.forEach((config) => {
    const ctx = document.getElementById(config.id).getContext("2d");

    // Memproses setiap dataset berdasarkan tipe grafiknya
    const processedDatasets = config.data.datasets.map((ds) => {
      const bgColor = Array.isArray(ds.colorKey) ? ds.colorKey.map((k) => colors[k]) : colors[ds.colorKey];

      const baseDs = { data: ds.data, backgroundColor: bgColor };
      if (ds.label) baseDs.label = ds.label;

      if (ds.isPie) {
        // Grafik Lingkaran: Bentuk tanpa batas dengan efek halus
        baseDs.borderWidth = 0;
        baseDs.hoverBorderWidth = 0;
        baseDs.hoverOffset = 8;
      } else if (config.type === "line") {
        // Grafik Garis: warna garis, tegangan, isian, dan titik
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
        // Grafik Batang: lekukan sudut dan ketebalan
        baseDs.borderRadius = ds.borderRadius || 4;
        if (ds.barThickness) baseDs.barThickness = ds.barThickness;
        else {
          baseDs.barPercentage = 0.8;
          baseDs.categoryPercentage = 0.6;
        }
      }
      return baseDs;
    });

    // Membangun opsi grafik
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart", // Efek animasi linear untuk mencegah flicker
      },
      animations: {
        x: { duration: 0 }, // Matikan animasi geser horizontal
      },
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "rectRounded", boxWidth: 12, padding: 20, font: { family: "'Space Grotesk', sans-serif", size: 13 } } },
        tooltip: getTooltipConfig(colors),
      },
      ...config.options,
    };

    // Mewarnai grid untuk grafik bersumbu
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

// Fungsi Pembaruan Tema
function updateChartsTheme(theme) {
  const colors = getColors(theme);
  Chart.defaults.color = colors.text;

  activeCharts.forEach(({ instance: chart, config }) => {
    // Memperbarui warna dataset grafik
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

    // Memperbarui skala grafik
    if (chart.options.scales) {
      ["x", "y"].forEach((axis) => {
        if (chart.options.scales[axis]) {
          chart.options.scales[axis].ticks.color = colors.text;
          if (chart.options.scales[axis].grid) chart.options.scales[axis].grid.color = colors.grid;
        }
      });
    }

    // Memperbarui plugin grafik
    chart.options.plugins.legend.labels.color = colors.text;
    Object.assign(chart.options.plugins.tooltip, getTooltipConfig(colors));

    // Sinkronisasi transisi CSS 400ms
    const originalDuration = chart.options.animation.duration;
    chart.options.animation.duration = 400;
    chart.update();
    setTimeout(() => {
      chart.options.animation.duration = originalDuration;
    }, 450);
  });
}

// Pembaruan Grafik Dinamis
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

  chart.reset();
  chart.update();
}
// START
initCharts();
// Logika Notifikasi Toast
function showToast(message, type = "success", autoClose = true) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
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

// UNIVERSAL PAGINATION LOGIC
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

// MAIN FETCH DATA
async function fetchDashboardData() {
  if (!WEB_APP_URL) return;

  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("hidden");
    loader.style.display = "flex";
  }

  try {
    // Menambahkan parameter waktu untuk mencegah browser menggunakan Cache lama
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
      setTimeout(() => {
        loader.style.display = "none";
      }, 300);
    }
  }
}

function updateDashboardUI(data) {
  const num = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
  const str = (v) => String(v || "").trim();

  // Data Vendor Terbaik, Grafik VPI, dan Tabel VPI
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

    // Tabel Riwayat Vendor Gabungan
    if (data.riwayat_raw_data && data.riwayat_raw_data.length > 0 && data.vpi_scoring_data) {
      const scoreMap = {};
      data.vpi_scoring_data.forEach((r) => {
        scoreMap[str(r[0]).trim().toLowerCase()] = r.slice(1);
      });

      const mergedData = data.riwayat_raw_data.map((r) => {
        const vendorName = str(r[0]).trim().toLowerCase();
        const scoreData = scoreMap[vendorName] || ["-", "-", "-", "-", "-"];
        return [...r, ...scoreData];
      });

      // Urutkan berdasarkan Ranking (index 10) secara ascending
      mergedData.sort((a, b) => {
        let rankA = num(a[10]);
        let rankB = num(b[10]);
        if (rankA === 0) rankA = 999;
        if (rankB === 0) rankB = 999;
        return rankA - rankB;
      });

      initPaginatedTable({
        id: "riwayat-vendor",
        data: mergedData,
        itemsPerPage: 5,
        renderRow: (r) => `<tr>
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
        </tr>`,
      });

      // Update pesananChart dari DATA RIWAYAT VENDOR (Jumlah Pemesanan & Jumlah Return)
      const riwayatLabels = data.riwayat_raw_data.map((r) => str(r[0]));
      updateChartData("pesananChart", riwayatLabels, [
        data.riwayat_raw_data.map((r) => num(r[1])), // Jumlah Pemesanan
        data.riwayat_raw_data.map((r) => num(r[2])), // Jumlah Return
      ]);

      // Update performaChart dari DATA RIWAYAT VENDOR (Jumlah Pengiriman & Total Pengiriman Delay)
      updateChartData("performaChart", riwayatLabels, [
        data.riwayat_raw_data.map((r) => num(r[3])), // Jumlah Pengiriman
        data.riwayat_raw_data.map((r) => num(r[4])), // Total Pengiriman Delay
      ]);
    }
  }

  // Data Sisa Stok Gudang dan Grafik FIFO
  if (data.fifo_stok_data && data.fifo_stok_data.length > 0) {
    const stockRows = data.fifo_stok_data;

    // Update Judul FIFO sesuai Spreadsheet
    if (data.fifo_title) {
      const fifoTitleEl = document.querySelector("#fifo .section-title");
      if (fifoTitleEl) fifoTitleEl.innerText = data.fifo_title;
    }

    // Tabel sisa stok — header = nama material, nilai = sisa stok
    const stockThead = document.getElementById("stock-thead");
    const stockTbody = document.getElementById("stock-tbody");
    if (stockThead && stockTbody && stockRows.length > 0) {
      stockThead.innerHTML = stockRows.map((r) => `<th>${str(r[0])}</th>`).join("");
      stockTbody.innerHTML = stockRows.map((r) => `<td>${str(r[3])}</td>`).join("");
    }

    // Detail Tabel FIFO dan Kapasitas
    if (data.fifo_detail_data && Object.keys(data.fifo_detail_data).length > 0) {
      // Logika Rekomendasi FIFO Keseluruhan
      const recEl = document.getElementById("fifo-recommendation");
      if (recEl) {
        const materials = ["K-1-PUTIH", "K-1-HITAM", "K-1-ABU-ABU"];
        let rowsHTML = "";

        materials.forEach((matName) => {
          const matData = data.fifo_detail_data[matName] || [];
          let recommendedBatch = "-";
          let recommendedSisa = "0";

          if (matData.length >= 2) {
            const detailRows = matData.slice(1);
            for (let i = 0; i < detailRows.length; i++) {
              const r = detailRows[i];
              const sisa = num(r[0]);
              const type = str(r[2]).toUpperCase();
              if (type === "IN" && sisa > 0) {
                recommendedBatch = str(r[1]); // Tanggal Batch
                recommendedSisa = str(r[0]); // Sisa Stok
                break;
              }
            }
          }

          rowsHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 8px; padding-top: 8px;">
              <span style="font-size: 0.95rem; font-weight: 500; color: var(--text); width: 33%;">${matName}</span>
              <div style="width: 33%; display: flex; justify-content: center;">
                <span style="font-size: 0.8rem; background: var(--accent); color: var(--bg); padding: 2px 8px; border-radius: 12px; font-weight: 700;">${recommendedBatch}</span>
              </div>
              <span style="font-size: 0.95rem; font-weight: 700; color: var(--accent); width: 33%; text-align: right;">${recommendedSisa}</span>
            </div>
           `;
        });

        recEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--line); padding-bottom: 6px; margin-bottom: 4px;">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; width: 33%;">Kode Material</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; width: 33%; text-align: center;">Ambil Barang di Tgl</span>
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.5px; width: 33%; text-align: right;">Sisa Stok Batch (kg)</span>
          </div>
          ${rowsHTML}
        `;
      }

      // Proses Render Tabel & Grafik FIFO per Material
      const fifoSelect = document.getElementById("fifo-material-select");

      const renderFifoMaterial = (materialName) => {
        const matData = data.fifo_detail_data[materialName] || [];
        if (matData.length < 2) {
          document.querySelector("#fifo-tbody").innerHTML = "<tr><td colspan='10' style='text-align: center; padding: 16px;'>Data Kosong</td></tr>";
          const paginationEl = document.getElementById("fifo-pagination");
          if (paginationEl) paginationEl.innerHTML = "";
          return;
        }

        const detailRows = matData.slice(1);

        // Tabel dengan urutan data terbaru di posisi atas
        initPaginatedTable({
          id: "fifo",
          data: [...detailRows].reverse(),
          itemsPerPage: 10,
          renderRow: (r) => {
            const status = str(r[2]).toUpperCase();
            let rowClass = "";
            if (status === "IN") rowClass = "row-in";
            else if (status === "OUT") rowClass = "row-out";

            return `<tr class="${rowClass}">${r
              .slice(0, 8)
              .map((c) => `<td>${str(c)}</td>`)
              .join("")}</tr>`;
          },
        });
      };

      if (fifoSelect) {
        // Hapus event listener lama agar tidak dobel saat auto-sync
        const newSelect = fifoSelect.cloneNode(true);
        fifoSelect.parentNode.replaceChild(newSelect, fifoSelect);

        renderFifoMaterial(newSelect.value); // Render default
        newSelect.addEventListener("change", (e) => {
          renderFifoMaterial(e.target.value);
        });
      }
    }
  }

  // Data Riwayat Inspeksi Quality Control (QC)
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
      itemsPerPage: 10,
      renderRow: (r) => {
        const badge = (v, okVal) => {
          const val = str(v);
          if (val === "" || val === "-") return `<td>${val}</td>`;
          return `<td class="${val.toLowerCase() === okVal ? "badge-lolos" : "badge-return"}">${val}</td>`;
        };
        return `<tr>
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
          <td>${str(r[11])}</td>
          ${badge(r[12], "lolos")}
          ${badge(r[13], "lolos")}
          ${badge(r[14], "lolos")}
          ${badge(r[15], "lolos")}
          <td>${str(r[16])}</td>
          <td>${str(r[17])}</td>
          <td>${str(r[18])}</td>
          <td>${str(r[19])}</td>
        </tr>`;
      },
    });
  }

  // 6. MRP CHART + TABEL MRP
  if (data.mrp_data && data.mrp_data.length > 0) {
    // Cari baris header MRP
    const mhIdx = data.mrp_data.findIndex((r) => str(r[0]).toLowerCase().includes("komponen") || str(r[2]).toLowerCase().includes("minggu 0"));

    if (mhIdx !== -1) {
      const headerRow = data.mrp_data[mhIdx];
      const mrpRows = data.mrp_data.slice(mhIdx + 1);

      let satuanIdx = headerRow.findIndex((c) => str(c).toLowerCase().includes("satuan"));
      if (satuanIdx === -1) satuanIdx = headerRow.length - 2;

      const timeCols = headerRow.slice(2, satuanIdx);
      const mrpLabels = timeCols.filter((c) => str(c) !== "");

      const mrpThead = document.querySelector("#mrp-thead");
      if (mrpThead) {
        mrpThead.innerHTML = `<tr><th>Komponen MRP</th>` + mrpLabels.map((l) => `<th>${l}</th>`).join("") + `<th>${str(headerRow[satuanIdx])}</th></tr>`;
      }

      initPaginatedTable({
        id: "mrp",
        data: mrpRows,
        itemsPerPage: 6,
        renderRow: (r) => {
          const dataCells = r
            .slice(2, 2 + mrpLabels.length)
            .map((c) => `<td>${str(c)}</td>`)
            .join("");
          const satuan = str(r[satuanIdx]);

          return `<tr>
            <td><strong>${str(r[0])}</strong><br><span style="font-size:0.85em;opacity:0.8">${str(r[1])}</span></td>
            ${dataCells}
            <td style="font-weight:bold; color:var(--accent)">${satuan}</td>
          </tr>`;
        },
      });
    }
  }
}

fetchDashboardData();
document.getElementById("footer-year").textContent = new Date().getFullYear();
