import React from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { Icons } from '../components/Icons';
import { PRICING_PLANS } from '../constants';

interface PaymentViewProps {
  user: UserProfile | null;
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
}

export const PaymentView = ({ user, setView, setUser }: PaymentViewProps) => (
  <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans overflow-y-auto">
    <div className="bg-white rounded-3xl p-0 max-w-4xl w-full grid md:grid-cols-2 shadow-2xl animate-slide-up overflow-hidden my-auto">
        <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
              <button onClick={() => setView('dashboard')} className="md:hidden absolute top-0 right-0 text-white/50 hover:text-white"><Icons.X /></button>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Pro Imkoniyatlar</h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">Kurs ishlari, BMI va Diploplarni yozish uchun Pro versiyaga o'ting.</p>
          </div>
          <div className="mt-8 md:mt-12 relative z-10">
              <div className="text-sm text-slate-400 mb-1 uppercase tracking-wide font-bold">Joriy reja</div>
              <div className="text-3xl font-bold mb-2 uppercase text-blue-400">{user?.plan}</div>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <h3 className="font-bold text-xl md:text-2xl mb-6 text-gray-900">Tarifni tanlang</h3>
          <div className="space-y-4 mb-8">
              {PRICING_PLANS.filter(p => p.id !== 'free').map(p => (
                <div key={p.id} onClick={() => { AuthService.addCredits(10, p.id); setUser(AuthService.getCurrentUser()); setView('wizard'); }} className="border-2 border-gray-100 p-4 md:p-5 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden">
                    {p.isPopular && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">POPULAR</div>}
                    <div>
                      <div className="font-bold text-gray-900 text-base md:text-lg">{p.name}</div>
                      <div className="text-xs text-gray-500 font-medium">{p.features[0]}</div>
                    </div>
                    <div className="font-bold text-blue-600 text-lg md:text-xl group-hover:scale-105 transition-transform">{p.price}</div>
                </div>
              ))}
          </div>
          <button onClick={() => setView('dashboard')} className="text-sm text-gray-400 hover:text-gray-600 font-medium w-full text-center hover:underline">Vaqtinchalik bekor qilish</button>
        </div>
    </div>
  </div>
);