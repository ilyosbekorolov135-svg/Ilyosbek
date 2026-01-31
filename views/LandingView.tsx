import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { PricingTier } from '../types';

const PRICING_PLANS: PricingTier[] = [
  { id: 'free', name: 'Start', price: 'Bepul', period: '/oy', features: ['Oyiga 1 hujjat', 'Faqat Referat (10-15 bet)', 'GOST shablon (Baza)', 'Standart tezlik'], buttonText: "Bepul Boshlash" },
  { id: 'student', name: 'Pro Student', price: '49,000 UZS', period: '/oy', features: ['Cheksiz hujjatlar', 'Kurs ishi & BMI & Maqola', 'Deep Search (Manbalar tahlili)', 'Plagiat tekshiruvi', '24/7 Ustoz yordami'], isPopular: true, buttonText: "Pro A'zolikni Olish" },
  { id: 'teacher', name: 'Ustoz', price: 'Kelishilgan', period: '', features: ['Guruhli litsenziya', 'Talabalar monitoringi', 'API integratsiya', 'Kafedra hisobotlari'], buttonText: "Biz bilan bog'laning" }
];

const PARTNERS = ["O'zMU", "TATU", "TDTU", "ToshKIMYO", "Yoju", "Amity", "Diplomatiya", "Westminster", "INHA", "SamDU", "AndijonDU"];

export const LandingView = ({ onAuthOpen }: { onAuthOpen: () => void }) => {
    return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass border-b border-white/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
               <Icons.Academic />
             </div>
             <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">AcademiaFlow</span>
           </div>
           <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
             <a href="#features" className="hover:text-blue-600 transition-colors">Imkoniyatlar</a>
             <a href="#pricing" className="hover:text-blue-600 transition-colors">Narxlar</a>
           </div>
           <div className="flex gap-4">
               <button onClick={onAuthOpen} className="hidden md:block text-sm font-semibold text-slate-600 hover:text-blue-600">Kirish</button>
               <Button onClick={onAuthOpen} variant="primary" className="shadow-lg shadow-blue-500/20 px-6">Boshlash</Button>
           </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-20">
         {/* HERO SECTION */}
         <section className="relative pt-32 pb-40 px-6 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-[0.5] -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] -z-10"></div>

            <div className="max-w-5xl mx-auto text-center animate-slide-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
                   <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                   </span> 
                   Sun'iy Intellekt v2.0
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                   Akademik ishlaringizni <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Mukammallik darajasiga</span> ko'taring
                </h1>
                
                <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                   Kurs ishi, BMI va Maqolalarni O'zbekiston standartlari (GOST 7.0.5) asosida yozing. 
                   <span className="text-slate-900 font-semibold"> Plagiatsiz. Tezkor. Sifatli.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                   <Button onClick={onAuthOpen} className="px-10 py-5 text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-1 transition-all">Bepul Boshlash</Button>
                   <Button variant="secondary" className="px-10 py-5 text-lg" onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}>Imkoniyatlar</Button>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Bizga ishonadigan talabalar</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {["O'zMU", "TATU", "TDTU", "Westminster", "Diplomatiya"].map((p, i) => (
                            <span key={i} className="text-xl font-serif font-bold text-slate-800">{p}</span>
                        ))}
                    </div>
                </div>
            </div>
         </section>

         {/* BENTO GRID FEATURES */}
         <section id="features" className="py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-20">
                  <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Siz uchun yaratilgan <span className="text-blue-600">texnologiya</span></h2>
                  <p className="text-slate-500 text-lg">Eski uslubdagi Word hujjatlari bilan xayrlashing.</p>
               </div>
               
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                      <div className="relative z-10">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center mb-6"><Icons.Shield/></div>
                          <h3 className="text-2xl font-bold mb-4">GOST 7.0.5 Standarti</h3>
                          <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
                              Hoshiyalar (30mm, 20mm), shriftlar (Times New Roman 14), interval (1.5) va sarlavhalar avtomatik formatlanadi. 
                              Siz faqat mazmunga e'tibor qarating, formatlashni bizga qo'yib bering.
                          </p>
                      </div>
                      <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm transform translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                          <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <div className="text-xs text-slate-400 ml-auto">document.docx</div>
                          </div>
                          <div className="space-y-3 opacity-60">
                              <div className="h-2 bg-white rounded w-3/4"></div>
                              <div className="h-2 bg-white rounded w-full"></div>
                              <div className="h-2 bg-white rounded w-5/6"></div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-3xl p-10 flex flex-col justify-between group hover:border-blue-300 transition-colors">
                      <div>
                          <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm"><Icons.Academic/></div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-4">Chuqur Tahlil</h3>
                          <p className="text-slate-500 leading-relaxed">
                              Stat.uz va Jahon banki ma'lumotlari asosida real raqamlar va jadvallar bilan ishingizni boyitadi.
                          </p>
                      </div>
                      <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                          <div className="flex justify-between items-end h-16 gap-2">
                              {[40, 60, 45, 80, 55, 75].map((h, i) => (
                                  <div key={i} className="w-full bg-blue-500 rounded-t" style={{height: `${h}%`}}></div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-10 hover:shadow-xl transition-shadow duration-300 group">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6"><Icons.Check/></div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Antiplagiat 90%+</h3>
                      <p className="text-slate-500 leading-relaxed">
                          Har bir matn noyob generatsiya qilinadi. Takrorlanishlar oldini olish uchun "Pereraz" algoritmi ishlatiladi.
                      </p>
                  </div>

                  <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-10">
                      <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-4">Tezkor Natija</h3>
                          <p className="text-indigo-100 text-lg mb-8">
                              40 betlik kurs ishini yozish uchun odatda 1 hafta ketadi. AcademiaFlow buni 5 daqiqada bajaradi.
                          </p>
                          <Button onClick={onAuthOpen} className="bg-white text-indigo-700 hover:bg-indigo-50 border-none">Hozir Sinab Ko'ring</Button>
                      </div>
                      <div className="w-full md:w-1/3 aspect-square bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                          <div className="text-4xl font-bold">5 daq</div>
                      </div>
                  </div>
               </div>
            </div>
         </section>

         {/* PRICING */}
         <section id="pricing" className="py-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Investitsiya Qiling</h2>
                    <p className="text-slate-500 text-lg">Bilim olishga vaqtingizni sarflang, yozishga emas.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING_PLANS.map(p => (
                        <div key={p.id} className={`relative p-8 rounded-3xl bg-white flex flex-col transition-all duration-300 ${p.isPopular ? 'border-2 border-blue-500 shadow-2xl shadow-blue-900/10 scale-105 z-10' : 'border border-slate-200 shadow-lg hover:shadow-xl'}`}>
                            {p.isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-600/30">Tavsiya Etamiz</div>}
                            <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
                            <div className="mt-4 mb-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{p.price}</span>
                                <span className="text-slate-500 font-medium">{p.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {p.features.map(f => <li key={f} className="flex gap-3 text-sm text-slate-600 font-medium"><div className="text-blue-500 shrink-0"><Icons.Check/></div> {f}</li>)}
                            </ul>
                            <Button variant={p.isPopular ? 'primary' : 'outline'} className="w-full py-4 text-base font-bold" onClick={onAuthOpen}>{p.buttonText}</Button>
                        </div>
                    ))}
                </div>
            </div>
         </section>

         <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">A</div> AcademiaFlow
                </div>
                <div className="text-slate-500 text-sm">© 2025 Barcha huquqlar himoyalangan.</div>
            </div>
         </footer>
      </main>
    </div>
    );
};