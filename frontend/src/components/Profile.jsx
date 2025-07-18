import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL, PFP_UPDATE_ENDPOINT_URL } from '../utils/ApiHost';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import pfp from '../assets/anonymous.png';
import GlobalHeader from './GlobalHeader';
import { FaWindows } from 'react-icons/fa';
import ErrorPage from './ErrorPage';

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
if (!document.head.querySelector('style[data-profile-animations]')) {
  style.setAttribute('data-profile-animations', 'true');
  document.head.appendChild(style);
}

const ProfilePage = ({ isLogged }) => {
  const { lang, setLang } = useLanguage();
  const [profileInfo, setProfileInfo] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ visited: 0, wishlist: 0 });
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

  // Animarea numerelor din stats
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
    <>
      <GlobalHeader isLogged={isLogged} />
      <div 
        style={styles.container} 
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
        {/* Floating decorative elements matching Journal/Bucketlist */}
        <div style={styles.floatingDecorationExtra}></div>
        <div style={styles.floatingDecoration1}></div>
        <div style={styles.floatingDecoration2}></div>
        <div style={styles.floatingDecoration3}></div>
        <div style={styles.floatingDecorationAfter}></div>
        
        {/* Enhanced Card */}
        <div style={{
          ...styles.card,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          {/* Glass morphism overlay */}
          <div style={styles.cardOverlay}></div>
          
          {/* Language Toggle */}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", position: 'relative', zIndex: 10 }}>
            <button
              onClick={toggleLang}
              onFocus={(e) => e.target.blur()}
              style={{
                ...styles.toggleBtn,
                background: lang === "ro"
                  ? "linear-gradient(135deg, #66ea9b 0%, #208291 100%)"
                  : "linear-gradient(135deg, #208291 0%, #66ea9b 100%)",
                color: "#fff",
                transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.8)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = lang === "ro"
                  ? "linear-gradient(135deg, #4facfe 0%, #66ea9b 50%, #208291 100%)"
                  : "linear-gradient(135deg, #208291 0%, #66ea9b 50%, #4facfe 100%)";
                e.target.style.backgroundSize = "200% 200%";
                e.target.style.animation = "gradientShift 2s ease infinite";
                e.target.style.transition = "background 0.3s ease, background-size 0.3s ease";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = lang === "ro"
                  ? "linear-gradient(135deg, #66ea9b 0%, #208291 100%)"
                  : "linear-gradient(135deg, #208291 0%, #66ea9b 100%)";
                e.target.style.backgroundSize = "100% 100%";
                e.target.style.animation = "none";
                e.target.style.transition = "background 0.3s ease, background-size 0.3s ease";
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.target.style.background = lang === "ro"
                  ? "linear-gradient(135deg, #208291 0%, #66ea9b 100%)"
                  : "linear-gradient(135deg, #66ea9b 0%, #208291 100%)";
                e.target.style.animation = "none";
                e.target.style.transition = "background 0.15s ease";
              }}
              onMouseUp={(e) => {
                e.target.style.background = lang === "ro"
                  ? "linear-gradient(135deg, #4facfe 0%, #66ea9b 50%, #208291 100%)"
                  : "linear-gradient(135deg, #208291 0%, #66ea9b 50%, #4facfe 100%)";
                e.target.style.animation = "gradientShift 2s ease infinite";
                e.target.style.transition = "background 0.3s ease";
              }}
            >
              <span style={{
                fontWeight: lang === "ro" ? "bold" : "normal",
                opacity: lang === "ro" ? 1 : 0.7,
                transform: lang === "ro" ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>RO</span>
              <div style={styles.langSeparator}></div>
              <span style={{
                fontWeight: lang === "en" ? "bold" : "normal",
                opacity: lang === "en" ? 1 : 0.7,
                transform: lang === "en" ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>EN</span>
            </button>
          </div>
          
          {/* Enhanced Profile Picture */}
          <div style={styles.profilePictureContainer}>
            <div 
              style={styles.profilePictureWrapper}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseEnter={(e) => e.stopPropagation()}
              onMouseLeave={(e) => e.stopPropagation()}
              onWheel={(e) => e.preventDefault()}
              onScroll={(e) => e.preventDefault()}
            >
              <img
                src={BACKEND_BASE_URL + profileInfo.profile_picture}
                alt="Profile"
                style={{
                  ...styles.profilePicture,
                  transform: isVisible ? 'scale(1)' : 'scale(0.6)',
                  opacity: isVisible ? 1 : 0,
                  transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'none'
                }}
                onError={e => { e.target.onerror = null; e.target.src = pfp }}
                onWheel={(e) => e.preventDefault()}
                onScroll={(e) => e.preventDefault()}
                draggable={false}
              />
              <div style={{
                ...styles.profileRing,
                transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-180deg)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
                pointerEvents: 'none'
              }}></div>
              <div style={{
                ...styles.profileGlow,
                opacity: isVisible ? 1 : 0,
                transition: 'all 1.5s ease 0.5s',
                pointerEvents: 'none'
              }}></div>
            </div>
          </div>
          
          {/* Enhanced Name */}
          <h2 style={{
            ...styles.name,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s'
          }}>
            {profileInfo.username}
          </h2>
          
          {/* Enhanced Email */}
          <p style={{
            ...styles.email,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s'
          }}>
            {profileInfo.email}
          </p>
          
          {/* Enhanced Stats */}
          <div style={{
            ...styles.stats,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s'
          }}>
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
          
          {/* Enhanced Upload Container */}
          <div style={{
            ...styles.uploadContainer,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s'
          }}>
            <div style={styles.fileInputContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.fileInput}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={styles.fileInputLabel}>
                <span style={styles.fileInputIcon}>📁</span>
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
          
          {/* Enhanced Navigation Buttons */}
          <div style={{
            ...styles.buttons,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s'
          }}>
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
      </div>
      
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(10px) rotate(-1deg); }
          66% { transform: translateY(-20px) rotate(1deg); }
        }
        
        .profile-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle 400px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0.25) 20%,
            rgba(255, 255, 255, 0.15) 40%,
            rgba(255, 255, 255, 0.08) 60%,
            transparent 80%
          );
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.2s ease;
          opacity: 0;
        }
        
        .profile-container.mouse-active::before {
          opacity: 1;
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.9; 
          }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(2, 247, 27, 0.3); }
          50% { box-shadow: 0 0 40px rgba(2, 161, 20, 0.6), 0 0 60px rgba(2, 161, 20, 0.2); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

const AnimatedStatItem = ({ number, label, isVisible, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      style={{
        ...styles.statItem,
        background: isHovered 
          ? `linear-gradient(135deg, ${color}15, ${color}25)` 
          : 'rgba(255, 255, 255, 0.1)',
        borderColor: isHovered ? color : 'transparent',
        // transform: isVisible ? (isHovered ? 'translateY(-8px) scale(1.05)' : 'scale(1)') : 'scale(0.8)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.statItemInner}>
        <h3 style={{
          ...styles.statNumber,
          color: isHovered ? color : '#333',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}>
          {number}
        </h3>
        <p style={{
          ...styles.statLabel,
          color: isHovered ? color : '#666'
        }}>{label}</p>
      </div>
      {isHovered && (
        <div style={{
          ...styles.statShimmer,
          background: `linear-gradient(90deg, transparent, ${color}40, transparent)`
        }}></div>
      )}
    </div>
  );
};

const EnhancedButton = ({ label, onClick, disabled = false, isVisible, variant = 'primary', icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    let baseStyle = { ...styles.enhancedButton };
    
    if (disabled) {
      return { ...baseStyle, ...styles.buttonDisabled };
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        baseStyle.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3)';
        break;
      case 'secondary':
        baseStyle.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        baseStyle.boxShadow = '0 8px 32px rgba(240, 147, 251, 0.3)';
        break;
      case 'accent':
        baseStyle.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        baseStyle.boxShadow = '0 8px 32px rgba(79, 172, 254, 0.3)';
        break;
    }
    
    if (isPressed) {
      return { 
        ...baseStyle, 
        transform: 'translateY(2px) scale(0.98)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      };
    }
    
    if (isHovered) {
      return { 
        ...baseStyle, 
        // transform: 'translateY(-4px) scale(1.02)',
        boxShadow: baseStyle.boxShadow.replace('0.3', '0.5')
      };
    }
    
    return baseStyle;
  };

  return (
    <button
      style={{
        ...getButtonStyle(),
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <span style={styles.buttonContent}>
        {icon && <span style={styles.buttonIcon}>{icon}</span>}
        {label}
      </span>
      {isHovered && !disabled && (
        <div style={styles.buttonRipple}></div>
      )}
    </button>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    background: 'linear-gradient(-45deg, #66ea9b, #208291, #4facfe, #66ea9b, #208291, #4facfe)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    paddingTop: '80px', // Account for fixed transparent header
    position: 'relative',
    overflow: 'hidden',
  },
  // Floating decorations matching Journal/Bucketlist
  floatingDecorationExtra: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingDecoration1: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: '80px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    animation: 'float 7s ease-in-out infinite',
    animationDelay: '-2s',
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingDecoration2: {
    position: 'absolute',
    top: '60%',
    left: '5%',
    width: '50px',
    height: '50px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    animation: 'float 7s ease-in-out infinite',
    animationDelay: '-4s',
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingDecoration3: {
    position: 'absolute',
    top: '20%',
    left: '60%',
    width: '30px',
    height: '30px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50%',
    animation: 'float 7s ease-in-out infinite',
    animationDelay: '-6s',
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingDecorationAfter: {
    position: 'absolute',
    top: '70%',
    right: '15%',
    width: '40px',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    animation: 'floatReverse 8s ease-in-out infinite',
    zIndex: 0,
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '40px',
    borderRadius: '30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    width: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    borderRadius: '30px',
    zIndex: 1,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: '30px',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  profilePictureWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    background: 'linear-gradient(135deg, #66ea9b, #208291, #4facfe, #66ea9b)',
    borderRadius: '50%',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 6s ease infinite',
    width: '156px',
    height: '156px',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  profilePicture: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(255, 255, 255, 0.9)',
    position: 'relative',
    zIndex: 3,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitUserDrag: 'none',
    pointerEvents: 'none',
  },
  profileRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '180px',
    height: '180px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    border: '2px solid rgba(102, 234, 155, 0.4)',
    animation: 'rotate 20s linear infinite',
    zIndex: 1,
    background: 'conic-gradient(from 0deg, transparent, rgba(102, 234, 155, 0.3), transparent)',
  },
  profileGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '196px',
    height: '196px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102, 234, 155, 0.2) 0%, rgba(32, 130, 145, 0.15) 40%, transparent 70%)',
    animation: 'pulse 4s ease-in-out infinite',
    zIndex: 0,
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #66ea9b, #208291)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    position: 'relative',
    zIndex: 10,
  },
  email: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 10,
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: '30px',
    gap: '20px',
    position: 'relative',
    zIndex: 10,
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '20px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    border: '1px solid transparent',
    backdropFilter: 'blur(10px)',
  },
  statItemInner: {
    position: 'relative',
    zIndex: 2,
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '8px',
    transition: 'all 0.3s ease',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  statShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    animation: 'shimmer 2s infinite',
    zIndex: 1,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    width: '100%',
    marginTop: '10px',
    position: 'relative',
    zIndex: 10,
  },
  enhancedButton: {
    color: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    backdropFilter: 'blur(10px)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 2,
  },
  buttonIcon: {
    fontSize: '16px',
  },
  buttonRipple: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    animation: 'shimmer 1.5s infinite',
    zIndex: 1,
  },
  buttonDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  fileInputContainer: {
    position: 'relative',
  },
  fileInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  fileInputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: '500',
    backdropFilter: 'blur(10px)',
  },
  fileInputIcon: {
    fontSize: '18px',
  },
  toggleBtn: {
    border: 'none',
    borderRadius: '25px',
    padding: '12px 20px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '20px',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backdropFilter: 'blur(15px)',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    '&:focus': {
      outline: 'none',
      boxShadow: 'none',
    },
    '&:active': {
      outline: 'none',
      boxShadow: 'none',
    },
    minWidth: '100px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '25px',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover::before': {
      opacity: 1,
    },
    '&:active': {
      transform: 'scale(0.95)',
    }
  },
  langSeparator: {
    width: '2px',
    height: '18px',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '1px',
    transition: 'all 0.3s ease',
  },
};

export default ProfilePage;