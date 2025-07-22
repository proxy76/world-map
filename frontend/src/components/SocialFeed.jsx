﻿import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import GlobalHeader from './GlobalHeader';
import PostCard from './PostCard';
import PostFilter from './PostFilter';
import CreatePost from './CreatePost';
import axios from 'axios';
import { GET_POSTS_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/socialFeed.scss';
const SocialFeed = ({ isLogged }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filters, setFilters] = useState({
    country: '',
    postType: '',
    travelType: '',
    theme: ''
  });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.search.includes("reloaded=1")) {
      window.location.replace(location.pathname + "?reloaded=1");
    } else {
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchPosts();
  }, []);
  useEffect(() => {
    fetchPosts();
  }, [filters]);
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.country) params.country = filters.country;
      if (filters.postType) params.postType = filters.postType;
      if (filters.travelType) params.travelType = filters.travelType;
      if (filters.theme) params.theme = filters.theme;
      const response = await axios.get(GET_POSTS_ENDPOINT_URL, {
        withCredentials: true,
        params: params
      });
      setPosts(response.data.posts);
      setFilteredPosts(response.data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
    setFilteredPosts([newPost, ...filteredPosts]);
    setShowCreatePost(false);
  };
  const handleStampUpdate = (postId, newStampCount, hasStamped) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, passport_count: newStampCount, user_has_stamped: hasStamped }
          : post
      )
    );
  };
  if (!isLogged) {
    return (
      <div className="social-auth-required">
        <GlobalHeader isLogged={isLogged} />
        <div className="auth-message">
          <h2>{translations[lang].loginRequired || 'Login Required'}</h2>
          <p>{translations[lang].socialLoginMessage || 'Please login to access the travel community'}</p>
          <button onClick={() => navigate('/login')} className="auth-btn">
            {translations[lang].signIn || 'Sign In'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="social-feed-container">
      <GlobalHeader isLogged={isLogged} />
      <div className="social-content">
        <div className="social-actions">
          <button 
            className="create-post-btn"
            onClick={() => setShowCreatePost(true)}
            style={{
              transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.9)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s'
            }}
          >
            {translations[lang].createPost || 'Create Post'}
          </button>
        </div>
        <PostFilter 
          filters={filters} 
          setFilters={setFilters}
          isVisible={isVisible}
          onApplyFilters={fetchPosts}
        />
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading posts...</p>
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                isVisible={isVisible}
                delay={index * 0.1}
                onStampUpdate={handleStampUpdate}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="no-posts">
                <p>No posts found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleNewPost}
        />
      )}
    </div>
  );
};
export default SocialFeed;