﻿import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import { searchCountries, countries } from '../utils/countries';
import '../styles/postFilter.scss';
const PostFilter = ({ filters, setFilters, isVisible, onApplyFilters }) => {
  const { lang } = useLanguage();
  const getDisplayCountry = (backendCountry) => {
    if (!backendCountry) return '';
    if (lang === 'en') {
      const roIndex = countries.ro.indexOf(backendCountry);
      if (roIndex !== -1 && countries.en[roIndex]) {
        return countries.en[roIndex];
      }
    }
    return backendCountry;
  };
  const [countryQuery, setCountryQuery] = useState(getDisplayCountry(filters.country || ''));
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countryResults, setCountryResults] = useState([]);
  const countryInputRef = useRef(null);
  const countryList = countries[lang] || countries.ro;
  const postTypes = [
    { value: '', label: translations[lang].all },
    { value: 'jurnal', label: translations[lang].journal },
    { value: 'recenzie', label: translations[lang].review },
    { value: 'itinerariu', label: translations[lang].itinerary },
    { value: 'sfaturi', label: translations[lang].tips },
    { value: 'intrebari', label: translations[lang].questions }
  ];
  const travelTypes = [
    { value: '', label: translations[lang].all },
    { value: 'solo', label: translations[lang].solo },
    { value: 'family', label: translations[lang].family },
    { value: 'friends', label: translations[lang].friends },
    { value: 'honeymoon', label: translations[lang].honeymoon },
    { value: 'business', label: translations[lang].business },
    { value: 'guided_tour', label: translations[lang].guidedTour },
    { value: 'couple', label: translations[lang].couple },
    { value: 'backpacking', label: translations[lang].backpacking }
  ];
  const themes = [
    { value: '', label: translations[lang].all },
    { value: 'natura', label: translations[lang].nature },
    { value: 'mare', label: translations[lang].sea },
    { value: 'cultura', label: translations[lang].culture },
    { value: 'gastronomie', label: translations[lang].gastronomy },
    { value: 'festival', label: translations[lang].festival },
    { value: 'relaxare', label: translations[lang].relaxation },
    { value: 'sport', label: translations[lang].sport }
  ];
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };
  const getDropdownStyle = () => {
    if (!countryInputRef.current) return { display: 'none' };
    const rect = countryInputRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      background: 'white',
      border: '2px solid #667eea',
      borderTop: 'none',
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxHeight: '200px',
      overflowY: 'auto'
    };
  };
  const searchInCountries = (query) => {
    return searchCountries(query, lang);
  };
  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setCountryQuery(value);
    if (value.length > 0) {
      const results = searchInCountries(value);
      setCountryResults(results);
      setShowCountryDropdown(true);
    } else {
      setCountryResults([]);
      setShowCountryDropdown(false);
      handleFilterChange('country', '');
    }
  };
  const selectCountry = (country) => {
    setCountryQuery(country);
    setShowCountryDropdown(false);
    setCountryResults([]);
    let countryForBackend = country;
    if (lang === 'en' && countries.en.includes(country)) {
      const index = countries.en.indexOf(country);
      countryForBackend = countries.ro[index]; 
    }
    else if (lang === 'ro' && countries.ro.includes(country)) {
      countryForBackend = country; 
    }
    else if (countries.en.includes(country)) {
      const index = countries.en.indexOf(country);
      countryForBackend = countries.ro[index];
    } else if (countries.ro.includes(country)) {
      countryForBackend = country;
    }
    handleFilterChange('country', countryForBackend);
  };
  const handleCountryInputBlur = () => {
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryInputRef.current && !countryInputRef.current.contains(event.target)) {
        const dropdown = document.querySelector('.country-dropdown-portal');
        if (dropdown && !dropdown.contains(event.target)) {
          setShowCountryDropdown(false);
        }
      }
    };
    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCountryDropdown]);
  useEffect(() => {
    const newDisplayCountry = getDisplayCountry(filters.country || '');
    if (newDisplayCountry !== countryQuery) {
      setCountryQuery(newDisplayCountry);
    }
  }, [filters.country, lang]);
  useEffect(() => {
    if (filters.country) {
      const newDisplayCountry = getDisplayCountry(filters.country);
      setCountryQuery(newDisplayCountry);
    }
  }, [lang]);
  const clearFilters = () => {
    const clearedFilters = {
      country: '',
      postType: '',
      travelType: '',
      theme: ''
    };
    setFilters(clearedFilters);
    setCountryQuery('');
    setCountryResults([]);
    setShowCountryDropdown(false);
  };
  return (
    <div 
      className="post-filter-container"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s'
      }}
    >
      <div className="filter-row">
        <div className="filter-group country-filter-group">
          <label>{translations[lang].country}:</label>
          <div className="country-autocomplete-container">
            <div className="country-autocomplete">
              <input
                ref={countryInputRef}
                type="text"
                placeholder={translations[lang].searchCountry}
                value={countryQuery}
                onChange={handleCountryInputChange}
                onBlur={handleCountryInputBlur}
                className="country-input"
              />
              {showCountryDropdown && createPortal(
                <div 
                  className="country-dropdown-portal"
                  style={getDropdownStyle()}
                >
                  {countryResults.length > 0 ? (
                    countryResults.map((country, index) => (
                      <div
                        key={index}
                        className="country-option"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCountry(country)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f8f9fa',
                          fontSize: '14px',
                          background: 'white',
                          color: '#333'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.color = '#333';
                        }}
                      >
                        🌎 {country}
                      </div>
                    ))
                  ) : (
                    <div className="country-option no-results" style={{
                      padding: '12px 16px',
                      color: '#999',
                      fontStyle: 'italic'
                    }}>
                      {translations[lang].noCountriesFound} "{countryQuery}"
                    </div>
                  )}
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
        <div className="filter-group">
          <label>{translations[lang].postType}:</label>
          <select
            value={filters.postType}
            onChange={(e) => handleFilterChange('postType', e.target.value)}
            className="filter-select"
          >
            {postTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{translations[lang].travelType}:</label>
          <select
            value={filters.travelType}
            onChange={(e) => handleFilterChange('travelType', e.target.value)}
            className="filter-select"
          >
            {travelTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>{translations[lang].theme}:</label>
          <select
            value={filters.theme}
            onChange={(e) => handleFilterChange('theme', e.target.value)}
            className="filter-select"
          >
            {themes.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="filter-actions">
        <button onClick={clearFilters} className="clear-filters">
          {translations[lang].clearFilters}
        </button>
        <button onClick={onApplyFilters} className="apply-filters">
          {translations[lang].applyFilters}
        </button>
      </div>
    </div>
  );
};
export default PostFilter;