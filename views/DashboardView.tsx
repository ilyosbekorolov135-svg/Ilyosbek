import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { UserProfile, CourseWorkStructure } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  history: CourseWorkStructure[];
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
  setCurrentDoc: (doc: CourseWorkStructure) => void;
  addToast: (type: any, msg: string) => void;
}

export const DashboardView = ({ user, history, setView, setUser, setCurrentDoc, addToast }: DashboardViewProps) => {
  // Safe filtering logic
  const myWorks = history || [];
  const worksCount = myWorks.length;
  
  return (
  <DashboardLayout user={user} currentView="dashboard" setView={setView} setUser={setUser}>
     <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* HERO HEADER */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-12 overflow-hidden shadow-2xl shadow-indigo-500/20 text-white">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online Tizim
                 </div>
                 <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">Xush kelibsiz, {user?.fullName.split(' ')[0]}</h1>
                 <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                    Bugun qanday ilmiy kashfiyot qilamiz? Sizning balansingizda <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{user?.credits} kredit</span> mavjud.
                 </p>
              </div>
              <Button onClick={() => setView('wizard')} className="bg-white text-blue-600 hover:bg-blue-50 border-none px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full md:w-auto">
                 <Icons.Plus /> Yangi Ish Yaratish
              </Button>
           </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {[
              { label: 'Jami Ishlar', val: worksCount, icon: <Icons.Doc/>, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tejalgan Vaqt', val: `${worksCount * 12}s`, icon: <span className="text-lg">⏳</span>, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Antiplagiat', val: '98%', icon: <Icons.Shield/>, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Darajangiz', val: user?.plan === 'free' ? 'Start' : 'Pro', icon: <span className="text-lg">🚀</span>, color: 'text-orange-600', bg: 'bg-orange-50' },
           ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                 <div>
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{stat.val}</div>
                 </div>
              </div>
           ))}
        </div>
        
        {/* DOCUMENTS SECTION */}
        <div>
           <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">Mening Ishlarim <span className="text-sm font-medium bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">{worksCount}</span></h2>
              <div className="relative group">
                 <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-40 focus:w-64 transition-all" />
                 <div className="absolute left-3 top-2.5 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
              </div>
           </div>

           {worksCount === 0 ? (
              <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 p-16 text-center">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 grayscale opacity-50"><Icons.Academic /></div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Ish stoli bo'm-bo'sh</h3>
                 <p className="text-gray-500 mb-8 max-w-md mx-auto">Sizda hali yaratilgan hujjatlar yo'q. Birinchi ishingizni yaratish uchun quyidagi tugmani bosing.</p>
                 <Button onClick={() => setView('wizard')} variant="outline" className="px-8">Boshlash</Button>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {myWorks.map(doc => (
                    <div key={doc.id} onClick={() => { setCurrentDoc(doc); setView('workspace'); }} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${doc.type === 'bmi' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                             {doc.type === 'bmi' ? <span className="text-lg">🎓</span> : <Icons.Doc />}
                          </div>
                          <span className="bg-gray-50 text-gray-500 text-xs font-bold px-2 py-1 rounded-lg border border-gray-100">
                             {new Date(doc.createdAt!).toLocaleDateString()}
                          </span>
                       </div>
                       
                       <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {doc.topic}
                       </h3>
                       
                       <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
                                {user?.fullName.charAt(0)}
                             </div>
                             <span className="text-xs text-gray-400 font-medium">Muallif</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                             Ochish <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                          </span>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
     </div>
  </DashboardLayout>
  );
};