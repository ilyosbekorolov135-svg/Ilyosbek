import { GenerateContentResponse } from "@google/genai";
import { UserInputs, CoursePlan, CourseWorkStructure } from "../../types";
import { createClient, retryRequest, cleanJson, extractUrls, getModelName, delay } from "../aiCore";
import { getFacultyRules } from "./promptUtils";

// --- MUSTAQIL ISH & REFERAT STRATEGY (FREE/LIGHT) ---

const getCreativeSystemInstruction = (inputs: UserInputs) => {
  return `
Siz talabalar uchun akademik maslahatchisiz.
Hujjat Turi: ${inputs.documentType === 'referat' ? 'REFERAT' : 'MUSTAQIL ISH'}.
Mavzu: "${inputs.topic}"

**YONDASHUV:**
1. Bu jiddiy ilmiy dissertatsiya EMAS. Bu talabaning mavzu bo'yicha mustaqil fikrlashi va tahlili.
2. Uslub: Tushunarli, ravon, publitsistik elementlarga ega bo'lishi mumkin.
3. Ruxsat etiladi: "Menimcha", "Xulosa qilib aytganda", "Fikrimizcha" kabi iboralar (Active Voice).
4. Maqsad: Mavzuning mohiyatini qisqa va londa ochib berish.

${getFacultyRules(inputs.facultyName)}
`;
};

export const generateIndependentWorkPlan = async (inputs: UserInputs): Promise<{ plan: CoursePlan }> => {
  const ai = createClient();
  const isReferat = inputs.documentType === 'referat';
  
  // Referat va Mustaqil ish uchun soddaroq reja
  const structurePrompt = isReferat
    ? `REFERAT uchun reja tuzing:
       KIRISH (Qisqa).
       1. Mavzuning tarixi va nazariy tushunchalari.
       2. Mavzuning bugungi kundagi holati va ahamiyati.
       XULOSA.`
    : `MUSTAQIL ISH uchun reja tuzing:
       KIRISH.
       1. Muammoning qo'yilishi va sabablari.
       2. Tahlil, misollar va shaxsiy qarashlar.
       3. Takliflar va yechimlar.
       XULOSA.`;

  const prompt = `
    MAVZU: "${inputs.topic}"
    ${structurePrompt}
    
    JSON Formatida qaytaring:
    {
      "chapter1_title": "1-bob nomi",
      "chapter1_subsections": ["..."],
      "chapter2_title": "2-bob nomi",
      "chapter2_subsections": ["..."],
      "chapter3_title": "",
      "chapter3_subsections": []
    }
  `;

  const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: { systemInstruction: getCreativeSystemInstruction(inputs), responseMimeType: "application/json" }
  }));

  const plan = JSON.parse(cleanJson(response.text || "{}"));
  
  if (!plan.chapter1_subsections || plan.chapter1_subsections.length === 0) plan.chapter1_subsections = ["Umumiy tushunchalar"];
  if (!plan.chapter2_subsections || plan.chapter2_subsections.length === 0) plan.chapter2_subsections = ["Asosiy qism"];
  plan.chapter3_title = "";
  plan.chapter3_subsections = [];
  
  return { plan };
};

export const generateCreativeFullDoc = async (
    inputs: UserInputs,
    plan: CoursePlan,
    onProgress: (status: string, percent: number, timeLeft: string) => void,
    onPartialUpdate?: (partial: CourseWorkStructure) => void
  ): Promise<CourseWorkStructure> => {
    const ai = createClient();
    const startTime = Date.now();
    let accumulatedContext = "";
    const allUrls = new Set<string>();
    const useSearch = inputs.settings.useGoogleSearch; 
  
    const structure: CourseWorkStructure = {
      type: inputs.documentType,
      universityName: inputs.universityName,
      facultyName: inputs.facultyName,
      groupName: inputs.groupName,
      studentName: inputs.studentName,
      teacherName: inputs.teacherName,
      cityYear: inputs.cityYear,
      topic: inputs.topic,
      tableOfContents: [],
      introduction: "",
      chapter1: { title: plan.chapter1_title, intro: "", sections: [] },
      chapter2: { title: plan.chapter2_title, intro: "", sections: [] },
      chapter3: { title: plan.chapter3_title, intro: "", sections: [] },
      conclusion: "",
      references: [],
      sourceUrls: [],
      generationTime: 0
    };
  
    // 1. KIRISH
    onProgress("Kirish qismi...", 10, "Boshlanmoqda");
    
    const introPrompt = `
      Mavzu: "${inputs.topic}"
      Vazifa: "KIRISH", "XULOSA" va "ADABIYOTLAR" yozish.
      
      KIRISH: Mavzuni qiziqarli qilib ochib bering. Hayotiy misollar keltiring. Maqsadni yozing. (Hajmi 1 sahifa atrofida).
      ADABIYOTLAR: 5-8 ta asosiy manba yetarli.
      
      Javob JSON: { "introduction": "...", "conclusion": "...", "references": ["..."] }
    `;
    
    const metaRes = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
      model: getModelName(),
      contents: introPrompt,
      config: { 
          systemInstruction: getCreativeSystemInstruction(inputs), 
          responseMimeType: "application/json", 
          tools: useSearch ? [{googleSearch:{}}] : [] 
      }
    }));
    
    const metaData = JSON.parse(cleanJson(metaRes.text || "{}"));
    structure.introduction = metaData.introduction || "";
    structure.conclusion = metaData.conclusion || "";
    structure.references = metaData.references || [];
    extractUrls(metaRes).forEach(u => allUrls.add(u));
  
    accumulatedContext = structure.introduction;
    if(onPartialUpdate) onPartialUpdate({...structure, sourceUrls: Array.from(allUrls)});
  
    // 2. GENERATSIYA
    const chapters = [
      { key: 'chapter1', title: plan.chapter1_title, subs: plan.chapter1_subsections },
      { key: 'chapter2', title: plan.chapter2_title, subs: plan.chapter2_subsections },
    ].filter(c => c.title && c.subs.length > 0);
  
    let totalSections = chapters.reduce((acc, c) => acc + c.subs.length, 0);
    let completedSections = 0;
  
    for (const ch of chapters) {
      (structure as any)[ch.key].intro = `Quyida ${ch.title} haqida fikr yuritamiz.`;
      
      for (const sub of ch.subs) {
        completedSections++;
        onProgress(`${ch.title}: ${sub}`, 20 + Math.round((completedSections / totalSections) * 60), "Yozilmoqda...");
        
        const secPrompt = `
          BOB: ${ch.title}
          BO'LIM: ${sub}
          
          Vazifa: Mavzuni erkin, tushunarli tilda yoriting.
          Hajmi: 300 so'z atrofida.
          Talab: O'z fikringizni, kuzatishlaringizni va misollarni qo'shing. Matn zerikarli bo'lmasin.
          
          Kontekst: ${accumulatedContext.slice(-300)}
        `;

        const secRes = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
            model: getModelName(),
            contents: secPrompt,
            config: { 
                systemInstruction: getCreativeSystemInstruction(inputs), 
                tools: useSearch ? [{googleSearch:{}}] : [] 
            }
        }));
        
        const content = secRes.text || "";
        (structure as any)[ch.key].sections.push({ title: sub, content });
        extractUrls(secRes).forEach(u => allUrls.add(u));
        accumulatedContext += content;
        
        if(onPartialUpdate) onPartialUpdate({...structure, sourceUrls: Array.from(allUrls)});
        await delay(500); 
      }
    }
  
    // 3. YAKUNLASH
    onProgress("Formatlash...", 90, "Oz qoldi");
    structure.appendix = ""; // Mustaqil ishda ilova shart emas
  
    structure.tableOfContents = [
        "KIRISH",
        ...chapters.flatMap((c, i) => [
            c.title.toUpperCase(),
            ...c.subs.map((s, j) => `${i+1}.${j+1}. ${s}`)
        ]),
        "XULOSA",
        "ADABIYOTLAR"
    ];
  
    structure.generationTime = Date.now() - startTime;
    onProgress("Tayyor!", 100, "0 sek");
    
    return structure;
};