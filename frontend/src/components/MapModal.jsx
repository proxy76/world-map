import React from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/MapModal.scss';


const MapModal = ({ isOpen, onClose, capital, countryName }) => {
    const { lang } = useLanguage();
    
    if (!isOpen) return null;

    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(capital + ', ' + countryName)}&zoom=12`;

    return (
        <div className="map-modal-overlay" onClick={onClose}>
            <div className="map-modal-content" onClick={e => e.stopPropagation()}>
                <div className="map-modal-header">
                    <h2>{translations[lang]?.mapOf || 'Map of'} {capital}</h2>
                    <button 
                        className="map-modal-close"
                        onClick={onClose}
                        aria-label={translations[lang]?.close || 'Close'}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="map-modal-body">
                    {GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY_HERE' ? (
                        <iframe
                            src={mapSrc}
                            width="100%"
                            height="400"
                            style={{ border: 0, borderRadius: '12px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map of ${capital}`}
                        />
                    ) : (
                        <div className="map-placeholder">
                            <div className="map-placeholder-content">
                                <h3>{translations[lang]?.mapUnavailable || 'Map Unavailable'}</h3>
                                <p>{translations[lang]?.apiKeyRequired || 'Google Maps API key required'}</p>
                                <p>{translations[lang]?.addApiKey || 'Please add your API key to REACT_APP_GOOGLE_MAPS_API_KEY environment variable'}</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="map-modal-footer">
                    <p className="map-info">
                        {translations[lang]?.showingLocation || 'Showing location of'} <strong>{capital}</strong> {translations[lang]?.in || 'in'} <strong>{countryName}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
