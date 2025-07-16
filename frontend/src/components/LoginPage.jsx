import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import { LOGIN_ENDPOINT_URL } from '../utils/ApiHost';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';


const LoginPage = ({ setIsLogged }) => {
  const { lang } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const location = useLocation()
    useEffect(() => {
        if (!location.search.includes("reloaded=1")) {
            window.location.replace(location.pathname + "?reloaded=1");
        } else {
            window.history.replaceState({}, "", location.pathname);
        }
    }, [location]);
  useEffect(() => {
    usernameRef.current && usernameRef.current.focus();
  }, []);

  const login = (e) => {
    setError('');
    if (
      (e.target.className && e.target.className.includes('login-button')) ||
      (e.type === "keydown" && (e.code === "Enter" || e.key === "Enter"))
    ) {
      axios
        .post(
          LOGIN_ENDPOINT_URL,
          { username, password },
          { withCredentials: true }
        )
        .then(() => {
          setIsLogged(true);
          navigate('/');
        })
        .catch(() => {
          setError(translations[lang].incorrectCredentials);
        });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.floatingElements}>
        <div style={{...styles.floatingCircle, ...styles.circle1}}></div>
        <div style={{...styles.floatingCircle, ...styles.circle2}}></div>
        <div style={{...styles.floatingCircle, ...styles.circle3}}></div>
      </div>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>{translations[lang].welcome}</h2>
          <p style={styles.subtitle}>{translations[lang].login}</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            ref={usernameRef}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="Introduceți numele dvs."
            style={styles.input}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.key === "Enter") {
                e.preventDefault();
                passwordRef.current && passwordRef.current.focus();
              }
            }}
            onFocus={(e) => e.target.style.transform = 'translateY(-1px)'}
            onBlur={(e) => e.target.style.transform = 'translateY(0)'}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            ref={passwordRef}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Introduceți parola"
            style={styles.input}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.key === "Enter") {
                login(e);
              }
            }}
            onFocus={(e) => e.target.style.transform = 'translateY(-1px)'}
            onBlur={(e) => e.target.style.transform = 'translateY(0)'}
          />
        </div>

        <div style={styles.buttonContainer}>
          <button 
            onClick={login} 
            className="button login-button" 
            style={styles.button}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 12px 24px ${colors.buttonShadowHover}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 8px 16px ${colors.buttonShadow}`;
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {translations[lang].login}
          </button>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

// Color Variables
const colors = {
  // Primary Colors
  primary: '#66ea9b',
  primaryDark: '#118515',
  
  // Background Colors
  backgroundGradientStart: '#66ea9b',
  backgroundGradientEnd: '#208291',
  
  // Card Colors
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Text Colors
  titleGradientStart: '#66ea9b',
  titleGradientEnd: '#208291',
  subtitleText: '#64748b',
  labelText: '#374151',
  inputText: '#374151',
  
  // Input Colors
  inputBackground: '#fafafa',
  inputBackgroundHover: 'white',
  inputBackgroundFocus: 'white',
  inputBorder: '#e5e7eb',
  inputBorderHover: '#66ea9b',
  inputBorderFocus: '#66ea9b',
  
  // Button Colors
  buttonGradientStart: '#66ea9b',
  buttonGradientEnd: '#208291',
  buttonText: 'white',
  buttonShadow: 'rgba(102, 126, 234, 0)',
  buttonShadowHover: 'rgba(102, 126, 234, 0)',
  
  // Error Colors
  errorText: '#ef4444',
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
  
  // Floating Elements
  floatingCircle: 'rgba(255, 255, 255, 0.1)',
  
  // Shadow Colors
  cardShadow: 'rgba(0, 0, 0, 0.15)',
  inputFocusShadow: 'rgba(102, 126, 234, 0)',
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: `linear-gradient(135deg, ${colors.backgroundGradientStart} 0%, ${colors.backgroundGradientEnd} 100%)`,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  floatingCircle: {
    position: 'absolute',
    background: colors.floatingCircle,
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite',
  },
  circle1: {
    width: '80px',
    height: '80px',
    top: '10%',
    left: '10%',
    animationDelay: '-2s',
  },
  circle2: {
    width: '120px',
    height: '120px',
    top: '70%',
    right: '10%',
    animationDelay: '-4s',
  },
  circle3: {
    width: '60px',
    height: '60px',
    top: '40%',
    left: '80%',
    animationDelay: '-1s',
  },
  card: {
    background: colors.cardBackground,
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: `0 32px 64px ${colors.cardShadow}`,
    border: `1px solid ${colors.cardBorder}`,
    position: 'relative',
    animation: 'slideUp 0.6s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: `linear-gradient(135deg, ${colors.titleGradientStart} 0%, ${colors.titleGradientEnd} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: colors.subtitleText,
    fontSize: '1.1rem',
    fontWeight: '500',
    margin: 0,
  },
  formGroup: {
    marginBottom: '24px',
    position: 'relative',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: colors.labelText,
    marginBottom: '8px',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    border: `2px solid ${colors.inputBorder}`,
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: colors.inputBackground,
    color: colors.inputText,
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    width: '100%',
    padding: '16px 24px',
    background: `linear-gradient(135deg, ${colors.buttonGradientStart} 0%, ${colors.buttonGradientEnd} 100%)`,
    color: colors.buttonText,
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: `0 8px 16px ${colors.buttonShadow}`,
  },
  error: {
    color: colors.errorText,
    fontWeight: '600',
    fontSize: '1.1rem',
    textAlign: 'center',
    background: colors.errorBackground,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${colors.errorBorder}`,
    animation: 'shake 0.5s ease-in-out',
  },
};

// Add CSS animations via a style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  input:focus {
    border-color: ${colors.inputBorderFocus} !important;
    background: ${colors.inputBackgroundFocus} !important;
    box-shadow: 0 0 0 3px ${colors.inputFocusShadow} !important;
  }
  
  input:hover {
    border-color: ${colors.inputBorderHover} !important;
    background: ${colors.inputBackgroundHover} !important;
  }
  
  @media (max-width: 480px) {
    .card {
      padding: 30px 20px !important;
      margin: 10px !important;
    }
    
    .title {
      font-size: 2rem !important;
    }
  }
`;

if (!document.head.querySelector('style[data-login-styles]')) {
  styleSheet.setAttribute('data-login-styles', 'true');
  document.head.appendChild(styleSheet);
}

export default LoginPage;