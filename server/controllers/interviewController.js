// Filename: server/controllers/interviewController.js (FINAL - VOICE & REALISM OPTIMIZED)

import InterviewSession from '../models/interviewSessionModel.js';
import { CohereClient } from 'cohere-ai';
// Variable names updated to match your new prompts.js file
import { interviewerSystemPrompt, reportGeneratorPrompt , topicExtractorPrompt } from '../ai/prompts.js';

// Initialize Cohere client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});


export const startInterviewSession = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized. User not found." });
    }
    const initialMessage = {
      role: 'model',
      // The initial greeting, including the control token
      text: "Hello! I'm the EngiVerse AI Interviewer. To begin, could you please introduce yourself and mention the technical areas or roles you’d like to focus on? <SPEAK_END>",
    };
    const newSession = await InterviewSession.create({
      user: req.user.id,
      conversationHistory: [initialMessage],
      status: 'in_progress', // Start with 'in_progress' status
    });
    return res.status(201).json({
      success: true,
      sessionId: newSession._id,
      // Send clean text to the frontend (without the token) for speaking
      initialMessage: initialMessage.text.replace("<SPEAK_END>", "").trim(),
    });
  } catch (error) {
    console.error("❌ Error in startInterviewSession:", error);
    return res.status(500).json({ success: false, message: "Failed to start a new interview session." });
  }
};


export const postChatMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    // Validation
    if (!sessionId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Session ID and message are required." });
    }

    // Fetch session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: "This interview has already ended." });
    }

    // Push user message to session history
    session.conversationHistory.push({ role: 'user', text: message.trim() });

    // --- TOPIC EXTRACTION LOGIC ---
    // If this is the first message from the user, extract and save the topic.
    // The history length will be 2 (Eva's greeting + User's intro).
    if (session.conversationHistory.length === 2) {
        try {
            const topicResponse = await cohere.chat({
                message: `Extract the main topic from this introduction: "${message.trim()}"`,
                preamble: `You are an AI that extracts the primary technical topic from a user's text. Respond with only one or two words (e.g., "Java", "React", "Data Science").`,
                chatHistory: []
            });
            const extractedTopic = topicResponse?.text?.trim();
            if (extractedTopic) {
                session.topic = extractedTopic; // Update the session's topic
            }
        } catch (e) {
            console.error("❌ Failed to extract topic, defaulting to 'General'.", e);
            session.topic = 'General'; // Fallback topic
        }
    }

    // Map conversation for Cohere
    const chatHistory = session.conversationHistory
      .slice(0, -1) // exclude latest user message
      .map(msg => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.text,
      }));

    // Call Cohere API for the next question
    const response = await cohere.chat({
      message: message.trim(),
      chatHistory: chatHistory,
      preamble: interviewerSystemPrompt,
    });

    const aiResponseText = response?.text?.trim();
    if (!aiResponseText) {
      return res.status(502).json({ success: false, message: "Eva couldn’t respond right now. Please try again." });
    }

    // Save the full AI response to the database
    session.conversationHistory.push({ role: 'model', text: aiResponseText });
    
    // Clean the response before sending to the frontend
    const cleanResponse = aiResponseText.replace(/<SPEAK_END>|<END_OF_INTERVIEW>/g, '').trim();

    // --- REPORT GENERATION LOGIC ---
    if (aiResponseText.includes("<END_OF_INTERVIEW>")) {
      session.status = 'completed';
      const transcript = session.conversationHistory.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`).join('\n\n');
      
      const reportResponse = await cohere.chat({
        message: `Analyze this transcript:\n\n${transcript}`,
        preamble: reportGeneratorPrompt,
        chatHistory: []
      });

      // --- ROBUST JSON PARSING ---
      if (reportResponse && reportResponse.text) {
        try {
          let reportText = reportResponse.text;
          const startIndex = reportText.indexOf('{');
          const endIndex = reportText.lastIndexOf('}');
          
          if (startIndex !== -1 && endIndex !== -1) {
            const jsonString = reportText.substring(startIndex, endIndex + 1);
            const reportJson = JSON.parse(jsonString);
            
            session.overallScore = reportJson.overallScore || 0;
            session.finalReport = JSON.stringify({
              summary: reportJson.summary || "",
              strengths: reportJson.strengths || "",
              areasForImprovement: reportJson.areasForImprovement || "",
              technicalTopics: reportJson.technicalTopics || [session.topic], // Fallback to extracted topic
              communicationScore: reportJson.communicationScore || 0,
            });
          } else {
            throw new Error("No JSON object found in AI response.");
          }
        } catch (e) {
          console.error("❌ Failed to parse AI report JSON:", e, "\nRaw Response from AI:", reportResponse.text);
          session.finalReport = JSON.stringify({ summary: "Failed to generate a structured report."});
        }
      } else {
          console.error("❌ AI returned no response for the report generation.");
          session.finalReport = JSON.stringify({ summary: "AI failed to generate the report."});
      }
    }

    await session.save();
    return res.status(200).json({ success: true, reply: cleanResponse });

  } catch (error) {
    console.error("❌ Error in postChatMessage:", error);
    return res.status(500).json({ success: false, message: "The AI is taking a short break. Please try again later." });
  }
};


export const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select('topic status overallScore createdAt');
    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("❌ Error in getInterviewHistory:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch interview history." });
  }
};


export const getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findById(sessionId);
    if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: "Interview session not found." });
    }
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("❌ Error in getInterviewReport:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch interview report." });
  }
};

export const deleteInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 1. Session dhundo
    const session = await InterviewSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found." });
    }

    // 2. Security Check: Kya delete karne wala wahi user hai jiska interview hai?
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    // 3. Delete karo
    await InterviewSession.findByIdAndDelete(sessionId);

    return res.status(200).json({ success: true, message: "Session deleted successfully." });

  } catch (error) {
    console.error("❌ Error in deleteInterviewSession:", error);
    return res.status(500).json({ success: false, message: "Failed to delete session." });
  }
};