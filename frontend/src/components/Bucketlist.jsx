import React, { useState, useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import CardWithReview from './CardWithReview.jsx';
import '../styles/journalBucketlistShared.scss';
import ErrorPage from './ErrorPage.jsx';
import PackingLoader from './PackingLoader.jsx';
import useAuthenticatedData from '../hooks/useAuthenticatedData.jsx';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import { useLocation } from 'react-router-dom';
const Bucketlist = ({ isLogged }) => {
  const { profileInfo, isLoading, isAuthenticated, setProfileInfo } = useAuthenticatedData();
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
          <CardWithReview key={index} name={name} page={"bucketlist"} onRemove={handleRemoveFromWishlist} />
        ))}
      </div>
    </div>
  );
};

export default Bucketlist;
