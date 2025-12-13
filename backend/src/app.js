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

// Booking Routes
const { createBooking, getPendingBookings, approveBooking, rejectBooking } = require('./routes/bookings');
app.post('/api/bookings/book', createBooking);
app.get('/api/bookings/pending', getPendingBookings);
app.post('/api/bookings/approve', approveBooking);
app.post('/api/bookings/reject', rejectBooking);

// Bulk Upload
const { uploadCsv } = require('./routes/bulkUpload');
const { smartUpload } = require('./routes/smartUpload');
app.post('/api/bookings/upload-csv', upload.single('file'), uploadCsv);
app.post('/api/bookings/smart-upload', upload.single('file'), smartUpload);

// Return/Cancel Request Routes
const { createRequest, getPendingRequests, getUserRequests, approveRequest, rejectRequest } = require('./routes/requests');
app.post('/api/requests/create', createRequest);
app.get('/api/requests/pending', getPendingRequests);
app.get('/api/requests/user/:userId', getUserRequests);
app.post('/api/requests/approve', approveRequest);
app.post('/api/requests/reject', rejectRequest);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Server running on', PORT));
