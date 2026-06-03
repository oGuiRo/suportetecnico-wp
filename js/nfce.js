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

// ── 3. LÓGICA DO ROTEADOR NFC-E ─────────────────────────────────────────────

// Dicionário de Códigos IBGE para os links da Sefaz de cada Estado
const sefazLinks = {
  '11': { uf: 'RO', url: 'http://www.nfce.sefin.ro.gov.br/' },
  '12': { uf: 'AC', url: 'http://www.sefaznet.ac.gov.br/nfce/consulta' },
  '13': { uf: 'AM', url: 'https://sistemas.sefaz.am.gov.br/nfceweb/formConsulta.do' },
  '14': { uf: 'RR', url: 'https://www.sefaz.rr.gov.br/nfce/servlet/wp_consulta_nfce' },
  '15': { uf: 'PA', url: 'https://appnfc.sefa.pa.gov.br/portal/view/consultas/nfce/nfceForm.seam' },
  '16': { uf: 'AP', url: 'https://www.sefaz.ap.gov.br/sate/seg/SEGf_AcessarFuncao.jsp?cdFuncao=FIS_1261' },
  '17': { uf: 'TO', url: 'http://www.sefaz.to.gov.br/nfce/consulta.jsf' },
  '21': { uf: 'MA', url: 'https://nfce.sefaz.ma.gov.br/portal/consultaNfce.jsp' },
  '22': { uf: 'PI', url: 'https://webas.sefaz.pi.gov.br/nfceweb/consultarNFCe.jsf' },
  '23': { uf: 'CE', url: 'https://nfce.sefaz.ce.gov.br/pages/ShowNFCe.html' },
  '24': { uf: 'RN', url: 'http://nfce.set.rn.gov.br/consultarNFCe.aspx' },
  '25': { uf: 'PB', url: 'https://www.sefaz.pb.gov.br/nfce/consulta' },
  '26': { uf: 'PE', url: 'https://nfce.sefaz.pe.gov.br/nfce/consulta' },
  '27': { uf: 'AL', url: 'http://nfce.sefaz.al.gov.br/consultaNFCe.htm' },
  '28': { uf: 'SE', url: 'https://www.nfce.se.gov.br/portal/portalNoticias.jsp' },
  '29': { uf: 'BA', url: 'http://nfe.sefaz.ba.gov.br/servicos/nfce/modulos/geral/NFCEC_consulta_chave_acesso.aspx' },
  '31': { uf: 'MG', url: 'https://nfce.fazenda.mg.gov.br/portalnfce' },
  '32': { uf: 'ES', url: 'http://app.sefaz.es.gov.br/ConsultaNFCe/qrcode.aspx' },
  '33': { uf: 'RJ', url: 'https://consultadfe.fazenda.rj.gov.br/consultaDFe/paginas/consultaChaveAcesso.faces' },
  '35': { uf: 'SP', url: 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaPublica.aspx' },
  '41': { uf: 'PR', url: 'http://www.fazenda.pr.gov.br/nfce/consulta' },
  '42': { uf: 'SC', url: 'https://sat.sef.sc.gov.br/tax.NET/Sat.NFCe.Web/ConsultaPublica/ConsultaPublica.aspx' },
  '43': { uf: 'RS', url: 'https://www.sefaz.rs.gov.br/NFE/NFE-COM.aspx' },
  '50': { uf: 'MS', url: 'http://www.dfe.ms.gov.br/nfce/consulta' },
  '51': { uf: 'MT', url: 'http://www.sefaz.mt.gov.br/nfce/consultanfce' },
  '52': { uf: 'GO', url: 'http://nfe.sefaz.go.gov.br/nfeweb/sites/nfce/danfeNFCe' },
  '53': { uf: 'DF', url: 'https://dec.fazenda.df.gov.br/ConsultarNFCe.aspx' }
};

const btnConsultar = document.getElementById('btn-consultar-nfce');
const inputChave = document.getElementById('chave-nfce');
const msgBox = document.getElementById('nfce-msg');

btnConsultar.addEventListener('click', () => {
  // Remove espaços, traços ou pontos que o usuário possa ter colado
  const chave = inputChave.value.replace(/\D/g, '');

  if (chave.length !== 44) {
    msgBox.innerHTML = `<span style="color: #ff7070;">A chave deve conter exatamente 44 números. (Atual: ${chave.length})</span>`;
    return;
  }

  // Captura os dois primeiros números
  const codigoUF = chave.substring(0, 2);
  const estadoDestino = sefazLinks[codigoUF];

  if (estadoDestino) {
    msgBox.innerHTML = `<span style="color: var(--accent-green);">Redirecionando para a Sefaz do estado: <strong>${estadoDestino.uf}</strong>...</span>`;
    
    // Copia a chave para a área de transferência do usuário automaticamente
    navigator.clipboard.writeText(chave).catch(err => console.log('Erro ao copiar', err));
    
    // Abre o site do governo em uma nova aba
    setTimeout(() => {
      window.open(estadoDestino.url, '_blank');
      msgBox.innerHTML = '';
    }, 800);
  } else {
    msgBox.innerHTML = `<span style="color: #ff7070;">Código IBGE (${codigoUF}) desconhecido. Verifique a chave de acesso.</span>`;
  }
});