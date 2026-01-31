import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { Button } from '../components/Button';
import { UserInputs, DocumentType, CoursePlan, UserProfile } from '../types';
import { generateCoursePlan, generateFullCourseWork, refineTopic } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { AuthService } from '../services/authService';
import { SecurityService } from '../services/securityService';

// ... (Keep existing imports like constants DOC_TYPES)

const DOC_TYPES: {id: DocumentType, icon: any, label: string, desc: string, badge?: string, isPro?: boolean}[] = [
    { id: 'referat', icon: '📝', label: 'Referat', desc: '10-15 sahifa. Erkin mavzu.', badge: 'Bepul' },
    { id: 'mustaqil_ish', icon: '🧠', label: 'Mustaqil Ish', desc: 'Analitik tahlil va xulosa.', badge: 'Bepul' },
    { id: 'kurs_ishi', icon: '📘', label: 'Kurs Ishi', desc: 'GOST 7.0.5. Nazariya va Amaliyot.', isPro: true },
    { id: 'bmi', icon: '🎓', label: 'BMI (Diplom)', desc: 'Chuqur ilmiy tadqiqot.', badge: 'Premium', isPro: true },
    { id: 'maqola', icon: '📰', label: 'Ilmiy Maqola', desc: 'Tezis va maqolalar.', isPro: true }
];

const InputGroup = ({ label, value, name, onChange, placeholder, icon, required = false, error }: any) => (
    <div className="relative group">
        <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">
            {label}
            {required && <span className="text-red-400 text-[10px] bg-red-50 px-1.5 py-0.5 rounded">Majburiy</span>}
        </label>
        <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'}`}>
                {icon}
            </div>
            <input 
                name={name}
                className={`w-full pl-11 pr-4 py-4 bg-gray-50 border rounded-xl font-medium text-gray-900 focus:ring-2 focus:bg-white transition-all outline-none placeholder-gray-400 ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'}`}
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1 ml-1 animate-fade-in">{error}</p>}
    </div>
);

const TitlePreview = ({ data }: { data: UserInputs }) => {
    return (
        <div className="w-full bg-white shadow-2xl border border-gray-200 aspect-[1/1.41] relative p-6 md:p-8 flex flex-col text-center font-serif text-[10px] md:text-[12px] leading-relaxed text-gray-900 select-none transform transition-transform hover:scale-[1.02] duration-500">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50 pointer-events-none"></div>
            
            <div className="uppercase font-bold tracking-wider opacity-80">
                O'zbekiston Respublikasi <br/> Oliy Ta'lim, Fan va Innovatsiyalar Vazirligi
            </div>
            <div className="uppercase font-bold mt-4 text-blue-900">
                {SecurityService.sanitize(data.universityName) || "[Universitet Nomi]"}
            </div>
            <div className="mt-2 text-gray-600">
                {SecurityService.sanitize(data.facultyName) || "[Fakultet]"} fakulteti
            </div>
            
            <div className="flex-1 flex flex-col justify-center items-center my-4">
                <h1 className="uppercase font-bold text-xl md:text-2xl tracking-widest mb-4 border-b-2 border-gray-900 pb-2">
                    {data.documentType.replace('_', ' ')}
                </h1>
                <p className="italic text-gray-500 mb-2">Mavzu:</p>
                <p className="font-bold text-base md:text-lg break-words w-4/5 leading-snug">
                    {SecurityService.sanitize(data.topic) || "Mavzu hali kiritilmagan..."}
                </p>
            </div>
            
            <div className="flex justify-end text-left w-full mb-8 px-4">
                <div className="w-1/2 space-y-1">
                    <p><span className="font-bold">Bajardi:</span> {SecurityService.sanitize(data.studentName) || "..."}</p>
                    <p><span className="font-bold">Guruh:</span> {SecurityService.sanitize(data.groupName) || "..."}</p>
                    <p><span className="font-bold">Tekshirdi:</span> {SecurityService.sanitize(data.teacherName) || "..."}</p>
                </div>
            </div>
            
            <div className="font-bold text-gray-600">
                {SecurityService.sanitize(data.cityYear)}
            </div>
        </div>
    );
};

interface WizardProps {
  user: UserProfile | null;
  setView: (view: any) => void;
  setUser: (user: UserProfile | null) => void;
  setCurrentDoc: (doc: any) => void;
  setHistory: (hist: any) => void;
  addToast: (type: any, msg: string) => void;
}

export const WizardView = ({ user, setView, setUser, setCurrentDoc, setHistory, addToast }: WizardProps) => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<UserInputs>({
    documentType: 'kurs_ishi',
    universityName: '', facultyName: '', groupName: '', studentName: '', teacherName: '', cityYear: 'Toshkent - 2025',
    topic: '', pages: 30, settings: { includeCode: true, includeTables: true, style: 'academic', useGoogleSearch: user?.plan !== 'free' }
  });
  const [plan, setPlan] = useState<CoursePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setInputs(prev => ({ ...prev, [name]: value }));
      if(errors[name]) setErrors(prev => ({...prev, [name]: ''}));
  };

  const isLocked = (isProFeature?: boolean) => {
    if (!user) return true;
    if (user.plan === 'student' || user.plan === 'teacher') return false; 
    return isProFeature === true; 
  };

  const handleTypeSelect = (type: any) => {
    if (isLocked(type.isPro)) {
        addToast('info', 'Ushbu format faqat PRO foydalanuvchilar uchun.');
        setView('payment');
        return;
    }
    const allowSearch = user?.plan !== 'free';
    setInputs({...inputs, documentType: type.id, settings: {...inputs.settings, useGoogleSearch: allowSearch}});
    setStep(2);
  };

  const handleRefineTopic = async () => {
    if(!inputs.topic) return;
    setAiThinking(true);
    try {
      const newTopic = await refineTopic(inputs.topic);
      setInputs(prev => ({...prev, topic: newTopic}));
      addToast('success', 'Mavzu muvaffaqiyatli optimallashtirildi!');
    } catch (e) {
      addToast('error', 'Mavzuni tahlil qilishda xatolik.');
    }
    setAiThinking(false);
  };

  const handlePlanGenerate = async () => {
    setErrors({});
    try {
        // SECURE BACKEND SIMULATION CALL
        SecurityService.validateInputs(inputs);
        
        setLoading(true);
        const res = await generateCoursePlan(inputs);
        setPlan(res.plan);
        setStep(3);
        addToast('success', 'Reja muvaffaqiyatli tuzildi');
    } catch (e: any) {
        addToast('error', e.message);
        // Simple error mapping
        if(e.message.includes('Universitet')) setErrors(prev =>({...prev, universityName: 'To\'ldirish shart', facultyName: 'To\'ldirish shart'}));
        if(e.message.includes('Mavzu')) setErrors(prev =>({...prev, topic: 'Mavzuni to\'g\'ri kiriting'}));
    } finally {
        setLoading(false);
    }
  };

  const handleFullGenerate = async () => {
    if(!user) return;
    if(user.credits < 1) { 
        addToast('error', 'Hisobingizda yetarli kredit mavjud emas.');
        setView('payment'); 
        return; 
    }
    
    AuthService.deductCredit();
    setUser(AuthService.getCurrentUser());
    setView('generating');
    
    try {
      const res = await generateFullCourseWork(inputs, plan!, (msg, pct, time) => {
         window.dispatchEvent(new CustomEvent('ai-progress', { detail: { msg, pct, time } }));
      });
      
      setCurrentDoc(res);
      StorageService.saveWork(res);
      setHistory(StorageService.getAllWorks());
      setView('workspace');
      addToast('success', 'Hujjat tayyor!');
    } catch (e) {
      addToast('error', 'Generatsiya jarayonida kutilmagan xatolik yuz berdi.');
      setView('dashboard');
    }
  };

  // ... (Return JSX is largely the same, but utilizes addToast and SecurityService logic implicitly through handlers)
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
        {/* SIDEBAR */}
        <div className="bg-white md:w-80 border-r border-gray-200 flex flex-col h-auto md:h-screen sticky top-0 z-20">
             <div className="p-8 border-b border-gray-100">
                <div className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-blue-500/30">A</div>
                    Flow AI
                </div>
             </div>
             {/* ... Steps Navigation ... */}
             <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                 {[1, 2, 3].map(i => (
                    <div key={i} className={`relative flex items-center gap-4 transition-all duration-300 ${step === i ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step === i ? 'border-blue-500 bg-blue-50 text-blue-600' : (step > i ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-gray-50 text-gray-400')}`}>
                            {step > i ? <Icons.Check /> : i}
                        </div>
                        <div>
                            <span className="text-sm font-bold text-gray-900 block">{['Hujjat Turi', "Ma'lumotlar", 'Tuzilma'][i-1]}</span>
                            <span className="text-xs text-gray-500">{['Formatni tanlash', 'Titul varaqasi', 'Rejani tasdiqlash'][i-1]}</span>
                        </div>
                        {step === i && <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>}
                    </div>
                 ))}
             </div>
             <div className="p-6 bg-gray-50 border-t border-gray-200">
                 <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                     <Icons.ChevronLeft/> Bekor qilish
                 </button>
             </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto p-4 md:p-10">
                {step === 1 && (
                    <div className="animate-slide-up max-w-4xl mx-auto">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Nima yozamiz?</h2>
                            <p className="text-gray-500">Talabalik darajangiz va maqsadingizga mos formatni tanlang.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {DOC_TYPES.map(type => {
                                const locked = isLocked(type.isPro);
                                return (
                                <div key={type.id} onClick={() => handleTypeSelect(type)} className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${locked ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-white bg-white shadow-sm hover:border-blue-500 hover:shadow-xl hover:-translate-y-1'}`}>
                                    {locked && <div className="absolute top-3 right-3 bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"><Icons.Lock/> PRO</div>}
                                    {!locked && type.badge && <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{type.badge}</div>}
                                    
                                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{type.icon}</div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">{type.label}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{type.desc}</p>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up flex flex-col lg:flex-row gap-8 items-start h-full">
                        <div className="w-full lg:w-3/5 space-y-6">
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Ma'lumotlar</h2>
                                    <div 
                                        onClick={() => {
                                            if(user?.plan !== 'free') setInputs({...inputs, settings: {...inputs.settings, useGoogleSearch: !inputs.settings.useGoogleSearch}});
                                            else addToast('info', 'Google Search faqat PRO rejasida mavjud.');
                                        }}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none ${inputs.settings.useGoogleSearch ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${inputs.settings.useGoogleSearch ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                        <span className="text-xs font-bold uppercase">Internet {inputs.settings.useGoogleSearch ? 'ON' : 'OFF'}</span>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <InputGroup label="Universitet" name="universityName" value={inputs.universityName} onChange={handleChange} placeholder="O'zMU" icon={<Icons.Academic/>} required error={errors.universityName} />
                                    <InputGroup label="Fakultet" name="facultyName" value={inputs.facultyName} onChange={handleChange} placeholder="Iqtisodiyot" icon={<span className="text-lg">🏛️</span>} required error={errors.facultyName} />
                                    <InputGroup label="Talaba" name="studentName" value={inputs.studentName} onChange={handleChange} placeholder="Ism Familiya" icon={<span className="text-lg">👨‍🎓</span>} required error={errors.studentName} />
                                    <InputGroup label="Guruh" name="groupName" value={inputs.groupName} onChange={handleChange} placeholder="201-guruh" icon={<span className="text-lg">👥</span>} required error={errors.groupName} />
                                    <InputGroup label="O'qituvchi" name="teacherName" value={inputs.teacherName} onChange={handleChange} placeholder="Prof. Ism" icon={<span className="text-lg">👨‍🏫</span>} />
                                    <InputGroup label="Shahar - Yil" name="cityYear" value={inputs.cityYear} onChange={handleChange} placeholder="Toshkent - 2025" icon={<span className="text-lg">📍</span>} />
                                </div>
                            </div>

                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <label className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                                    Mavzu (To'liq nomlanishi)
                                    <span className="text-red-400 text-[10px] bg-red-50 px-1.5 py-0.5 rounded">Majburiy</span>
                                </label>
                                <div className="relative">
                                    <textarea 
                                        name="topic"
                                        className={`w-full p-4 bg-gray-50 border rounded-2xl h-32 focus:ring-2 focus:bg-white transition-all outline-none resize-none text-lg font-medium text-gray-900 placeholder-gray-400 ${errors.topic ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
                                        placeholder="Masalan: Raqamli iqtisodiyot..." 
                                        value={inputs.topic} 
                                        onChange={handleChange} 
                                    />
                                    <button 
                                        onClick={handleRefineTopic}
                                        disabled={!inputs.topic || aiThinking}
                                        className="absolute bottom-4 right-4 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {aiThinking ? <span className="animate-spin">⌛</span> : <Icons.Sparkles/>}
                                        {aiThinking ? "O'ylamoqda..." : "Mavzuni kuchaytirish"}
                                    </button>
                                </div>
                                {errors.topic && <p className="text-red-500 text-xs mt-2 animate-fade-in">{errors.topic}</p>}
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setStep(1)} className="px-6">Orqaga</Button>
                                <Button onClick={handlePlanGenerate} disabled={loading} className="px-8 py-4 text-base shadow-lg shadow-blue-600/20 w-full md:w-auto">
                                    {loading ? 'Reja tuzilmoqda...' : 'Davom Etish'}
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:block w-2/5 sticky top-10">
                            <div className="mb-4 flex items-center justify-between px-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hujjat Ko'rinishi</h3>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold animate-pulse">Jonli rejim</span>
                            </div>
                            <TitlePreview data={inputs} />
                        </div>
                    </div>
                )}

                {step === 3 && plan && (
                <div className="animate-slide-up max-w-4xl mx-auto space-y-8">
                   <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Ish tuzilmasi</h2>
                      <p className="text-gray-500">AI tomonidan tuzilgan rejani tasdiqlang yoki o'zgartiring.</p>
                   </div>
                   <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                         (plan as any)[`chapter${i}_title`] && (
                           <div key={i} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors group">
                              <div className="flex items-center gap-4 mb-4">
                                 <span className="w-10 h-10 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-lg font-bold flex items-center justify-center shadow-sm">{i}</span>
                                 <input className="font-bold text-lg bg-transparent w-full outline-none border-b-2 border-transparent focus:border-blue-500 text-gray-900 transition-colors placeholder-gray-400 pb-1" value={(plan as any)[`chapter${i}_title`]} onChange={e => setPlan({...plan, [`chapter${i}_title`]: e.target.value})} />
                              </div>
                              <div className="pl-14 space-y-3 border-l-2 border-gray-100 ml-5">
                                 {(plan as any)[`chapter${i}_subsections`].map((sub: string, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                                       <input className="bg-transparent w-full text-sm outline-none text-gray-600 focus:text-gray-900 border-b border-transparent focus:border-gray-200 pb-0.5 transition-colors" value={sub} onChange={e => {
                                          const newSubs = [...(plan as any)[`chapter${i}_subsections`]];
                                          newSubs[idx] = e.target.value;
                                          setPlan({...plan, [`chapter${i}_subsections`]: newSubs});
                                       }} />
                                    </div>
                                 ))}
                              </div>
                           </div>
                         )
                      ))}
                   </div>
                   <div className="flex justify-between pt-8 border-t border-gray-200">
                      <Button variant="ghost" onClick={() => setStep(2)} className="px-6">Orqaga</Button>
                      <Button onClick={handleFullGenerate} className="px-10 py-4 bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-900/20 text-lg">
                          Generatsiya Boshlash <span className="ml-2 text-slate-400 text-sm font-normal">({user?.credits} kredit)</span>
                      </Button>
                   </div>
                </div>
             )}
            </div>
        </div>
    </div>
  );
};