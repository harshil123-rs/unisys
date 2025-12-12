require('dotenv').config();
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
const { answerQuery } = require('./services/ragService');
const { ingestDocument } = require('./services/ingestService');
const { handleWhatsappWebhook } = require('./routes/whatsappRoute');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// simple health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ask route
app.post('/api/ask', async (req, res) => {
  try {
    const { userId, query, language } = req.body;
    const result = await answerQuery(userId || null, query, language || 'en');
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'server error' });
  }
});

// upload + ingest
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    // returns documentId (stub)
    const docId = await ingestDocument(file);
    res.json({ ok: true, documentId: docId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// AI Report
const { generateReport } = require('./services/reportService');
const { analyzeDocument } = require('./services/complianceService');

app.post('/api/ai-report', async (req, res) => {
  try {
    const report = await generateReport();
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Analyze Document
app.post('/api/analyze-doc', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const result = await analyzeDocument(req.file.path, req.file.mimetype);

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// whatsapp webhook
app.post('/api/whatsapp/webhook', express.urlencoded({ extended: true }), handleWhatsappWebhook);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server running on', PORT));
