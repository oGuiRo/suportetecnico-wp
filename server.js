const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// URL real do XML do S3 (descoberta no index.html do bucket)
const S3_XML_URL = 'https://s3.amazonaws.com/arquivo.qualityautomacao.com.br';
const BUCKET_WEBSITE_URL = 'https://arquivo.qualityautomacao.com.br';

// Arquivos excluídos (conforme configurado no index.html original)
const EXCLUDE_FILES = [
  'index.html',
  'list.js',
  'Retaguarda/QualityPosto_1.exe',
  'Retaguarda/QualityPosto_2.exe',
  'Retaguarda/QualityPosto_3.exe',
  'Retaguarda/QualityPosto_4.exe',
  'Retaguarda/QualityPosto_5.exe',
  'Retaguarda/QualityPosto_6.exe',
  'Retaguarda/QualityPosto_7.exe',
  'Retaguarda/QualityPosto_8.exe',
  'PDV/webPostoPay/webPostoPayServer.exe',
  'PDV/webPostoPay/webPostoPayServer.zip',
  'politica-privacidade-webContagem.html',
];

app.use(cors());
app.use(express.static('.'));

app.get('/api/arquivos', async (req, res) => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;

    // Busca o XML real do S3
    const response = await fetch(S3_XML_URL);
    if (!response.ok) throw new Error(`S3 retornou status ${response.status}`);

    const xml = await response.text();
    console.log('XML recebido (primeiros 500 chars):', xml.slice(0, 500));

    const arquivos = [];
    const regex = /<Contents>([\s\S]*?)<\/Contents>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      const bloco = match[1];
      const key = (bloco.match(/<Key>(.*?)<\/Key>/) || [])[1] || '';
      const size = (bloco.match(/<Size>(.*?)<\/Size>/) || [])[1] || '0';
      const modified = (bloco.match(/<LastModified>(.*?)<\/LastModified>/) || [])[1] || '';

      if (!key || key.endsWith('/')) continue;
      if (EXCLUDE_FILES.includes(key)) continue;

      arquivos.push({
        key,
        nome: key.split('/').pop(),
        pasta: key.includes('/') ? key.split('/').slice(0, -1).join('/') : '',
        tamanho: parseInt(size, 10),
        modificado: modified,
        url: `${BUCKET_WEBSITE_URL}/${key}`,
      });
    }

    console.log(`Total de arquivos encontrados: ${arquivos.length}`);
    res.json({ total: arquivos.length, atualizado: new Date().toISOString(), arquivos });

  } catch (err) {
    console.error('Erro:', err.message);
    res.status(500).json({ erro: err.message });
  }
});

app.get('/api/raw', async (req, res) => {
  try {
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    const response = await fetch(S3_XML_URL);
    const text = await response.text();
    res.type('text/plain').send(text);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/status', (req, res) => {
  res.json({ ok: true, hora: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📂 API: http://localhost:${PORT}/api/arquivos`);
  console.log(`🔍 RAW: http://localhost:${PORT}/api/raw`);
});