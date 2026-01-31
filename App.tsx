import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';
import { CourseWorkStructure, UserProfile } from './types';
import { LandingView } from './views/LandingView';
import { WizardView } from './views/WizardView';
import { DashboardView } from './views/DashboardView';
import { WorkspaceView } from './views/WorkspaceView';
import { GeneratingView } from './views/GeneratingView';
import { PaymentView } from './views/PaymentView';
import { ParaphraserView } from './views/ParaphraserView';
import { ProfileView } from './views/ProfileView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer, ToastMessage } from './components/Toast';

const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'wizard' | 'generating' | 'workspace' | 'payment' | 'paraphraser' | 'profile'>('landing');
  const [history, setHistory] = useState<CourseWorkStructure[]>([]);
  const [currentDoc, setCurrentDoc] = useState<CourseWorkStructure | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Generation Progress State (Global)
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("Tayyorlanmoqda...");
  const [timeLeft, setTimeLeft] = useState("");

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const u = AuthService.getCurrentUser();
    if(u) { setUser(u); setView('dashboard'); }
    setHistory(StorageService.getAllWorks());
    
    // Listen for progress events from WizardView
    const handleProgress = (e: any) => {
        const { msg, pct, time } = e.detail;
        setProgressMsg(msg);
        setProgress(pct);
        setTimeLeft(time);
    };
    window.addEventListener('ai-progress', handleProgress);
    return () => window.removeEventListener('ai-progress', handleProgress);
  }, []);

  const handleLoginSuccess = (u: UserProfile) => {
    setUser(u);
    setView('dashboard');
    setIsAuthOpen(false);
    addToast('success', `Xush kelibsiz, ${u.fullName}!`);
  };

  const renderView = () => {
    const commonProps = { addToast }; 

    switch(view) {
      case 'landing': return <LandingView onAuthOpen={() => setIsAuthOpen(true)} />;
      case 'dashboard': return <DashboardView user={user} history={history} setView={setView} setUser={setUser} setCurrentDoc={setCurrentDoc} {...commonProps} />;
      case 'wizard': return <WizardView user={user} setView={setView} setUser={setUser} setCurrentDoc={setCurrentDoc} setHistory={setHistory} {...commonProps} />;
      case 'generating': return <GeneratingView progress={progress} progressMsg={progressMsg} timeLeft={timeLeft} />;
      case 'workspace': return <WorkspaceView currentDoc={currentDoc} setView={setView} {...commonProps} />;
      case 'payment': return <PaymentView user={user} setView={setView} setUser={setUser} />;
      case 'paraphraser': return <ParaphraserView user={user} setView={setView} setUser={setUser} />;
      case 'profile': return <ProfileView user={user} setView={setView} setUser={setUser} history={history} />;
      default: return <LandingView onAuthOpen={() => setIsAuthOpen(true)} />;
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      {renderView()}
    </>
  );
};

export default App;