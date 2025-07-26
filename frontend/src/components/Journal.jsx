import React, { useState, useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import CardWithReview from './CardWithReview.jsx';
import ItineraryViewModal from './ItineraryViewModal.jsx';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/journalBucketlistShared.scss';
import ErrorPage from './ErrorPage.jsx';
import PackingLoader from './PackingLoader.jsx';
import useAuthenticatedData from '../hooks/useAuthenticatedData.jsx';
import ReviewModal from './ReviewModal.jsx';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import { useLocation } from 'react-router-dom';
const Journal = ({ isLogged }) => {
  const { profileInfo, isLoading, isAuthenticated, setProfileInfo } = useAuthenticatedData();
  const [reviewsOpened, setReviewsOpened] = useState('');
  const [itineraryViewModalOpen, setItineraryViewModalOpen] = useState(false);
  const [selectedItineraries, setSelectedItineraries] = useState([]);
  const [selectedCountryForView, setSelectedCountryForView] = useState('');
  const { lang } = useLanguage();
  const location = useLocation();

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

  
  if (isLoading) {
    return <PackingLoader />;
  }

  if (!isAuthenticated || !profileInfo) {
    return <ErrorPage />;
  }

  const handleRemoveFromJournal = (name) => {
    setProfileInfo({
      ...profileInfo,
      countriesVisited: profileInfo.countriesVisited.filter((country) => country !== name),
    });
  };

  const handleViewItineraries = (countryName, itineraries) => {
    setSelectedCountryForView(countryName);
    setSelectedItineraries(itineraries);
    setItineraryViewModalOpen(true);
  };

  return (
    <div className="journal-bucketlist-container">
      {/* Floating decorative elements */}
      <div className="floating-decoration-extra"></div>
      <div className="floating-decoration"></div>
      <div className="floating-decoration"></div>
      <div className="floating-decoration"></div>
      
      <GlobalHeader isLogged={isLogged} />
      <h1>{translations[lang].yourJournal}</h1>
      <div className="content">
        {reviewsOpened &&
          <ReviewModal reviewsOpened={reviewsOpened} setReviewsOpened={setReviewsOpened} isLogged={isLogged} />
        }
        {Array.from(new Set(profileInfo.countriesVisited)).map((name, index) => (
          <CardWithReview 
            key={index} 
            name={name} 
            setReviewsOpened={setReviewsOpened} 
            page={"journal"} 
            onRemove={handleRemoveFromJournal}
            onViewItineraries={handleViewItineraries}
          />
        ))}
      </div>
      
      {/* Itinerary View Modal - Now properly overlays the entire page */}
      <ItineraryViewModal
        isOpen={itineraryViewModalOpen}
        onClose={() => setItineraryViewModalOpen(false)}
        itineraries={selectedItineraries}
        countryName={selectedCountryForView}
      />
    </div>
  );
};

export default Journal;
