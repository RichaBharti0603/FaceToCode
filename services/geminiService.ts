import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

/**
 * Initialize and get the Google AI Client
 */
const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes an image for visual features and threat level
 */
export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("AI Client not initialized");

    // Remove the data URL prefix if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = `
      You are a futuristic cyberpunk security AI. 
      Analyze this visual feed of a person or object. 
      Provide a brief, robotic assessment of what you see.
      Determine a 'Threat Level' (e.g., LOW, MODERATE, CRITICAL, UNKNOWN).
      Extract key identifier tags.
      
      Respond in JSON format.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt }
        ]
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["description", "threatLevel", "tags"]
        }
      }
    });

    if (!result.text) throw new Error("No response from AI");

    return JSON.parse(result.text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      description: "ANALYSIS FAILED. UNABLE TO PROCESS VISUAL DATA. RETRY INITIATED.",
      threatLevel: "ERROR",
      tags: ["ERROR", "NO_DATA"]
    };
  }
};

/**
 * Detect dominant emotion for auto-styling
 */
export const detectEmotion = async (base64Image: string): Promise<'happy' | 'neutral' | 'serious'> => {
  try {
    const ai = getClient();
    if (!ai) throw new Error("AI Client not initialized");

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const prompt = "Identify the dominant facial expression from this image. Options: happy, neutral, serious. Respond only with one single word.";

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: prompt }
        ]
      }]
    });

    const emotion = result.text.trim().toLowerCase();
    
    if (emotion.includes('happy')) return 'happy';
    if (emotion.includes('serious')) return 'serious';
    return 'neutral';

  } catch (error) {
    console.error("Emotion detection error:", error);
    return 'neutral';
  }
};