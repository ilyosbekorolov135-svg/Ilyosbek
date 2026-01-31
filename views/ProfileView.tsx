import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { UserProfile, CourseWorkStructure } from '../types';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { AuthService } from '../services/authService';

interface ProfileViewProps {
  user: UserProfile | null;
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
  history: CourseWorkStructure[];
}

export const ProfileView = ({ user, setView, setUser, history }: ProfileViewProps) => {
  if (!user) return null;

  const totalWords = history.reduce((acc, doc) => acc + (doc.generationTime ? Math.round(doc.generationTime / 100) : 3000), 0);
  const savedHours = Math.round(totalWords / 200 / 60); // Approx typing speed

  return (
    <DashboardLayout user={user} currentView="profile" setView={setView} setUser={setUser}>
       <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shaxsiy Kabinet</h1>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
             {/* Profile Card */}
             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-card relative overflow-hidden group hover:shadow-card-hover transition-all">
                <div className="flex flex-col items-center text-center relative z-10">
                   <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      {user.fullName.charAt(0)}
                   </div>
                   <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                   <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                   <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${user.plan === 'free' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {user.plan} Plan
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-24 bg-gray-50/50 z-0"></div>
             </div>

             {/* Stats Cards */}
             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card flex flex-col justify-between group hover:border-blue-200 transition-all">
                   <div className="flex items-start justify-between">
                      <div>
                         <p className="text-gray-500 text-sm font-medium">Jami Hujjatlar</p>
                         <h3 className="text-3xl font-bold text-gray-900 mt-1">{history.length}</h3>
                      </div>
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:rotate-12 transition-transform"><Icons.Doc /></div>
                   </div>
                   <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: `${Math.min(history.length * 10, 100)}%`}}></div>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-card flex flex-col justify-between group hover:border-green-200 transition-all">
                   <div className="flex items-start justify-between">
                      <div>
                         <p className="text-gray-500 text-sm font-medium">Tejalgan Vaqt</p>
                         <h3 className="text-3xl font-bold text-gray-900 mt-1">{savedHours} <span className="text-sm text-gray-400 font-normal">soat</span></h3>
                      </div>
                      <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:rotate-12 transition-transform"><span className="text-lg">⏳</span></div>
                   </div>
                   <p className="text-xs text-green-600 mt-4 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Unumdorlik oshdi
                   </p>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-900/10 col-span-1 sm:col-span-2 flex items-center justify-between relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-slate-400 text-sm font-medium mb-1">Balans</p>
                      <h3 className="text-4xl font-bold tracking-tight">{user.credits} <span className="text-lg font-normal text-slate-500">kredit</span></h3>
                   </div>
                   <Button onClick={() => setView('payment')} className="bg-white text-slate-900 hover:bg-gray-100 border-none relative z-10 font-bold px-6">To'ldirish</Button>
                   
                   {/* Decorative BG */}
                   <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
             <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Icons.Shield /> Profil Sozlamalari</h3>
             </div>
             <form className="space-y-6 max-w-2xl" onSubmit={(e) => { e.preventDefault(); alert('Ma\'lumotlar saqlandi!'); }}>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">To'liq ism</label>
                      <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" defaultValue={user.fullName} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Telefon</label>
                      <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" defaultValue={user.phone} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                   <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400" defaultValue={user.email} disabled />
                   <p className="text-xs text-gray-400 flex items-center gap-1"><Icons.Lock /> Email manzilni o'zgartirish uchun admin bilan bog'laning.</p>
                </div>
                
                <div className="pt-6 flex gap-4">
                   <Button className="px-8 shadow-lg shadow-blue-500/20">Saqlash</Button>
                   <Button type="button" variant="secondary" onClick={() => { AuthService.logout(); setUser(null); setView('landing'); }} className="text-red-600 hover:bg-red-50 border-red-100 hover:border-red-200">Chiqish</Button>
                </div>
             </form>
          </div>
       </div>
    </DashboardLayout>
  );
};