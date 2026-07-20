// charts.js
// Konfigurasi Chart.js
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
window.activeCharts = [];

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
    type: "bar",
    data: {
      labels: [],
      datasets: [{ label: "Skor VPI", data: [], colorKey: ["primary", "accent", "gray"] }],
    },
    options: {
      indexAxis: "y",
      layout: { padding: 20 },
      plugins: { legend: { display: false } },
    },
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
window.initCharts = function () {
  const htmlEl = document.documentElement;
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

    window.activeCharts.push({ instance: chartInstance, config });
  });
};

// Fungsi Pembaruan Tema
window.updateChartsTheme = function (theme) {
  const colors = getColors(theme);
  Chart.defaults.color = colors.text;

  window.activeCharts.forEach(({ instance: chart, config }) => {
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
};

// Pembaruan Grafik Dinamis
window.updateChartData = function (chartId, newLabels, newDatasetsData, newDatasetLabels = null) {
  const chartObj = window.activeCharts.find((c) => c.config.id === chartId);
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
};
