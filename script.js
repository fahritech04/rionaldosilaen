// ==========================================
// THEME & UI LOGIC
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateToggleIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateToggleIcon(newTheme);
    updateChartsTheme(newTheme);
});

function updateToggleIcon(theme) {
    themeToggle.innerHTML = theme === 'dark'
        ? '<span class="icon">☀️</span>'
        : '<span class="icon">🌙</span>';
}

// ==========================================
// MOBILE MENU LOGIC
// ==========================================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navTabs = document.querySelector('.nav-tabs');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('is-active');
    navTabs.classList.toggle('is-open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
            mobileMenuToggle.classList.remove('is-active');
            navTabs.classList.remove('is-open');
        }
    });
});
// ==========================================
// SCROLL SPY — Active Nav Link
// ==========================================
const navLinks = document.querySelectorAll('.nav-link[data-section]');
const sections = document.querySelectorAll('.dashboard-section');

window.addEventListener('scroll', () => {
    let currentSection = '';
    sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) currentSection = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === currentSection);
    });
}, { passive: true });

// ==========================================
// INTERSECTION OBSERVER — Reveal Animations
// ==========================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // Animate only once
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ==========================================
// CHART.JS — CONFIGURATION
// ==========================================
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
const activeCharts = [];

// Dynamic theme color palette
function getColors(theme) {
    const isDark = theme === 'dark';
    return {
        text:      isDark ? '#94a3b8' : '#425069',
        primary:   isDark ? '#f28b6d' : '#cc5f3d',
        accent:    isDark ? '#38bdf8' : '#1f5f77',
        gray:      isDark ? '#94a3b8' : '#425069',
        grid:      isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)',
        pieBorder: isDark ? '#1e293b' : '#ffffff',
        ttBg:      isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        ttText:    isDark ? '#f8fafc' : '#16253b',
        ttBorder:  isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)'
    };
}

// Reusable tooltip config generator
function getTooltipConfig(colors) {
    return {
        backgroundColor: colors.ttBg, titleColor: colors.ttText, bodyColor: colors.ttText,
        titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: 'bold' },
        bodyFont:  { family: "'Space Grotesk', sans-serif", size: 13 },
        padding: 12, cornerRadius: 8,
        borderColor: colors.ttBorder, borderWidth: 1
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
        id: 'sisaStokChart', type: 'bar',
        data: {
            labels: ['K-1-ABU-ABU', 'K-1-HITAM', 'K-1-PUTIH'],
            datasets: [{ label: 'Sisa Stok (kg)', data: [98, 90, 57], colorKey: 'accent', barThickness: 30, borderRadius: 6 }]
        },
        options: { indexAxis: 'y', scales: { x: { max: 120 } } }
    },
    {
        id: 'vpiChart', type: 'pie',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            // VPI scores: A=74.2 (Excel), B=99.7, C=20.0 (computed with verified formula)
            datasets: [{ data: [74.2, 99.7, 20.0], colorKey: ['primary', 'accent', 'gray'], isPie: true }]
        },
        options: { layout: { padding: 20 } }
    },
    {
        id: 'performaChart', type: 'bar',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            datasets: [
                { label: 'Tepat Waktu',      data: [2, 1, 0], colorKey: 'accent' },
                { label: 'Total Pengiriman',  data: [2, 2, 2], colorKey: 'primary' }
            ]
        },
        options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } }
    },
    {
        id: 'pesananChart', type: 'bar',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            datasets: [
                { label: 'Total Pesanan', data: [2, 2, 2], colorKey: 'accent' },
                { label: 'Retur',         data: [1, 0, 2], colorKey: 'primary' }
            ]
        },
        options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } }
    },

    // --- MRP SECTION ---
    {
        id: 'mrpChart', type: 'line',
        data: {
            labels: ['PD', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
            datasets: [
                { label: 'GR — Kebutuhan Kotor (kg)',       data: [0, 50, 50, 50, 50, 50, 50, 50], colorKey: 'accent',  tension: 0.3 },
                { label: 'NR — Kebutuhan Bersih (kg)',      data: [0, 20, 50, 50, 50, 50, 50, 50], colorKey: 'primary', tension: 0.3 },
                { label: 'PORel — Pelepasan Pesanan (kg)',   data: [20, 50, 50, 50, 50, 50, 50, 0], colorKey: 'gray',    tension: 0.3, borderDash: [6, 4] }
            ]
        },
        options: { scales: { y: { beginAtZero: true, max: 60, ticks: { stepSize: 10 } } } }
    },

    // --- FIFO SECTION ---
    {
        id: 'fifoChart', type: 'line',
        data: {
            labels: ['1 Jun', '2 Jun', '3 Jun', '4 Jun', '5 Jun', '10 Jun'],
            datasets: [
                { label: 'Total Gudang (kg)',     data: [100, 190, 288, 388, 290, 245], colorKey: 'accent',  tension: 0.3, fill: true },
                { label: 'Margin Kapasitas (kg)', data: [400, 310, 212, 112, 210, 255], colorKey: 'primary', tension: 0.3, borderDash: [6, 4] }
            ]
        },
        options: { scales: { y: { beginAtZero: true, max: 500, ticks: { stepSize: 100 } } } }
    }
];

// ==========================================
// CHART INITIALIZATION (Single Reusable Loop)
// ==========================================
function initCharts() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const colors = getColors(currentTheme);
    Chart.defaults.color = colors.text;

    chartDefinitions.forEach(config => {
        const ctx = document.getElementById(config.id).getContext('2d');

        // Process each dataset based on chart type
        const processedDatasets = config.data.datasets.map(ds => {
            const bgColor = Array.isArray(ds.colorKey)
                ? ds.colorKey.map(k => colors[k])
                : colors[ds.colorKey];

            const baseDs = { data: ds.data, backgroundColor: bgColor };
            if (ds.label) baseDs.label = ds.label;

            if (ds.isPie) {
                // PIE: border, hover
                baseDs.borderWidth = 2;
                baseDs.borderColor = colors.pieBorder;
                baseDs.hoverOffset = 4;
            } else if (config.type === 'line') {
                // LINE: border color, tension, fill, points
                baseDs.borderColor = bgColor;
                baseDs.backgroundColor = ds.fill ? hexToRgba(bgColor, 0.15) : 'transparent';
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
                else { baseDs.barPercentage = 0.8; baseDs.categoryPercentage = 0.6; }
            }
            return baseDs;
        });

        // Build chart options
        const baseOptions = {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20, font: { family: "'Space Grotesk', sans-serif", size: 13 } } },
                tooltip: getTooltipConfig(colors)
            },
            ...config.options
        };

        // Inject grid colors for axis-based charts
        if ((config.type === 'bar' || config.type === 'line') && baseOptions.scales) {
            Object.keys(baseOptions.scales).forEach(axis => {
                const isHiddenGrid =
                    (config.options.indexAxis === 'y' && axis === 'y') ||
                    (config.options.indexAxis !== 'y' && axis === 'x');
                baseOptions.scales[axis].grid = {
                    color: colors.grid,
                    display: !isHiddenGrid,
                    drawBorder: false
                };
            });
        }

        const chartInstance = new Chart(ctx, {
            type: config.type,
            data: { labels: config.data.labels, datasets: processedDatasets },
            options: baseOptions
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
            const newColor = Array.isArray(origDs.colorKey)
                ? origDs.colorKey.map(k => colors[k])
                : colors[origDs.colorKey];

            ds.backgroundColor = newColor;

            if (origDs.isPie) {
                ds.borderColor = colors.pieBorder;
            } else if (config.type === 'line') {
                ds.borderColor = newColor;
                if (origDs.fill) ds.backgroundColor = hexToRgba(newColor, 0.15);
            }
        });

        // Update scales
        if (chart.options.scales) {
            ['x', 'y'].forEach(axis => {
                if (chart.options.scales[axis]) {
                    chart.options.scales[axis].ticks.color = colors.text;
                    if (chart.options.scales[axis].grid) chart.options.scales[axis].grid.color = colors.grid;
                }
            });
        }

        // Update plugins
        chart.options.plugins.legend.labels.color = colors.text;
        Object.assign(chart.options.plugins.tooltip, getTooltipConfig(colors));

        chart.update();
    });
}

// ==========================================
// START
// ==========================================
initCharts();

// Footer: dynamic year
document.getElementById('footer-year').textContent = new Date().getFullYear();
