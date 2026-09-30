import ai from "../config/ai.js"; // Make sure path is correct
import Resume from "../models/resumeModel.js";

// Helper to clean AI output (remove markdown, quotes)
const cleanAIResponse = (text) => {
    if (!text) return "";
    return text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .replace(/^"|"$/g, "") // Remove surrounding quotes
        .trim();
};

// 1. Enhance Professional Summary
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ success: false, message: "Content is required." });
        }

        const prompt = `
        You are a Senior Resume Strategist. Rewrite this professional summary to be a "High-Impact Executive Hook".
        
        Original Text: "${userContent}"
        
        GUIDELINES:
        - Use active voice and strong action verbs.
        - Include ATS keywords naturally.
        - Keep it to 3-4 concise sentences.
        - Return ONLY the refined text. No introductory words like "Here is the refined version".
        `;

        const response = await ai.chat({
            model: "command-r-08-2024", // or your specific model
            message: prompt,
            temperature: 0.5,
        });

        const cleanedText = cleanAIResponse(response.text);

        return res.status(200).json({ 
            success: true, 
            enhancedContent: cleanedText 
        });

    } catch (error) {
        console.error("AI Summary Error:", error);
        return res.status(500).json({ success: false, message: "AI Service Failed: " + error.message });
    }
};

// 2. Enhance Job Description (Bullet Points)
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ success: false, message: "Content is required." });
        }

        const prompt = `
        You are an expert Technical Recruiter. Rewrite these job description bullet points using the "Action Verb + Task + Result" formula.
        
        Original Bullets: "${userContent}"
        
        GUIDELINES:
        - Start every bullet with a strong power verb (e.g., Engineered, Spearheaded).
        - Add metrics/numbers where possible (use placeholders like 'X%' if unknown).
        - Remove fluff.
        - Return ONLY the bullet points as plain text lines. No markdown symbols like (* or -) at the start.
        `;

        const response = await ai.chat({
            model: "command-r-08-2024",
            message: prompt,
            temperature: 0.5,
        });

        const cleanedText = cleanAIResponse(response.text);

        return res.status(200).json({ 
            success: true, 
            enhancedContent: cleanedText 
        });

    } catch (error) {
        console.error("AI Job Desc Error:", error);
        return res.status(500).json({ success: false, message: "AI Service Failed: " + error.message });
    }
};

// 3. Parse PDF to JSON (Upload Resume Feature)
export const parseResumeFromPDF = async (req, res) => {
    try {
        const { resumeText, title } = req.body;
        // const userId = req.user.id; // Ensure you get User ID correctly based on your auth middleware
        // For now assuming userId is passed in body or req.userId
        const userId = req.userId || req.body.userId; 

        if (!resumeText) return res.status(400).json({ success: false, message: "No text provided" });

        const jsonSchema = `{
            "professional_summary": "string",
            "skills": ["string"],
            "personal_info": { "full_name": "string", "email": "string", "phone": "string", "linkedin": "string", "location": "string", "profession": "string" },
            "experience": [{ "company": "string", "position": "string", "start_date": "string", "end_date": "string", "description": "string", "is_current": boolean }],
            "education": [{ "institution": "string", "degree": "string", "field": "string", "graduation_date": "string", "gpa": "string" }],
            "project": [{ "name": "string", "type": "string", "description": "string" }]
        }`;

        const response = await ai.chat({
            model: "command-r-08-2024",
            message: `Extract data from this text:\n\n"${resumeText.slice(0, 30000)}"\n\nReturn ONLY valid JSON matching this schema:\n${jsonSchema}`,
            temperature: 0,
        });

        let extractedText = cleanAIResponse(response.text);
        let parsedData;
        
        try {
            parsedData = JSON.parse(extractedText);
        } catch (e) {
             // Fallback: sometimes AI adds extra text, try to find the first { and last }
             const firstBrace = extractedText.indexOf('{');
             const lastBrace = extractedText.lastIndexOf('}');
             if(firstBrace !== -1 && lastBrace !== -1) {
                 parsedData = JSON.parse(extractedText.substring(firstBrace, lastBrace + 1));
             } else {
                 throw new Error("AI output was not valid JSON");
             }
        }

        const newResume = await Resume.create({
            userId,
            title: title || "Parsed Resume",
            ...parsedData,
        });
        
        return res.status(200).json({ success: true, resumeId: newResume._id });

    } catch (error) {
        console.error("AI Parse Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};