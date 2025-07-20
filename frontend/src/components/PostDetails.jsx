import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetchPost();
    setTimeout(() => setIsVisible(true), 100);
  }, [id]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      intrebari: lang === 'ro' ? 'Întrebări' : 'Questions'
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
          ← Înapoi la comunitate
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
                <time>{formatDate(post.createdAt)}</time>
              </div>
            </div>
            
            <div className="post-meta">
              <span className="post-type-badge">
                {getPostTypeLabel(post.postType)}
              </span>
            </div>
          </header>

          <h1 className="post-title">{post.title}</h1>

          <div className="post-tags-section">
            <div className="countries">
              {post.countries.map((country, index) => (
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
            <div className="post-images">
              {post.images.map((image, index) => (
                <img key={index} src={BASE_API_HOST + image} alt={`${post.title} ${index + 1}`} />
              ))}
            </div>
          )}

          <div className="post-content">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="hashtag">
                #{tag}
              </span>
            ))}
          </div>

          <div className="post-actions">
            <button 
              className={`passport-stamp-btn ${hasStamped ? 'stamped' : ''}`}
              onClick={handlePassportStamp}
            >
              <span className="passport-icon">📓</span>
              <span>{passportStamps} passport stamps</span>
            </button>
          </div>
        </article>

        <CommentSection 
          postId={post.id} 
          isLogged={isLogged}
          isVisible={isVisible}
        />
      </div>
    </div>
  );
};

export default PostDetails;