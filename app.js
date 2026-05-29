const API_URL = 'http://localhost:3001/api/arquivos';
const PER_PAGE = 60;

let allFiles = [];
let currentPath = '';
let prevKeys = new Set();
let newKeys = new Set();
let currentPage = 1;
let countdown = 30;
let cdTimer = null;

// ── EXT CONFIG ───────────────────────────────────────────────────────────────
const extCfg = {
    exe: { bg: 'rgba(255,92,92,.15)', color: '#ff7070', label: 'EXE' },
    msi: { bg: 'rgba(255,92,92,.15)', color: '#ff7070', label: 'MSI' },
    pdf: { bg: 'rgba(255,130,60,.15)', color: '#ff9060', label: 'PDF' },
    zip: { bg: 'rgba(0,152,255,.15)', color: '#5ab4ff', label: 'ZIP' },
    rar: { bg: 'rgba(0,152,255,.15)', color: '#5ab4ff', label: 'RAR' },
    mp4: { bg: 'rgba(167,139,250,.15)', color: '#a78bfa', label: 'MP4' },
    mp3: { bg: 'rgba(167,139,250,.15)', color: '#a78bfa', label: 'MP3' },
    jpg: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'IMG' },
    jpeg: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'IMG' },
    png: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'IMG' },
    gif: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'GIF' },
    xlsx: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'XLS' },
    xls: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'XLS' },
    docx: { bg: 'rgba(0,152,255,.15)', color: '#5ab4ff', label: 'DOC' },
    doc: { bg: 'rgba(0,152,255,.15)', color: '#5ab4ff', label: 'DOC' },
    txt: { bg: 'rgba(136,146,164,.12)', color: '#8892a4', label: 'TXT' },
    csv: { bg: 'rgba(0,212,160,.12)', color: '#00d4a0', label: 'CSV' },
    json: { bg: 'rgba(255,179,71,.12)', color: '#ffb347', label: 'JSON' },
    xml: { bg: 'rgba(255,179,71,.12)', color: '#ffb347', label: 'XML' },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getExt(name) {
    const p = name.split('.');
    return p.length > 1 ? p.pop().toLowerCase() : '';
}

function formatSize(b) {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
    return (b / 1073741824).toFixed(2) + ' GB';
}

function formatDate(s) {
    if (!s) return '—';
    try {
        const d = new Date(s);
        return d.toLocaleDateString('pt-BR') + ' ' +
            d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return s; }
}

// ── NAVEGAÇÃO ────────────────────────────────────────────────────────────────
function getView(files, path, query) {
    if (query) {
        const q = query.toLowerCase();
        return { folders: [], files: files.filter(f => f.key.toLowerCase().includes(q)) };
    }
    const prefix = path ? path + '/' : '';
    const subFolders = new Set();
    const directFiles = [];
    files.forEach(f => {
        if (!f.key.startsWith(prefix)) return;
        const rest = f.key.slice(prefix.length);
        const slashIdx = rest.indexOf('/');
        if (slashIdx === -1) directFiles.push(f);
        else subFolders.add(rest.slice(0, slashIdx));
    });
    return { folders: [...subFolders].sort(), files: directFiles };
}

function sortItems(files) {
    const s = document.getElementById('sort-select').value;
    return [...files].sort((a, b) => {
        if (s === 'name') return a.nome.localeCompare(b.nome);
        if (s === 'name-desc') return b.nome.localeCompare(a.nome);
        if (s === 'date-desc') return new Date(b.modificado) - new Date(a.modificado);
        if (s === 'date-asc') return new Date(a.modificado) - new Date(b.modificado);
        if (s === 'size-desc') return b.tamanho - a.tamanho;
        if (s === 'size-asc') return a.tamanho - b.tamanho;
        return 0;
    });
}

function navigate(path) {
    currentPath = path;
    currentPage = 1;
    document.getElementById('search').value = '';
    render();
}

// ── RENDER ───────────────────────────────────────────────────────────────────
function renderBreadcrumb() {
    const bc = document.getElementById('breadcrumb');
    const parts = currentPath ? currentPath.split('/') : [];
    let html = `<span class="bc-item" onclick="navigate('')">🏠 Raiz</span>`;
    parts.forEach((p, i) => {
        const path = parts.slice(0, i + 1).join('/');
        html += `<span class="bc-sep">/</span>`;
        if (i === parts.length - 1) {
            html += `<span class="bc-current">${p}</span>`;
        } else {
            html += `<span class="bc-item" onclick="navigate('${path}')">${p}</span>`;
        }
    });
    bc.innerHTML = html;
}

function renderFolderRow(name) {
    const folderPath = currentPath ? currentPath + '/' + name : name;
    return `<div class="row row-folder" onclick="navigate('${folderPath}')">
    <div class="row-name">
      <div class="row-icon icon-folder">📁</div>
      <span class="row-label">${name}/</span>
    </div>
    <div class="row-size">—</div>
    <div class="row-date">—</div>
    <div class="row-link"></div>
  </div>`;
}

function renderFileRow(f) {
    const ext = getExt(f.nome);
    const cfg = extCfg[ext] || { bg: 'rgba(136,146,164,.12)', color: '#8892a4', label: (ext.toUpperCase().slice(0, 4) || '?') };
    const isNew = newKeys.has(f.key);
    return `<a class="row${isNew ? ' row-new' : ''}" href="${f.url}" target="_blank" rel="noopener">
    <div class="row-name">
      <div class="row-icon" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</div>
      <span class="row-label" title="${f.nome}">${f.nome}</span>
    </div>
    <div class="row-size">${formatSize(f.tamanho)}</div>
    <div class="row-date">${formatDate(f.modificado)}</div>
    <div class="row-link">
      <a href="${f.url}" target="_blank" onclick="event.stopPropagation()">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Abrir
      </a>
    </div>
  </a>`;
}

function render() {
    const query = document.getElementById('search').value.trim();
    const { folders, files } = getView(allFiles, currentPath, query);
    const sortedFiles = sortItems(files);

    const allRows = [
        ...folders.map(f => ({ type: 'folder', name: f })),
        ...sortedFiles.map(f => ({ type: 'file', data: f })),
    ];
    const totalItems = allRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
    if (currentPage > totalPages) currentPage = 1;
    const page = allRows.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const listing = document.getElementById('listing');
    const pagination = document.getElementById('pagination');

    if (allRows.length === 0) {
        listing.innerHTML = `<div class="state"><div class="ico">🔍</div>Nenhum item encontrado.</div>`;
        pagination.style.display = 'none';
        renderBreadcrumb();
        return;
    }

    listing.innerHTML = page.map(row =>
        row.type === 'folder' ? renderFolderRow(row.name) : renderFileRow(row.data)
    ).join('');

    if (totalPages > 1) {
        pagination.style.display = 'flex';
        document.getElementById('pg-info').textContent = `Pág ${currentPage}/${totalPages} · ${totalItems} itens`;
        document.getElementById('pg-prev').disabled = currentPage === 1;
        document.getElementById('pg-next').disabled = currentPage === totalPages;
    } else {
        pagination.style.display = 'none';
    }

    renderBreadcrumb();
}

// ── STATS ────────────────────────────────────────────────────────────────────
function updateStats() {
    document.getElementById('stat-count').textContent = allFiles.length;
    const total = allFiles.reduce((s, f) => s + f.tamanho, 0);
    document.getElementById('stat-size').textContent = formatSize(total);
    const rootFolders = new Set(
        allFiles.map(f => f.key.includes('/') ? f.key.split('/')[0] : null).filter(Boolean)
    );
    document.getElementById('stat-folders').textContent = rootFolders.size;
}

// ── STATUS BAR ───────────────────────────────────────────────────────────────
function setStatus(html) {
    document.getElementById('status-bar').innerHTML = html;
}

// ── FETCH ────────────────────────────────────────────────────────────────────
async function fetchData() {
    const btn = document.getElementById('refresh-btn');
    btn.classList.add('spinning');
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Servidor retornou ${res.status}`);
        const data = await res.json();
        if (data.erro) throw new Error(data.erro);

        const currentKeys = new Set(data.arquivos.map(f => f.key));
        newKeys = new Set([...currentKeys].filter(k => !prevKeys.has(k) && prevKeys.size > 0));
        prevKeys = currentKeys;
        allFiles = data.arquivos;

        updateStats();
        render();

        const hora = new Date().toLocaleTimeString('pt-BR');
        const novosPill = newKeys.size > 0
            ? `<span class="new-pill">+${newKeys.size} novo${newKeys.size > 1 ? 's' : ''}</span>`
            : '';
        setStatus(`Atualizado às <span class="hi">${hora}</span>
      &nbsp;·&nbsp; ${data.total} arquivos
      &nbsp;<span class="cd-pill" id="cd-pill">—</span>
      ${novosPill}`);

        if (newKeys.size > 0) setTimeout(() => { newKeys = new Set(); render(); }, 5000);
    } catch (err) {
        document.getElementById('listing').innerHTML = `
      <div class="error-box">
        <strong>⚠ Não foi possível conectar ao servidor local.</strong><br>
        Certifique-se de que o <code>server.js</code> está rodando:<br><br>
        <code>node server.js</code><br><br>
        Erro: <code>${err.message}</code>
      </div>`;
        setStatus('⚠ Erro de conexão');
    } finally {
        btn.classList.remove('spinning');
    }
}

// ── COUNTDOWN ────────────────────────────────────────────────────────────────
function resetCountdown() {
    if (cdTimer) clearInterval(cdTimer);
    const iv = parseInt(document.getElementById('interval-select').value);
    countdown = iv;
    document.getElementById('stat-countdown').textContent = iv + 's';

    cdTimer = setInterval(() => {
        countdown--;
        const pill = document.getElementById('cd-pill');
        if (pill) pill.textContent = countdown + 's';
        document.getElementById('stat-countdown').textContent = countdown + 's';
        if (countdown <= 0) { countdown = iv; fetchData(); }
    }, 1000);
}

function manualRefresh() {
    countdown = parseInt(document.getElementById('interval-select').value);
    fetchData();
}

function changePage(d) {
    currentPage += d;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', () => { currentPage = 1; render(); });
document.getElementById('sort-select').addEventListener('change', () => { currentPage = 1; render(); });
document.getElementById('interval-select').addEventListener('change', resetCountdown);

renderBreadcrumb();
fetchData();
resetCountdown();