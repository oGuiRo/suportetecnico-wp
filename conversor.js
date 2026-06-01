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
  const originalName = file.name.replace(/\.[^/.]+$/, ""); // Pega o nome do arquivo sem a extensão

  statusMsg.innerHTML = '<span style="color: var(--accent-blue);">Processando...</span>';

  const reader = new FileReader();

  // Lê o arquivo como texto binário (necessário para o forge)
  reader.onload = function(e) {
    try {
      const pfxBinary = e.target.result;
      
      // Converte o binário para ASN.1 e abre o PFX com a senha
      const p12Asn1 = forge.asn1.fromDer(pfxBinary);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // 1. Extraindo o Certificado (CRT)
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = certBags[forge.pki.oids.certBag][0];
      const certPem = forge.pki.certificateToPem(certBag.cert);

      // 2. Extraindo a Chave Privada (KEY)
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      const keyPem = forge.pki.privateKeyToPem(keyBag.key);

      // Faz o download dos dois arquivos
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

// Função auxiliar para forçar o download dos arquivos gerados
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

// ── TEMA CLARO / ESCURO E LOGO ──────────────────────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const brandLogo = document.getElementById('brand-logo');

const logoClara = './IMAGES/LogoPreta_WP.png';
const logoEscura = './IMAGES/LogoBranca_WP.png';

// 1. Verifica no localStorage na hora que a página carrega
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  bodyElement.classList.add('light-mode');
  if (brandLogo) brandLogo.src = logoClara;
} else {
  if (brandLogo) brandLogo.src = logoEscura;
}

// 2. Adiciona a ação de clique no botão de tema
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    bodyElement.classList.toggle('light-mode');
    
    // Salva a nova preferência e troca a logo instantaneamente
    if (bodyElement.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      if (brandLogo) brandLogo.src = logoClara;
    } else {
      localStorage.setItem('theme', 'dark');
      if (brandLogo) brandLogo.src = logoEscura;
    }
  });
}