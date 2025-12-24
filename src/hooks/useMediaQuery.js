import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design - detects if viewport matches a media query
 * @param {string} query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    // Check if window is available (SSR safety)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
};

/**
 * Convenience hook for mobile detection (< 768px)
 * @returns {boolean} - Whether viewport is mobile-sized
 */
export const useIsMobile = () => {
  return useMediaQuery('(max-width: 767px)');
};

/**
 * Convenience hook for tablet detection (768px - 1023px)
 * @returns {boolean} - Whether viewport is tablet-sized
 */
export const useIsTablet = () => {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
};

/**
 * Convenience hook for desktop detection (≥ 1024px)
 * @returns {boolean} - Whether viewport is desktop-sized
 */
export const useIsDesktop = () => {
  return useMediaQuery('(min-width: 1024px)');
};

export default useMediaQuery;
