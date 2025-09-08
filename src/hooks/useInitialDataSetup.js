import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Singleton promise to prevent duplicate initialization
let initializationPromise = null;
let initializationUser = null;

/**
 * Hook to handle initial data setup for new users
 * This ensures financial year is created only once, even with multiple component mounts
 */
export const useInitialDataSetup = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
      setIsInitializing(false);
      return;
    }

    // If we already have an initialization in progress for this user, wait for it
    if (initializationPromise && initializationUser === user.id) {
      setIsInitializing(true);
      initializationPromise
        .then(() => {
          setIsInitialized(true);
          setIsInitializing(false);
        })
        .catch(() => {
          setIsInitializing(false);
        });
      return;
    }

    // If already initialized for this component instance, skip
    if (initRef.current) {
      setIsInitialized(true);
      return;
    }

    const initializeUserData = async () => {
      const currentYear = new Date().getFullYear();
      
      try {
        // Check if financial year already exists
        const { data: existingYear, error: checkError } = await supabase
          .from('financial_years')
          .select('id')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .single();

        // If year exists or there's an error other than "not found", we're done
        if (existingYear || (checkError && checkError.code !== 'PGRST116')) {
          return;
        }

        // Create financial year with proper duplicate handling
        const { error: createError } = await supabase
          .from('financial_years')
          .upsert(
            {
              user_id: user.id,
              year: currentYear,
              annual_goal: ''
            },
            { 
              onConflict: 'user_id,year',
              ignoreDuplicates: true 
            }
          );

        if (createError && !createError.message?.includes('duplicate')) {
          console.error('Error creating initial financial year:', createError);
        }
      } catch (err) {
        console.error('Error in initial data setup:', err);
      }
    };

    // Create singleton promise for this user
    setIsInitializing(true);
    initializationUser = user.id;
    initializationPromise = initializeUserData()
      .then(() => {
        initRef.current = true;
        setIsInitialized(true);
        setIsInitializing(false);
        // Clear the promise after a delay to allow for future re-initialization if needed
        setTimeout(() => {
          if (initializationUser === user.id) {
            initializationPromise = null;
            initializationUser = null;
          }
        }, 5000);
      })
      .catch((err) => {
        console.error('Failed to initialize user data:', err);
        setIsInitializing(false);
        // Clear on error to allow retry
        initializationPromise = null;
        initializationUser = null;
      });

  }, [user]);

  return { isInitialized, isInitializing };
};