import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a production environment, never expose API keys on the client side.
// This is for demonstration as per instructions using process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTutorResponse = async (
  prompt: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct the chat including history
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: "You are a helpful, encouraging, and knowledgeable educational AI tutor. You help students from Class 8 to 12 with their studies in Bengali or English.",
      },
      history: history,
    });

    const result = await chat.sendMessage({ message: prompt });
    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Something went wrong with the AI Tutor. Please check your API key.";
  }
};