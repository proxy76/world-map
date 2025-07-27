import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import '../styles/ItineraryViewModal.scss';

const ItineraryViewModal = ({ isOpen, onClose, itineraries, countryName }) => {
  const { lang } = useLanguage();
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  if (!isOpen) return null;

  const handleItinerarySelect = (itinerary) => {
    setSelectedItinerary(itinerary);
  };

  const handleBackToList = () => {
    setSelectedItinerary(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="itinerary-view-modal-overlay" onClick={onClose}>
      <div className="itinerary-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            {selectedItinerary ? (
              <>
                <button className="back-btn" onClick={handleBackToList}>
                  ← {translations[lang].backToList || 'Back'}
                </button>
                <h2>{selectedItinerary.title.replace('🗺️ ', '')}</h2>
                <div className="header-badges">
                  {selectedItinerary.is_private && (
                    <span className="private-badge">🔒 {translations[lang].private || 'Private'}</span>
                  )}
                  <span className="days-badge">
                    📅 {selectedItinerary.itinerary_data?.total_days || 0} {translations[lang].days || 'days'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="country-info">
                  <h2>🗺️ {translations[lang].itineraries || 'Itineraries'}</h2>
                  <span className="country-name">{countryName}</span>
                </div>
                <div className="total-count">
                  {itineraries.length} {itineraries.length === 1 ? (translations[lang].itinerary || 'Itinerary') : (translations[lang].itineraries || 'Itineraries')}
                </div>
              </>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="itinerary-modal-content">
          {!selectedItinerary ? (
            <div className="itineraries-list-view">
              {itineraries.length === 0 ? (
                <div className="no-itineraries">
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>{translations[lang].noItinerariesYet || 'No itineraries yet'}</h3>
                    <p>{translations[lang].createFirstItinerary || 'Create your first itinerary to start planning your trip!'}</p>
                  </div>
                </div>
              ) : (
                <div className="itineraries-grid">
                  {itineraries.map((itinerary, index) => (
                    <div key={index} className="itinerary-card" onClick={() => handleItinerarySelect(itinerary)}>
                      <div className="card-header">
                        <h3>{itinerary.title.replace('🗺️ ', '')}</h3>
                        <div className="card-badges">
                          {itinerary.is_private && (
                            <span className="private-badge">🔒</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="card-stats">
                        <div className="stat">
                          <span className="stat-icon">📅</span>
                          <span className="stat-value">{itinerary.itinerary_data?.total_days || 0}</span>
                          <span className="stat-label">{translations[lang].days || 'days'}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">🎯</span>
                          <span className="stat-value">{itinerary.itinerary_data?.total_activities || 0}</span>
                          <span className="stat-label">{translations[lang].activities || 'activities'}</span>
                        </div>
                      </div>

                      {itinerary.itinerary_data?.description && (
                        <div className="card-description">
                          <p>{itinerary.itinerary_data.description}</p>
                        </div>
                      )}

                      <div className="card-date">
                        <span className="created-label">{translations[lang].created || 'Created'}</span>
                        <span className="created-date">{new Date(itinerary.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="card-action">
                        <span className="view-btn">{translations[lang].viewDetails || 'View Details'} →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="itinerary-detail-view">
              {selectedItinerary.itinerary_data?.description && (
                <div className="itinerary-description">
                  <h4>📝 {translations[lang].description || 'Description'}</h4>
                  <p>{selectedItinerary.itinerary_data.description}</p>
                </div>
              )}

              <div className="itinerary-timeline">
                <h4>🗓️ {translations[lang].timeline || 'Timeline'}</h4>
                {selectedItinerary.itinerary_data?.days?.map((day, dayIndex) => (
                  <div key={dayIndex} className="timeline-day">
                    <div className="day-marker">
                      <div className="day-number">{dayIndex + 1}</div>
                      <div className="day-line"></div>
                    </div>
                    
                    <div className="day-content">
                      <div className="day-header">
                        <div className="day-date">
                          <h5>{formatDate(day.date)}</h5>
                          {day.title && <span className="day-title">{day.title}</span>}
                        </div>
                      </div>

                      <div className="day-activities">
                        {day.activities?.length > 0 ? (
                          day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="activity">
                              <div className="activity-main">
                                <div className="activity-header">
                                  <span className="activity-name">{activity.name}</span>
                                  {activity.time && (
                                    <span className="activity-time">🕐 {activity.time}</span>
                                  )}
                                </div>
                                
                                {activity.location && (
                                  <div className="activity-location">
                                    📍 {activity.location}
                                  </div>
                                )}
                                
                                {activity.notes && (
                                  <div className="activity-notes">
                                    💭 {activity.notes}
                                  </div>
                                )}
                                
                                <div className="activity-extras">
                                  {activity.estimatedCost && (
                                    <span className="activity-cost">💰 {activity.estimatedCost}</span>
                                  )}
                                  {activity.website && (
                                    <a href={activity.website} target="_blank" rel="noopener noreferrer" className="activity-website">
                                      🌐 {translations[lang].website || 'Website'}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-activities">
                            <span>📝 {translations[lang].noActivitiesPlanned || 'No activities planned for this day'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryViewModal;
