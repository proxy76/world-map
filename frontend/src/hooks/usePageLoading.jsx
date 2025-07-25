import { useState, useEffect } from 'react';

const usePageLoading = (minimumLoadingTime = 800) => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    // Ensure minimum loading time to prevent flash
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, minimumLoadingTime);

    return () => clearTimeout(timer);
  }, [minimumLoadingTime]);

  return { isPageLoading, setIsPageLoading };
};

export default usePageLoading;
