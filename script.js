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
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Chart.js Default Settings
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = htmlEl.getAttribute('data-theme') === 'dark' ? '#e0e0e0' : '#333333';

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
                    family: "'Inter', sans-serif",
                    size: 13
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { family: "'Inter', sans-serif", size: 14 },
            bodyFont: { family: "'Inter', sans-serif", size: 13 },
            padding: 12,
            cornerRadius: 8
        }
    },
    animation: {
        duration: 1000,
        easing: 'easeOutQuart'
    }
};

// Colors based on the provided image design
const colors = {
    blue: '#4a90e2',
    orange: '#f39c12',
    gray: '#95a5a6',
    pieVendorA: '#ed7d31', // Orange
    pieVendorB: '#4472c4', // Blue
    pieVendorC: '#a5a5a5'  // Gray
};

// 1. Sisa Stok Chart (Horizontal Bar)
const ctxSisa = document.getElementById('sisaStokChart').getContext('2d');
const sisaStokChart = new Chart(ctxSisa, {
    type: 'bar',
    data: {
        labels: ['K-1 ABU-ABU', 'K-1 HITAM', 'K-1 PUTIH'],
        datasets: [{
            label: 'Sisa Stok (Kg)',
            data: [98, 90, 57],
            backgroundColor: colors.blue,
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
                    color: htmlEl.getAttribute('data-theme') === 'dark' ? '#333' : '#e0e0e0'
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
            data: [103, 74, 28], // Vendor A (Orange), Vendor B (Blue), Vendor C (Gray)
            backgroundColor: [colors.pieVendorA, colors.pieVendorB, colors.pieVendorC],
            borderWidth: 2,
            borderColor: htmlEl.getAttribute('data-theme') === 'dark' ? '#1e1e1e' : '#ffffff',
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
                backgroundColor: colors.blue,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            },
            {
                label: 'Total Pengiriman',
                data: [2, 2, 2],
                backgroundColor: colors.orange,
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
                    color: htmlEl.getAttribute('data-theme') === 'dark' ? '#333' : '#e0e0e0'
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
                backgroundColor: colors.blue,
                borderRadius: 4,
                barPercentage: 0.8,
                categoryPercentage: 0.6
            },
            {
                label: 'Retur',
                data: [1, 0, 2],
                backgroundColor: colors.orange,
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
                    color: htmlEl.getAttribute('data-theme') === 'dark' ? '#333' : '#e0e0e0'
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
    const textColor = theme === 'dark' ? '#e0e0e0' : '#333333';
    const gridColor = theme === 'dark' ? '#333333' : '#e0e0e0';
    const pieBorder = theme === 'dark' ? '#1e1e1e' : '#ffffff';

    const barCharts = [sisaStokChart, performaChart, pesananChart];
    
    barCharts.forEach(chart => {
        if(chart.options.scales.x) {
            chart.options.scales.x.ticks.color = textColor;
            if(chart.options.scales.x.grid) {
                chart.options.scales.x.grid.color = gridColor;
            }
        }
        if(chart.options.scales.y) {
            chart.options.scales.y.ticks.color = textColor;
            if(chart.options.scales.y.grid) {
                chart.options.scales.y.grid.color = gridColor;
            }
        }
        chart.options.plugins.legend.labels.color = textColor;
        chart.update();
    });

    // Pie chart update
    vpiChart.options.plugins.legend.labels.color = textColor;
    vpiChart.data.datasets[0].borderColor = pieBorder;
    vpiChart.update();
}
