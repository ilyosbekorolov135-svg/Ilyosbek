import { UserProfile, PlanType } from "../types";

const USER_STORAGE_KEY = "ai_course_user_session";

// Mock User Database simulation
export const AuthService = {
  // Check if user is logged in
  getCurrentUser: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Simulate Login/Registration
  login: async (email: string, fullName: string, phone: string): Promise<UserProfile> => {
    // In a real app, this would verify credentials with a backend
    await new Promise(resolve => setTimeout(resolve, 800)); // Network delay simulation
    
    // Check if user exists in local storage (mock DB), else create new
    let user = AuthService.getCurrentUser();
    
    // Safe ID generation fallback
    const generateId = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            try { return crypto.randomUUID(); } catch(e) {}
        }
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    if (!user || user.email !== email) {
      user = {
        id: generateId(),
        email,
        fullName,
        phone,
        plan: 'free',
        credits: 1, // Welcome bonus
        isPro: false
      };
    } else {
        // Update phone if exists
        user.phone = phone;
    }
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Credit System Logic
  deductCredit: (amount: number = 1): boolean => {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    if (user.credits >= amount) {
      user.credits -= amount;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  },

  addCredits: (amount: number, plan: PlanType = 'free') => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    user.credits += amount;
    if (plan !== 'free') {
        user.plan = plan;
        user.isPro = true;
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  }
};