// pagination.js
// UNIVERSAL PAGINATION LOGIC
window.paginationState = {};

window.initPaginatedTable = function(config) {
  window.paginationState[config.id] = {
    data: config.data || [],
    currentPage: 1,
    itemsPerPage: config.itemsPerPage || 5,
    renderRow: config.renderRow,
  };
  renderTablePage(config.id);
};

function renderTablePage(id) {
  const state = window.paginationState[id];
  if (!state) return;
  const tbody = document.getElementById(`${id}-tbody`);
  if (!tbody) return;

  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const pageData = state.data.slice(startIndex, startIndex + state.itemsPerPage);

  // OPTIMASI ALGORITMA RENDER DOM:
  // Merakit string terlebih dahulu, kemudian menempelkannya ke DOM sekaligus.
  // Ini mencegah browser me-render ulang secara terus menerus (efisien untuk data banyak).
  const fragmentHTML = pageData.map((row) => state.renderRow(row)).join("");
  tbody.innerHTML = fragmentHTML;

  renderPaginationControls(id);
}

function renderPaginationControls(id) {
  const state = window.paginationState[id];
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
