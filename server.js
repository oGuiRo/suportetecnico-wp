const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// --- ROTA FTP ---
const S3_XML_URL = 'https://s3.amazonaws.com/arquivo.qualityautomacao.com.br';
const BUCKET_WEBSITE_URL = 'https://arquivo.qualityautomacao.com.br';
app.get('/api/arquivos', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(S3_XML_URL);
    const xml = await response.text();
    // ... (sua lógica original de FTP continua aqui)
    res.json({ total: 0, arquivos: [] }); // Ajuste conforme sua lógica
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// --- ROTA SEFAZ (Corrigida) ---
app.get('/api/sefaz', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://www.nfe.fazenda.gov.br/portal/disponibilidade.aspx');
    const html = await response.text();
    const $ = cheerio.load(html);
    const resultados = [];
    $('table.tabelaListagemDados tbody tr').each((i, el) => {
      if (i === 0) return;
      const tds = $(el).find('td');
      if (tds.length < 5) return;
      resultados.push({ autorizador: $(tds[0]).text().trim(), status: 'online' });
    });
    res.json(resultados);
  } catch (e) { res.status(500).json({ erro: "Indisponível" }); }
});

// --- ROTA SQL ---
app.post('/api/sql', async (req, res) => {
  const { host, port, database, user, password, query } = req.body;
  const client = new Client({ host, port, database, user, password, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const result = await client.query(query);
    await client.end();
    res.json({ sucesso: true, colunas: result.fields.map(f => f.name), linhas: result.rows });
  } catch (erro) {
    if (client) await client.end().catch(e => console.log(e));
    res.status(500).json({ sucesso: false, erro: erro.message });
  }
});

app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));