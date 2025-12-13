const OpenAI = require('openai');
const { supabase } = require('./supabaseService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReport() {
    try {
        // Fetch Real Data from Supabase in Parallel
        const [shipmentsResult, queriesResult] = await Promise.all([
            supabase.from('shipments').select('*'),
            supabase.from('queries').select('*').limit(50)
        ]);

        const shipments = shipmentsResult.data;
        const queries = queriesResult.data;

        // Construct Data Context
        const realContext = {
            shipments: shipments || [],
            queries: queries || []
        };

        const context = JSON.stringify(realContext, null, 2);

        const systemPrompt = `
        You are an advanced Logistics AI. Generate a comprehensive "Operations Summary Report" based on the following REAL-TIME DATA snapshot.
        
        DATA SNAPSHOT:
        ${context}

        INSTRUCTIONS:
        - Analyze the "shipments" array to identify delays, risks, and carrier performance.
        - Analyze the "queries" array (if available) to identify common user questions. If empty, state "No recent queries".
        - For "compliance", analyze the shipment data for potential issues (e.g. missing fields, delayed status, high risk scores) instead of relying on external SOP documents.
        - Do NOT invent data. If data is missing, state "Insufficient data".

        OUTPUT FORMAT:
        Return a valid JSON object with the following structure (do not include markdown formatting like \`\`\`json):
        {
            "summary": {
                "totalShipments": number,
                "delivered": number,
                "delayed": number,
                "highRisk": number,
                "fastestRoute": string,
                "slowestRoute": string,
                "insight": string
            },
            "compliance": {
                "topSOP": string, // Derive from common issues (e.g. "On-Time Delivery Protocol", "Documentation Check")
                "missingDoc": string, // Derive from data gaps or state "None"
                "recommendation": string
            },
            "queries": {
                "topQuestions": ["q1", "q2", "q3"], // Extract from real queries
                "timeSaved": string, // Estimate based on query count
                "languages": string // Detect from query text
            },
            "risks": {
                "highDelayZones": [{"zone": string, "risk": string}],
                "carrierPerformance": [{"carrier": string, "score": string}],
                "alert": string
            },
            "recommendations": ["rec1", "rec2", "rec3", "rec4"],
            "customerExperience": {
                "responseTimeBefore": string,
                "responseTimeAfter": string,
                "confidence": string
            }
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const answer = completion.choices[0].message.content;
        return JSON.parse(answer);

    } catch (error) {
        console.error('AI Report Generation Failed:', error);
        throw new Error('Failed to generate report');
    }
}

module.exports = { generateReport };
