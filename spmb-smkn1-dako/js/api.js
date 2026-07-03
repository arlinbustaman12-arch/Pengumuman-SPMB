/**
 * ============================================================
 * api.js - Modul API & Pengelolaan Data
 * ============================================================
 * Menangani pengambilan data dari Google Apps Script API.
 * Jika URL belum dikonfigurasi (masih placeholder), akan
 * menggunakan data demo bawaan agar website tetap berfungsi.
 * ============================================================
 */

const API = (() => {
  // Ganti dengan URL deployment Google Apps Script Anda
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbz0tEytD_38IX5ulTLdCZMrXqQjwiyow2Cg_YWArcWBfaqmuHhobk0RV8uOH3GD5zln/exec';

  // Cache data yang sudah di-fetch
  let cachedData = null;

  // Flag apakah sedang menggunakan mode demo
  let isDemoMode = false;

  /**
   * Data demo untuk pengujian tanpa koneksi ke Google Spreadsheet.
   * Hapus atau kosongkan array ini di produksi.
   */
  const DEMO_DATA = [
    { no: 1, nama: 'Ahmad Fauzi Rahman', asalSekolah: 'SMP Negeri 1 Dako', jurusan: 'Agribisnis Tanaman Perkebunan', kodeJurusan: 'ATP' },
    { no: 2, nama: 'Siti Nurhaliza', asalSekolah: 'SMP Negeri 2 Dako', jurusan: 'Agribisnis Tanaman Perkebunan', kodeJurusan: 'ATP' },
    { no: 3, nama: 'Muhammad Rizky', asalSekolah: 'SMP Negeri 3 Bungku', jurusan: 'Agribisnis Tanaman Perkebunan', kodeJurusan: 'ATP' },
    { no: 4, nama: 'Fatimah Az-Zahra', asalSekolah: 'SMP Muhammadiyah Dako', jurusan: 'Agribisnis Tanaman Perkebunan', kodeJurusan: 'ATP' },
    { no: 5, nama: 'Rizki Pratama', asalSekolah: 'SMP Negeri 1 Bungku', jurusan: 'Agribisnis Tanaman Perkebunan', kodeJurusan: 'ATP' },
    { no: 6, nama: 'Dewi Sartika Putri', asalSekolah: 'SMP Negeri 1 Dako', jurusan: 'Agribisnis Ternak Unggas', kodeJurusan: 'ATU' },
    { no: 7, nama: 'Andi Saputra', asalSekolah: 'SMP Negeri 4 Bungku', jurusan: 'Agribisnis Ternak Unggas', kodeJurusan: 'ATU' },
    { no: 8, nama: 'Nur Aisyah', asalSekolah: 'SMP Negeri 2 Dako', jurusan: 'Agribisnis Ternak Unggas', kodeJurusan: 'ATU' },
    { no: 9, nama: 'Bayu Adi Nugroho', asalSekolah: 'SMP Negeri 1 Morowali', jurusan: 'Agribisnis Ternak Unggas', kodeJurusan: 'ATU' },
    { no: 10, nama: 'Putri Maharani', asalSekolah: 'SMP Negeri 3 Dako', jurusan: 'Agribisnis Ternak Unggas', kodeJurusan: 'ATU' },
    { no: 11, nama: 'Hendra Wijaya', asalSekolah: 'SMP Negeri 1 Luwuk', jurusan: 'Agribisnis Perikanan Air Payau dan Laut', kodeJurusan: 'APPL' },
    { no: 12, nama: 'Rina Wulandari', asalSekolah: 'SMP Negeri 2 Bungku', jurusan: 'Agribisnis Perikanan Air Payau dan Laut', kodeJurusan: 'APPL' },
    { no: 13, nama: 'Fajar Maulana', asalSekolah: 'SMP Negeri 1 Dako', jurusan: 'Agribisnis Perikanan Air Payau dan Laut', kodeJurusan: 'APPL' },
    { no: 14, nama: 'Sri Wahyuni', asalSekolah: 'SMP Negeri 5 Bungku', jurusan: 'Agribisnis Perikanan Air Payau dan Laut', kodeJurusan: 'APPL' },
    { no: 15, nama: 'Irfan Hakim', asalSekolah: 'SMP Negeri 2 Morowali', jurusan: 'Agribisnis Perikanan Air Payau dan Laut', kodeJurusan: 'APPL' },
  ];

  /**
   * Cek apakah URL API sudah dikonfigurasi
   * @returns {boolean}
   */
  function isConfigured() {
    return !BASE_URL.includes('YOUR_DEPLOYMENT_ID');
  }

  /**
   * Fetch semua data siswa dari API atau gunakan data demo
   * @returns {Promise<Array>} Array objek siswa
   */
  async function fetchAll() {
    // Kembalikan cache jika tersedia
    if (cachedData) return cachedData;

    // Jika API belum dikonfigurasi, gunakan data demo
    if (!isConfigured()) {
      isDemoMode = true;
      console.info('[API] Mode demo aktif. Ganti YOUR_DEPLOYMENT_ID di js/api.js untuk menggunakan data nyata.');
      cachedData = DEMO_DATA;
      return cachedData;
    }

    try {
      const response = await fetch(BASE_URL, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        cachedData = json.data;
        return cachedData;
      } else {
        throw new Error(json.error || 'Format respons tidak valid.');
      }
    } catch (error) {
      console.error('[API] Gagal mengambil data:', error.message);

      // Fallback ke data demo jika fetch gagal
      if (!cachedData) {
        isDemoMode = true;
        console.warn('[API] Fallback ke data demo karena error fetch.');
        cachedData = DEMO_DATA;
      }
      return cachedData;
    }
  }

  /**
   * Filter data berdasarkan kode jurusan (dari cache, tanpa fetch ulang)
   * @param {string} kode - Kode jurusan (ATP/ATU/APPL)
   * @returns {Promise<Array>} Array siswa yang terfilter
   */
  async function filterByKode(kode) {
    const allData = await fetchAll();
    const normalizedKode = kode.trim().toUpperCase();
    return allData.filter(s =>
      s.kodeJurusan && s.kodeJurusan.toUpperCase() === normalizedKode
    );
  }

  /**
   * Hitung statistik per jurusan dari data cache
   * @returns {Object} { atp: number, atu: number, appl: number, total: number }
   */
  function getStats() {
    if (!cachedData) return { atp: 0, atu: 0, appl: 0, total: 0 };

    return {
      atp: cachedData.filter(s => s.kodeJurusan && s.kodeJurusan.toUpperCase() === 'ATP').length,
      atu: cachedData.filter(s => s.kodeJurusan && s.kodeJurusan.toUpperCase() === 'ATU').length,
      appl: cachedData.filter(s => s.kodeJurusan && s.kodeJurusan.toUpperCase() === 'APPL').length,
      total: cachedData.length,
    };
  }

  /**
   * Cek apakah sedang dalam mode demo
   * @returns {boolean}
   */
  function inDemoMode() {
    return isDemoMode;
  }

  /**
   * Bersihkan cache (untuk force refresh)
   */
  function clearCache() {
    cachedData = null;
    isDemoMode = false;
  }

  // Public API
  return { fetchAll, filterByKode, getStats, inDemoMode, clearCache, isConfigured };
})();