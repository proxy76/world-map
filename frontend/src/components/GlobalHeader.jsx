import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import pfp from '../assets/anonymous.png';
import { getProfileInfo } from '../utils/profileInfo.js';
import { LOGOUT_ENDPOINT_URL } from '../utils/ApiHost.js';
import axios from 'axios';

import "../styles/header.scss";
import "../styles/globalHeader.scss";

const GlobalHeader = ({ isLogged }) => {
  const { lang } = useLanguage();
  const [profilePic, setProfilePic] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    getProfileInfo()
      .then(data => setProfilePic(data.profilePic))
      .catch(() => setProfilePic('/anonymous.png'));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.className !== 'dropdownWrapper' && e.target.className !== 'profilePic') {
        setIsOpened(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    axios.post(LOGOUT_ENDPOINT_URL, {}, { withCredentials: true })
      .then(() => window.location.reload());
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isGradientPage = location.pathname.startsWith('/social') || location.pathname === '/map';
  return (
    <div className="headerWrapper">
      <div className="headerText">
        <div className="sections">
          <div className="title">
            <div className="titleLogo">
              <img src="/vite.png" alt="" />
            </div>
            <div className="titleText">
              <a href='/'>GlobeTales.</a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="middleSection middleSectionFull">
            <Link to="/map" className={`middleItem`}>WorldMap</Link>
            <Link to="/journal" className="middleItem">Journal</Link>
            <Link to="/bucketlist" className="middleItem">Bucketlist</Link>
            <Link to="/social" className={`middleItemLarge ${isGradientPage ? 'socialize-gradient' : ''}`}>Socialize</Link> 
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="hamburger-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
          </button>

          {/* Profile Dropdown */}
          <div
            onClick={() => setIsOpened(!isOpened)}
            ref={dropdownRef}
            className="dropdownWrapper"
          >
            <img
              className="profilePic"
              src={profilePic || pfp}
              alt=""
              onError={e => { e.target.onerror = null; e.target.src = pfp }}
            />
            {isOpened && (
              <div className="dropdownContainer">
                {isLogged ? (
                  <div className="dropdown">
                    <Link to='/profile'>
                      <div className="dropdownItem">{translations[lang].profile}</div>
                    </Link>
                    <div onClick={handleLogout} className="dropdownItem">
                      {translations[lang].logout}
                    </div>
                  </div>
                ) : (
                  <div className="dropdown">
                    <Link to='/login'>
                      <div className="dropdownItem">{translations[lang].login}</div>
                    </Link>
                    <Link to='/register'>
                      <div className="dropdownItem">{translations[lang].register}</div>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}>
        <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <h3>Navigation</h3>
            <button className="mobile-nav-close" onClick={closeMobileMenu}>
              ✕
            </button>
          </div>
          <div className="mobile-nav-links">
            <Link to="/map" className="mobile-nav-item" onClick={closeMobileMenu}>
              <span className="nav-icon">🗺️</span>
              WorldMap
            </Link>
            <Link to="/journal" className="mobile-nav-item" onClick={closeMobileMenu}>
              <span className="nav-icon">📔</span>
              Journal
            </Link>
            <Link to="/bucketlist" className="mobile-nav-item" onClick={closeMobileMenu}>
              <span className="nav-icon">🎯</span>
              Bucketlist
            </Link>
            <Link to="/social" className="mobile-nav-item socialize-mobile" onClick={closeMobileMenu}>
              <span className="nav-icon">👥</span>
              Socialize
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader;
