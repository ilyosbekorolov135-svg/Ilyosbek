import React from 'react';
import { CourseWorkStructure } from '../types';

export const PaperRender = ({ data }: { data: CourseWorkStructure }) => {
  const contentFormat = (text: string) => {
    if(!text) return null;
    return text.split('\n').map((line, i) => {
      // Handle Markdown Tables (Simulated)
      if (line.trim().startsWith('|')) {
         return (
            <div key={i} className="my-6 w-full overflow-x-auto avoid-break">
                <div className="font-mono text-[10pt] whitespace-pre-wrap border border-black p-2 bg-white">
                    {line}
                </div>
            </div>
         );
      }
      if (line.trim().length === 0) return <br key={i} />;
      
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\[RASM:.*?\]/g, '');
        
      return <p key={i} className="mb-0 text-justify indent-[1.25cm]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <>
    <style>{`
      @media print {
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; background: white; }
        .no-print { display: none !important; }
        #paper-content { 
            width: 100% !important;
            max-width: 210mm !important; 
            padding: 20mm 10mm 20mm 30mm !important; 
            margin: 0 auto !important;
            box-shadow: none !important;
            overflow: visible !important;
        }
        .page-break { page-break-before: always; break-before: always; }
        .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        h1, h2, h3 { page-break-after: avoid; break-after: avoid; }
        p { orphans: 3; widows: 3; }
      }
    `}</style>
    <div id="paper-content" className="w-full bg-white shadow-paper min-h-[297mm] mx-auto p-[20mm_10mm_20mm_30mm] font-serif text-[14pt] leading-[1.5] text-black box-border">
      
      {/* --- TITLE PAGE --- */}
      <div className="flex flex-col relative min-h-[calc(297mm-40mm)] text-center">
          {/* Header */}
          <div className="text-center">
              <p className="uppercase font-bold">O'zbekiston Respublikasi <br/>Oliy Ta'lim, Fan va Innovatsiyalar Vazirligi</p>
              <p className="uppercase font-bold mt-4">{data.universityName}</p>
              <p className="uppercase font-bold mt-2">{data.facultyName} fakulteti</p>
          </div>
          
          {/* Center Title */}
          <div className="flex-1 flex flex-col justify-center items-center my-8">
              <h1 className="uppercase font-bold text-[24pt] tracking-widest mb-6 leading-tight">
                {data.type === 'referat' ? 'REFERAT' : data.type === 'bmi' ? 'BITIRUV MALAKAVIY ISHI' : data.type === 'maqola' ? 'ILMIY MAQOLA' : data.type === 'mustaqil_ish' ? 'MUSTAQIL ISH' : 'KURS ISHI'}
              </h1>
              <p className="text-[14pt] mb-4">Mavzu:</p>
              <div className="w-4/5 text-center pb-2">
                 <p className="uppercase font-bold text-[16pt] leading-snug break-words">{data.topic}</p>
                 <div className="w-full h-px bg-black mt-1"></div>
              </div>
          </div>
          
          {/* Footer Info */}
          <div className="w-full flex justify-end mb-16">
              <div className="text-left w-[350px] text-[14pt] leading-normal">
                  <p className="mb-2 flex"><span className="w-24 font-semibold">Bajardi:</span> <b>{data.studentName}</b></p>
                  <p className="mb-2 flex"><span className="w-24 font-semibold">Guruh:</span> <b>{data.groupName}</b></p>
                  <p className="flex"><span className="w-24 font-semibold">Tekshirdi:</span> <b>{data.teacherName}</b></p>
              </div>
          </div>
          
          {/* Year */}
          <div className="text-center mt-auto">
              <p className="font-bold text-[14pt]">{data.cityYear}</p>
          </div>
      </div>

      {/* --- CONTENT --- */}
      
      {/* Table of Contents */}
      <div className="page-break pt-4">
          <h2 className="text-center font-bold uppercase mb-6">MUNDARIJA</h2>
          <div className="w-full space-y-2">
          {data.tableOfContents.map((t, i) => (
              <div key={i} className="flex items-end w-full">
                  <span className="bg-white pr-1 text-justify relative max-w-[90%]">
                      {t}
                  </span>
                  <span className="flex-grow border-b border-dotted border-black mb-1.5 mx-1"></span>
                  <span className="bg-white pl-1 shrink-0">{i+3}</span>
              </div>
          ))}
          </div>
      </div>

      {/* Introduction */}
      <div className="page-break pt-4">
          <h2 className="text-center font-bold uppercase mb-4">KIRISH</h2>
          <div className="text-justify">{contentFormat(data.introduction)}</div>
      </div>

      {/* Chapters */}
      {[data.chapter1, data.chapter2, data.chapter3].map((ch, i) => (
         ch.title && (
           <div key={i} className="page-break pt-4">
              <h2 className="text-center font-bold uppercase mb-4">{i+1}-BOB. {ch.title.toUpperCase()}</h2>
              {ch.intro && <div className="italic mb-6 text-gray-800 indent-[1.25cm]">{ch.intro}</div>}
              {ch.sections.map((sec, j) => (
                 <div key={j} className="mb-6 avoid-break">
                    <h3 className="font-bold uppercase mb-3 text-center mt-6">{i+1}.{j+1}. {sec.title}</h3>
                    <div className="text-justify">{contentFormat(sec.content)}</div>
                 </div>
              ))}
           </div>
         )
      ))}

      {/* Conclusion */}
      <div className="page-break pt-4">
          <h2 className="text-center font-bold uppercase mb-4">XULOSA</h2>
          <div className="text-justify">{contentFormat(data.conclusion)}</div>
      </div>

      {/* References */}
      <div className="page-break pt-4">
          <h2 className="text-center font-bold uppercase mb-4">FOYDALANILGAN ADABIYOTLAR RO'YXATI</h2>
          <ol className="list-decimal pl-[1.25cm] space-y-2">
            {data.references.map((r, i) => <li key={i} className="pl-2 text-justify">{r}</li>)}
          </ol>
      </div>

      {/* Appendix */}
      {data.appendix && (
        <div className="page-break pt-4">
          <h2 className="text-center font-bold uppercase mb-4">ILOVALAR</h2>
          <div className="text-justify">{contentFormat(data.appendix)}</div>
        </div>
      )}

    </div>
    </>
  );
};