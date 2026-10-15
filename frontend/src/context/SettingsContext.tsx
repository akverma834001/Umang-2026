import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebsiteSettings } from '../types';
import { api } from '../services/api';

interface SettingsContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const applyBrandingColors = (s: WebsiteSettings) => {
    if (s.primary_color) {
      document.documentElement.style.setProperty('--brand-primary', s.primary_color);
    }
    if (s.secondary_color) {
      document.documentElement.style.setProperty('--brand-secondary', s.secondary_color);
    }
    if (s.accent_color) {
      document.documentElement.style.setProperty('--brand-accent', s.accent_color);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      applyBrandingColors(data);
    } catch (err) {
      console.error('Failed to load website settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
