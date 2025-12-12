const { MessagingResponse } = require('twilio').twiml;
const { answerQuery } = require('../services/ragService');
const fetch = require('node-fetch');

async function handleWhatsappWebhook(req, res) {
  try {
    const from = req.body.From;
    const body = req.body.Body;
    const result = await answerQuery(null, body, 'en');
    const twiml = new MessagingResponse();
    twiml.message(result.answer);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
}

module.exports = { handleWhatsappWebhook };
