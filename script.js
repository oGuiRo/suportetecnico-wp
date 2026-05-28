// URL base do repositório de arquivos S3
const BUCKET_URL = 'https://arquivo.qualityautomacao.com.br/';

// Escuta mudanças na URL (hash) para navegar entre as pastas sem recarregar a página
window.addEventListener('hashchange', loadCurrentFolder);
window.addEventListener('DOMContentLoaded', loadCurrentFolder);

// Inicializa a barra de pesquisa interna
document.addEventListener('DOMContentLoaded', initSearch);

async function loadCurrentFolder() {
    const body = document.getElementById('listing-body');
    body.innerHTML = '<tr><td colspan="3" class="loading-status">Buscando dados do diretório...</td></tr>';

    // Captura o caminho da pasta a partir do hash da URL (ex: #Retaguarda/Versões/ -> Retaguarda/Versões/)
    const prefix = decodeURIComponent(window.location.hash.substring(1));
    
    // Atualiza a barra de navegação (breadcrumbs) no topo
    updateBreadcrumbs(prefix);

    try {
        // Faz a requisição à API do S3 usando o delimitador '/' para isolar apenas o nível atual da pasta
        const targetUrl = `${BUCKET_URL}?delimiter=/&prefix=${prefix}`;
        const response = await fetch(targetUrl);
        
        if (!response.ok) {
            throw new Error('Não foi possível obter resposta do servidor de arquivos.');
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        renderListing(xmlDoc, prefix);
    } catch (error) {
        console.error('Erro na requisição:', error);
        body.innerHTML = `
            <tr>
                <td colspan="3" style="color: #dc2626; text-align: center; padding: 30px;">
                    <strong>Erro de Conexão (CORS):</strong> Não foi possível puxar os dados diretamente do link externo.<br>
                    <small style="color: #64748b; display: block; margin-top: 8px;">
                        Consulte o aviso sobre políticas de CORS enviado junto ao código para resolver isso no ambiente local.
                    </small>
                </td>
            </tr>`;
    }
}

function renderListing(xml, currentPrefix) {
    const body = document.getElementById('listing-body');
    body.innerHTML = '';

    // 1. Botão de Voltar (se não estivermos na raiz do repositório)
    if (currentPrefix) {
        const parts = currentPrefix.split('/').filter(Boolean);
        parts.pop();
        const parentPrefix = parts.length ? parts.join('/') + '/' : '';
        
        const tr = document.createElement('tr');
        tr.className = 'directory back';
        tr.innerHTML = `
            <td><a href="#${encodeURIComponent(parentPrefix)}">📁 .. (Voltar para pasta anterior)</a></td>
            <td data-value="-">-</td>
            <td data-value="-">-</td>
        `;
        body.appendChild(tr);
    }

    // 2. Mapeia e renderiza as Subpastas (<CommonPrefixes>)
    const commonPrefixes = xml.getElementsByTagName('CommonPrefixes');
    for (let i = 0; i < commonPrefixes.length; i++) {
        const prefixNode = commonPrefixes[i].getElementsByTagName('Prefix')[0];
        if (prefixNode) {
            const fullPrefix = prefixNode.textContent;
            // Extrai apenas o nome da subpasta atual
            const folderName = fullPrefix.substring(currentPrefix.length);

            const tr = document.createElement('tr');
            tr.className = 'directory';
            tr.innerHTML = `
                <td data-value="${folderName}"><a href="#${encodeURIComponent(fullPrefix)}">📁 ${folderName}</a></td>
                <td data-value="-">-</td>
                <td data-value="0">-</td>
            `;
            body.appendChild(tr);
        }
    }

    // 3. Mapeia e renderiza os Arquivos (<Contents>)
    const contents = xml.getElementsByTagName('Contents');
    for (let i = 0; i < contents.length; i++) {
        const keyNode = contents[i].getElementsByTagName('Key')[0];
        const lastModifiedNode = contents[i].getElementsByTagName('LastModified')[0];
        const sizeNode = contents[i].getElementsByTagName('Size')[0];

        if (keyNode) {
            const key = keyNode.textContent;

            // Ignora o registro da própria pasta vazia que o S3 costuma retornar
            if (key === currentPrefix) continue;

            const fileName = key.substring(currentPrefix.length);
            if (!fileName) continue;

            const lastModified = lastModifiedNode ? lastModifiedNode.textContent : '-';
            const sizeBytes = sizeNode ? parseInt(sizeNode.textContent, 10) : 0;

            const tr = document.createElement('tr');
            tr.className = 'file';
            tr.innerHTML = `
                <td data-value="${fileName}">
                    <a href="${BUCKET_URL}${encodeURIComponent(key)}" target="_blank">📄 ${fileName}</a>
                </td>
                <td data-value="${lastModified}">${formatDate(lastModified)}</td>
                <td data-value="${sizeBytes}">${formatBytes(sizeBytes)}</td>
            `;
            body.appendChild(tr);
        }
    }

    if (body.children.length === 0) {
        body.innerHTML = '<tr><td colspan="3" class="loading-status">Esta pasta está vazia.</td></tr>';
    }
}

// Atualiza a linha de navegação superior (Breadcrumbs)
function updateBreadcrumbs(prefix) {
    const container = document.getElementById('breadcrumbs');
    container.innerHTML = '<a href="#">Home</a> / ';

    if (!prefix) return;

    const parts = prefix.split('/').filter(Boolean);
    let cumulativePath = '';

    parts.forEach((part, index) => {
        cumulativePath += part + '/';
        if (index === parts.length - 1) {
            container.innerHTML += `<span>${part}</span> / `;
        } else {
            container.innerHTML += `<a href="#${encodeURIComponent(cumulativePath)}">${part}</a> / `;
        }
    });
}

// Funções Auxiliares de Formatação (Bytes e Data)
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'kB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
    if (dateStr === '-') return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
}

// Mecanismo de Busca Interna (Filtro)
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('#listing-body tr');

        rows.forEach(row => {
            if (row.classList.contains('back')) return; // Nunca esconde o botão voltar
            const name = row.cells[0]?.textContent.toLowerCase() || '';
            row.style.display = name.includes(term) ? '' : 'none';
        });
    });
}

// Mecanismo de Ordenação da Tabela
let currentColumn = -1;
let asc = true;
function sortTable(colIndex) {
    const body = document.getElementById('listing-body');
    const rows = Array.from(body.querySelectorAll('tr:not(.back)'));
    const backRow = body.querySelector('tr.back');

    asc = currentColumn === colIndex ? !asc : true;
    currentColumn = colIndex;

    rows.sort((a, b) => {
        const valA = a.cells[colIndex].getAttribute('data-value') || '';
        const valB = b.cells[colIndex].getAttribute('data-value') || '';

        if (colIndex === 2) { // Ordenação Numérica para o Tamanho
            return asc ? parseFloat(valA) - parseFloat(valB) : parseFloat(valB) - parseFloat(valA);
        }
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    body.innerHTML = '';
    if (backRow) body.appendChild(backRow);
    rows.forEach(r => body.appendChild(r));
}