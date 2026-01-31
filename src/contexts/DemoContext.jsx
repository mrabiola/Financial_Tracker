import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  isDemoSession, 
  getDemoSessionId, 
  createDemoSession,
  loadDemoSession,
  saveDemoData,
  loadDemoData,
  cleanupDemoSession,
  isDemoSessionExpiringSoon,
  getDemoSessionRemainingTime
} from '../utils/demoSession';
import { generateDemoData } from '../utils/demoDataGenerator';
import { THEME_SESSION_KEY } from './ThemeContext';

const DemoContext = createContext({});

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider = ({ children }) => {
  const [isDemo, setIsDemo] = useState(false);
  const [demoSessionId, setDemoSessionId] = useState(null);
  const [demoData, setDemoData] = useState(null);
  const [demoMetadata, setDemoMetadata] = useState(null);
  const [showConversionPrompt, setShowConversionPrompt] = useState(false);
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // Ref to track latest demoData without triggering useEffect re-renders
  const demoDataRef = useRef(null);
  demoDataRef.current = demoData;

  // Check for existing demo session on mount
  useEffect(() => {
    checkDemoSession();

    // Also listen for storage events to detect when demo session is cleared externally
    const handleStorageChange = (e) => {
      if (e.key === 'demo_session_id' && !e.newValue && isDemo) {
        // Demo session was cleared externally (e.g., from logout)
        setIsDemo(false);
        setDemoSessionId(null);
        setDemoData(null);
        setDemoMetadata(null);
        setShowConversionPrompt(false);
        setShowExpirationWarning(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isDemo]);

  // Check for expiration warning periodically
  useEffect(() => {
    if (!isDemo) return;

    const checkExpiration = async () => {
      const expiringSoon = await isDemoSessionExpiringSoon();
      setShowExpirationWarning(expiringSoon);
      
      const time = await getDemoSessionRemainingTime();
      setRemainingTime(time);
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isDemo]);

  // Periodic save of demo data
  useEffect(() => {
    if (!isDemo) return;

    const saveInterval = setInterval(() => {
      // Use ref to get latest demoData without recreating interval
      if (demoDataRef.current) {
        saveDemoData(demoDataRef.current, 'financial_data');
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [isDemo]);

  const checkDemoSession = async () => {
    try {
      setLoading(true);
      const sessionId = getDemoSessionId();

      if (sessionId && isDemoSession()) {
        const metadata = await loadDemoSession(sessionId);

        if (metadata) {
          // Session is valid
          setIsDemo(true);
          setDemoSessionId(sessionId);
          setDemoMetadata(metadata);

          // Load saved demo data
          const savedData = await loadDemoData('financial_data');
          if (savedData) {
            setDemoData(savedData);
          } else {
            // Generate new demo data if none exists
            const newData = generateDemoData();
            setDemoData(newData);
            await saveDemoData(newData, 'financial_data');
          }
        } else {
          // Session expired or invalid
          setIsDemo(false);
          setDemoSessionId(null);
        }
      }
    } catch (error) {
      console.error('Error checking demo session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDemo = async () => {
    try {
      setLoading(true);

      // Create new demo session
      const { success, sessionId, sessionData } = await createDemoSession();

      if (success) {
        setIsDemo(true);
        setDemoSessionId(sessionId);
        setDemoMetadata(sessionData);

        // Generate and save demo data
        const newData = generateDemoData();
        setDemoData(newData);
        await saveDemoData(newData, 'financial_data');

        // Show initial conversion prompt after 2 minutes
        setTimeout(() => {
          setShowConversionPrompt(true);
        }, 120000);

        return { success: true };
      }

      return { success: false, error: 'Failed to create demo session' };
    } catch (error) {
      console.error('Error starting demo:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const endDemo = async () => {
    try {
      // Ensure theme is scoped to the demo/authenticated session only
      try {
        sessionStorage.removeItem(THEME_SESSION_KEY);
      } catch {
        // ignore storage errors
      }

      if (demoSessionId) {
        await cleanupDemoSession(demoSessionId);
      }
      
      setIsDemo(false);
      setDemoSessionId(null);
      setDemoData(null);
      setDemoMetadata(null);
      setShowConversionPrompt(false);
      setShowExpirationWarning(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error ending demo:', error);
      return { success: false, error: error.message };
    }
  };

  const updateDemoData = async (newData) => {
    try {
      setDemoData(newData);
      await saveDemoData(newData, 'financial_data');
      return { success: true };
    } catch (error) {
      console.error('Error updating demo data:', error);
      return { success: false, error: error.message };
    }
  };

  const convertDemoToAccount = async (userData) => {
    // This will be implemented when integrating with the auth system
    // It will create a real user account and migrate demo data
    return { success: false, error: 'Conversion not yet implemented' };
  };

  const dismissConversionPrompt = () => {
    setShowConversionPrompt(false);
    
    // Show again after 30 minutes
    setTimeout(() => {
      if (isDemo) {
        setShowConversionPrompt(true);
      }
    }, 1800000);
  };

  const value = {
    isDemo,
    demoSessionId,
    demoData,
    demoMetadata,
    showConversionPrompt,
    showExpirationWarning,
    remainingTime,
    loading,
    startDemo,
    endDemo,
    updateDemoData,
    convertDemoToAccount,
    dismissConversionPrompt,
    checkDemoSession
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};