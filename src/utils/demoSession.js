import { v4 as uuidv4 } from 'uuid';

// Demo session configuration
export const DEMO_CONFIG = {
  SESSION_DURATION_DAYS: 7,
  SESSION_KEY: 'demo_session_id',
  DEMO_USER_PREFIX: 'demo_',
};

/**
 * Generate a unique demo session ID
 */
export const generateDemoSessionId = () => {
  return `${DEMO_CONFIG.DEMO_USER_PREFIX}${uuidv4()}`;
};

/**
 * Check if current session is a demo session
 */
export const isDemoSession = () => {
  const sessionId = localStorage.getItem(DEMO_CONFIG.SESSION_KEY);
  return sessionId && sessionId.startsWith(DEMO_CONFIG.DEMO_USER_PREFIX);
};

/**
 * Get current demo session ID
 */
export const getDemoSessionId = () => {
  return localStorage.getItem(DEMO_CONFIG.SESSION_KEY);
};

/**
 * Create a new demo session
 */
export const createDemoSession = async () => {
  try {
    const sessionId = generateDemoSessionId();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + DEMO_CONFIG.SESSION_DURATION_DAYS);
    
    const sessionData = {
      sessionId,
      createdAt: new Date().toISOString(),
      expiresAt: expirationDate.toISOString(),
      lastActive: new Date().toISOString(),
    };

    // Demo sessions use localStorage only for simplicity and reliability

    // Store session ID in localStorage
    localStorage.setItem(DEMO_CONFIG.SESSION_KEY, sessionId);
    localStorage.setItem(`${sessionId}_metadata`, JSON.stringify(sessionData));
    
    return { success: true, sessionId, sessionData };
  } catch (error) {
    console.error('Error creating demo session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load existing demo session
 */
export const loadDemoSession = async (sessionId = null) => {
  try {
    const id = sessionId || getDemoSessionId();
    if (!id) return null;

    // First check localStorage
    const localMetadata = localStorage.getItem(`${id}_metadata`);
    if (localMetadata) {
      const metadata = JSON.parse(localMetadata);
      
      // Check if session has expired
      if (new Date(metadata.expiresAt) < new Date()) {
        await cleanupDemoSession(id);
        return null;
      }
      
      return metadata;
    }

    // If no localStorage data found, session is invalid
    return null;
  } catch (error) {
    console.error('Error loading demo session:', error);
    return null;
  }
};

/**
 * Save demo data to storage
 */
export const saveDemoData = async (data, dataType = 'financial_data') => {
  try {
    const sessionId = getDemoSessionId();
    if (!sessionId) {
      throw new Error('No active demo session');
    }

    // Update last active timestamp
    const metadata = await loadDemoSession(sessionId);
    if (metadata) {
      metadata.lastActive = new Date().toISOString();
      localStorage.setItem(`${sessionId}_metadata`, JSON.stringify(metadata));
    }

    // Save to localStorage as primary storage
    const storageKey = `${sessionId}_${dataType}`;
    localStorage.setItem(storageKey, JSON.stringify(data));

    // Demo data uses localStorage only for simplicity and performance

    return { success: true };
  } catch (error) {
    console.error('Error saving demo data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load demo data from storage
 */
export const loadDemoData = async (dataType = 'financial_data') => {
  try {
    const sessionId = getDemoSessionId();
    if (!sessionId) return null;

    // Check session validity
    const metadata = await loadDemoSession(sessionId);
    if (!metadata) return null;

    // First try localStorage
    const storageKey = `${sessionId}_${dataType}`;
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      return JSON.parse(localData);
    }

    // Demo data uses localStorage only

    return null;
  } catch (error) {
    console.error('Error loading demo data:', error);
    return null;
  }
};

/**
 * Clean up expired demo session
 */
export const cleanupDemoSession = async (sessionId) => {
  try {
    // Remove from localStorage
    localStorage.removeItem(DEMO_CONFIG.SESSION_KEY);
    localStorage.removeItem(`${sessionId}_metadata`);
    
    // Remove all demo data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(sessionId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Demo cleanup uses localStorage only

    return { success: true };
  } catch (error) {
    console.error('Error cleaning up demo session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if demo session is about to expire (within 24 hours)
 */
export const isDemoSessionExpiringSoon = async () => {
  const metadata = await loadDemoSession();
  if (!metadata) return false;
  
  const expirationDate = new Date(metadata.expiresAt);
  const now = new Date();
  const hoursUntilExpiration = (expirationDate - now) / (1000 * 60 * 60);
  
  return hoursUntilExpiration <= 24 && hoursUntilExpiration > 0;
};

/**
 * Get remaining time for demo session
 */
export const getDemoSessionRemainingTime = async () => {
  const metadata = await loadDemoSession();
  if (!metadata) return null;
  
  const expirationDate = new Date(metadata.expiresAt);
  const now = new Date();
  const msRemaining = expirationDate - now;
  
  if (msRemaining <= 0) return null;
  
  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { days, hours, expirationDate };
};