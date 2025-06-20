document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeButton(currentTheme);

  themeToggle.addEventListener('click', function () {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
    this.blur();
  });

  function updateThemeButton(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️ Mode Terang' : '🌙 Mode Gelap';
  }

  const apiPopup = document.getElementById('apiPopup');
  const closePopup = document.getElementById('closePopup');
  const popupBody = document.getElementById('popupBody');
  const popupTitle = document.getElementById('popupTitle');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const statusNotification = document.getElementById('statusNotification');
  const comicBannerContainer = document.getElementById('comic-banner-container');
  const searchInput = document.getElementById('searchInput');

  closePopup.addEventListener('click', () => apiPopup.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === apiPopup) apiPopup.style.display = 'none';
  });

  searchInput.addEventListener('input', debounce(handleSearch, 300));
  loadApiData();

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.api-card');

    cards.forEach(card => {
      const name = card.dataset.apiName || '';
      const desc = card.dataset.apiDesc || '';
      const visible = name.includes(searchTerm) || desc.includes(searchTerm);
      card.style.display = visible ? 'block' : 'none';

      const category = card.closest('.category');
      if (category) {
        const hasVisible = Array.from(category.querySelectorAll('.api-card'))
          .some(c => c.style.display !== 'none');
        category.style.display = hasVisible ? 'block' : 'none';
      }
    });
  }

  function showStatusNotification(message) {
    statusNotification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    statusNotification.style.display = 'block';
    statusNotification.classList.add('animate__animated', 'animate__bounceIn');

    setTimeout(() => {
      statusNotification.classList.remove('animate__bounceIn');
      statusNotification.style.display = 'none';
    }, 3500);
  }

  function createComicBanner(bannerImage) {
    if (!bannerImage) return;
    comicBannerContainer.innerHTML = `
      <img src="${bannerImage}" alt="Banner Rest Apis" loading="lazy">
      <div class="banner-caption">Selamat Menggunakan -/o/-</div>
      <div class="speech-bubble" style="top: 20px; right: 20px;">Coba API gratis sekarang!</div>
      <div class="speech-bubble" style="bottom: 40px; left: 20px; animation-delay: 0.5s;">Keren banget!</div>
    `;
  }

  window.addEventListener('scroll', () => {
    document.querySelectorAll('.category').forEach(category => {
      const rect = category.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) category.classList.add('visible');
    });
  });

  async function loadApiData() {
    try {
      const response = await fetch('/src/web-set.json');
      if (!response.ok) throw new Error('Gagal memuat data: ' + response.status);
      const data = await response.json();

      document.getElementById('api-name').textContent = data.name;
      document.getElementById('api-status').textContent = data.header.status;
      document.getElementById('api-description').textContent = data.description;
      document.getElementById('api-creator').textContent = data.apiSettings.creator;
      document.getElementById('api-version').textContent = data.version;

      if (data.bannerImage) createComicBanner(data.bannerImage);

      const categoriesContainer = document.getElementById('categories-container');
      categoriesContainer.innerHTML = '';

      data.categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.name;
        const apiGrid = document.createElement('div');
        apiGrid.className = 'api-grid';

        category.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'api-card';
          card.dataset.apiName = item.name.toLowerCase();
          card.dataset.apiDesc = item.desc.toLowerCase();

          const nameEl = document.createElement('h3');
          nameEl.className = 'api-name';
          nameEl.textContent = item.name;

          const badge = document.createElement('span');
          badge.className = `api-key-badge ${item.requireKey ? '' : 'public'}`;
          badge.textContent = item.requireKey ? 'Butuh Key' : 'Publik';
          nameEl.appendChild(badge);

          const desc = document.createElement('p');
          desc.className = 'api-desc';
          desc.textContent = item.desc;

          const path = document.createElement('code');
          path.className = 'api-path';
          path.textContent = item.path;

          const pathBtn = document.createElement('button');
          pathBtn.className = 'copy-path-btn';
          pathBtn.innerHTML = '<i class="far fa-copy"></i>';
          pathBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(item.path).then(() => {
              pathBtn.innerHTML = '<i class="fas fa-check"></i>';
              setTimeout(() => pathBtn.innerHTML = '<i class="far fa-copy"></i>', 2000);
            });
          });

          const pathWrap = document.createElement('div');
          pathWrap.className = 'api-path-container';
          pathWrap.append(path, pathBtn);

          const statusEl = document.createElement('span');
          statusEl.className = `api-status status-${item.status.toLowerCase()}`;
          statusEl.innerHTML = `<i class="fas fa-${item.status === 'ready' ? 'circle-check' : 'tools'}"></i> ${item.status}`;

          const tryBtn = document.createElement('button');
          tryBtn.className = 'try-btn';
          tryBtn.textContent = 'Coba Sekarang';

          if (item.status.toLowerCase() !== 'ready') {
            tryBtn.classList.add('disabled');
            tryBtn.addEventListener('click', () => showStatusNotification(`Endpoint ini sedang ${item.status.toLowerCase()}!`));
          } else {
            tryBtn.addEventListener('click', () => toggleTryContainer(card, item));
          }

          card.append(nameEl, desc, pathWrap, statusEl, tryBtn);
          apiGrid.appendChild(card);
        });

        categoryElement.append(categoryTitle, apiGrid);
        categoriesContainer.appendChild(categoryElement);
      });

    } catch (err) {
      popupBody.innerHTML = `<div class='error'><i class="fas fa-bug"></i> Gagal memuat data API: ${err.message}</div>`;
    }
  }

  function toggleTryContainer(card, item) {
    let container = card.querySelector('.try-container');
    if (!container) container = createTryContainer(card, item);
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  }

  function createTryContainer(card, item) {
    const container = document.createElement('div');
    container.className = 'try-container';

    if (item.requireKey) {
      const input = document.createElement('input');
      input.placeholder = 'API Key';
      input.id = `api-key-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
      container.appendChild(input);
    }

    Object.entries(item.params || {}).forEach(([key, desc]) => {
      const input = document.createElement('input');
      input.placeholder = desc;
      input.id = `param-${key}-${item.name.replace(/\s+/g, '-').toLowerCase()}`;
      container.appendChild(input);
    });

    const runBtn = document.createElement('button');
    runBtn.textContent = 'Run';
    runBtn.className = 'execute-btn';
    runBtn.addEventListener('click', () => executeApi(item));
    container.appendChild(runBtn);

    card.appendChild(container);
    return container;
  }

  async function executeApi(item) {
    popupTitle.textContent = `Hasil ${item.name}`;
    popupBody.innerHTML = '<div class="loading"></div><p style="text-align:center">Mengambil data...</p>';
    apiPopup.style.display = 'flex';

    try {
      let url = item.path.split('?')[0];
      const params = new URLSearchParams();

      if (item.requireKey) {
        const keyInput = document.getElementById(`api-key-${item.name.replace(/\s+/g, '-').toLowerCase()}`);
        if (keyInput && keyInput.value.trim()) params.append('apikey', keyInput.value.trim());
      }

      Object.entries(item.params || {}).forEach(([key]) => {
        const input = document.getElementById(`param-${key}-${item.name.replace(/\s+/g, '-').toLowerCase()}`);
        if (input && input.value.trim()) params.append(key, input.value.trim());
      });

      if (params.toString()) url += '?' + params.toString();

      const res = await fetch(url);
      const json = await res.json();

      popupBody.innerHTML = `<pre class='result-content'>${JSON.stringify(json, null, 2)}</pre>`;
    } catch (err) {
      popupBody.innerHTML = `<div class='error-message'><i class="fas fa-times-circle"></i> ${err.message}</div>`;
    }
  }

  copyResultBtn.addEventListener('click', function () {
    const pre = popupBody.querySelector('pre');
    if (pre) {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        copyResultBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        setTimeout(() => copyResultBtn.innerHTML = '<i class="fas fa-copy"></i> Salin', 2000);
      });
    }
  });
});