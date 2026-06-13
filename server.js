const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

const S3_XML_URL = 'https://s3.amazonaws.com/arquivo.qualityautomacao.com.br';
const BUCKET_WEBSITE_URL = 'https://arquivo.qualityautomacao.com.br';

const EXCLUDE_FILES = [
  'index.html', 'list.js', 'Retaguarda/QualityPosto_1.exe', 'Retaguarda/QualityPosto_2.exe',
  'Retaguarda/QualityPosto_3.exe', 'Retaguarda/QualityPosto_4.exe', 'Retaguarda/QualityPosto_5.exe',
  'Retaguarda/QualityPosto_6.exe', 'Retaguarda/QualityPosto_7.exe', 'Retaguarda/QualityPosto_8.exe',
  'PDV/webPostoPay/webPostoPayServer.exe', 'PDV/webPostoPay/webPostoPayServer.zip',
  'politica-privacidade-webContagem.html'
];

app.use(cors());
app.use(express.static('.'));

// Rota FTP
app.get('/api/arquivos', async (req, res) => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const response = await fetch(S3_XML_URL);
    const xml = await response.text();
    const arquivos = [];
    const regex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const bloco = match[1];
      const key = (bloco.match(/<Key>(.*?)<\/Key>/) || [])[1] || '';
      const size = (bloco.match(/<Size>(.*?)<\/Size>/) || [])[1] || '0';
      const modified = (bloco.match(/<LastModified>(.*?)<\/LastModified>/) || [])[1] || '';
      if (!key || key.endsWith('/') || EXCLUDE_FILES.includes(key)) continue;
      arquivos.push({ key, nome: key.split('/').pop(), tamanho: parseInt(size, 10), modificado: modified, url: `${BUCKET_WEBSITE_URL}/${key}` });
    }
    res.json({ total: arquivos.length, arquivos });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

app.get('/api/sefaz', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Adicionamos um controller de abort (timeout de 5 segundos)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('http://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx', { 
      signal: controller.signal 
    });
    
    clearTimeout(timeout);
    const html = await response.text();
    const $ = cheerio.load(html);
    const resultados = [];
    
    $('table.tabelaListagemDados tbody tr').each((i, el) => {
      if (i === 0) return;
      const tds = $(el).find('td');
      if (tds.length < 5) return;
      
      const getStatus = (td) => {
        const src = $(td).find('img').attr('src') || '';
        return src.includes('verde') ? 'online' : src.includes('amarela') ? 'instavel' : 'offline';
      };
      
      resultados.push({
        autorizador: $(tds[0]).text().trim(),
        autorizacao: getStatus(tds[1]),
        retorno: getStatus(tds[2]),
        consulta: getStatus(tds[4])
      });
    });
    res.json(resultados);
  } catch (e) {
    res.status(500).json({ erro: "Sefaz indisponível no momento" });
  }
});