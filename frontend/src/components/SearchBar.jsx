import React, { useState, useEffect } from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";

const SearchBar = ({ onSearch, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { lang } = useLanguage();

  useEffect(() => {
    if (searchTerm.trim() === '') {
      onClear();
    } else {
      onSearch(searchTerm.trim());
    }
  }, [searchTerm, onSearch, onClear]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="searchBarContainer">
      <div className="searchBarWrapper">
        <input
          type="text"
          placeholder={translations[lang].searchPlaceholder}
          value={searchTerm}
          onChange={handleInputChange}
          className="searchInput"
        />
        {searchTerm && (
          <button 
            onClick={clearSearch} 
            className="clearButton"
            title={translations[lang].clearSearch}
          >
            ×
          </button>
        )}
        <div className="searchIcon">
          🔍
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
