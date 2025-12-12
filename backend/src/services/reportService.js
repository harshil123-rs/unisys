const OpenAI = require('openai');
const { supabase } = require('./supabaseService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReport() {
    try {
        // Fetch Real Data from Supabase
        const { data: shipments } = await supabase.from('shipments').select('*');
        const { data: queries } = await supabase.from('queries').select('*').limit(50); // Fetch recent queries

        // Construct Data Context
        const realContext = {
            shipments: shipments || [],
            // Summarize queries if available, otherwise mock for now if table is empty
            queries: queries && queries.length > 0 ? queries.map(q => q.query_text) : [
                'Where is my shipment?', 'Delay prediction', 'Customs rules'
            ],
            // Keep SOPs mock for now as we don't have a structured SOP table yet, or we could count documents
            sops: [
                { title: 'General Compliance', checks: 120 },
                { title: 'Hazardous Goods', checks: 45 }
            ]
        };

        const context = JSON.stringify(realContext, null, 2);

        const systemPrompt = `
        You are an advanced Logistics AI. Generate a comprehensive "Operations Summary Report" based on the following REAL-TIME DATA snapshot.
        
        DATA SNAPSHOT:
        ${context}

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
                "topSOP": string,
                "missingDoc": string,
                "recommendation": string
            },
            "queries": {
                "topQuestions": ["q1", "q2", "q3"],
                "timeSaved": string,
                "languages": string
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
