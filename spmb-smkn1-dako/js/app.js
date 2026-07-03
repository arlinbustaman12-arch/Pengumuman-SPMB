/**
 * ============================================================
 * app.js - Entry Point Aplikasi
 * ============================================================
 * Menginisialisasi seluruh modul dan mengkoordinasikan
 * alur utama aplikasi SPMB.
 * ============================================================
 */

const App = (() => {
  /**
   * Fungsi utama yang dijalankan saat DOM siap
   */
  async function start() {
    // 1. Inisialisasi AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 700,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
      });
    }

    // 2. Inisialisasi modul UI (dark mode, preloader, navbar, dll)
    UI.init();

    // 3. Tentukan apakah pengumuman sudah dibuka
    const isOpen = Countdown.isExpired();

    // 4. Set status badge sesuai kondisi
    UI.setStatus(isOpen);

    // 5. Jika pengumuman sudah dibuka, langsung tampilkan form
    if (isOpen) {
      await openAnnouncement();
    } else {
      // 6. Jika belum, jalankan countdown dan tunggu
      Countdown.init(async () => {
        // Callback saat countdown selesai
        UI.setStatus(true);
        await openAnnouncement();
      });
    }

    // 7. Inisialisasi modul pencarian (selalu, supaya siap saat dibutuhkan)
    Search.init();

    console.log('[App] SPMB SMKN 1 Dako Pemean berhasil diinisialisasi.');
  }

  /**
   * Buka pengumuman: fetch data, tampilkan statistik & form pencarian
   */
  async function openAnnouncement() {
    try {
      // Fetch semua data terlebih dahulu (untuk statistik & cache)
      await API.fetchAll();

      // Update statistik
      UI.updateStats();

      // Tampilkan section pencarian, statistik, hasil
      UI.showSearchSections();

      // Toast selamat datang
      setTimeout(() => {
        UI.toast('success', 'Pengumuman Dibuka', 'Silakan masukkan kode jurusan untuk melihat hasil seleksi.');
      }, 500);

    } catch (error) {
      console.error('[App] Gagal membuka pengumuman:', error);

      // Tetap tampilkan form meski error (dengan data demo fallback)
      UI.showSearchSections();
      UI.toast('warning', 'Perhatian', 'Data dimuat dalam mode demo. Hubungkan ke Google Spreadsheet untuk data nyata.');
    }
  }

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Public API (jika diperlukan)
  return { start };
})();