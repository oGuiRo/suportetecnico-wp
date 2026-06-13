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
    if (bodyElement.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      if (brandLogo) brandLogo.src = logoClara;
    } else {
      localStorage.setItem('theme', 'dark');
      if (brandLogo) brandLogo.src = logoEscura;
    }
  });
}

// ── 2. SIDEBAR TOGGLE ───────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

const sidebarState = localStorage.getItem('sidebarState');
if (sidebarState === 'expanded') {
  if (sidebar) sidebar.classList.remove('collapsed');
}

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
      localStorage.setItem('sidebarState', 'collapsed');
    } else {
      localStorage.setItem('sidebarState', 'expanded');
    }
  });
}

// ── 3. BLOCO DE NOTAS AUTO-SAVE ─────────────────────────────────────────────
const blocoNotas = document.getElementById('bloco-notas');
if (blocoNotas) {
  // Carrega o que estava salvo
  const textoSalvo = localStorage.getItem('anotacoesDashboard');
  if (textoSalvo) {
    blocoNotas.value = textoSalvo;
  }

  // Salva automaticamente toda vez que você digitar algo
  blocoNotas.addEventListener('input', () => {
    localStorage.setItem('anotacoesDashboard', blocoNotas.value);
  });
}

// ── ROBÔ INVISÍVEL: PRÉ-CARREGAMENTO DO FTP ──
// Espera 2 segundos para não atrasar a página atual e então baixa a lista do FTP no fundo
setTimeout(() => {
  if (!sessionStorage.getItem('ftpCacheQA')) {
    fetch('https://ftp-qualityautomacao-frontend.onrender.com/api/arquivos')
      .then(res => res.json())
      .then(data => {
        if (!data.erro) {
          sessionStorage.setItem('ftpCacheQA', JSON.stringify(data));
          console.log('⚡ FTP Pré-carregado com sucesso nos bastidores!');
        }
      })
      .catch(err => console.log('Aviso: Prefetch do FTP falhou.'));
  }
}, 2000);


async function carregarSefaz() {
  const container = document.getElementById('sefaz-container');
  if (!container) return;
  try {
    const res = await fetch('https://ftp-qualityautomacao-frontend.onrender.com/api/sefaz');
    const dados = await res.json();
    const statusCores = { 'online': '#10b981', 'instavel': '#f59e0b', 'offline': '#ef4444', 'indisponivel': '#71717a' };
    
    let html = `<table style="width:100%; border-collapse:collapse; font-size:12px;">`;
    dados.forEach(e => {
      const dot = (s) => `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${statusCores[s]}"></span>`;
      html += `<tr style="border-bottom:1px solid #27272a">
        <td style="padding:8px">${e.autorizador}</td>
        <td style="padding:8px">${dot(e.autorizacao)}</td>
        <td style="padding:8px">${dot(e.retorno)}</td>
        <td style="padding:8px">${dot(e.consulta)}</td>
      </tr>`;
    });
    container.innerHTML = html + `</table>`;
  } catch (e) {
    container.innerHTML = "Erro ao carregar dados.";
  }
}
document.addEventListener('DOMContentLoaded', carregarSefaz);