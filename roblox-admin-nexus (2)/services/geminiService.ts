
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the API_KEY from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    // Generate content using gemini-3-pro-preview for complex reasoning tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Твоё имя Nexus AI. Ты помогаешь команде с вопросами по Roblox и клиентам. Пиши максимально коротко и только по делу. Самое важное: ПИШИ ВООБЩЕ БЕЗ ЗАПЯТЫХ. Не будь занудным и не используй лишние слова. Тон общения — простой и четкий как в быстром чате. Отвечай на русском языке.",
      }
    });
    // The response.text property contains the generated string content.
    return response.text || "не вышло ответить чето";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ошибка связи с базой чекай коннект";
  }
};
