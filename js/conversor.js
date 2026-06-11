// ── 1. TEMA CLARO / ESCURO E LOGO (PRIORIDADE) ──────────────────────────────
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

// ── 2. SIDEBAR TOGGLE (MENU LATERAL) ────────────────────────────────────────
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

// ── 3. LÓGICA DE CONVERSÃO DO CERTIFICADO ───────────────────────────────────
document.getElementById('btn-convert').addEventListener('click', () => {
  const fileInput = document.getElementById('pfx-file');
  const passwordInput = document.getElementById('pfx-password');
  const statusMsg = document.getElementById('status-msg');

  if (fileInput.files.length === 0) {
    statusMsg.innerHTML = '<span style="color: #ff7070;">Por favor, selecione um arquivo .PFX.</span>';
    return;
  }

  const file = fileInput.files[0];
  const password = passwordInput.value;
  const originalName = file.name.replace(/\.[^/.]+$/, ""); 

  statusMsg.innerHTML = '<span style="color: var(--accent-blue);">Processando...</span>';

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const pfxBinary = e.target.result;
      
      const p12Asn1 = forge.asn1.fromDer(pfxBinary);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // Extrai CRT
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = certBags[forge.pki.oids.certBag][0];
      const certPem = forge.pki.certificateToPem(certBag.cert);

      // Extrai KEY
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      const keyPem = forge.pki.privateKeyToPem(keyBag.key);

      downloadFile(`${originalName}.crt`, certPem);
      downloadFile(`${originalName}.key`, keyPem);

      statusMsg.innerHTML = '<span style="color: var(--accent-green);">✅ Arquivos gerados com sucesso! Verifique seus downloads.</span>';
      
    } catch (err) {
      console.error(err);
      statusMsg.innerHTML = '<span style="color: #ff7070;">❌ Erro: Senha incorreta ou arquivo PFX inválido.</span>';
    }
  };

  reader.readAsBinaryString(file);
});

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
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