import { CourseWorkStructure } from "../types";

const STORAGE_KEY = "ai_course_work_db";

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback if secure context check fails
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const StorageService = {
  // Save a new coursework
  saveWork: (work: CourseWorkStructure): void => {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const history: CourseWorkStructure[] = existingData ? JSON.parse(existingData) : [];
      
      // Add ID and Date if missing
      const newWork = {
        ...work,
        id: work.id || generateId(),
        createdAt: work.createdAt || new Date().toISOString()
      };

      // Add to beginning of array
      history.unshift(newWork);
      
      // Limit to last 20 works to save space
      if (history.length > 20) {
        history.pop();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save work to storage", e);
    }
  },

  // Get all saved works
  getAllWorks: (): CourseWorkStructure[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Get single work by ID
  getWorkById: (id: string): CourseWorkStructure | undefined => {
    const works = StorageService.getAllWorks();
    return works.find(w => w.id === id);
  },

  // Delete a work
  deleteWork: (id: string): void => {
    const works = StorageService.getAllWorks();
    const filtered = works.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};