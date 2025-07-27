import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PROFILE_INFO_ENDPOINT_URL, GET_USER_POSTS_ENDPOINT_URL } from '../utils/ApiHost';
import { useLanguage } from "../context/LanguageContext";
import '../styles/Achievements.scss';

const Achievements = ({ profileInfo, isVisible }) => {
  const { lang } = useLanguage();
  const [achievementData, setAchievementData] = useState({
    countriesVisited: [],
    countriesWishlist: [],
    hasProfilePicture: false,
    userPosts: [],
    uniqueCountriesFromPosts: []
  });

  const achievementsConfig = [
    {
      id: 'first_visit',
      title: {
        en: 'First Steps',
        ro: 'Primii Pași'
      },
      description: {
        en: 'Visit your first country',
        ro: 'Vizitează prima țară'
      },
      icon: '🗺️',
      target: 1,
      type: 'visits',
      color: '#667eea'
    },
    {
      id: 'explorer',
      title: {
        en: 'Explorer',
        ro: 'Explorator'
      },
      description: {
        en: 'Visit 5 countries',
        ro: 'Vizitează 5 țări'
      },
      icon: '🌍',
      target: 5,
      type: 'visits',
      color: '#f093fb'
    },
    {
      id: 'wanderer',
      title: {
        en: 'World Wanderer',
        ro: 'Călător Mondial'
      },
      description: {
        en: 'Visit 10 countries',
        ro: 'Vizitează 10 țări'
      },
      icon: '🌎',
      target: 10,
      type: 'visits',
      color: '#ffc658'
    },
    {
      id: 'dreamer',
      title: {
        en: 'Big Dreamer',
        ro: 'Visător Mare'
      },
      description: {
        en: 'Add 20 countries to bucketlist',
        ro: 'Adaugă 20 țări în bucketlist'
      },
      icon: '🎯',
      target: 20,
      type: 'bucketlist',
      color: '#82ca9d'
    },
    {
      id: 'collector',
      title: {
        en: 'Dream Collector',
        ro: 'Colecționar de Vise'
      },
      description: {
        en: 'Add 30 countries to bucketlist',
        ro: 'Adaugă 30 țări în bucketlist'
      },
      icon: '🌟',
      target: 30,
      type: 'bucketlist',
      color: '#ff7979'
    },
    {
      id: 'profile_pic',
      title: {
        en: 'Show Yourself',
        ro: 'Arată-te'
      },
      description: {
        en: 'Upload a profile picture',
        ro: 'Încarcă o poză de profil'
      },
      icon: '📸',
      target: 1,
      type: 'profile',
      color: '#a29bfe'
    }
  ];

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(GET_USER_POSTS_ENDPOINT_URL, { withCredentials: true });
      const posts = response.data || [];
      
      const allCountries = posts.flatMap(post => post.countries_visited || []);
      const uniqueCountries = [...new Set(allCountries)];
      
      setAchievementData(prev => ({
        ...prev,
        userPosts: posts,
        uniqueCountriesFromPosts: uniqueCountries
      }));
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setAchievementData(prev => ({
        ...prev,
        userPosts: [],
        uniqueCountriesFromPosts: []
      }));
    }
  };

  useEffect(() => {
    if (profileInfo) {
      setAchievementData(prev => ({
        ...prev,
        countriesVisited: profileInfo.countriesVisited || [],
        countriesWishlist: profileInfo.countriesWishlist || [],
        hasProfilePicture: profileInfo.profile_picture && !profileInfo.profile_picture.includes('anonymous.png')
      }));
      
      fetchUserPosts();
    }
  }, [profileInfo]);

  const getAchievementProgress = (achievement) => {
    let current = 0;
    
    switch (achievement.type) {
      case 'visits':
        current = achievementData.countriesVisited.length;
        break;
      case 'bucketlist':
        current = achievementData.countriesWishlist.length;
        break;
      case 'profile':
        current = achievementData.hasProfilePicture ? 1 : 0;
        break;
      default:
        current = 0;
    }
    
    return {
      current: Math.min(current, achievement.target),
      percentage: Math.min((current / achievement.target) * 100, 100),
      isCompleted: current >= achievement.target
    };
  };

  const AchievementCard = ({ achievement, index }) => {
    const progress = getAchievementProgress(achievement);
    
    return (
      <div 
        className={`achievement-card ${progress.isCompleted ? 'completed' : ''}`}
        style={{
          '--achievement-color': achievement.color,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.2 + index * 0.1}s`
        }}
      >
        <div className="achievement-card-inner">
          <div className="achievement-icon">
            <span className="achievement-emoji">{achievement.icon}</span>
          </div>
          
          <div className="achievement-content">
            <h3 className="achievement-title">
              {achievement.title[lang] || achievement.title.en}
            </h3>
            <p className="achievement-description">
              {achievement.description[lang] || achievement.description.en}
            </p>
            
            <div className="achievement-progress">
              <div className="achievement-progress-text">
                <span className="achievement-current">{progress.current}</span>
                <span className="achievement-separator">/</span>
                <span className="achievement-target">{achievement.target}</span>
              </div>
              
              <div className="achievement-progress-bar">
                <div 
                  className="achievement-progress-fill"
                  style={{
                    width: `${progress.percentage}%`,
                    backgroundColor: achievement.color,
                    transition: 'width 1s ease-in-out'
                  }}
                >
                  <div className="achievement-progress-shine"></div>
                </div>
              </div>
              
              <div className="achievement-percentage">
                {Math.round(progress.percentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="achievements-container">
      <div 
        className="achievements-header"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s'
        }}
      >
        <h2 className="achievements-title">
          <span className="achievements-icon">🏆</span>
          {lang === 'ro' ? 'Realizări' : 'Achievements'}
        </h2>
        <p className="achievements-subtitle">
          {lang === 'ro' 
            ? 'Urmărește-ți progresul și deblochează noi realizări' 
            : 'Track your progress and unlock new achievements'
          }
        </p>
      </div>
      
      <div className="achievements-grid">
        {achievementsConfig.map((achievement, index) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Achievements;
