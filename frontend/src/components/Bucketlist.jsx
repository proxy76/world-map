import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalHeader from './GlobalHeader';
import CardWithReview from './CardWithReview.jsx';
import ItineraryModal from './ItineraryModal.jsx';
import '../styles/journalBucketlistShared.scss';
import ErrorPage from './ErrorPage.jsx';
import PackingLoader from './PackingLoader.jsx';
import useAuthenticatedData from '../hooks/useAuthenticatedData.jsx';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import { CREATE_ITINERARY_ENDPOINT_URL } from '../utils/ApiHost';
import { useLocation } from 'react-router-dom';
const Bucketlist = ({ isLogged }) => {
  const { profileInfo, isLoading, isAuthenticated, setProfileInfo } = useAuthenticatedData();
  const { lang } = useLanguage();
  const location = useLocation();
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  
  useEffect(() => {
    if (!location.search.includes("reloaded=1")) {
      window.location.replace(location.pathname + "?reloaded=1");
    } else {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.querySelector('.journal-bucketlist-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        container.style.setProperty('--mouse-x', `${x}%`);
        container.style.setProperty('--mouse-y', `${y}%`);
        container.classList.add('mouse-active');
      }
    };

    const handleMouseLeave = () => {
      const container = document.querySelector('.journal-bucketlist-container');
      if (container) {
        container.classList.remove('mouse-active');
      }
    };

    const container = document.querySelector('.journal-bucketlist-container');
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    }
      }, []);
  
  // Show loading animation while checking authentication
  if (isLoading) {
    return <PackingLoader />;
  }

  // Show error page only if user is definitely not authenticated
  if (!isAuthenticated || !profileInfo) {
    return <ErrorPage />;
  }

  if (!profileInfo) return <ErrorPage />;

  const handleRemoveFromWishlist = (name) => {
    setProfileInfo({
      ...profileInfo,
      countriesWishlist: profileInfo.countriesWishlist.filter((country) => country !== name),
    });
  };

  const handleCreateItinerary = (countryName) => {
    setSelectedCountry(countryName);
    setItineraryModalOpen(true);
  };

  const handleSaveItinerary = async (itineraryData) => {
    try {
      const response = await axios.post(
        CREATE_ITINERARY_ENDPOINT_URL,
        itineraryData,
        { withCredentials: true }
      );
      
      if (response.status === 201) {
        alert(`${translations[lang]?.itinerary || 'Itinerary'} "${itineraryData.title}" ${translations[lang]?.saved || 'saved'} ${itineraryData.shareToSocial ? translations[lang]?.andShared || 'and shared' : translations[lang]?.privately || 'privately'}!`);
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert(translations[lang]?.errorSavingItinerary || 'Error saving itinerary. Please try again.');
    }
  };

  return (
    <div className="journal-bucketlist-container">
      {/* Floating decorative elements */}
      <div className="floating-decoration-extra"></div>
      <div className="floating-decoration"></div>
      <div className="floating-decoration"></div>
      <div className="floating-decoration"></div>
      
      <GlobalHeader isLogged={isLogged} />
      <h1>{translations[lang].bucketlist}</h1>
      <div className="content">
        {Array.from(new Set(profileInfo.countriesWishlist)).map((name, index) => (
          <CardWithReview 
            key={index} 
            name={name} 
            page={"bucketlist"} 
            onRemove={handleRemoveFromWishlist}
            onCreateItinerary={handleCreateItinerary}
          />
        ))}
      </div>
      
      {/* Itinerary Modal */}
      <ItineraryModal
        isOpen={itineraryModalOpen}
        onClose={() => setItineraryModalOpen(false)}
        countryName={selectedCountry}
        onSaveItinerary={handleSaveItinerary}
      />
    </div>
  );
};

export default Bucketlist;
