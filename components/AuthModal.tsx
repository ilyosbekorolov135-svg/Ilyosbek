import React, { useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { Button } from './Button';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const user = await AuthService.login(
      fd.get('email') as string,
      fd.get('fullname') as string,
      fd.get('phone') as string
    );
    onLoginSuccess(user);
    onClose();
  };

  return (
    <dialog 
      ref={dialogRef}
      className="backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm bg-transparent p-0 rounded-3xl shadow-2xl open:animate-slide-up m-auto w-[90%] md:w-full max-w-md"
      onCancel={onClose}
    >
      <div className="bg-white p-6 md:p-8 w-full rounded-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <Icons.X />
        </button>
        
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icons.Academic />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Xush kelibsiz</h2>
          <p className="text-gray-500 text-sm mt-1">Davom etish uchun ma'lumotlaringizni kiriting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">To'liq ism</label>
            <input name="fullname" required defaultValue="Ali Valiyev" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" placeholder="Ism Familiya" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Telefon Raqam</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Icons.Phone />
                </div>
                <input name="phone" type="tel" required defaultValue="+998" className="w-full pl-11 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" placeholder="+998 90 123 45 67" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 ml-1">Email</label>
            <input name="email" type="email" required defaultValue="ali@example.com" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400" placeholder="email@domain.uz" />
          </div>
          <Button className="w-full py-4 text-base shadow-lg shadow-blue-500/20 mt-2">Tizimga Kirish</Button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          Kirish orqali siz foydalanish shartlarini qabul qilasiz.
        </p>
      </div>
    </dialog>
  );
};