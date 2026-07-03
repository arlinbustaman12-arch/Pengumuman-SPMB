/**
 * ============================================================
 * search.js - Modul Pencarian & Rendering Hasil
 * ============================================================
 * Menangani form pencarian, validasi input, instant search
 * dengan debounce, dan rendering hasil ke tabel (desktop)
 * serta kartu (mobile).
 * ============================================================
 */

const Search = (() => {
  // Kode jurusan yang valid
  const VALID_CODES = ['ATP', 'ATU', 'APPL'];

  // Pemetaan kode ke detail jurusan
  const DEPT_MAP = {
    ATP: { name: 'Agribisnis Tanaman Perkebunan', icon: 'fa-seedling', badgeClass: 'badge-atp' },
    ATU: { name: 'Agribisnis Ternak Unggas', icon: 'fa-dove', badgeClass: 'badge-atu' },
    APPL: { name: 'Agribisnis Perikanan Air Payau dan Laut', icon: 'fa-fish', badgeClass: 'badge-appl' },
  };

  // Elemen DOM
  let form, input, btnSearch, errorEl;
  let tableWrapper, tbody, cardsWrapper;
  let skeletonLoader, emptyState, resultActions;
  let resultsTitle, resultsSubtitle;
  let quickFilterBtns;

  // Timer debounce untuk instant search
  let debounceTimer = null;
  const DEBOUNCE_DELAY = 400;

  // Kode jurusan yang sedang aktif dicari
  let activeKode = null;

  /**
   * Inisialisasi modul pencarian
   */
  function init() {
    form = document.getElementById('search-form');
    input = document.getElementById('search-input');
    btnSearch = document.getElementById('btn-search');
    errorEl = document.getElementById('search-error');
    tableWrapper = document.getElementById('table-wrapper');
    tbody = document.getElementById('results-tbody');
    cardsWrapper = document.getElementById('cards-wrapper');
    skeletonLoader = document.getElementById('skeleton-loader');
    emptyState = document.getElementById('empty-state');
    resultActions = document.getElementById('result-actions');
    resultsTitle = document.getElementById('results-title');
    resultsSubtitle = document.getElementById('results-subtitle');
    quickFilterBtns = document.querySelectorAll('.btn-quick-filter');

    if (!form || !input) {
      console.warn('[Search] Elemen form tidak ditemukan.');
      return;
    }

    // Event: submit form
    form.addEventListener('submit', handleSubmit);

    // Event: input untuk instant search
    input.addEventListener('input', handleInput);

    // Event: quick filter buttons
    quickFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const kode = btn.dataset.kode;
        if (kode) {
          input.value = kode;
          clearError();
          setActiveQuickFilter(kode);
          performSearch(kode);
        }
      });
    });
  }

  /**
   * Handle submit form
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    const kode = input.value.trim().toUpperCase();
    if (validate(kode)) {
      setActiveQuickFilter(kode);
      performSearch(kode);
    }
  }

  /**
   * Handle input untuk instant search dengan debounce
   */
  function handleInput() {
    const kode = input.value.trim().toUpperCase();

    // Hapus error saat mengetik
    clearError();

    // Reset quick filter highlight jika input tidak cocok
    if (!VALID_CODES.includes(kode)) {
      clearActiveQuickFilter();
    }

    // Debounce: tunggu user berhenti mengetik
    clearTimeout(debounceTimer);

    if (kode.length >= 2) {
      debounceTimer = setTimeout(() => {
        if (VALID_CODES.includes(kode)) {
          setActiveQuickFilter(kode);
          performSearch(kode);
        }
      }, DEBOUNCE_DELAY);
    }
  }

  /**
   * Validasi input kode jurusan
   * @param {string} kode
   * @returns {boolean}
   */
  function validate(kode) {
    if (!kode) {
      showError('Silakan masukkan kode jurusan.');
      return false;
    }
    if (!VALID_CODES.includes(kode)) {
      showError(`Kode "${kode}" tidak valid. Gunakan: ATP, ATU, atau APPL.`);
      return false;
    }
    clearError();
    return true;
  }

  /**
   * Tampilkan pesan error di bawah input
   * @param {string} msg
   */
  function showError(msg) {
    if (!errorEl) return;
    errorEl.querySelector('span').textContent = msg;
    errorEl.classList.remove('hidden');
    input.classList.add('input-error');
  }

  /**
   * Sembunyikan pesan error
   */
  function clearError() {
    if (!errorEl) return;
    errorEl.classList.add('hidden');
    input.classList.remove('input-error');
  }

  /**
   * Set highlight pada quick filter button yang aktif
   * @param {string} kode
   */
  function setActiveQuickFilter(kode) {
    quickFilterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.kode === kode);
    });
  }

  /**
   * Hapus highlight semua quick filter button
   */
  function clearActiveQuickFilter() {
    quickFilterBtns.forEach(btn => btn.classList.remove('active'));
  }

  /**
   * Lakukan pencarian dan render hasil
   * @param {string} kode
   */
  async function performSearch(kode) {
    activeKode = kode;
    const dept = DEPT_MAP[kode];

    // Update judul hasil
    if (resultsTitle) resultsTitle.textContent = `Hasil Seleksi - ${kode}`;
    if (resultsSubtitle) resultsSubtitle.textContent = dept ? dept.name : '';

    // Tampilkan skeleton loading
    showSkeleton();
    hideTable();
    hideCards();
    hideEmpty();

    try {
      const data = await API.filterByKode(kode);

      // Sembunyikan skeleton
      hideSkeleton();

      if (data.length === 0) {
        showEmpty();
        hideActions();
      } else {
        renderTable(data, dept);
        renderCards(data, dept);
        showTable();
        showCards();
        showActions();
      }

      // Notifikasi jika mode demo
      if (API.inDemoMode()) {
        UI.toast('info', 'Mode Demo', 'Menampilkan data contoh. Hubungkan ke Google Spreadsheet untuk data nyata.');
      }
    } catch (error) {
      hideSkeleton();
      showEmpty();
      hideActions();
      UI.toast('error', 'Error', 'Gagal memuat data. Silakan coba lagi.');
      console.error('[Search] Error:', error);
    }
  }

  /**
   * Render data ke tabel desktop
   * @param {Array} data
   * @param {Object} dept
   */
  function renderTable(data, dept) {
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.className = 'table-row table-row-enter';
      tr.style.animationDelay = `${index * 50}ms`;

      tr.innerHTML = `
        <td class="table-td font-semibold text-slate-500 dark:text-slate-400">${item.no || index + 1}</td>
        <td class="table-td font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(item.nama)}</td>
        <td class="table-td text-slate-600 dark:text-slate-300 hidden md:table-cell">${escapeHtml(item.asalSekolah)}</td>
        <td class="table-td">
          ${dept ? `<span class="badge-jurusan ${dept.badgeClass}"><i class="fas ${dept.icon} text-[10px]"></i> ${kodeToShort(activeKode)}</span>` : escapeHtml(item.jurusan)}
      `;

      tbody.appendChild(tr);
    });
  }

  /**
   * Render data ke kartu mobile
   * @param {Array} data
   * @param {Object} dept
   */
  function renderCards(data, dept) {
    if (!cardsWrapper) return;
    cardsWrapper.innerHTML = '';

    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${index * 60}ms`;

      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-xs font-bold">${item.no || index + 1}</span>
          ${dept ? `<span class="badge-jurusan ${dept.badgeClass} text-[11px]"><i class="fas ${dept.icon} text-[9px]"></i> ${kodeToShort(activeKode)}</span>` : ''}
        </div>
        <h4 class="font-heading font-bold text-base text-slate-800 dark:text-white mb-1">${escapeHtml(item.nama)}</h4>
        <p class="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
          <i class="fas fa-school text-xs text-slate-400"></i>
          ${escapeHtml(item.asalSekolah)}
        </p>
      `;

      cardsWrapper.appendChild(card);
    });
  }

  /**
   * Konversi kode jurusan ke nama pendek
   */
  function kodeToShort(kode) {
    const map = { ATP: 'Tanaman Perkebunan', ATU: 'Ternak Unggas', APPL: 'Perikanan' };
    return map[kode] || kode;
  }

  /**
   * Escape HTML untuk mencegah XSS
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Fungsi show/hide elemen ---
  function showSkeleton() { if (skeletonLoader) skeletonLoader.classList.remove('hidden'); }
  function hideSkeleton() { if (skeletonLoader) skeletonLoader.classList.add('hidden'); }
  function showTable() { if (tableWrapper) tableWrapper.classList.remove('hidden'); }
  function hideTable() { if (tableWrapper) tableWrapper.classList.add('hidden'); }
  function showCards() { if (cardsWrapper) cardsWrapper.classList.remove('hidden'); }
  function hideCards() { if (cardsWrapper) cardsWrapper.classList.add('hidden'); }
  function showEmpty() { if (emptyState) emptyState.classList.remove('hidden'); }
  function hideEmpty() { if (emptyState) emptyState.classList.add('hidden'); }
  function showActions() { if (resultActions) resultActions.classList.remove('hidden'); resultActions.classList.add('flex'); }
  function hideActions() { if (resultActions) resultActions.classList.add('hidden'); resultActions.classList.remove('flex'); }

  /**
   * Dapatkan kode jurusan yang sedang aktif
   * @returns {string|null}
   */
  function getActiveKode() {
    return activeKode;
  }

  // Public API
  return { init, getActiveKode, DEPT_MAP };
})();
