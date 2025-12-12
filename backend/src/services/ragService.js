const OpenAI = require('openai');
const { supabase } = require('./supabaseService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function semanticSearch(query) {
  // Create embedding for the query
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const embedding = result.data[0].embedding;

  // Call Supabase RPC function 'match_documents'
  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.5, // Adjust threshold as needed
    match_count: 5
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return documents.map(doc => ({
    id: doc.id,
    text: doc.content,
    metadata: doc.metadata
  }));
}

async function answerQuery(userId, query, language = 'en') {
  try {
    const top = await semanticSearch(query);

    let context = '';
    if (top.length > 0) {
      context = top.map(t => t.text).join('\n---\n');
    } else {
      context = "No specific documents found. Answer based on general logistics knowledge.";
    }

    // --- NEW: Fetch Real-time Shipment Data ---
    let shipmentContext = "";

    // 1. Check for specific Shipment ID (e.g., TN88912)
    const idMatch = query.match(/\bTN\d+\b/i);
    if (idMatch) {
      const { data: shipment } = await supabase.from('shipments').select('*').eq('id', idMatch[0].toUpperCase()).single();
      if (shipment) {
        shipmentContext += `\nSPECIFIC SHIPMENT DATA: ${JSON.stringify(shipment, null, 2)}\n`;
      }
    }

    // 2. Check for general keywords (delay, route, lane, risk, where is) to provide broader context
    const keywords = ['delay', 'risk', 'route', 'lane', 'traffic', 'weather', 'where', 'status'];
    if (keywords.some(k => query.toLowerCase().includes(k))) {
      // Fetch a batch of relevant shipments (e.g., active ones) to allow AI to answer "Delhi routes" etc.
      const { data: shipments } = await supabase.from('shipments').select('*').limit(20);
      if (shipments && shipments.length > 0) {
        // Filter out the specific one if already added to avoid duplication (optional, but clean)
        const others = shipments.filter(s => !idMatch || s.id !== idMatch[0].toUpperCase());
        shipmentContext += `\nOTHER ACTIVE SHIPMENTS (Use this to answer questions about routes, delays, or specific cities): ${JSON.stringify(others, null, 2)}\n`;
      }
    }
    // ------------------------------------------

    const systemPrompt = `
    You are LogiMind, an advanced AI logistics assistant.
    
    REAL-TIME DATABASE DATA:
    ${shipmentContext}

    CONTEXT FROM DOCUMENTS:
    ${context}
    
    INSTRUCTIONS:
    - Answer the question using the REAL-TIME DATA and DOCUMENTS.
    - If the user asks about a shipment (e.g. TN88912), use the "SPECIFIC SHIPMENT DATA" section.
    - If the user asks about "Delhi routes" or "delays", analyze the "OTHER ACTIVE SHIPMENTS" JSON to find relevant entries (e.g. filter by location='Delhi' or status='Delayed').
    - If the context doesn't contain the answer, say "I couldn't find specific information in your documents or live database."
    - Keep the tone professional and concise.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
    });

    const answer = completion.choices[0].message.content;

    // store query in Supabase (best-effort)
    try {
      await supabase.from('queries').insert([{
        user_id: userId,
        query_text: query,
        response_text: answer,
        source_chunks: top
      }]);
    } catch (e) {
      console.warn('Failed to store query:', e.message);
    }
    return { answer, sources: top };
  } catch (error) {
    console.error("Error in answerQuery:", error);
    throw error; // Re-throw to be caught by app.js
  }
}

module.exports = { answerQuery };
