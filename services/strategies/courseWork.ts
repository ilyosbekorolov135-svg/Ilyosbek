import { GenerateContentResponse } from "@google/genai";
import { UserInputs, CoursePlan, CourseWorkStructure } from "../../types";
import { createClient, retryRequest, cleanJson, extractUrls, getModelName, delay } from "../aiCore";
import { getFacultyRules } from "./promptUtils";

// --- KURS ISHI & BMI STRATEGY (PRO - Professor Karimov Edition v2.0) ---

const getAcademicSystemInstruction = (inputs: UserInputs) => {
  return `
Siz Professor Dr. Akmal Karimovsiz - O'zbekiston Oliy Ta'lim vazirligi huzuridagi GOST 7.0.5 bo'yicha bosh auditor va "Anti-Plagiat" tizimi ekspertisiz.

MAQSAD: ${inputs.documentType === 'bmi' ? 'BITIRUV MALAKAVIY ISHI (Diplom)' : 'KURS ISHI'} tayyorlash.
MAVZU: "${inputs.topic}"
FAKULTET: ${inputs.facultyName}

### 🧠 ANALITIK QOIDALAR (MUHIM):
1. **KONTEKSTNI SAQLASH**: Har bir yangi bo'limni yozishda oldingi bo'limdagi fikrlarni mantiqiy davom ettiring. Ziddiyat bo'lmasin.
2. **MA'LUMOTLAR ANIQLIGI**: 
   - "[Jadval kiritiladi]" kabi so'zlar **QAT'IYAN TAQIQLANADI**.
   - Jadval kerakmi? Markdown formatida chizing va ichini *Stat.uz* yoki *Jahon Banki* ma'lumotlariga asoslangan realga yaqin raqamlar bilan to'ldiring.
   - 2020-2024 yillar oralig'idagi ma'lumotlardan foydalaning.
3. **ILMIY USLUB**:
   - Gaplar qisqa va londa bo'lsin.
   - "Menimcha", "Bizningcha" so'zlarini ishlatmang. "Tahlillar shuni ko'rsatadiki..." deb yozing.
4. **FORMATLASH**:
   - Har bir yangi fikr yangi xatboshidan boshlansin.
   - Asosiy terminlar **qalin** shriftda berilsin.

${getFacultyRules(inputs.facultyName)}
`;
};

export const generateCourseWorkPlan = async (inputs: UserInputs): Promise<{ plan: CoursePlan }> => {
  const ai = createClient();
  const isBMI = inputs.documentType === 'bmi';
  
  const prompt = `
    Professor Karimov, quyidagi mavzu bo'yicha mukammal ilmiy ish rejasini tuzing: "${inputs.topic}".
    
    Talablar:
    1. Reja mantiqiy ketma-ketlikda bo'lsin (Nazariya -> Tahlil -> Yechim).
    2. Bob nomlari ilmiy va jiddiy bo'lsin.
    
    Javob JSON formatida:
    {
      "chapter1_title": "1-bob nomi (Nazariy asoslar)",
      "chapter1_subsections": ["1.1. ...", "1.2. ...", "1.3. ..."],
      "chapter2_title": "2-bob nomi (Tahliliy qism)",
      "chapter2_subsections": ["2.1. ...", "2.2. ...", "2.3. ..."],
      "chapter3_title": "${isBMI ? '3-bob nomi (Amaliy takliflar)' : ''}",
      "chapter3_subsections": ${isBMI ? '["3.1. ...", "3.2. ..."]' : '[]'}
    }
  `;

  const response = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: { systemInstruction: getAcademicSystemInstruction(inputs), responseMimeType: "application/json" }
  }));

  const plan = JSON.parse(cleanJson(response.text || "{}"));
  
  // Fallback validatsiyasi
  if (!plan.chapter1_subsections) plan.chapter1_subsections = ["Mavzuning nazariy asoslari", "Xorijiy tajriba tahlili"];
  if (!plan.chapter2_subsections) plan.chapter2_subsections = ["Tizimli tahlil", "Muammolar tasnifi"];
  
  return { plan };
};

export const generateAcademicFullDoc = async (
    inputs: UserInputs,
    plan: CoursePlan,
    onProgress: (status: string, percent: number, timeLeft: string) => void,
    onPartialUpdate?: (partial: CourseWorkStructure) => void
  ): Promise<CourseWorkStructure> => {
    const ai = createClient();
    const startTime = Date.now();
    let accumulatedContext = ""; // Context memory
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
  
    // 1. KIRISH QISMI (INTRODUCTION)
    onProgress("Ilmiy apparat (Kirish) shakllantirilmoqda...", 5, "2 daqiqa qoldi");
    
    const introPrompt = `
      Mavzu: "${inputs.topic}"
      
      Vazifa: GOST 7.0.5 talablari asosida KIRISH va XULOSA qismlarini yozing.
      
      KIRISH TARKIBI (Har biri alohida abzasda):
      1. Mavzuning dolzarbligi (O'zbekiston strategiyasi bilan bog'lang).
      2. Muammoning o'rganilganlik darajasi (Kamida 3 ta olim ismi keltirilsin).
      3. Tadqiqot maqsadi va vazifalari.
      4. Tadqiqot obyekti va predmeti.
      5. Ilmiy yangilik.
      
      ADABIYOTLAR:
      - O'zbekiston qonunlari (Lex.uz).
      - Prezident asarlari.
      - 2020-2024 yillardagi ilmiy maqolalar.
      
      Javob JSON: { "introduction": "markdown text...", "conclusion": "markdown text...", "references": ["1. ...", "2. ..."] }
    `;
    
    const metaRes = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
      model: getModelName(),
      contents: introPrompt,
      config: { 
          systemInstruction: getAcademicSystemInstruction(inputs), 
          responseMimeType: "application/json", 
          tools: useSearch ? [{googleSearch:{}}] : [] 
      }
    }));
    
    const metaData = JSON.parse(cleanJson(metaRes.text || "{}"));
    structure.introduction = metaData.introduction || "Generatsiya xatosi.";
    structure.conclusion = metaData.conclusion || "Generatsiya xatosi.";
    structure.references = (metaData.references || []).sort();
    extractUrls(metaRes).forEach(u => allUrls.add(u));
  
    accumulatedContext = `MAVZU: ${inputs.topic}.\nMAQSAD: ${structure.introduction.substring(0, 500)}...`;
    if(onPartialUpdate) onPartialUpdate({...structure, sourceUrls: Array.from(allUrls)});
  
    // 2. BOBLARNI KENGAYTIRIB YOZISH
    const chapters = [
      { key: 'chapter1', title: plan.chapter1_title, subs: plan.chapter1_subsections },
      { key: 'chapter2', title: plan.chapter2_title, subs: plan.chapter2_subsections },
      { key: 'chapter3', title: plan.chapter3_title, subs: plan.chapter3_subsections },
    ].filter(c => c.title && c.subs.length > 0);
  
    let totalSections = chapters.reduce((acc, c) => acc + c.subs.length, 0);
    let completedSections = 0;
  
    for (const ch of chapters) {
      // Bob uchun qisqa kirish
      (structure as any)[ch.key].intro = `Ushbu bobda ${ch.title} masalalari atroflicha tahlil qilinadi.`;
      
      for (const sub of ch.subs) {
        completedSections++;
        const percent = 10 + Math.round((completedSections / totalSections) * 80);
        onProgress(`${ch.title} | ${sub}`, percent, "Tahlil qilinmoqda...");
        
        const secPrompt = `
          OLDI TARIY KONTEKST: ${accumulatedContext.slice(-1000)}
          
          JORIY VAZIFA:
          Bob: ${ch.title}
          Bo'lim: ${sub}
          
          TALABLAR:
          1. **HAJM**: Minimal 700 so'z (juda batafsil bo'lsin).
          2. **TARKIB**: Nazariyani amaliyot bilan bog'lang. Agar iqtisodiy mavzu bo'lsa, jadvallar (markdown) kiriting. Agar texnik bo'lsa, algoritmlar kiriting.
          3. **ILMIYLIK**: Har bir da'vo asoslanishi kerak. Manbalarga havolalar [1], [2] ko'rinishida bo'lsin.
          4. **QO'SHIMCHA**: Matnni "suv" bilan to'ldirmang. Aniq faktlar, raqamlar va tahlillar yozing.
        `;

        const secRes = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
            model: getModelName(),
            contents: secPrompt,
            config: { 
                systemInstruction: getAcademicSystemInstruction(inputs), 
                tools: useSearch ? [{googleSearch:{}}] : [] 
            }
        }));
        
        const content = secRes.text || "";
        (structure as any)[ch.key].sections.push({ title: sub, content });
        
        extractUrls(secRes).forEach(u => allUrls.add(u));
        accumulatedContext += `\n${sub}: ${content.substring(0, 300)}...`; // Context update
        
        if(onPartialUpdate) onPartialUpdate({...structure, sourceUrls: Array.from(allUrls)});
        await delay(1500); // API limitini buzmaslik uchun
      }
    }
  
    // 3. ILOVALAR VA YAKUNIY FORMATLASH
    onProgress("Ilovalar va bibliografiya...", 95, "Yakunlanmoqda");
    const appPrompt = `
        Mavzu: "${inputs.topic}"
        Vazifa: Ishga ilova (Appendix) tayyorlash.
        
        Tayyorlang:
        1. Statistik jadval (Yillar kesimida dinamika).
        2. Tizim strukturasi yoki jarayon sxemasi (Text-based flowchart).
        
        Faqat mazmunni qaytaring.
    `;
    const appRes = await retryRequest<GenerateContentResponse>(() => ai.models.generateContent({
        model: getModelName(), 
        contents: appPrompt,
        config: { systemInstruction: getAcademicSystemInstruction(inputs) }
    }));
    structure.appendix = appRes.text || "";
  
    structure.tableOfContents = [
        "KIRISH",
        ...chapters.flatMap((c, i) => [
            `${i+1}-BOB. ${c.title.toUpperCase()}`,
            ...c.subs.map((s, j) => `${i+1}.${j+1}. ${s}`)
        ]),
        "XULOSA",
        "FOYDALANILGAN ADABIYOTLAR RO'YXATI",
        "ILOVALAR"
    ];
  
    structure.generationTime = Date.now() - startTime;
    onProgress("Muvaffaqiyatli yakunlandi!", 100, "Tayyor");
    
    return structure;
};