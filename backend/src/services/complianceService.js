const OpenAI = require('openai');
const fs = require('fs');
const pdf = require('pdf-parse');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeDocument(filePath, fileType) {
    try {
        let text = '';

        if (fileType === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else {
            // Assume text/markdown for simplicity or add other parsers
            text = fs.readFileSync(filePath, 'utf8');
        }

        // Truncate if too long
        const truncatedText = text.substring(0, 10000);

        const systemPrompt = `
        You are an expert Logistics Compliance Officer. Analyze the following shipping document text.
        
        Identify:
        1. Document Type (Invoice, Packing List, Battery Declaration, etc.)
        2. Missing Critical Information (Dates, Signatures, HS Codes, Weight, etc.)
        3. Compliance Status (Pass/Fail/Warning)
        4. Actionable Steps to fix any issues.

        OUTPUT JSON FORMAT:
        {
            "type": "string",
            "status": "Pass" | "Fail" | "Warning",
            "missing": ["item1", "item2"],
            "steps": ["step1", "step2"],
            "summary": "string"
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this document:\n\n${truncatedText}` }
            ],
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result;

    } catch (error) {
        console.error('Compliance Analysis Failed:', error);
        throw new Error('Failed to analyze document');
    }
}

module.exports = { analyzeDocument };
