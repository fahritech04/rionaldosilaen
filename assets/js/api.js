// api.js
window.WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwFg2HubxgMsHzSrVVLXpiZbU-W5kn0mIAbsXkfw3juA_YhnPfxnaKyfVBRQghWpScZMQ/exec";

// MAIN FETCH DATA
window.fetchDashboardData = async function() {
  if (!window.WEB_APP_URL) return;

  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("hidden");
    loader.style.display = "flex";
  }

  try {
    // Menambahkan parameter waktu untuk mencegah browser menggunakan Cache lama
    const fetchUrl = window.WEB_APP_URL + (window.WEB_APP_URL.includes("?") ? "&" : "?") + "t=" + new Date().getTime();
    const response = await fetch(fetchUrl);
    const data = await response.json();

    if (data.status === "success") {
      updateDashboardUI(data);
      if (typeof window.showToast === "function") window.showToast("Data berhasil disinkronisasi", "success");
    } else {
      if (typeof window.showToast === "function") window.showToast("Error Server: " + data.message, "error");
      console.error("Server error:", data.message);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    if (typeof window.showToast === "function") window.showToast("Error Fetch/CORS: " + error.message, "error");
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
};

function updateDashboardUI(data) {
  const num = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
  const str = (v) => String(v || "").trim();

  // Data Vendor Terbaik, Grafik VPI, dan Tabel VPI
  if (data.vpi_scoring_data && data.vpi_scoring_data.length > 0) {
    // Vendor Terbaik = Ranking == 1 (kolom index 5)
    const best = data.vpi_scoring_data.find((r) => str(r[5]) === "1" || str(r[5]) === "1.0");
    if (best) document.querySelector(".vendor-best").innerText = str(best[0]);

    // VPI Chart — label: Vendor, nilai: skor VPI (kolom index 4)
    if (typeof window.updateChartData === "function") {
      window.updateChartData(
        "vpiChart",
        data.vpi_scoring_data.map((r) => str(r[0])),
        [data.vpi_scoring_data.map((r) => num(r[4]))]
      );
    }

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

      if (typeof window.initPaginatedTable === "function") {
        window.initPaginatedTable({
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
      }

      // Update pesananChart dari DATA RIWAYAT VENDOR (Jumlah Pemesanan & Jumlah Return)
      const riwayatLabels = data.riwayat_raw_data.map((r) => str(r[0]));
      if (typeof window.updateChartData === "function") {
        window.updateChartData("pesananChart", riwayatLabels, [
          data.riwayat_raw_data.map((r) => num(r[1])), // Jumlah Pemesanan
          data.riwayat_raw_data.map((r) => num(r[2])), // Jumlah Return
        ]);

        // Update performaChart dari DATA RIWAYAT VENDOR (Jumlah Pengiriman & Total Pengiriman Delay)
        window.updateChartData("performaChart", riwayatLabels, [
          data.riwayat_raw_data.map((r) => num(r[3])), // Jumlah Pengiriman
          data.riwayat_raw_data.map((r) => num(r[4])), // Total Pengiriman Delay
        ]);
      }
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
        if (typeof window.initPaginatedTable === "function") {
          window.initPaginatedTable({
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
        }
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

    if (typeof window.initPaginatedTable === "function") {
      window.initPaginatedTable({
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

      if (typeof window.initPaginatedTable === "function") {
        window.initPaginatedTable({
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
}
