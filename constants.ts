import { PricingTier } from './types';

export const PRICING_PLANS: PricingTier[] = [
  { id: 'free', name: 'Start', price: 'Bepul', period: '/oy', features: ['Oyiga 1 hujjat', 'Faqat Referat (10-15 bet)', 'GOST shablon (Baza)', 'AI tezligi: Normal'], buttonText: "Sinab ko'rish" },
  { id: 'student', name: 'Pro Student', price: '49,000 UZS', period: '/oy', features: ['Cheksiz hujjatlar', 'Kurs ishi va BMI', 'Plagiat tekshiruvi (Pro)', 'Manbalar tahlili (Deep Search)', 'Prioritet qo\'llab-quvvatlash'], isPopular: true, buttonText: "Professional bo'lish" },
  { id: 'teacher', name: 'Ustoz', price: 'Kelishilgan', period: '', features: ['Guruh monitoringi', 'Talabalar progressi', 'API integratsiya', 'Maxsus hisobotlar'], buttonText: "Bog'lanish" }
];