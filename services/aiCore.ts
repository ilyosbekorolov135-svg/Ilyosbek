import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Updated to the requested Pro model for better academic performance
const MODEL_NAME = "gemini-1.5-pro-preview-latest"; 

export const createClient = () => {
  let apiKey = '';
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Unable to access process.env");
  }

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const retryRequest = async <T>(fn: () => Promise<T>, retries = 3, baseDelay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const message = error.message || "";
    // Handle rate limits (429) or server errors (5xx)
    if (retries > 0 && (message.includes("429") || message.includes("503") || message.includes("500"))) {
      await delay(baseDelay);
      return retryRequest(fn, retries - 1, baseDelay * 1.5);
    }
    throw error;
  }
};

export const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

export const extractUrls = (response: any): string[] => {
  const urls: string[] = [];
  const candidates = response.candidates || [];
  for (const candidate of candidates) {
    const chunks = candidate.groundingMetadata?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        urls.push(chunk.web.uri);
      }
    }
  }
  return [...new Set(urls)];
};

export const getModelName = () => MODEL_NAME;