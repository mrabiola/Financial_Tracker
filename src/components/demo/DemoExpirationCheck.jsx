import { useEffect } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { useNavigate } from 'react-router-dom';

const DemoExpirationCheck = () => {
  const { isDemo, remainingTime, endDemo } = useDemo();
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiration = async () => {
      if (!isDemo) return;

      // Only check for expiration if remainingTime has been calculated
      // remainingTime === undefined initially means it hasn't been calculated yet
      // remainingTime === null after calculation means session expired
      if (remainingTime !== undefined && (remainingTime === null || (remainingTime && remainingTime.days === 0 && remainingTime.hours === 0))) {
        await endDemo();

        // Show expiration message
        const message = encodeURIComponent('Your demo session has expired. Please sign up to continue.');
        navigate(`/login?message=${message}`);
      }
    };

    checkExpiration();
    
    // Check every minute
    const interval = setInterval(checkExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [isDemo, remainingTime, endDemo, navigate]);

  return null;
};

export default DemoExpirationCheck;