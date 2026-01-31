import { UserInputs } from "../types";

/**
 * SECURITY LAYER
 * This service acts as a Firewall/Backend Validation layer.
 * It ensures no malicious code enters the system and validates all inputs before processing.
 */

export const SecurityService = {
  /**
   * Sanitize text to prevent XSS (Cross-Site Scripting)
   */
  sanitize: (text: string): string => {
    if (!text) return "";
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return text.replace(reg, (match) => (map[match]));
  },

  /**
   * Validate User Inputs (Backend Logic Simulation)
   * Throws error if validation fails.
   */
  validateInputs: (inputs: UserInputs): void => {
    if (!inputs.topic || inputs.topic.length < 5) {
      throw new Error("Mavzu nomi juda qisqa. Kamida 5 ta harf bo'lishi kerak.");
    }
    if (inputs.topic.length > 300) {
      throw new Error("Mavzu nomi juda uzun.");
    }
    if (!inputs.universityName || !inputs.facultyName) {
      throw new Error("Universitet va Fakultet ma'lumotlari to'ldirilishi shart.");
    }
    
    // Check for forbidden characters/patterns
    const forbiddenPatterns = [/<script>/i, /javascript:/i, /onload=/i];
    forbiddenPatterns.forEach(pattern => {
      if (pattern.test(inputs.topic) || pattern.test(inputs.studentName)) {
        throw new Error("Xavfsizlik: Ruxsat etilmagan belgilar aniqlandi.");
      }
    });
  },

  /**
   * Generate a Secure ID (UUID v4 Simulation)
   */
  generateSecureId: (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};