// ── 1. TEMA CLARO / ESCURO E LOGO (PRIORIDADE) ──────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const brandLogo = document.getElementById('brand-logo');

const logoClara = './IMAGES/LogoPreta_WP.png';
const logoEscura = './IMAGES/LogoBranca_WP.png';

// Aplica o tema imediatamente ao carregar
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  bodyElement.classList.add('light-mode');
  if (brandLogo) brandLogo.src = logoClara;
} else {
  if (brandLogo) brandLogo.src = logoEscura;
}

// Ação do botão de tema
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

// ── 3. FUNÇÃO PARA ORGANIZAR (PRETTY PRINT) O XML ───────────────────────────
function formatarXML(xml) {
  const PADDING = '  '; // 2 espaços de indentação por nível
  let formatado = '';
  let pad = 0;
  
  // Remove espaços em branco desnecessários entre as tags
  let xmlLimpo = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
  
  // Analisa linha por linha para organizar os espaços
  xmlLimpo.split('\n').forEach(function(linha) {
      let indent = 0;
      
      if (linha.match(/.+<\/\w[^>]*>$/)) {
          indent = 0; // Tag que abre e fecha na mesma linha
      } else if (linha.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1; // Tag de fechamento (diminui o espaço)
      } else if (linha.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1; // Tag de abertura (aumenta o espaço para a próxima linha)
      }
      
      formatado += PADDING.repeat(pad) + linha + '\n';
      pad += indent;
  });
  
  return formatado.trim();
}

// ── 4. LÓGICA DE VALIDAÇÃO JSON / XML ───────────────────────────────────────
const inputCodigo = document.getElementById('codigo-input');
const btnJson = document.getElementById('btn-json');
const btnXml = document.getElementById('btn-xml');
const resultadoBox = document.getElementById('resultado-box');

function mostrarResultado(sucesso, mensagem) {
  if (!resultadoBox) return; // Trava de segurança
  
  resultadoBox.style.display = 'block';
  if (sucesso) {
    resultadoBox.style.backgroundColor = 'rgba(0, 212, 160, 0.12)';
    resultadoBox.style.color = '#00d4a0';
    resultadoBox.style.border = '1px solid rgba(0, 212, 160, 0.3)';
    resultadoBox.innerHTML = `<strong>✅ Estrutura Válida!</strong><br><br>${mensagem}`;
  } else {
    resultadoBox.style.backgroundColor = 'rgba(255, 92, 92, 0.15)';
    resultadoBox.style.color = '#ff7070';
    resultadoBox.style.border = '1px solid rgba(255, 92, 92, 0.3)';
    resultadoBox.innerHTML = `<strong>❌ Erro de Sintaxe Encontrado:</strong><br><br>${mensagem}`;
  }
}

if (btnJson) {
  btnJson.addEventListener('click', () => {
    const texto = inputCodigo.value.trim();
    if (!texto) return mostrarResultado(false, "O campo está vazio.");

    try {
      const objetoJson = JSON.parse(texto);
      
      // BÔNUS: Auto-formata o JSON na caixa de texto
      inputCodigo.value = JSON.stringify(objetoJson, null, 2);
      
      mostrarResultado(true, "O código JSON está perfeitamente formatado.");
    } catch (erro) {
      mostrarResultado(false, erro.message);
    }
  });
}

if (btnXml) {
  btnXml.addEventListener('click', () => {
    let texto = inputCodigo.value.trim();
    if (!texto) return mostrarResultado(false, "O campo está vazio.");

    // Formata o XML na caixa de texto ANTES de validar (se começar com <)
    if (texto.startsWith('<')) {
      texto = formatarXML(texto);
      inputCodigo.value = texto; 
    }

    const parser = new DOMParser();
    const dom = parser.parseFromString(texto, "application/xml");
    const erroNode = dom.querySelector("parsererror");

    if (erroNode) {
      mostrarResultado(false, erroNode.textContent);
    } else {
      mostrarResultado(true, "O código XML está perfeitamente formatado.");
    }
  });
}// ── 1. TEMA CLARO / ESCURO E LOGO (PRIORIDADE) ──────────────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const brandLogo = document.getElementById('brand-logo');

const logoClara = './IMAGES/LogoPreta_WP.png';
const logoEscura = './IMAGES/LogoBranca_WP.png';

// Aplica o tema imediatamente ao carregar
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  bodyElement.classList.add('light-mode');
  if (brandLogo) brandLogo.src = logoClara;
} else {
  if (brandLogo) brandLogo.src = logoEscura;
}

// Ação do botão de tema
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

// ── 3. FUNÇÃO PARA ORGANIZAR (PRETTY PRINT) O XML ───────────────────────────
function formatarXML(xml) {
  const PADDING = '  '; // 2 espaços de indentação por nível
  let formatado = '';
  let pad = 0;
  
  // Remove espaços em branco desnecessários entre as tags
  let xmlLimpo = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
  
  // Analisa linha por linha para organizar os espaços
  xmlLimpo.split('\n').forEach(function(linha) {
      let indent = 0;
      
      if (linha.match(/.+<\/\w[^>]*>$/)) {
          indent = 0; // Tag que abre e fecha na mesma linha
      } else if (linha.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1; // Tag de fechamento (diminui o espaço)
      } else if (linha.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1; // Tag de abertura (aumenta o espaço para a próxima linha)
      }
      
      formatado += PADDING.repeat(pad) + linha + '\n';
      pad += indent;
  });
  
  return formatado.trim();
}

// ── 4. LÓGICA DE VALIDAÇÃO JSON / XML ───────────────────────────────────────
const inputCodigo = document.getElementById('codigo-input');
const btnJson = document.getElementById('btn-json');
const btnXml = document.getElementById('btn-xml');
const resultadoBox = document.getElementById('resultado-box');

function mostrarResultado(sucesso, mensagem) {
  if (!resultadoBox) return; // Trava de segurança
  
  resultadoBox.style.display = 'block';
  if (sucesso) {
    resultadoBox.style.backgroundColor = 'rgba(0, 212, 160, 0.12)';
    resultadoBox.style.color = '#00d4a0';
    resultadoBox.style.border = '1px solid rgba(0, 212, 160, 0.3)';
    resultadoBox.innerHTML = `<strong>✅ Estrutura Válida!</strong><br><br>${mensagem}`;
  } else {
    resultadoBox.style.backgroundColor = 'rgba(255, 92, 92, 0.15)';
    resultadoBox.style.color = '#ff7070';
    resultadoBox.style.border = '1px solid rgba(255, 92, 92, 0.3)';
    resultadoBox.innerHTML = `<strong>❌ Erro de Sintaxe Encontrado:</strong><br><br>${mensagem}`;
  }
}

if (btnJson) {
  btnJson.addEventListener('click', () => {
    const texto = inputCodigo.value.trim();
    if (!texto) return mostrarResultado(false, "O campo está vazio.");

    try {
      const objetoJson = JSON.parse(texto);
      
      // BÔNUS: Auto-formata o JSON na caixa de texto
      inputCodigo.value = JSON.stringify(objetoJson, null, 2);
      
      mostrarResultado(true, "O código JSON está perfeitamente formatado.");
    } catch (erro) {
      mostrarResultado(false, erro.message);
    }
  });
}

if (btnXml) {
  btnXml.addEventListener('click', () => {
    let texto = inputCodigo.value.trim();
    if (!texto) return mostrarResultado(false, "O campo está vazio.");

    // Formata o XML na caixa de texto ANTES de validar (se começar com <)
    if (texto.startsWith('<')) {
      texto = formatarXML(texto);
      inputCodigo.value = texto; 
    }

    const parser = new DOMParser();
    const dom = parser.parseFromString(texto, "application/xml");
    const erroNode = dom.querySelector("parsererror");

    if (erroNode) {
      mostrarResultado(false, erroNode.textContent);
    } else {
      mostrarResultado(true, "O código XML está perfeitamente formatado.");
    }
  });
}