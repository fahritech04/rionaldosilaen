// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const icon = themeToggle.querySelector('i');

// Check for saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
    
    // Update chart colors based on theme
    updateChartsTheme(newTheme);
});

function updateIcon(theme) {
    if (theme === 'dark') {
        themeToggle.innerHTML = '<span class="icon">☀️</span>';
    } else {
        themeToggle.innerHTML = '<span class="icon">🌙</span>';
    }
}

// Chart.js Default Settings
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
Chart.defaults.color = htmlEl.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#425069';

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                boxWidth: 12,
                padding: 20,
                font: {
                    family: "'Space Grotesk', sans-serif",
                    size: 13
                }
            }
        },
        tooltip: {
            backgroundColor: htmlEl.getAttribute('data-theme') === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            titleColor: htmlEl.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#16253b',
            bodyColor: htmlEl.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#16253b',
            titleFont: { family: "'Space Grotesk', sans-serif", size: 14, weight: 'bold' },
            bodyFont: { family: "'Space Grotesk', sans-serif", size: 13 },
            padding: 12,
            cornerRadius: 8,
            borderColor: htmlEl.getAttribute('data-theme') === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)',
            borderWidth: 1
        }
    },
    animation: {
        duration: 800,
        easing: 'easeOutQuart'
    }
};

// Colors matching raihanfahrifi.my.id
function getColors(theme) {
    if (theme === 'dark') {
        return {
            primary: '#f28b6d',   // Light Orange
            accent: '#38bdf8',    // Light Blue
            gray: '#94a3b8',      // Slate
            grid: 'rgba(255, 255, 255, 0.1)',
            pieBorder: '#1e293b'
        };
    } else {
        return {
            primary: '#cc5f3d',   // Orange
            accent: '#1f5f77',    // Blue
            gray: '#425069',      // Slate
            grid: 'rgba(22, 37, 59, 0.1)',
            pieBorder: '#ffffff'
        };
    }
}

let currentColors = getColors(htmlEl.getAttribute('data-theme'));

// 1. Sisa Stok Chart (Horizontal Bar)
const ctxSisa = document.getElementById('sisaStokChart').getContext('2d');
const sisaStokChart = new Chart(ctxSisa, {
    type: 'bar',
    data: {
        labels: ['K-1 ABU-ABU', 'K-1 HITAM', 'K-1 PUTIH'],
        datasets: [{
            label: 'Sisa Stok (Kg)',
            data: [98, 90, 57],
            backgroundColor: currentColors.accent,
            borderRadius: 6,
            barThickness: 30
        }]
    },
    options: {
        ...commonOptions,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                max: 120,
                grid: {
                    drawBorder: false,
                    color: currentColors.grid
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// 2. VPI Chart (Pie)
const ctxVpi = document.getElementById('vpiChart').getContext('2d');
const vpiChart = new Chart(ctxVpi, {
    type: 'pie',
    data: {
        labels: ['Vendor A', 'Vendor B', 'Vendor C'],
        datasets: [{
            data: [103, 74, 28], 
            backgroundColor: [currentColors.primary, currentColors.accent, currentColors.gray],
            borderWidth: 2,
            borderColor: currentColors.pieBorder,
            hoverOffset: 4
        }]
    },
    options: {
        ...commonOptions,
        layout: {
            padding: 20
        },
        plugins: {
            ...commonOptions.plugins,
            legend: {
                position: 'bottom'
            }
        }
    }
});

// 3. Performa Pengiriman (Grouped Bar)
const ctxPerforma = document.getElementById('performaChart').getContext('2d');
const performaChart = new Chart(ctxPerforma, {
    type: 'bar',
    data: {
        labels: ['Vendor A', 'Vendor B', 'Vendor C'],
        datasets: [
            {
                label: 'Tepat Waktu',
                data: [2, 1, 0],
                backgroundColor: currentColors.accent,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            },
            {
                label: 'Total Pengiriman',
                data: [2, 2, 2],
                backgroundColor: currentColors.primary,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            }
        ]
    },
    options: {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 2.5,
                ticks: { stepSize: 0.5 },
                grid: {
                    color: currentColors.grid
                }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});

// 4. Jumlah Pesanan (Grouped Bar)
const ctxPesanan = document.getElementById('pesananChart').getContext('2d');
const pesananChart = new Chart(ctxPesanan, {
    type: 'bar',
    data: {
        labels: ['Vendor A', 'Vendor B', 'Vendor C'],
        datasets: [
            {
                label: 'Total Pesanan',
                data: [2, 2, 2],
                backgroundColor: currentColors.accent,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            },
            {
                label: 'Retur',
                data: [1, 0, 2],
                backgroundColor: currentColors.primary,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            }
        ]
    },
    options: {
        ...commonOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 2.5,
                ticks: { stepSize: 0.5 },
                grid: {
                    color: currentColors.grid
                }
            },
            x: {
                grid: { display: false }
            }
        }
    }
});

// Function to update chart colors on theme switch
function updateChartsTheme(theme) {
    const colors = getColors(theme);
    const textColor = theme === 'dark' ? '#94a3b8' : '#425069';

    Chart.defaults.color = textColor;

    const barCharts = [sisaStokChart, performaChart, pesananChart];
    
    // Update Sisa Stok
    sisaStokChart.data.datasets[0].backgroundColor = colors.accent;
    
    // Update Performa & Pesanan
    performaChart.data.datasets[0].backgroundColor = colors.accent;
    performaChart.data.datasets[1].backgroundColor = colors.primary;
    
    pesananChart.data.datasets[0].backgroundColor = colors.accent;
    pesananChart.data.datasets[1].backgroundColor = colors.primary;

    barCharts.forEach(chart => {
        if(chart.options.scales.x) {
            chart.options.scales.x.ticks.color = textColor;
            if(chart.options.scales.x.grid) {
                chart.options.scales.x.grid.color = colors.grid;
            }
        }
        if(chart.options.scales.y) {
            chart.options.scales.y.ticks.color = textColor;
            if(chart.options.scales.y.grid) {
                chart.options.scales.y.grid.color = colors.grid;
            }
        }
        chart.options.plugins.legend.labels.color = textColor;
        
        // Update tooltip colors
        chart.options.plugins.tooltip.backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        chart.options.plugins.tooltip.titleColor = theme === 'dark' ? '#f8fafc' : '#16253b';
        chart.options.plugins.tooltip.bodyColor = theme === 'dark' ? '#f8fafc' : '#16253b';
        chart.options.plugins.tooltip.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)';

        chart.update();
    });

    // Pie chart update
    vpiChart.data.datasets[0].backgroundColor = [colors.primary, colors.accent, colors.gray];
    vpiChart.data.datasets[0].borderColor = colors.pieBorder;
    vpiChart.options.plugins.legend.labels.color = textColor;
    
    vpiChart.options.plugins.tooltip.backgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    vpiChart.options.plugins.tooltip.titleColor = theme === 'dark' ? '#f8fafc' : '#16253b';
    vpiChart.options.plugins.tooltip.bodyColor = theme === 'dark' ? '#f8fafc' : '#16253b';
    vpiChart.options.plugins.tooltip.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 37, 59, 0.1)';
    
    vpiChart.update();
}
