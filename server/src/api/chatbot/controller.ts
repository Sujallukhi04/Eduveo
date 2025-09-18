import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { TokenPayload } from "types";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Validation schema for chat request
const chatRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

// Study-related context
const STUDY_CONTEXT = `You are an educational AI assistant. Only provide help with academic topics like:
- Academic subjects and coursework
- Study techniques and learning methods
- Homework help and explanations
- Test preparation strategies
Avoid any non-academic or inappropriate content.`;

// const isStudyRelated = (prompt: string): boolean => {
//   const nonAcademicKeywords = [
//     'gambling', 'betting', 'adult', 'nsfw', 'hack', 'crack',
//     'cheat', 'steal', 'illegal', 'drug', 'weapon', 'violence'
//   ];

//   return !nonAcademicKeywords.some(keyword => 
//     prompt.toLowerCase().includes(keyword)
//   );
// };

// Add this interface for chat history
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Add this near the top with other constants
const MAX_HISTORY_LENGTH = 5; // Adjust based on your needs

// Add this near the top with other constants
const chatHistory = new Map<string, ChatMessage[]>();

export const generateResponse = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validationResult = chatRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    const { prompt } = validationResult.data;
    
    // Get or initialize chat history for this user
    const userHistory = chatHistory.get(user.id) || [];
    
    // Limit history to last MAX_HISTORY_LENGTH messages
    if (userHistory.length > MAX_HISTORY_LENGTH) {
      userHistory.splice(0, userHistory.length - MAX_HISTORY_LENGTH);
    }

    // Construct the messages array for the AI
    const messages = [
      { role: 'assistant' as const, content: STUDY_CONTEXT },
      ...userHistory,
      { role: 'user' as const, content: prompt }
    ];

    // Convert messages to strings for Gemini
    const messageStrings = messages.map(msg => 
      `${msg.role}: ${msg.content}`
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContentStream(messageStrings);

    console.log(`[Chatbot] User ${user.name}: ${prompt}`);

    let fullResponse = '';

    // Modify the streaming loop to capture the full response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      // Send chunk as SSE
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }

    // Update chat history with both the user's message and AI's response
    userHistory.push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: fullResponse }
    );
    chatHistory.set(user.id, userHistory);

    // Send the final message
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("[Chatbot] Error:", error);
    res.write(`data: ${JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error"
    })}\n\n`);
    res.end();
  }
};
