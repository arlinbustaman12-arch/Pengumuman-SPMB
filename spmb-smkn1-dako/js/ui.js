/**
 * ============================================================
 * ui.js - Modul UI (Dark Mode, Preloader, Toast, Cetak, Bagikan)
 * ============================================================
 * Menangani semua aspek UI yang tidak terkait langsung
 * dengan pencarian: dark mode toggle, preloader, notifikasi
 * SweetAlert2, cetak hasil, download PDF, dan share WhatsApp.
 * ============================================================
 */

const UI = (() => {
  // Elemen DOM
  let preloader, btnDarkMode, iconDarkMode, navbar, btnScrollTop;
  let btnPrint, btnPdf, btnShareWa;

  /**
   * Inisialisasi modul UI
   */
  function init() {
    preloader = document.getElementById('preloader');
    btnDarkMode = document.getElementById('btn-dark-mode');
    iconDarkMode = document.getElementById('icon-dark-mode');
    navbar = document.getElementById('navbar');
    btnScrollTop = document.getElementById('btn-scroll-top');
    btnPrint = document.getElementById('btn-print');
    btnPdf = document.getElementById('btn-pdf');
    btnShareWa = document.getElementById('btn-share-wa');

    initDarkMode();
    initPreloader();
    initNavbar();
    initScrollTop();
    initActions();
  }

  // ==================== DARK MODE ====================

  /**
   * Inisialisasi dark mode dari localStorage atau preferensi sistem
   */
  function initDarkMode() {
    if (!btnDarkMode) return;

    const saved = localStorage.getItem('spmb-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved !== null ? saved === 'true' : prefersDark;

    applyDarkMode(isDark);

    btnDarkMode.addEventListener('click', toggleDarkMode);
  }

  /**
   * Toggle dark mode on/off
   */
  function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('spmb-dark-mode', String(isDark));
    applyDarkMode(isDark);
  }

  /**
   * Terapkan state dark mode ke ikon
   * @param {boolean} isDark
   */
  function applyDarkMode(isDark) {
    if (iconDarkMode) {
      iconDarkMode.className = isDark ? 'fas fa-sun text-sm' : 'fas fa-moon text-sm';
    }
  }

  // ==================== PRELOADER ====================

  /**
   * Sembunyikan preloader setelah halaman siap
   */
  function initPreloader() {
    if (!preloader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 600);
    });
  }

  // ==================== NAVBAR ====================

  /**
   * Tambahkan class 'scrolled' pada navbar saat scroll ke bawah
   */
  function initNavbar() {
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }, { passive: true });
  }

  // ==================== SCROLL TO TOP ====================

  /**
   * Tampilkan tombol scroll to top saat scroll ke bawah
   */
  function initScrollTop() {
    if (!btnScrollTop) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btnScrollTop.classList.add('visible');
      } else {
        btnScrollTop.classList.remove('visible');
      }
    }, { passive: true });

    btnScrollTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== TOMBOL AKSI (CETAK, PDF, SHARE) ====================

  /**
   * Inisialisasi event listener untuk tombol aksi hasil
   */
  function initActions() {
    if (btnPrint) btnPrint.addEventListener('click', handlePrint);
    if (btnPdf) btnPdf.addEventListener('click', handlePdf);
    if (btnShareWa) btnShareWa.addEventListener('click', handleShareWhatsApp);
  }

  /**
   * Cetak hasil dengan window.print()
   */
  function handlePrint() {
    window.print();
  }

  /**
   * Download PDF (menggunakan window.print() dengan tip nama file PDF)
   */
  function handlePdf() {
    toast('info', 'Simpan sebagai PDF', 'Pada dialog cetak, pilih "Save as PDF" sebagai tujuan printer.');
    setTimeout(() => window.print(), 800);
  }

  /**
   * Bagikan hasil ke WhatsApp
   */
  function handleShareWhatsApp() {
    const kode = Search.getActiveKode();
    const stats = API.getStats();
    const dept = Search.DEPT_MAP[kode];

    let count = 0;
    if (kode === 'ATP') count = stats.atp;
    else if (kode === 'ATU') count = stats.atu;
    else if (kode === 'APPL') count = stats.appl;

    const deptName = dept ? dept.name : kode;
    const url = window.location.href;

    const message = `*PENGUMUMAN SPMB SMKN 1 DAKO PEMEAN 2025/2026*

Jurusan: ${deptName} (${kode})
Jumlah Diterima: ${count} siswa

Lihat selengkapnya: ${url}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  // ==================== TOAST / NOTIFIKASI ====================

  /**
   * Tampilkan notifikasi menggunakan SweetAlert2
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} title
   * @param {string} message
   * @param {number} duration - Durasi tampil dalam ms (default 3000)
   */
  function toast(type, title, message, duration = 3000) {
    const iconMap = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    Toast.fire({
      icon: iconMap[type] || 'info',
      title: title,
      text: message,
    });
  }

  /**
   * Tampilkan SweetAlert2 dialog
   * @param {Object} options - Opsi Swal.fire
   */
  function alert(options) {
    return Swal.fire({
      confirmButtonColor: '#0F4C81',
      ...options,
    });
  }

  // ==================== STATISTIK ANIMASI ====================

  /**
   * Animasi angka naik dari 0 ke target
   * @param {HTMLElement} el - Elemen target
   * @param {number} target - Angka target
   * @param {number} duration - Durasi animasi ms
   */
  function animateNumber(el, target, duration = 800) {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Update tampilan statistik dengan animasi
   */
  function updateStats() {
    const stats = API.getStats();

    animateNumber(document.getElementById('stat-atp'), stats.atp);
    animateNumber(document.getElementById('stat-atu'), stats.atu);
    animateNumber(document.getElementById('stat-appl'), stats.appl);
    animateNumber(document.getElementById('stat-total'), stats.total);
  }

  // ==================== STATUS BADGE ====================

  /**
   * Update status badge (sebelum/sesudah pengumuman)
   * @param {boolean} isOpen - true jika pengumuman sudah dibuka
   */
  function setStatus(isOpen) {
    const statusText = document.getElementById('status-text');
    if (!statusText) return;

    if (isOpen) {
      statusText.className = 'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-heading font-bold tracking-wide status-after';
      statusText.innerHTML = '<span class="status-dot"></span> PENGUMUMAN SUDAH DIBUKA';
    } else {
      statusText.className = 'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-heading font-bold tracking-wide status-before';
      statusText.innerHTML = '<span class="status-dot"></span> PENGUMUMAN BELUM DIBUKA';
    }
  }

  // ==================== SHOW/HIDE SECTIONS ====================

  /**
   * Tampilkan section pencarian, statistik, dan hasil
   */
  function showSearchSections() {
    const sections = ['search-section', 'stats-section', 'results-section'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('hidden');
        // Trigger AOS refresh untuk animasi masuk
        if (typeof AOS !== 'undefined') {
          AOS.refresh();
        }
      }
    });
  }

  // Public API
  return {
    init,
    toast,
    alert,
    updateStats,
    setStatus,
    showSearchSections,
    animateNumber,
  };
})();