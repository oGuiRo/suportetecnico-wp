// Alternar Tema
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Navegação (Interna para evitar 404)
function navigate(path) {
  currentPath = path;
  currentPage = 1;
  render();
}

// Render Breadcrumb (Atualize sua função render() para incluir esta chamada)
function renderBreadcrumb() {
  const container = document.getElementById('breadcrumb');
  if (!container) return;
  let html = `<button class="bc-pill" onclick="navigate('')">Raiz</button>`;
  if (currentPath) {
    const parts = currentPath.split('/');
    let acc = '';
    parts.forEach((p) => {
      acc = acc ? `${acc}/${p}` : p;
      html += ` ❯ <button class="bc-pill" onclick="navigate('${acc}')">${p}</button>`;
    });
  }
  container.innerHTML = html;
}

// IMPORTANTE: Adicione renderBreadcrumb() dentro da sua função render() original