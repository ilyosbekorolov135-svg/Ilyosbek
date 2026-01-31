import { GenerateContentResponse } from "@google/genai";
import { CourseWorkStructure, UserInputs, CoursePlan } from "../types";
import { createClient, retryRequest, cleanJson, getModelName } from "./aiCore";
import { generateCourseWorkPlan, generateAcademicFullDoc } from "./strategies/courseWork";
import { generateIndependentWorkPlan, generateCreativeFullDoc } from "./strategies/independentWork";

// --- FACADE METHODS ---

export const validateTopic = async (topic: string): Promise<{ isValid: boolean; reason: string }> => {
  try {
    const ai = createClient();
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
      model: getModelName(),
      contents: `Mavzuni tekshiring: "${topic}". Akademik ish uchun yaroqlimi? Javob JSON: {"isValid": boolean, "reason": "qisqa izoh"}`,
      config: { responseMimeType: "application/json" }
    }));
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error: any) {
    return { isValid: true, reason: "" }; // Fail open if API error
  }
};

export const refineTopic = async (topic: string): Promise<string> => {
  const ai = createClient();
  const prompt = `
    Talaba quyidagi mavzuni kiritdi: "${topic}".
    Bu mavzuni Oliy ta'lim talablari (GOST) asosida jiddiy, ilmiy va chiroyli nomlangan mavzuga aylantirib ber.
    Faqat bitta eng yaxshi variantni qaytar.
    Masalan: "AI va iqtisod" -> "Raqamli iqtisodiyot sharoitida sun'iy intellekt texnologiyalarini joriy etish istiqbollari".
    
    Javob faqat mavzu nomi bo'lsin.
  `;
  
  try {
    const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: getModelName(),
        contents: prompt
    }));
    return response.text?.trim() || topic;
  } catch (e) {
    return topic;
  }
};

export const generateCoursePlan = async (inputs: UserInputs): Promise<{ plan: CoursePlan }> => {
  if (inputs.documentType === 'mustaqil_ish' || inputs.documentType === 'referat') {
    return generateIndependentWorkPlan(inputs);
  } else {
    return generateCourseWorkPlan(inputs);
  }
};

export const generateFullCourseWork = async (
  inputs: UserInputs,
  plan: CoursePlan,
  onProgress: (status: string, percent: number, timeLeft: string) => void,
  onPartialUpdate?: (partial: CourseWorkStructure) => void
): Promise<CourseWorkStructure> => {
  if (inputs.documentType === 'mustaqil_ish' || inputs.documentType === 'referat') {
    return generateCreativeFullDoc(inputs, plan, onProgress, onPartialUpdate);
  } else {
    return generateAcademicFullDoc(inputs, plan, onProgress, onPartialUpdate);
  }
};

export const paraphraseText = async (text: string): Promise<string> => {
  const ai = createClient();
  const prompt = `
    You are an expert academic editor specializing in plagiarism reduction for Uzbek universities. Your task is to PARAPHRASE the given text while preserving its original meaning and academic rigor.

    ### RULES:
    1. NEVER copy direct quotes from laws/Constitution — always paraphrase.
    2. MAINTAIN academic tone — no colloquial language.
    3. ADD citation numbers where appropriate (e.g., [1], [2]).
    4. OUTPUT MUST BE IN THE SAME LANGUAGE AS INPUT.
    5. RETURN ONLY THE PARAPHRASED TEXT. NO META COMMENTARY.

    ### INPUT TEXT:
    "${text}"
  `;

  const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: getModelName(),
    contents: prompt
  }));

  return response.text || "";
};