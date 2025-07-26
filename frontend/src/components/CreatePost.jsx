import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import axios from 'axios';
import { CREATE_POST_ENDPOINT_URL } from '../utils/ApiHost';
import { searchCountries, countries } from '../utils/countries';
import '../styles/createPost.scss';

const CreatePost = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    countries: [],
    postType: 'jurnal',
    travelType: 'solo',
    theme: 'natura',
    images: [],
    tags: [],
    isPrivate: false
  });
  const [newCountry, setNewCountry] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countryResults, setCountryResults] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { lang } = useLanguage();
  const countryInputRef = useRef(null);

  const translateCountryName = (countryName) => {
    if (lang === 'en') {
      const index = countries.ro.indexOf(countryName);
      return index !== -1 ? countries.en[index] : countryName;
    }
    return countryName; 
  };

  const postTypes = [
    { value: 'jurnal', label: translations[lang].journal },
    { value: 'recenzie', label: translations[lang].review },
    { value: 'itinerariu', label: translations[lang].itinerary },
    { value: 'sfaturi', label: translations[lang].tips },
    { value: 'intrebari', label: translations[lang].questions }
  ];

  const travelTypes = [
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
    { value: 'natura', label: translations[lang].nature },
    { value: 'mare', label: translations[lang].sea },
    { value: 'cultura', label: translations[lang].culture },
    { value: 'gastronomie', label: translations[lang].gastronomy },
    { value: 'festival', label: translations[lang].festival },
    { value: 'relaxare', label: translations[lang].relaxation },
    { value: 'sport', label: translations[lang].sport }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryInputChange = (e) => {
    const value = e.target.value;
    setNewCountry(value);
    
    if (value.length > 0) {
      const results = searchCountries(value, lang);
      setCountryResults(results);
      setShowCountryDropdown(true);
    } else {
      setCountryResults([]);
      setShowCountryDropdown(false);
    }
  };

  const getDropdownStyle = () => {
    if (!countryInputRef.current) return {};
    
    const rect = countryInputRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 2,
      left: rect.left + window.scrollX,
      width: rect.width
    };
  };

  const selectCountry = (country) => {
    setNewCountry(country);
    setShowCountryDropdown(false);
    setCountryResults([]);
  };

  const handleCountryInputBlur = () => {
    setTimeout(() => {
      setShowCountryDropdown(false);
    }, 150);
  };

  const addCountry = () => {
    const countryToAdd = newCountry.trim();
    

    let countryToStore = null;
    
    if (countries.ro.includes(countryToAdd)) {
      countryToStore = countryToAdd; 
    } else if (countries.en.includes(countryToAdd)) {
      const index = countries.en.indexOf(countryToAdd);
      countryToStore = countries.ro[index]; 
    }
    
    if (!countryToStore) {
      alert(translations[lang].selectValidCountry);
      return;
    }
    
    if (countryToStore && !formData.countries.includes(countryToStore)) {
      setFormData(prev => ({
        ...prev,
        countries: [...prev.countries, countryToStore]
      }));
      setNewCountry('');
      setShowCountryDropdown(false);
      setCountryResults([]);
    }
  };

  const removeCountry = (country) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.filter(c => c !== country)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Titlul și conținutul sunt obligatorii!');
      return;
    }

    if (formData.countries.length === 0) {
      alert(translations[lang].addAtLeastOneCountry);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('countries', JSON.stringify(formData.countries));
      formDataToSend.append('postType', formData.postType);
      formDataToSend.append('travelType', formData.travelType);
      formDataToSend.append('theme', formData.theme);
      formDataToSend.append('travel_duration', formData.travel_duration || '');
      formDataToSend.append('isPrivate', formData.isPrivate);
      
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      const response = await axios.post(
        CREATE_POST_ENDPOINT_URL,
        formDataToSend,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const newPost = {
        id: response.data.post.id,
        author: {
          id: response.data.post.author.id,
          username: response.data.post.author.username,
          avatar: response.data.post.author.avatar
        },
        title: response.data.post.title,
        content: response.data.post.content,
        countries_visited: response.data.post.countries_visited,
        post_type: response.data.post.post_type,
        travel_type: response.data.post.travel_type,
        theme: response.data.post.theme,
        images: response.data.post.images,
        passport_count: response.data.post.passport_count,
        comments_count: response.data.post.comments_count,
        created_at: response.data.post.created_at,
        user_has_stamped: response.data.post.user_has_stamped
      };

      onSubmit(newPost);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Eroare la crearea postării!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-modal">
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>✏️ Creează o postare nouă</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Titlu *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Un titlu captivant pentru postarea ta..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tip postare *</label>
              <select
                value={formData.postType}
                onChange={(e) => handleInputChange('postType', e.target.value)}
              >
                {postTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tip călătorie *</label>
              <select
                value={formData.travelType}
                onChange={(e) => handleInputChange('travelType', e.target.value)}
              >
                {travelTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tematică *</label>
              <select
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                {themes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Conținut *</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Povestește-ne despre experiența ta de călătorie..."
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Țări vizitate *</label>
            <div className="add-item-container country-autocomplete-container">
              <div className="country-autocomplete">
                <input
                  ref={countryInputRef}
                  type="text"
                  value={newCountry}
                  onChange={handleCountryInputChange}
                  onBlur={handleCountryInputBlur}
                  placeholder={translations[lang].searchSelectCountry}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                />
                {showCountryDropdown && (
                  <div 
                    className={`country-dropdown ${countryResults.length === 1 ? 'single-result' : ''}`}
                    style={getDropdownStyle()}
                  >
                    {countryResults.length > 0 ? (
                      countryResults.map((country, index) => (
                        <div
                          key={index}
                          className="country-option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCountry(country)}
                        >
                          🌍 {country}
                        </div>
                      ))
                    ) : (
                      <div className="country-option no-results">
                        {translations[lang].noCountriesFound} "{newCountry}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button type="button" onClick={addCountry} className="add-btn">
                {translations[lang].add}
              </button>
            </div>
            <div className="tags-container">
              {formData.countries.map(country => (
                <span key={country} className="tag">
                  🏴 {translateCountryName(country)}
                  <button type="button" onClick={() => removeCountry(country)}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tag-uri (opțional)</label>
            <div className="add-item-container">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adaugă un tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button type="button" onClick={addTag} className="add-btn">
                Adaugă
              </button>
            </div>
            <div className="tags-container">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Imagini (opțional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            <div className="images-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img src={URL.createObjectURL(image)} alt={`Preview ${index}`} />
                  <button type="button" onClick={() => removeImage(index)} className="remove-image">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group privacy-toggle">
            <label className="privacy-label">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="privacy-checkbox"
              />
              <span className="checkmark"></span>
              <span className="privacy-text">
                🔒 {translations[lang]?.privatePost || 'Postare privată'} 
                <small>({translations[lang]?.privatePostDesc || 'Vizibilă doar pentru tine și în jurnalul de călătorie'})</small>
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Anulează
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Se publică...' : 'Publică postarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;