import React, { useState } from 'react';
import { Icons } from './Icons';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  currentView: string;
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
}

export const DashboardLayout = ({ children, user, currentView, setView, setUser }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
             <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center shadow-lg shadow-blue-500/20">A</div> 
             <span>Academia</span>
          </div>
          {/* Close button for mobile */}
          <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={closeMenu}>
             <Icons.X />
          </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
         <button onClick={() => { setView('dashboard'); closeMenu(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Icons.Home /> Asosiy Panel
         </button>
         <button onClick={() => { setView('paraphraser'); closeMenu(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentView === 'paraphraser' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Icons.Shield /> Antiplagiat Pro
         </button>
         <button onClick={() => { setView('profile'); closeMenu(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${currentView === 'profile' ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span className="w-5 h-5 flex items-center justify-center text-lg">⚙️</span> Sozlamalar
         </button>
         
         <div className="pt-4 mt-2 border-t border-gray-100">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hisob</p>
            <div className="bg-slate-900 rounded-xl p-4 text-white mb-4 shadow-lg shadow-slate-900/20 relative overflow-hidden group cursor-pointer mx-2" onClick={() => { setView('payment'); closeMenu(); }}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform"></div>
                <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">Mening Balansim</div>
                <div className="text-2xl font-bold">{user?.credits} <span className="text-sm font-normal text-slate-400">kr</span></div>
                <div className="text-xs text-blue-300 mt-2 font-medium flex items-center gap-1">Hisobni to'ldirish &rarr;</div>
             </div>
         </div>
      </nav>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
         <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-200/50 p-2 rounded-lg transition-colors" onClick={() => { setView('profile'); closeMenu(); }}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0">{user?.fullName.charAt(0)}</div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-gray-900 truncate" title={user?.fullName}>{user?.fullName}</p>
               <p className="text-xs text-gray-500 truncate">{user?.phone || user?.email}</p>
            </div>
         </div>
         <button onClick={() => { AuthService.logout(); setUser(null); setView('landing'); }} className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 w-full px-2 py-2 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
             <Icons.Logout /> Chiqish
         </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
       {/* Mobile Overlay */}
       {isMobileMenuOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={closeMenu}></div>
       )}

       {/* Sidebar - Desktop & Mobile */}
       <aside className={`fixed md:sticky top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent />
       </aside>

       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
                <div className="w-8 h-8 bg-blue-600 rounded-lg text-white flex items-center justify-center text-sm">A</div>
                Academia
             </div>
             <button onClick={toggleMenu} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Icons.Menu />
             </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
             {children}
          </main>
       </div>
    </div>
  );
};