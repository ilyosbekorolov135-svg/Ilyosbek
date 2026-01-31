import React from 'react';
import { CourseWorkStructure } from '../types';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { PaperRender } from '../components/PaperRender';

interface WorkspaceViewProps {
  currentDoc: CourseWorkStructure | null;
  setView: (view: any) => void;
}

export const WorkspaceView = ({ currentDoc, setView }: WorkspaceViewProps) => {
  if (!currentDoc) return null;
  return (
    <div className="h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-hidden">
        <header className="h-18 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 shadow-sm no-print">
          <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
              <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all shrink-0"><Icons.ChevronLeft /></button>
              <div className="min-w-0">
                <h1 className="font-bold text-gray-900 text-base md:text-lg leading-tight truncate">{currentDoc.topic}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-xs text-green-700 font-bold uppercase tracking-wide truncate">Muvaffaqiyatli Yakunlandi</p>
                </div>
              </div>
          </div>
          <div className="flex gap-2 md:gap-4 shrink-0">
              <Button variant="secondary" className="hidden md:flex" onClick={() => { setView('wizard'); }}>Yangi Hujjat</Button>
              <Button onClick={() => window.print()} className="shadow-lg shadow-blue-500/20 px-4"><Icons.Print /> <span className="hidden md:inline ml-2">PDF ga Eksport</span></Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center print:p-0 print:overflow-visible">
          <div className="w-full md:w-[210mm] shadow-2xl print:shadow-none transition-all duration-300">
              <PaperRender data={currentDoc} />
          </div>
        </div>
    </div>
  );
};