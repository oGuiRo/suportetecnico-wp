const API_URL = 'https://ftp-qualityautomacao-frontend.onrender.com/api/arquivos';

// Carregar tema salvo
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function navigate(path, updateHistory = true) {
  currentPath = path;
  if (updateHistory) {
    const url = path ? `?path=${encodeURIComponent(path)}` : window.location.pathname;
    window.history.pushState({ path }, '', url);
  }
  render();
}

// Escuta botão voltar do navegador
window.addEventListener('popstate', (e) => {
  currentPath = e.state?.path || '';
  render();
});

// Inicialização baseada na URL
const params = new URLSearchParams(window.location.search);
currentPath = params.get('path') || '';

function renderBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  const parts = currentPath ? currentPath.split('/') : [];
  let html = `<button class="bc-pill" onclick="navigate('')">Raiz</button>`;
  parts.forEach((p, i) => {
    const path = parts.slice(0, i + 1).join('/');
    html += ` ❯ <button class="bc-pill" onclick="navigate('${path}')">${p}</button>`;
  });
  bc.innerHTML = html;
}

// ... (mantenha o restante das funções fetch e render, garantindo que chamem renderBreadcrumb())