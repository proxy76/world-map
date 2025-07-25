import { useState, useEffect } from 'react';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL } from '../utils/ApiHost';

const useAuthenticatedData = (minimumLoadingTime = 1000) => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(PROFILE_INFO_ENDPOINT_URL, { 
          withCredentials: true 
        });
        setProfileInfo(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to fetch profile info:', error);
        setIsAuthenticated(false);
      } finally {
        // Add a minimum loading time to prevent flash and ensure smooth UX
        setTimeout(() => {
          setIsLoading(false);
        }, minimumLoadingTime);
      }
    };

    fetchData();
  }, [minimumLoadingTime]);

  return { profileInfo, isLoading, isAuthenticated, setProfileInfo };
};

export default useAuthenticatedData;
