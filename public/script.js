// === Theme Toggle ===
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton(currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButton(newTheme);
  themeToggle.blur();
});

function updateThemeButton(theme) {
  themeToggle.textContent = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
}

// === Typing Banner Animation ===
const typingText = document.getElementById('typingText');
const messages = [
  "Ayo cobain Strix Apis sekarang!",
  "Gratis dan powerful untuk developer!",
  "API lengkap dan mudah digunakan!",
  "Strix Apis bantu produktivitasmu!"
];

let msgIndex = 0;
let charIndex = 0;
let isDeleting = false;

function animateTyping() {
  const current = messages[msgIndex];
  typingText.textContent = current.substring(0, charIndex);

  if (!isDeleting && charIndex < current.length) {
    charIndex++;
    setTimeout(animateTyping, 60);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(animateTyping, 40);
  } else {
    isDeleting = !isDeleting;
    if (!isDeleting) msgIndex = (msgIndex + 1) % messages.length;
    setTimeout(animateTyping, isDeleting ? 1000 : 600);
  }
}
animateTyping();

// === Custom Notification ===
function showCustomNotification(type, message) {
  const box = document.getElementById('customNotification');
  const icon = box.querySelector('i');
  const text = document.getElementById('notifMessage');

  box.className = 'notification-box';
  icon.className = 'fas';

  if (type === 'success') {
    box.classList.add('notification-success');
    icon.classList.add('fa-check-circle');
  } else if (type === 'error') {
    box.classList.add('notification-error');
    icon.classList.add('fa-times-circle');
  }

  text.textContent = message;
  box.style.display = 'flex';

  setTimeout(() => box.style.display = 'none', 4000);
}

// === Search & Filter ===
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', debounce(handleSearch, 300));

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function handleSearch() {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll('.api-card').forEach(card => {
    const name = card.dataset.apiName || '';
    const desc = card.dataset.apiDesc || '';
    const visible = name.includes(term) || desc.includes(term);
    card.style.display = visible ? 'block' : 'none';

    const category = card.closest('.category');
    if (category) {
      const hasVisible = [...category.querySelectorAll('.api-card')].some(c => c.style.display !== 'none');
      category.style.display = hasVisible ? 'block' : 'none';
    }
  });
}

// === Load API from JSON ===
async function loadApiData() {
  try {
    const res = await fetch('/web-set.json'); // <--- Perbaikan disini
    if (!res.ok) throw new Error('Gagal memuat data');

    const data = await res.json();
    document.getElementById('api-name').textContent = data.name;
    document.getElementById('api-status').textContent = data.header.status;
    document.getElementById('api-description').textContent = data.description;
    document.getElementById('api-creator').textContent = data.apiSettings.creator;
    document.getElementById('api-version').textContent = data.version;

    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    data.categories.forEach(category => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'category';

      const title = document.createElement('h2');
      title.className = 'category-title';
      title.textContent = category.name;

      const grid = document.createElement('div');
      grid.className = 'api-grid';

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

        const status = document.createElement('span');
        status.className = `api-status status-${item.status.toLowerCase()}`;
        status.innerHTML = `<i class="fas fa-${item.status === 'ready' ? 'circle-check' : 'tools'}"></i> ${item.status}`;

        const tryBtn = document.createElement('button');
        tryBtn.className = 'try-btn';
        tryBtn.textContent = 'Coba Sekarang';

        if (item.status.toLowerCase() !== 'ready') {
          tryBtn.classList.add('disabled');
          tryBtn.addEventListener('click', () => showCustomNotification('error', `Endpoint sedang ${item.status.toLowerCase()}`));
        } else {
          tryBtn.addEventListener('click', () => toggleTryContainer(card, item));
        }

        card.append(nameEl, desc, pathWrap, status, tryBtn);
        grid.appendChild(card);
      });

      categoryEl.append(title, grid);
      container.appendChild(categoryEl);
    });
  } catch (error) {
    showCustomNotification('error', 'Gagal memuat data API');
  }
}
loadApiData();

// === Try Popup ===
const apiPopup = document.getElementById('apiPopup');
const closePopup = document.getElementById('closePopup');
const popupBody = document.getElementById('popupBody');
const popupTitle = document.getElementById('popupTitle');
const copyResultBtn = document.getElementById('copyResultBtn');

closePopup.addEventListener('click', () => apiPopup.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === apiPopup) apiPopup.style.display = 'none';
});

copyResultBtn.addEventListener('click', () => {
  const pre = popupBody.querySelector('pre');
  if (pre) {
    navigator.clipboard.writeText(pre.textContent).then(() => {
      copyResultBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
      setTimeout(() => copyResultBtn.innerHTML = '<i class="fas fa-copy"></i> Salin', 2000);
    });
  }
});

// === Try Container Logic ===
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
  runBtn.addEventListener('click', () => executeApi(item));
  container.appendChild(runBtn);

  card.appendChild(container);
  return container;
}

// === Execute API ===
async function executeApi(item) {
  popupTitle.textContent = `Hasil ${item.name}`;
  popupBody.innerHTML = `<div class="loading">Memuat...</div>`;
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
    popupBody.innerHTML = `<pre class="result-content">${JSON.stringify(json, null, 2)}</pre>`;
  } catch (err) {
    popupBody.innerHTML = `<div class="error"><strong>Error:</strong> ${err.message}</div>`;
  }
}