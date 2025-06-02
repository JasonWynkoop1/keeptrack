import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * @returns {boolean} isMobile - True if the user is on a mobile device
 */
export const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      // Check if the user agent contains mobile keywords or if the screen width is less than 768px
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      );
      const screenWidth = window.innerWidth <= 768;
      
      setIsMobile(mobile || screenWidth);
    };

    // Check on initial load
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

export default useDeviceDetect;