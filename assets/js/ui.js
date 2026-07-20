// ui.js
// Anti-debugging (Optional)
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.onkeydown = function (e) {
  if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83))) {
    return false;
  }
};
setInterval(() => {
  debugger;
}, 500);

const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
updateToggleIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = htmlEl.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    htmlEl.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateToggleIcon(newTheme);
    
    // Pastikan updateChartsTheme ada karena ini didefinisikan di charts.js
    if (typeof window.updateChartsTheme === "function") {
      window.updateChartsTheme(newTheme);
    }
  });
}

function updateToggleIcon(theme) {
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === "dark" ? '<span class="icon">☀️</span>' : '<span class="icon">🌙</span>';
}

// Logika Menu Mobile
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const navTabs = document.querySelector(".nav-tabs");

if (mobileMenuToggle && navTabs) {
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
}

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

// Logika Notifikasi Toast (Global)
window.showToast = function(message, type = "success", autoClose = true) {
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
};
