﻿import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import { countries } from '../utils/countries';
import axios from 'axios';
import { BACKEND_BASE_URL, STAMP_POST_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/postCard.scss';
const PostCard = ({ post, isVisible, delay = 0, onStampUpdate }) => {
  const [isPrivate, setIsPrivate] = useState(post.is_private);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [passportStamps, setPassportStamps] = useState(post.passport_count || 0);
  const [hasStamped, setHasStamped] = useState(post.user_has_stamped || false);
  const [isStamping, setIsStamping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const translateCountryName = (countryName) => {
    if (!countryName) return countryName;
    const roIndex = countries.ro.findIndex(country => 
      country.toLowerCase() === countryName.toLowerCase()
    );
    if (roIndex !== -1 && countries[lang] && countries[lang][roIndex]) {
      return countries[lang][roIndex];
    }
    return countryName;
  };
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);
  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isFullscreen, currentImageIndex]);
  const handlePassportStamp = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isStamping) return;
    
    const currentScrollPosition = window.scrollY;
    
    try {
      setIsStamping(true);
      const response = await axios.post(
        `${STAMP_POST_ENDPOINT_URL}/${post.id}/stamp/`,
        {},
        { withCredentials: true }
      );
      setPassportStamps(response.data.count);
      setHasStamped(response.data.stamped);
      
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollPosition);
      });
      
      if (onStampUpdate) {
        onStampUpdate(post.id, response.data.count, response.data.stamped);
      }
    } catch (error) {
      console.error('Failed to toggle stamp:', error);
    } finally {
      setIsStamping(false);
    }
  };
  const handleSharePost = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: post.title,
      text: `Check out this post: ${post.title}`,
      url: `${window.location.origin}/social/post/${post.id}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sha8ring:', error);
    }
  };
  const handlePostClick = () => {
    navigate(`/social/post/${post.id}`);
  };

  const handlePrivacyToggle = async (e) => {
    e.stopPropagation();
    if (privacyLoading) return;
    setPrivacyLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_BASE_URL}/posts/${post.id}/edit_privacy/`,
        { isPrivate: !isPrivate },
        { withCredentials: true }
      );
      setIsPrivate(response.data.is_private);
    } catch (error) {
      alert('Failed to update privacy');
    } finally {
      setPrivacyLoading(false);
    }
  };
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(previewImageIndex);
    setIsFullscreen(true);
  };
  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };
  const handleNextImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };
  const handlePrevImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };
  const handlePreviewNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.images && post.images.length > 1) {
      setPreviewImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };
  const handlePreviewPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.images && post.images.length > 1) {
      setPreviewImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseFullscreen();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    }
  };
  const getValidImages = () => {
    if (!post.images || !Array.isArray(post.images)) return [];
    return post.images.filter(img => 
      img && 
      typeof img === 'string' && 
      img.trim() !== '' && 
      img !== 'undefined' && 
      img !== 'null'
    );
  };
  const validImages = getValidImages();
  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : BACKEND_BASE_URL + image;
    }
    return '/anonymous.png';
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const getPostTypeLabel = (type) => {
    const types = {
      jurnal: lang === 'ro' ? 'Jurnal' : 'Journal',
      recenzie: lang === 'ro' ? 'Recenzie' : 'Review',
      itinerariu: lang === 'ro' ? 'Itinerariu' : 'Itinerary',
      sfaturi: lang === 'ro' ? 'Sfaturi' : 'Tips',
      intrebari: lang === 'ro' ? 'Întrebări' : 'Questions'
    };
    return types[type] || type;
  };
  return (
    <div 
      className="post-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`
      }}
    >
      <div className="post-content-area" onClick={handlePostClick}>
        <div className="post-header">
          <div className="author-info">
            <img 
              src={post.author.avatar} 
              alt={post.author.username}
              className="author-avatar"
              onError={(e) => { e.target.src = '/anonymous.png'; }}
            />
            <div className="author-details">
              <span className="author-name">{post.author.username}</span>
              <span className="post-date">{formatDate(post.created_at)}</span>
            </div>
          </div>
          <div className="post-type-badge">
            {getPostTypeLabel(post.post_type)}
          </div>
        {/* Privacy toggle for user's own posts */}
        {post.is_own_post && (
          <button
            className={`privacy-toggle-btn${privacyLoading ? ' loading' : ''}`}
            onClick={handlePrivacyToggle}
            disabled={privacyLoading}
            title={isPrivate ? 'Make Public' : 'Make Private'}
            style={{
              marginLeft: '10px',
              background: isPrivate
                ? 'linear-gradient(90deg, #ff6a6a 0%, #ffb86c 100%)'
                : 'linear-gradient(90deg, #66eaa0 0%, #4facfe 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.85rem',
              padding: '0.28rem 0.7rem',
              minWidth: '80px',
              maxWidth: '120px',
              boxShadow: isPrivate
                ? '0 2px 8px rgba(255, 106, 106, 0.10)'
                : '0 2px 8px rgba(102, 234, 160, 0.10)',
              cursor: privacyLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, color 0.2s, opacity 0.2s',
              opacity: privacyLoading ? 0.7 : 1,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4em',
              height: '32px',
              lineHeight: '1',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <span style={{fontSize: '1em'}}>{isPrivate ? '🔒' : '🌍'}</span>
            {isPrivate ? 'Private' : 'Public'}
            {privacyLoading && (
              <span className="privacy-spinner" style={{marginLeft: '6px'}}>
                <svg width="14" height="14" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#fff" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </span>
            )}
          </button>
        )}
        </div>
        <div className="post-content">
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            {isPrivate && (
              <span className="privacy-indicator" title={translations[lang]?.privatePost || 'Private Post'}>
                🔒
              </span>
            )}
          </div>
          {post.images && post.images.length > 0 && (
            <div className="post-image-container">
              <div className="post-image" onClick={handleImageClick}>
                <img 
                  src={getImageUrl(post.images[previewImageIndex])}
                  alt={`${post.title} ${previewImageIndex + 1}`}
                  onError={(e) => {
                    console.log('Image failed to load:', post.images[previewImageIndex]);
                    e.target.style.display = 'none';
                  }}
                />
                {}
                <div className="image-overlay">
                  {post.images.length > 1 && (
                    <>
                      <button className="preview-nav-btn prev" onClick={handlePreviewPrev}>‹</button>
                      <button className="preview-nav-btn next" onClick={handlePreviewNext}>›</button>
                      <div className="image-counter">
                        {previewImageIndex + 1} / {post.images.length}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {}
              {post.images.length > 1 && (
                <div className="preview-indicators">
                  {post.images.map((_, index) => (
                    <div
                      key={index}
                      className={`preview-indicator ${index === previewImageIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewImageIndex(index);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {(!post.images || post.images.length === 0) && (
            <>
              {post.post_type === 'itinerariu' && post.itinerary_data ? (
                <div className="itinerary-content">
                  <p className="post-excerpt">{post.content}</p>
                  <div className="itinerary-details">
                    <div className="itinerary-summary">
                      <div className="summary-stats">
                        <span className="stat">
                          <strong>{post.itinerary_data.total_days || 0}</strong> 
                          {lang === 'ro' ? ' zile' : ' days'}
                        </span>
                        <span className="stat">
                          <strong>{post.itinerary_data.total_activities || 0}</strong> 
                          {lang === 'ro' ? ' activități' : ' activities'}
                        </span>
                      </div>
                    </div>
                    
                    {post.itinerary_data.days && post.itinerary_data.days.length > 0 && (
                      <div className="itinerary-preview">
                        <h4>{lang === 'ro' ? 'Planul zilnic:' : 'Daily Plan:'}</h4>
                        {post.itinerary_data.days.slice(0, 3).map((day, index) => (
                          <div key={index} className="day-preview">
                            <div className="day-header">
                              <span className="day-number">{lang === 'ro' ? 'Ziua' : 'Day'} {day.dayNumber || index + 1}</span>
                              {day.title && <span className="day-title">{day.title}</span>}
                            </div>
                            {day.activities && day.activities.length > 0 && (
                              <div className="activities-preview">
                                {day.activities.slice(0, 2).map((activity, actIndex) => (
                                  <div key={actIndex} className="activity-preview">
                                    <span className="activity-category-icon">
                                      {activity.category === 'attraction' ? '🏛️' :
                                       activity.category === 'restaurant' ? '🍽️' :
                                       activity.category === 'activity' ? '🎯' :
                                       activity.category === 'transport' ? '🚗' :
                                       activity.category === 'accommodation' ? '🏨' :
                                       activity.category === 'shopping' ? '🛍️' : '📝'}
                                    </span>
                                    <span className="activity-title">{activity.title}</span>
                                    {activity.time && <span className="activity-time">{activity.time}</span>}
                                  </div>
                                ))}
                                {day.activities.length > 2 && (
                                  <div className="more-activities">
                                    +{day.activities.length - 2} {lang === 'ro' ? 'mai multe' : 'more'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {post.itinerary_data.days.length > 3 && (
                          <div className="more-days">
                            +{post.itinerary_data.days.length - 3} {lang === 'ro' ? 'mai multe zile' : 'more days'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="post-excerpt">{post.content}</p>
              )}
            </>
          )}
          <div className="post-tags">
            {post.countries_visited && post.countries_visited.map((country, index) => (
              <span key={index} className="country-tag">
                🏴 {translateCountryName(country)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="post-actions">
        <div 
          className={`passport-stamp-btn ${hasStamped ? 'stamped' : ''} ${isStamping ? 'loading' : ''}`}
          onClick={handlePassportStamp}
          role="button"
          aria-label="Stamp passport"
        >
          <span className="passport-icon">📓</span>
          <span className="stamp-count">{passportStamps}</span>
        </div>
        <div className="action-buttons">
          <button 
            type="button"
            className="share-btn"
            onClick={handleSharePost}
          >
            <span className="share-icon">🔗</span>
            Share
          </button>
          <div className="comments-count">
            💬 {post.comments_count}
          </div>
        </div>
      </div>
      {isHovered && (
        <div className="post-shimmer"></div>
      )}
      {}
      {isFullscreen && createPortal(
        <div 
          className="fullscreen-modal"
          onClick={handleCloseFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseFullscreen}>✕</button>
            <div className="fullscreen-image-container">
              {post.images.length > 1 && (
                <button className="nav-btn prev-btn" onClick={handlePrevImage}>‹</button>
              )}
              <img 
                src={getImageUrl(post.images[currentImageIndex])}
                alt={`${post.title} ${currentImageIndex + 1}`}
                className="fullscreen-image"
              />
              {post.images.length > 1 && (
                <button className="nav-btn next-btn" onClick={handleNextImage}>›</button>
              )}
            </div>
            {post.images.length > 1 && (
              <div className="image-indicators">
                {post.images.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default PostCard;