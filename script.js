// ==========================================
// THEME & UI LOGIC
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

// Initialize Theme
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
    themeToggle.innerHTML = theme === 'dark' ? '<span class="icon">☀️</span>' : '<span class="icon">🌙</span>';
}

// ==========================================
// CHART.JS CONFIGURATION & DATA
// ==========================================
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
const activeCharts = []; // Store chart instances for easy theme updates

// Get dynamic colors based on theme
function getColors(theme) {
    const isDark = theme === 'dark';
    return {
        text: isDark ? '#94a3b8' : '#425069',
        primary: isDark ? '#f28b6d' : '#cc5f3d',
        accent: isDark ? '#38bdf8' : '#1f5f77',
        gray: isDark ? '#94a3b8' : '#425069',
        grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)',
        pieBorder: isDark ? '#1e293b' : '#ffffff',
        ttBg: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        ttText: isDark ? '#f8fafc' : '#16253b',
        ttBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)'
    };
}

// Generate base tooltip config
function getTooltipConfig(colors) {
    return {
        backgroundColor: colors.ttBg,
        titleColor: colors.ttText,
        bodyColor: colors.ttText,
        titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: 'bold' },
        bodyFont: { family: "'Space Grotesk', sans-serif", size: 13 },
        padding: 12,
        cornerRadius: 8,
        borderColor: colors.ttBorder,
        borderWidth: 1
    };
}

// Chart Definitions
const chartDefinitions = [
    {
        id: 'sisaStokChart',
        type: 'bar',
        data: {
            labels: ['K-1 ABU-ABU', 'K-1 HITAM', 'K-1 PUTIH'],
            datasets: [{ label: 'Sisa Stok (Kg)', data: [98, 90, 57], colorKey: 'accent', barThickness: 30, borderRadius: 6 }]
        },
        options: { indexAxis: 'y', scales: { x: { max: 120 } } }
    },
    {
        id: 'vpiChart',
        type: 'pie',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            datasets: [{ data: [103, 74, 28], colorKey: ['primary', 'accent', 'gray'], isPie: true }]
        },
        options: { layout: { padding: 20 } }
    },
    {
        id: 'performaChart',
        type: 'bar',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            datasets: [
                { label: 'Tepat Waktu', data: [2, 1, 0], colorKey: 'accent' },
                { label: 'Total Pengiriman', data: [2, 2, 2], colorKey: 'primary' }
            ]
        },
        options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } }
    },
    {
        id: 'pesananChart',
        type: 'bar',
        data: {
            labels: ['Vendor A', 'Vendor B', 'Vendor C'],
            datasets: [
                { label: 'Total Pesanan', data: [2, 2, 2], colorKey: 'accent' },
                { label: 'Retur', data: [1, 0, 2], colorKey: 'primary' }
            ]
        },
        options: { scales: { y: { max: 2.5, ticks: { stepSize: 0.5 } } } }
    }
];

// ==========================================
// INITIALIZATION & RENDER
// ==========================================
function initCharts() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const colors = getColors(currentTheme);
    Chart.defaults.color = colors.text;

    chartDefinitions.forEach(config => {
        const ctx = document.getElementById(config.id).getContext('2d');
        
        // Map datasets
        const processedDatasets = config.data.datasets.map(ds => {
            const isPie = ds.isPie || false;
            let bgColor = Array.isArray(ds.colorKey) 
                ? ds.colorKey.map(k => colors[k]) 
                : colors[ds.colorKey];

            const baseDs = {
                data: ds.data,
                backgroundColor: bgColor,
            };

            if (ds.label) baseDs.label = ds.label;
            
            if (isPie) {
                baseDs.borderWidth = 2;
                baseDs.borderColor = colors.pieBorder;
                baseDs.hoverOffset = 4;
            } else {
                baseDs.borderRadius = ds.borderRadius || 4;
                if (ds.barThickness) baseDs.barThickness = ds.barThickness;
                else {
                    baseDs.barPercentage = 0.8;
                    baseDs.categoryPercentage = 0.6;
                }
            }
            return baseDs;
        });

        // Map options
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 20, font: { family: "'Space Grotesk', sans-serif", size: 13 } }
                },
                tooltip: getTooltipConfig(colors)
            },
            ...config.options
        };

        // Inject grid colors for Bar charts
        if (config.type === 'bar' && baseOptions.scales) {
            Object.keys(baseOptions.scales).forEach(axis => {
                baseOptions.scales[axis].grid = { 
                    color: colors.grid,
                    display: (config.options.indexAxis === 'y' && axis === 'y') || (config.options.indexAxis !== 'y' && axis === 'x') ? false : true,
                    drawBorder: false
                };
            });
        }

        const chartInstance = new Chart(ctx, {
            type: config.type,
            data: { labels: config.data.labels, datasets: processedDatasets },
            options: baseOptions
        });

        // Save reference for later theme updates
        activeCharts.push({ instance: chartInstance, config: config });
    });
}

// ==========================================
// THEME UPDATER
// ==========================================
function updateChartsTheme(theme) {
    const colors = getColors(theme);
    Chart.defaults.color = colors.text;

    activeCharts.forEach(item => {
        const chart = item.instance;
        const config = item.config;

        // Update dataset colors dynamically based on their original colorKey
        chart.data.datasets.forEach((ds, index) => {
            const originalDs = config.data.datasets[index];
            ds.backgroundColor = Array.isArray(originalDs.colorKey) 
                ? originalDs.colorKey.map(k => colors[k]) 
                : colors[originalDs.colorKey];
            
            if (originalDs.isPie) ds.borderColor = colors.pieBorder;
        });

        // Update scales & grids
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                chart.options.scales.x.ticks.color = colors.text;
                if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = colors.grid;
            }
            if (chart.options.scales.y) {
                chart.options.scales.y.ticks.color = colors.text;
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = colors.grid;
            }
        }

        // Update Plugins (Legend & Tooltip)
        chart.options.plugins.legend.labels.color = colors.text;
        chart.options.plugins.tooltip = { ...chart.options.plugins.tooltip, ...getTooltipConfig(colors) };

        chart.update();
    });
}

// Start rendering
initCharts();
