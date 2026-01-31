import React from 'react';

interface GeneratingViewProps {
  progress: number;
  progressMsg: string;
  timeLeft: string;
}

export const GeneratingView = ({ progress, progressMsg, timeLeft }: GeneratingViewProps) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center font-sans">
    <div className="relative w-32 h-32 mb-10">
        <svg className="animate-spin w-full h-full text-blue-200" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-blue-600">
          <span className="text-2xl">{progress}%</span>
        </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-3 animate-pulse-subtle">{progressMsg}</h2>
    <p className="text-gray-500 mb-10 max-w-md leading-relaxed">Bizning AI hozirda ilmiy manbalarni tahlil qilmoqda, GOST standartlarini tekshirmoqda va matnni shakllantirmoqda. <br/><span className="font-bold text-gray-700 mt-2 block">Taxminiy vaqt: {timeLeft}</span></p>
    <div className="w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{width: `${progress}%`}}></div>
    </div>
  </div>
);