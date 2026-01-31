import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { paraphraseText } from '../services/geminiService';
import { UserProfile } from '../types';

interface ParaphraserViewProps {
  user: UserProfile | null;
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
}

export const ParaphraserView = ({ user, setView, setUser }: ParaphraserViewProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParaphrase = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const res = await paraphraseText(input);
      setOutput(res);
    } catch (e) {
      alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
    setIsProcessing(false);
  };

  return (
    <DashboardLayout user={user} currentView="paraphraser" setView={setView} setUser={setUser}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 h-full flex flex-col">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Antiplagiat Pro <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 align-middle">Beta</span></h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Matnni akademik uslubda qayta ishlash va unikallashtirish.</p>
        </header>
        <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-8 min-h-[500px]">
          <div className="flex flex-col h-full">
            <label className="text-sm font-bold text-gray-700 mb-2 md:mb-3 flex justify-between">Original Matn <span className="text-gray-400 font-normal">{input.length} belgi</span></label>
            <textarea className="flex-1 w-full p-4 md:p-6 bg-white border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-800 leading-relaxed text-sm md:text-base transition-all" placeholder="Matnni shu yerga tashlang..." value={input} onChange={(e) => setInput(e.target.value)}/>
          </div>
          <div className="flex flex-col h-full relative">
             <label className="text-sm font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2"><Icons.Sparkles /> AI Natijasi</label>
             <div className={`flex-1 w-full p-4 md:p-6 rounded-2xl relative group transition-all ${output ? 'bg-white border border-blue-200 shadow-lg shadow-blue-500/5' : 'bg-gray-50 border border-gray-200 border-dashed'}`}>
                {isProcessing ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl z-10">
                      <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-sm font-bold text-blue-600 animate-pulse">Akademik tahlil ketmoqda...</p>
                   </div>
                ) : output ? (
                  <>
                    <textarea className="w-full h-full bg-transparent resize-none outline-none text-gray-800 leading-relaxed text-sm md:text-base" readOnly value={output}/>
                    <button onClick={() => navigator.clipboard.writeText(output)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"><Icons.Copy /></button>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Icons.Sparkles /></div>
                     <p className="text-sm text-center">Natija shu yerda paydo bo'ladi</p>
                  </div>
                )}
             </div>
          </div>
       </div>
        <div className="mt-6 md:mt-8 flex justify-end pt-4 md:pt-6 border-t border-gray-200">
          <Button onClick={handleParaphrase} disabled={isProcessing || !input} className="px-8 shadow-lg shadow-blue-500/20">{isProcessing ? 'Jarayon...' : 'Qayta Ishlash'}</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};