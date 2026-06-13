// ── 1. TEMA CLARO / ESCURO ──────────────────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const brandLogo = document.getElementById('brand-logo');
const logoClara = './IMAGES/LogoPreta_WP.png';
const logoEscura = './IMAGES/LogoBranca_WP.png';

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  bodyElement.classList.add('light-mode');
  if (brandLogo) brandLogo.src = logoClara;
} else {
  if (brandLogo) brandLogo.src = logoEscura;
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('light-mode');
    const isLight = bodyElement.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    if (brandLogo) brandLogo.src = isLight ? logoClara : logoEscura;
  });
}

// ── 2. SIDEBAR TOGGLE ───────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
  });
}

// ── 3. MONITOR SEFAZ (NATIVO - RENDER BACKEND) ─────────────────────────────
async function carregarSefaz() {
  const container = document.getElementById('sefaz-container');
  const btn = document.getElementById('btn-atualizar-sefaz');
  if (!container) return;

  btn.textContent = '↻ Buscando...';
  
  try {
    // IMPORTANTE: Se você estiver testando localmente, use 'http://localhost:3001/api/sefaz'
    const res = await fetch('https://ftp-qualityautomacao-frontend.onrender.com/api/sefaz');
    if (!res.ok) throw new Error('Servidor offline');
    
    const dados = await res.json();
    const statusCores = { 'online': '#10b981', 'instavel': '#f59e0b', 'offline': '#ef4444', 'indisponivel': '#71717a' };
    
    let html = `<table style="width:100%; border-collapse:collapse; font-size:12px;">`;
    dados.forEach(e => {
      const dot = (s) => `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${statusCores[s] || '#71717a'}"></span>`;
      html += `<tr style="border-bottom:1px solid var(--border)">
        <td style="padding:8px">${e.autorizador}</td>
        <td style="padding:8px">${dot(e.autorizacao)}</td>
        <td style="padding:8px">${dot(e.retorno)}</td>
        <td style="padding:8px">${dot(e.consulta)}</td>
      </tr>`;
    });
    container.innerHTML = html + `</table>`;
  } catch (e) {
    container.innerHTML = `<div style="padding:10px; color:#ef4444; text-align:center;">Erro ao carregar Sefaz.</div>`;
  } finally {
    btn.textContent = '↻ Atualizar';
  }
}

// ── 4. LÓGICA DO FTP (Seu código original que já funciona) ──────────────────
// Mantive a lógica de carregamento do seu FTP aqui embaixo para não conflitar
document.addEventListener('DOMContentLoaded', () => {
    carregarSefaz();
    // ... aqui você pode incluir a chamada da sua função de carga do FTP (fetchData)
});

// ── TRAVA DE ROLAGEM PARA O IFRAME SEFAZ ──
const sefazIframe = document.getElementById('sefaz-iframe');
if (sefazIframe) {
  sefazIframe.addEventListener('load', () => {
    // Força a página a permanecer no topo caso o iframe tente roubar o foco
    window.scrollTo(0, 0);
  });
}