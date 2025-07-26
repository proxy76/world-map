import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL, PFP_UPDATE_ENDPOINT_URL } from '../utils/ApiHost';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import pfp from '../assets/anonymous.png';
import GlobalHeader from './GlobalHeader';
import TravelJournal from './TravelJournal';
import Achievements from './Achievements';
import { FaWindows } from 'react-icons/fa';
import ErrorPage from './ErrorPage';
import '../styles/ProfilePage.scss';

const ProfilePage = ({ isLogged }) => {
  const { lang, setLang } = useLanguage();
  const [profileInfo, setProfileInfo] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ visited: 0, wishlist: 0 });
  const [showJournal, setShowJournal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const BACKEND_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (!location.search.includes("reloaded=1")) {
      window.location.replace(location.pathname + "?reloaded=1");
    } else {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  const getInfo = () => {
    axios
      .get(PROFILE_INFO_ENDPOINT_URL, { withCredentials: true })
      .then((response) => {
        setProfileInfo(response.data);
        setTimeout(() => {
          animateNumbers(response.data);
        }, 500);
      })
      .catch((error) => console.error('Failed to fetch profile info:', error));
  };

  const animateNumbers = (data) => {
    const visitedTarget = data.countriesVisited?.length || 0;
    const wishlistTarget = data.countriesWishlist?.length || 0;
    
    const duration = 1000;
    const steps = 30;
    const visitedStep = visitedTarget / steps;
    const wishlistStep = wishlistTarget / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        visited: Math.min(Math.floor(visitedStep * currentStep), visitedTarget),
        wishlist: Math.min(Math.floor(wishlistStep * currentStep), wishlistTarget)
      });
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedStats({ visited: visitedTarget, wishlist: wishlistTarget });
      }
    }, duration / steps);
  };

  useEffect(() => {
    getInfo();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  if (isLogged === false) return <ErrorPage />;
  else if (isLogged === undefined || isLogged === null) return null;

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const uploadImage = () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append('profile_picture', selectedImage);
    axios
      .post(PFP_UPDATE_ENDPOINT_URL, formData, { withCredentials: true })
      .then(() => {getInfo(); window.location.reload()});
  };

  const toggleLang = () => setLang(lang === "ro" ? "en" : "ro");

  return (
    <div 
      className="profile-container"
      onMouseMove={(e) => {
        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        container.style.setProperty('--mouse-x', `${x}%`);
        container.style.setProperty('--mouse-y', `${y}%`);
        container.classList.add('mouse-active');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove('mouse-active');
      }}
    >
      <div className="floating-decoration-extra"></div>
      <div className="floating-decoration-1"></div>
      <div className="floating-decoration-2"></div>
      <div className="floating-decoration-3"></div>
      <div className="floating-decoration-after"></div>
      
      <GlobalHeader isLogged={isLogged} />
      
      <div 
        className="profile-card"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="profile-card-overlay"></div>
        
        <div className="profile-lang-toggle">
          <button
            onClick={toggleLang}
            onFocus={(e) => e.target.blur()}
            className="profile-lang-btn"
            style={{
              background: lang === "ro"
                ? "linear-gradient(135deg, #66ea9b 0%, #208291 100%)"
                : "linear-gradient(135deg, #208291 0%, #66ea9b 100%)",
              transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = lang === "ro"
                ? "linear-gradient(135deg, #4facfe 0%, #66ea9b 50%, #208291 100%)"
                : "linear-gradient(135deg, #208291 0%, #66ea9b 50%, #4facfe 100%)";
              e.target.style.backgroundSize = "200% 200%";
              e.target.style.animation = "gradientShift 2s ease infinite";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = lang === "ro"
                ? "linear-gradient(135deg, #66ea9b 0%, #208291 100%)"
                : "linear-gradient(135deg, #208291 0%, #66ea9b 100%)";
              e.target.style.backgroundSize = "100% 100%";
              e.target.style.animation = "none";
            }}
          >
            <span style={{
              fontWeight: lang === "ro" ? "bold" : "normal",
              opacity: lang === "ro" ? 1 : 0.7,
              transform: lang === "ro" ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>RO</span>
            <div className="profile-lang-separator"></div>
            <span style={{
              fontWeight: lang === "en" ? "bold" : "normal",
              opacity: lang === "en" ? 1 : 0.7,
              transform: lang === "en" ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>EN</span>
          </button>
        </div>
        
        <div className="profile-picture-container">
          <div 
            className="profile-picture-wrapper"
            onMouseMove={(e) => e.stopPropagation()}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            onWheel={(e) => e.preventDefault()}
            onScroll={(e) => e.preventDefault()}
          >
            <img
              src={BACKEND_BASE_URL + profileInfo.profile_picture}
              alt="Profile"
              className="profile-picture"
              style={{
                transform: isVisible ? 'scale(1)' : 'scale(0.6)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
              }}
              onError={e => { e.target.onerror = null; e.target.src = pfp }}
              onWheel={(e) => e.preventDefault()}
              onScroll={(e) => e.preventDefault()}
              draggable={false}
            />
            <div 
              className="profile-ring"
              style={{
                transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-180deg)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
              }}
            ></div>
            <div 
              className="profile-glow"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: 'all 1.5s ease 0.5s',
              }}
            ></div>
          </div>
        </div>
        
        <h2 
          className="profile-name"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s'
          }}
        >
          {profileInfo.username}
        </h2>
        
        <p 
          className="profile-email"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s'
          }}
        >
          {profileInfo.email}
        </p>
        
        <div 
          className="profile-stats"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s'
          }}
        >
          <AnimatedStatItem 
            number={animatedStats.visited}
            label={translations[lang]?.visited || 'Visited'}
            isVisible={isVisible}
            color="#667eea"
          />
          <AnimatedStatItem 
            number={animatedStats.wishlist}
            label={translations[lang]?.wishlist || 'Wishlist'}
            isVisible={isVisible}
            color="#f093fb"
          />
        </div>
        
        <div 
          className="profile-upload-container"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s'
          }}
        >
          <div className="profile-file-input-container">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="profile-file-input"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="profile-file-input-label">
              <span className="profile-file-input-icon">📁</span>
              <span>{selectedImage ? selectedImage.name : 'Choose Image'}</span>
            </label>
          </div>
          <EnhancedButton
            label={translations[lang]?.changePic || 'Change Picture'}
            onClick={uploadImage}
            disabled={!selectedImage}
            isVisible={isVisible}
            variant="primary"
          />
        </div>
        
        <div 
          className="profile-buttons"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s'
          }}
        >
          <EnhancedButton
            label={translations[lang]?.openJournal || 'Open Travel Journal'}
            onClick={() => setShowJournal(true)}
            isVisible={isVisible}
            variant="primary"
            icon="📖"
          />
          <EnhancedButton
            label={translations[lang]?.travelJournal || 'Travel Journal'}
            onClick={() => navigate('/journal')}
            isVisible={isVisible}
            variant="secondary"
            icon="📖"
          />
          <EnhancedButton
            label={translations[lang]?.bucketlist || 'Bucket List'}
            onClick={() => navigate('/bucketlist')}
            isVisible={isVisible}
            variant="accent"
            icon="🎯"
          />
        </div>
      </div>
      
      {/* Achievements Section */}
      <Achievements 
        profileInfo={profileInfo}
        isVisible={isVisible}
      />
      
      {/* Travel Journal Modal */}
      <TravelJournal 
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
      />
    </div>
  );
};

const AnimatedStatItem = ({ number, label, isVisible, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="profile-stat-item"
      style={{
        '--stat-color': color,
        '--stat-color-rgb': color.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', '),
        background: isHovered 
          ? `linear-gradient(135deg, ${color}15, ${color}25)` 
          : 'rgba(255, 255, 255, 0.1)',
        borderColor: isHovered ? color : 'transparent',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="profile-stat-inner">
        <h3 
          className="profile-stat-number"
          style={{
            color: isHovered ? color : '#333',
            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {number}
        </h3>
        <p 
          className="profile-stat-label"
          style={{
            color: isHovered ? color : '#666'
          }}
        >{label}</p>
      </div>
      {isHovered && (
        <div 
          className="profile-stat-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`
          }}
        ></div>
      )}
    </div>
  );
};

const EnhancedButton = ({ label, onClick, disabled = false, isVisible, variant = 'primary', icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={`profile-enhanced-button ${variant}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isPressed ? 'translateY(2px) scale(0.98)' : 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <span className="profile-button-content">
        {icon && <span className="profile-button-icon">{icon}</span>}
        {label}
      </span>
      {isHovered && !disabled && (
        <div className="profile-button-ripple"></div>
      )}
    </button>
  );
};

export default ProfilePage;