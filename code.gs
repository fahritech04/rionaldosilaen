const SHEET_VPI = "IMPLEMENTASI VPI";
const SHEET_QC = "IMPLEMENTASI AQL";
const SHEET_FIFO = "IMPLEMENTASI FIFO";
const SHEET_DEFECT = "ADMINISTRASI VENDOR";
const SHEET_MRP = "IMPLEMENTASI MRP";
const SHEET_RIWAYAT = "DATA RIWAYAT VENDOR";

function doGet(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var vpiSheet = ss.getSheetByName(SHEET_VPI);
    var qcSheet = ss.getSheetByName(SHEET_QC);
    var fifoSheet = ss.getSheetByName(SHEET_FIFO);
    var defectSheet = ss.getSheetByName(SHEET_DEFECT);
    var mrpSheet = ss.getSheetByName(SHEET_MRP);
    var riwayatSheet = ss.getSheetByName(SHEET_RIWAYAT);

    // Ambil rentang spesifik dari sheet & kolom tertentu.
    function getRange(sheet, startRow, startCol, numRows, numCols) {
      if (!sheet) return [];
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      var endRow = numRows ? Math.min(startRow + numRows - 1, lastRow) : lastRow;
      var endCol = numCols ? Math.min(startCol + numCols - 1, lastCol) : lastCol;
      if (endRow < startRow || endCol < startCol) return [];
      return sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1).getDisplayValues();
    }

    var data = { status: "success" };

    // Riwayat Raw Data (Pemesanan, Return, Kirim, dsb)
    data.riwayat_raw_data = getRange(riwayatSheet, 5, 2, 3, 6);

    // VPI Scoring Data
    data.vpi_scoring_data = getRange(riwayatSheet, 11, 2, 3, 6);

    // MRP — B6 sampai ujung (mencakup MPS header, Komponen header, GR, SR, PoH, NR, PORt, PORel)
    data.mrp_data = getRange(mrpSheet, 6, 2);

    // QC — B5 sampai ujung (semua baris log inspeksi), 14 kolom (B sampai O)
    data.qc_data = getRange(qcSheet, 5, 2, null, 14);

    // FIFO Judul & Kapasitas — D2
    var fifoTitleData = getRange(fifoSheet, 2, 4, 1, 1);
    data.fifo_title = fifoTitleData && fifoTitleData.length > 0 ? fifoTitleData[0][0] : "Penyimpanan FIFO";

    // FIFO Sisa Stok dan Detail Transaksi
    
    // Ambil seluruh data FIFO untuk diproses manual
    var fifoRaw = fifoSheet.getDataRange().getDisplayValues();
    
    // Ambil Sisa Stok (Baris 2)
    var sisaStokData = [];
    if (fifoRaw.length > 1) {
      sisaStokData.push(["K-1-PUTIH", "-", "-", fifoRaw[1][2]]);
      sisaStokData.push(["K-1-ABU-ABU", "-", "-", fifoRaw[1][13]]);
      sisaStokData.push(["K-1-HITAM", "-", "-", fifoRaw[1][24]]);
    }
    data.fifo_stok_data = sisaStokData;

    // Ambil Detail Transaksi (Tiap material 10 kolom)
    var detailData = {
      "K-1-PUTIH": [],
      "K-1-ABU-ABU": [],
      "K-1-HITAM": []
    };
    
    if (fifoRaw.length > 4) {
      // Ganti label header kumulatif yang rusak menjadi rapi
      var hRow = fifoRaw[3]; 
      
      var headerCols = [
        "Sisa Stok (kg)", "Tanggal", "Barang (IN/OUT)", "Kode Material", "Vendor", 
        "Masuk (kg)", "Keluar (kg)", "Ambil Barang di Tgl", "Kumulatif Masuk (kg)", "Kumulatif Keluar (kg)"
      ];

      detailData["K-1-PUTIH"].push(headerCols);
      detailData["K-1-ABU-ABU"].push(headerCols);
      detailData["K-1-HITAM"].push(headerCols);
      
      var txPutih = [];
      var txAbu = [];
      var txHitam = [];
      
      for (var i = 4; i < fifoRaw.length; i++) {
        var row = fifoRaw[i];
        
        // Ambil Data Material K-1-PUTIH
        if (row[2] && String(row[2]).trim() !== "") { // Verifikasi keberadaan Tanggal
          txPutih.push([row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]]);
        }
        
        // Ambil Data Material K-1-ABU-ABU
        if (row.length > 13 && row[13] && String(row[13]).trim() !== "") {
          txAbu.push([row[12], row[13], row[14], row[15], row[16], row[17], row[18], row[19], row[20], row[21]]);
        }
        
        // Ambil Data Material K-1-HITAM
        if (row.length > 24 && row[24] && String(row[24]).trim() !== "") {
          txHitam.push([row[23], row[24], row[25], row[26], row[27], row[28], row[29], row[30], row[31], row[32]]);
        }
      }
      
      // Urutkan data berdasarkan Tanggal (Kronologis)
      function parseIndoDate(dStr) {
        if (!dStr) return 0;
        dStr = String(dStr).toLowerCase().trim();
        var months = {"januari":1, "februari":2, "maret":3, "april":4, "mei":5, "juni":6, "juli":7, "agustus":8, "september":9, "oktober":10, "november":11, "desember":12};
        var parts = dStr.split(" ");
        if (parts.length >= 3) {
           var day = parseInt(parts[0]) || 0;
           var month = months[parts[1]] || 0;
           var year = parseInt(parts[2]) || 0;
           return new Date(year, month - 1, day).getTime();
        }
        return 0;
      }
      
      function sortByDate(a, b) {
        return parseIndoDate(a[1]) - parseIndoDate(b[1]); // Indeks kolom Tanggal
      }
      
      txPutih.sort(sortByDate);
      txAbu.sort(sortByDate);
      txHitam.sort(sortByDate);
      
      detailData["K-1-PUTIH"] = detailData["K-1-PUTIH"].concat(txPutih);
      detailData["K-1-ABU-ABU"] = detailData["K-1-ABU-ABU"].concat(txAbu);
      detailData["K-1-HITAM"] = detailData["K-1-HITAM"].concat(txHitam);
    }
    
    data.fifo_detail_data = detailData;

    // Defect — B6:N9 (header + 3 baris data)
    data.defect_data = getRange(defectSheet, 6, 2, 4, 13);

    data.last_update = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMMM yyyy HH:mm:ss");

    return output.setContent(JSON.stringify(data));
  } catch (err) {
    return output.setContent(
      JSON.stringify({
        status: "error",
        message: err.message,
        stack: err.stack,
      }),
    );
  }
}
