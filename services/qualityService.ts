import { CourseWorkStructure, ValidationReport, ValidationItem, ValidationStatus } from "../types";

// Helper to count words
const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
};

// Helper to check regex pattern match count
const countMatches = (text: string, regex: RegExp) => {
    return (text.match(regex) || []).length;
};

export const validateCourseWork = (data: CourseWorkStructure): ValidationReport => {
    const items: ValidationItem[] = [];
    let passedChecks = 0;
    let totalChecks = 0;

    const addCheck = (
        category: ValidationItem['category'],
        label: string,
        condition: boolean,
        successMsg: string,
        failMsg: string,
        recommendation?: string,
        isWarning: boolean = false
    ) => {
        totalChecks++;
        let status: ValidationStatus = condition ? 'success' : (isWarning ? 'warning' : 'error');
        if (condition) passedChecks++;

        items.push({
            id: `check-${totalChecks}`,
            category,
            label,
            status,
            message: condition ? successMsg : failMsg,
            recommendation: condition ? undefined : recommendation
        });
    };

    // 1. GOST: STRUCTURE CHECK
    const hasIntro = data.introduction.length > 500;
    addCheck('Structure', 'Kirish qismi mavjudligi', hasIntro, 
        "Kirish qismi yetarli hajmda shakllantirilgan.", 
        "Kirish qismi juda qisqa yoki mavjud emas.", 
        "Kirish qismini kengaytiring, dolzarblik va maqsadni aniq yoriting.");

    const hasConclusion = data.conclusion.length > 300;
    addCheck('Structure', 'Xulosa va takliflar', hasConclusion,
        "Xulosa qismi talablarga javob beradi.",
        "Xulosa qismi juda qisqa.",
        "Xulosada olingan natijalar va takliflar aniq bo'lishi kerak.");

    // 2. GOST: REFERENCES (Adabiyotlar)
    const refCount = data.references.length;
    addCheck('GOST', 'Foydalanilgan adabiyotlar soni', refCount >= 10,
        `Adabiyotlar soni yetarli (${refCount} ta).`,
        `Adabiyotlar soni kam (${refCount} ta). GOST bo'yicha kamida 10-15 ta bo'lishi kerak.`,
        "Yana manbalar qo'shing yoki mavjudlarini ko'paytiring.");

    // Check Reference Formatting (Basic check for Year)
    const validRefs = data.references.filter(r => /\d{4}/.test(r)).length;
    const refQuality = validRefs / refCount > 0.8;
    addCheck('GOST', 'Adabiyotlar formati (Yil)', refQuality,
        "Adabiyotlar ro'yxatida nashr yillari ko'rsatilgan.",
        "Ayrim adabiyotlarda nashr yili ko'rsatilmagan.",
        "Har bir manbada [Muallif, Nom, Shahar, Nashriyot, Yil] bo'lishini ta'minlang.",
        true
    );

    // 3. CONTENT: VOLUME (Hajm)
    // Estimate: 250 words per page (Times New Roman 14, 1.5 spacing)
    const totalWords = countWords(data.introduction) + 
                       countWords(data.conclusion) + 
                       [data.chapter1, data.chapter2, data.chapter3].reduce((acc, ch) => acc + ch.sections.reduce((sAcc, s) => sAcc + countWords(s.content), 0), 0);
    
    const estimatedPages = Math.ceil(totalWords / 250);
    const minPages = 20; // Minimal requirement expectation
    
    addCheck('Content', 'Ishning umumiy hajmi', estimatedPages >= minPages,
        `Taxminiy sahifalar soni: ${estimatedPages}+ (A'lo)`,
        `Ish hajmi biroz kam bo'lishi mumkin (~${estimatedPages} sahifa).`,
        "Mavzularni kengaytirib yozish tavsiya etiladi.",
        true // Warning only, strictly generated content might be dense
    );

    // 4. FORMATTING: Figures and Tables numbering
    const allContent = [data.chapter1, data.chapter2, data.chapter3]
        .map(ch => ch.sections.map(s => s.content).join(" ")).join(" ");
    
    // Check for "x-rasm" pattern usage
    const figureRefs = countMatches(allContent, /\d+-rasm/g) + countMatches(allContent, /\[RASM:/g);
    // Check for Table pattern (markdown tables)
    const tableRefs = countMatches(allContent, /\|.*\|/g); 

    addCheck('Formatting', 'Grafik materiallar', figureRefs > 0 || tableRefs > 0,
        "Ishda rasm yoki jadvallar mavjud.",
        "Ishda ko'rgazmali qurollar (rasm/jadval) aniqlanmadi.",
        "Matnni boyitish uchun sxemalar yoki jadvallar qo'shish tavsiya etiladi.",
        true
    );

    // 5. GOST: Table of Contents
    const tocMatch = data.tableOfContents.length >= 5;
    addCheck('Structure', 'Mundarija shakllanishi', tocMatch,
        "Mundarija to'liq shakllantirilgan.",
        "Mundarija elementlari yetarli emas.",
        "Rejani qayta ko'rib chiqing."
    );

    // Calculate Score
    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
        score,
        items,
        passed: score > 60 // Pass threshold
    };
};