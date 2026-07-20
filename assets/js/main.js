// main.js
// Entry point utama untuk menginisialisasi aplikasi
document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Chart
  if (typeof window.initCharts === "function") {
    window.initCharts();
  }
  
  // Ambil Data Dashboard
  if (typeof window.fetchDashboardData === "function") {
    window.fetchDashboardData();
  }

  // Set tahun otomatis di footer
  const footerYearEl = document.getElementById("footer-year");
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
});
