﻿import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import GlobalHeader from './GlobalHeader';
import CommentSection from './CommentSection';
import axios from 'axios';
import { BASE_API_HOST, GET_POST_DETAILS_ENDPOINT_URL, STAMP_POST_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/postDetails.scss';

const PostDetails = ({ isLogged }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [post, setPost] = useState(null);
  const [passportStamps, setPassportStamps] = useState(0);
  const [hasStamped, setHasStamped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!location.search.includes("reloaded=1")) {
      window.location.replace(location.pathname + "?reloaded=1");
    } else {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);
  useEffect(() => {
    fetchPost();
    setTimeout(() => setIsVisible(true), 100);
  }, [id]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleCloseFullscreen();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        } else if (e.key === 'ArrowLeft') {
          handlePrevImage();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, currentImageIndex]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${GET_POST_DETAILS_ENDPOINT_URL}/${id}/`, {
        withCredentials: true
      });
      setPost(response.data);
      setPassportStamps(response.data.passportStamps);
      setHasStamped(response.data.userHasStamped);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePassportStamp = async () => {
    try {
      const response = await axios.post(
        `${STAMP_POST_ENDPOINT_URL}/${id}/stamp/`,
        {},
        { withCredentials: true }
      );
      setPassportStamps(response.data.count);
      setHasStamped(response.data.stamped);
    } catch (error) {
      console.error('Failed to toggle stamp:', error);
    }
  };

  const handleImageClick = (index) => {
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

  const handleSharePost = async (e) => {
     e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: post.title,
      text: `Check out this post: ${post.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/anonymous.png';
    
    if (typeof image === 'object' && image.url) {
      image = image.url;
    }
    
    if (typeof image !== 'string') return '/anonymous.png';
    
    if (image.startsWith('http')) return image;
    return `${BASE_API_HOST}${image}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostTypeLabel = (type) => {
    const types = {
      jurnal: lang === 'ro' ? 'Jurnal' : 'Journal',
      recenzie: lang === 'ro' ? 'Recenzie' : 'Review',
      itinerariu: lang === 'ro' ? 'Itinerariu' : 'Itinerary',
      sfaturi: lang === 'ro' ? 'Sfaturi' : 'Tips',
      intrebari: lang === 'ro' ? 'Întrebări' : 'Questions',
      inapoilaCom: lang == 'ro' ? '← Înapoi la comunitate' : '← Back to community'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="post-details-container">
        <GlobalHeader isLogged={isLogged} />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-details-container">
        <GlobalHeader isLogged={isLogged} />
        <div className="error">Post not found</div>
      </div>
    );
  }

  return (
    <div className="post-details-container">
      <GlobalHeader isLogged={isLogged} />
      
      <div className="post-details-content">
        <button 
          className="back-btn"
          onClick={() => navigate('/social')}
          style={{
            transform: isVisible ? 'translateX(0)' : 'translateX(-30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {getPostTypeLabel('inapoilaCom')}
        </button>

        <article 
          className="post-article"
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s'
          }}
        >
          <header className="post-article-header">
            <div className="author-section">
              <img 
                src={post.author.avatar} 
                alt={post.author.username}
                className="author-avatar"
                onError={(e) => { e.target.src = '/anonymous.png'; }}
              />
              <div className="author-info">
                <h3>{post.author.username}</h3>
                <time>{formatDate(post.created_at)}</time>
              </div>
            </div>
            
            <div className="post-meta">
              <span className="post-type-badge">
                {getPostTypeLabel(post.post_type)}
              </span>
            </div>
          </header>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-tags-section">
            <div className="countries">
              {post.countries && post.countries.map((country, index) => (
                <span key={index} className="country-tag">
                  🏴 {country}
                </span>
              ))}
            </div>
            
            <div className="travel-info">
              <span className="travel-type">👥 {post.travelType}</span>
              <span className="theme">🎯 {post.theme}</span>
            </div>
          </div>

          {post.images && post.images.length > 0 && (
            <div className="post-image-container">
              <div className="post-image" onClick={handleImageClick}>
                <img 
                  src={getImageUrl(post.images[previewImageIndex])} 
                  alt={`${post.title} ${previewImageIndex + 1}`}
                />
                <div className="image-overlay">
                  <span className="zoom-icon">🔍</span>
                </div>
                
                {post.images.length > 1 && (
                  <>
                    <button className="nav-btn prev-btn" onClick={handlePreviewPrev}>‹</button>
                    <button className="nav-btn next-btn" onClick={handlePreviewNext}>›</button>
                  </>
                )}
              </div>
              
              {post.images.length > 1 && (
                <div className="preview-indicators">
                  {post.images.map((_, index) => (
                    <div
                      key={index}
                      className={`indicator ${index === previewImageIndex ? 'active' : ''}`}
                      onClick={() => setPreviewImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="post-content">
            {post.content && post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="post-tags">
            {post.tags && post.tags.map((tag, index) => (
              <span key={index} className="hashtag">
                #{tag}
              </span>
            ))}
          </div>

          <div className="post-actions">
            <div className="action-buttons">
              <button 
                className={`passport-stamp-btn ${hasStamped ? 'stamped' : ''}`}
                onClick={handlePassportStamp}
              >
                <span className="passport-icon">📓</span>
                <span>{passportStamps} passport stamps</span>
              </button>
              
              <button 
                className="share-btn"
                onClick={handleSharePost}
              >
                <span className="share-icon">🔗</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </article>

        <CommentSection 
          postId={post.id} 
          isLogged={isLogged}
          isVisible={isVisible}
        />
      </div>

      {isFullscreen && post.images && createPortal(
        <div 
          className="fullscreen-modal"
          onClick={handleCloseFullscreen}
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

export default PostDetails;