import React, { useState, useEffect } from 'react';
import GlobalHeader from './GlobalHeader';
import CardWithReview from './CardWithReview.jsx';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/journalBucketlistShared.scss';
import ErrorPage from './ErrorPage.jsx';
import ReviewModal from './ReviewModal.jsx';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import { useLocation } from 'react-router-dom';
const Journal = ({ isLogged }) => {
  const [profileInfo, setProfileInfo] = useState(null);
  const [reviewsOpened, setReviewsOpened] = useState('');
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
      };
    }
  }, []);
  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await axios.get(PROFILE_INFO_ENDPOINT_URL, { withCredentials: true });
        setProfileInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch profile info:', error);
      }
    };
    getInfo();
  }, []);
  if (!profileInfo) return <ErrorPage />;
  const handleRemoveFromJournal = (name) => {
    setProfileInfo({
      ...profileInfo,
      countriesVisited: profileInfo.countriesVisited.filter((country) => country !== name),
    });
  };
  return (
    <div className="journal-bucketlist-container">
      {}
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
          <CardWithReview key={index} name={name} setReviewsOpened={setReviewsOpened} page={"journal"} onRemove={handleRemoveFromJournal} />
        ))}
      </div>
    </div>
  );
};
export default Journal;
