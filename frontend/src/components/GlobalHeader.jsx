import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import pfp from '../assets/anonymous.png';
import { getProfileInfo } from '../utils/profileInfo.js';
import { LOGOUT_ENDPOINT_URL } from '../utils/ApiHost.js';
import axios from 'axios';

import "../styles/header.scss";

const GlobalHeader = ({ isLogged }) => {
  const { lang } = useLanguage();
  const [profilePic, setProfilePic] = useState('');
  const [isOpened, setIsOpened] = useState(false);
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
          {/* NU mai afișați selectorul de limbă aici pe pagina de profil */}
          {location.pathname !== "/profile" && (
            <div style={{ marginLeft: "auto", marginRight: "1rem" }}>
              {/* Dacă vrei selector global pe alte pagini, îl poți lăsa aici */}
            </div>
          )}
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
    </div>
  );
};

export default GlobalHeader;
