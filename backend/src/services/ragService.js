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
    // --- OPTIMIZED: Parallel Data Fetching ---
    const idMatch = query.match(/\bTN\d+\b/i);
    const keywords = ['delay', 'risk', 'route', 'lane', 'traffic', 'weather', 'where', 'status'];
    const hasKeywords = keywords.some(k => query.toLowerCase().includes(k));

    // Execute all data fetching concurrently
    const [top, specificShipmentResult, generalShipmentsResult] = await Promise.all([
      semanticSearch(query),
      idMatch ? supabase.from('shipments').select('*').eq('id', idMatch[0].toUpperCase()).single() : Promise.resolve({ data: null }),
      hasKeywords ? supabase.from('shipments').select('*').limit(20) : Promise.resolve({ data: [] })
    ]);

    let context = '';
    if (top.length > 0) {
      context = top.map(t => t.text).join('\n---\n');
    } else {
      context = "No specific documents found. Answer based on general logistics knowledge.";
    }

    let shipmentContext = "";

    // 1. Process Specific Shipment Data
    if (specificShipmentResult.data) {
      shipmentContext += `\nSPECIFIC SHIPMENT DATA: ${JSON.stringify(specificShipmentResult.data, null, 2)}\n`;
    }

    // 2. Process General Shipment Data
    if (generalShipmentsResult.data && generalShipmentsResult.data.length > 0) {
      // Filter out the specific one if already added to avoid duplication
      const others = generalShipmentsResult.data.filter(s => !idMatch || s.id !== idMatch[0].toUpperCase());
      shipmentContext += `\nOTHER ACTIVE SHIPMENTS (Use this to answer questions about routes, delays, or specific cities): ${JSON.stringify(others, null, 2)}\n`;
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
    - **IMPORTANT: Respond in the following language code: ${language}. If the language is 'kn' (Kannada), ensure the response is in Kannada script.**
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
