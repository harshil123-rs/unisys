const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
const { supabase } = require('./supabaseService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function ingestDocument(file) {
  try {
    const buffer = fs.readFileSync(file.path);
    let text = '';

    if (file.mimetype === 'application/pdf') {
      const data = await pdf(buffer);
      text = data.text;
    } else {
      // Assume text/plain
      text = buffer.toString('utf-8');
    }

    // Clean text
    text = text.replace(/\s+/g, ' ').trim();

    // Chunk text (simple character splitter for now)
    const chunkSize = 1000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`Ingesting ${file.originalname}: ${chunks.length} chunks`);

    // Embed and store chunks
    for (const chunk of chunks) {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
      });
      const embedding = result.data[0].embedding;

      const { error } = await supabase.from('documents').insert({
        content: chunk,
        metadata: { filename: file.originalname },
        embedding: embedding
      });

      if (error) throw error;
    }

    // Cleanup uploaded file
    fs.unlinkSync(file.path);

    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error('Ingestion failed:', error);
    throw error;
  }
}

module.exports = { ingestDocument };
