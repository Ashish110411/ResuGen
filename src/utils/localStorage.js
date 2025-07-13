import { useState } from 'react';

export const useLocalStorage = (key, initialValue, serializer = null, deserializer = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return deserializer ? deserializer(parsed) : parsed;
      }
      return initialValue;
    } catch (error) {
      console.error("Error retrieving from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      const toStore = serializer ? serializer(valueToStore) : valueToStore;
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
};

export const clearAllResumeData = () => {
  try {
    const keysToRemove = [
      'resumeData',
      'sectionOrder',
      'visibleSections',
      'personalInfo',
      'education',
      'experience',
      'projects',
      'skills',
      'certifications'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

export const exportResumeData = () => {
  try {
    const data = {
      resumeData: JSON.parse(localStorage.getItem('resumeData') || '{}'),
      sectionOrder: JSON.parse(localStorage.getItem('sectionOrder') || '[]'),
      visibleSections: JSON.parse(localStorage.getItem('visibleSections') || '[]'),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-data.json';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting data:", error);
  }
};

export const importResumeData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.resumeData) localStorage.setItem('resumeData', JSON.stringify(data.resumeData));
        if (data.sectionOrder) localStorage.setItem('sectionOrder', JSON.stringify(data.sectionOrder));
        if (data.visibleSections) localStorage.setItem('visibleSections', JSON.stringify(data.visibleSections));
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};