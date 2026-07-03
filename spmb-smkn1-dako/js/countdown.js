/**
 * ============================================================
 * countdown.js - Modul Countdown Timer
 * ============================================================
 * Mengelola hitung mundur menuju waktu pengumuman SPMB.
 * Otomatis menyembunyikan diri dan menampilkan form pencarian
 * saat waktu pengumuman tercapai.
 * ============================================================
 */

const Countdown = (() => {
  // Waktu pengumuman: 3 Juli 2026 pukul 015:00 WITA (UTC+8)
  const TARGET_DATE = new Date('2026-07-03T15:00:00+08:00');

  // Elemen DOM
  let elDays, elHours, elMinutes, elSeconds, elWrapper;
  let intervalId = null;
  let onCompleteCallback = null;

  /**
   * Inisialisasi countdown timer
   * @param {Function} onComplete - Callback yang dipanggil saat countdown selesai
   */
  function init(onComplete) {
    elDays = document.getElementById('cd-days');
    elHours = document.getElementById('cd-hours');
    elMinutes = document.getElementById('cd-minutes');
    elSeconds = document.getElementById('cd-seconds');
    elWrapper = document.getElementById('countdown-wrapper');
    onCompleteCallback = onComplete;

    if (!elDays || !elHours || !elMinutes || !elSeconds) {
      console.warn('[Countdown] Elemen DOM tidak ditemukan.');
      return;
    }

    // Cek apakah sudah lewat waktu pengumuman
    if (isExpired()) {
      hide();
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    // Mulai hitung mundur
    update();
    intervalId = setInterval(update, 1000);
  }

  /**
   * Cek apakah waktu target sudah terlewati
   * @returns {boolean}
   */
  function isExpired() {
    return Date.now() >= TARGET_DATE.getTime();
  }

  /**
   * Update tampilan countdown setiap detik
   */
  function update() {
    const now = Date.now();
    const diff = TARGET_DATE.getTime() - now;

    if (diff <= 0) {
      // Countdown selesai
      setDisplay(0, 0, 0, 0);
      stop();
      hide();
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setDisplay(days, hours, minutes, seconds);
  }

  /**
   * Set nilai angka countdown dengan animasi flip
   */
  function setDisplay(d, h, m, s) {
    animateNumber(elDays, String(d).padStart(2, '0'));
    animateNumber(elHours, String(h).padStart(2, '0'));
    animateNumber(elMinutes, String(m).padStart(2, '0'));
    animateNumber(elSeconds, String(s).padStart(2, '0'));
  }

  /**
   * Animasi flip saat angka berubah
   * @param {HTMLElement} el - Elemen angka
   * @param {string} value - Nilai baru
   */
  function animateNumber(el, value) {
    if (el.textContent !== value) {
      el.textContent = value;
      el.classList.remove('flip');
      // Force reflow untuk restart animasi
      void el.offsetWidth;
      el.classList.add('flip');
    }
  }

  /**
   * Sembunyikan countdown dengan animasi fade out
   */
  function hide() {
    if (elWrapper) {
      elWrapper.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      elWrapper.style.opacity = '0';
      elWrapper.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        elWrapper.style.display = 'none';
      }, 600);
    }
  }

  /**
   * Hentikan interval countdown
   */
  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // Public API
  return { init, isExpired, stop };
})();
