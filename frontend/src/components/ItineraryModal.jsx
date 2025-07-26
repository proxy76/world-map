import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/ItineraryModal.scss';

const ItineraryModal = ({ isOpen, onClose, countryName, onSaveItinerary }) => {
  const { lang } = useLanguage();
  const [itinerary, setItinerary] = useState({
    title: '',
    description: '',
    days: [
      {
        id: '1',
        date: '',
        title: '',
        activities: []
      }
    ]
  });
  const [currentDay, setCurrentDay] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (isOpen && countryName) {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultDate = tomorrow.toISOString().split('T')[0];
      
      setItinerary(prev => ({
        ...prev,
        title: `${countryName} ${translations[lang]?.itinerary || 'Itinerary'}`,
        days: [{
          id: '1',
          date: defaultDate,
          title: '',
          activities: []
        }]
      }));
    }
  }, [isOpen, countryName, lang]);

  if (!isOpen) return null;

  const addNewDay = () => {
    // Calculate next date based on the last day's date
    const lastDay = itinerary.days[itinerary.days.length - 1];
    const lastDate = new Date(lastDay.date || new Date());
    lastDate.setDate(lastDate.getDate() + 1);
    const nextDate = lastDate.toISOString().split('T')[0];
    
    const newDay = {
      id: String(Date.now()),
      date: nextDate,
      title: '',
      activities: []
    };
    setItinerary(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
  };

  const removeDay = (dayIndex) => {
    if (itinerary.days.length <= 1) return;
    
    const newDays = itinerary.days.filter((_, index) => index !== dayIndex);
    
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
    
    if (currentDay >= newDays.length) {
      setCurrentDay(newDays.length - 1);
    }
  };

  const updateDayTitle = (dayIndex, title) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].title = title;
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const updateDayDate = (dayIndex, date) => {
    const newDays = [...itinerary.days];
    newDays[dayIndex].date = date;
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const addActivity = () => {
    const newActivity = {
      id: String(Date.now()),
      name: '',
      time: null, // Optional time (can be null or a time string)
      location: '',
      notes: '',
      website: '',
      estimatedCost: '',
      category: 'attraction'
    };
    
    const newDays = [...itinerary.days];
    newDays[currentDay].activities.push(newActivity);
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const updateActivity = (activityIndex, field, value) => {
    const newDays = [...itinerary.days];
    newDays[currentDay].activities[activityIndex][field] = value;
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const removeActivity = (activityIndex) => {
    const newDays = [...itinerary.days];
    newDays[currentDay].activities.splice(activityIndex, 1);
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newDays = [...itinerary.days];
    const activities = Array.from(newDays[currentDay].activities);
    const [reorderedItem] = activities.splice(result.source.index, 1);
    activities.splice(result.destination.index, 0, reorderedItem);
    
    newDays[currentDay].activities = activities;
    setItinerary(prev => ({
      ...prev,
      days: newDays
    }));
  };

  const handleSave = () => {
    if (!itinerary.title.trim()) {
      alert(translations[lang]?.itineraryTitleRequired || 'Please enter an itinerary title');
      return;
    }
    
    const hasActivities = itinerary.days.some(day => day.activities.length > 0);
    if (!hasActivities) {
      alert(translations[lang]?.itineraryNeedsActivities || 'Please add at least one activity');
      return;
    }

    setShowShareOptions(true);
  };

  const handleShare = (shareToSocial = false) => {
    const itineraryData = {
      ...itinerary,
      country: countryName,
      shareToSocial,
      createdAt: new Date().toISOString()
    };
    
    onSaveItinerary(itineraryData);
    setShowShareOptions(false);
    onClose();
    
    // Reset the form
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    setItinerary({
      title: '',
      description: '',
      days: [
        {
          id: '1',
          date: defaultDate,
          title: '',
          activities: []
        }
      ]
    });
    setCurrentDay(0);
  };

  const activityCategories = [
    { value: 'attraction', icon: '🏛️', label: translations[lang]?.attraction || 'Attraction' },
    { value: 'restaurant', icon: '🍽️', label: translations[lang]?.restaurant || 'Restaurant' },
    { value: 'activity', icon: '🎯', label: translations[lang]?.activity || 'Activity' },
    { value: 'transport', icon: '🚗', label: translations[lang]?.transport || 'Transport' },
    { value: 'accommodation', icon: '🏨', label: translations[lang]?.accommodation || 'Accommodation' },
    { value: 'shopping', icon: '🛍️', label: translations[lang]?.shopping || 'Shopping' },
    { value: 'other', icon: '📝', label: translations[lang]?.other || 'Other' }
  ];

  return (
    <div className="itinerary-modal-overlay">
      <div className="itinerary-modal">
        <div className="itinerary-header">
          <h2>{translations[lang]?.createItinerary || 'Create Itinerary'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="itinerary-content">
          {/* Itinerary Basic Info */}
          <div className="itinerary-basic-info">
            <div className="input-group">
              <label>{translations[lang]?.itineraryTitle || 'Itinerary Title'}</label>
              <input
                type="text"
                value={itinerary.title}
                onChange={(e) => setItinerary(prev => ({ ...prev, title: e.target.value }))}
                placeholder={`${countryName} ${translations[lang]?.itinerary || 'Itinerary'}`}
              />
            </div>
            <div className="input-group">
              <label>{translations[lang]?.description || 'Description'} ({translations[lang]?.optional || 'Optional'})</label>
              <textarea
                value={itinerary.description}
                onChange={(e) => setItinerary(prev => ({ ...prev, description: e.target.value }))}
                placeholder={translations[lang]?.itineraryDescriptionPlaceholder || 'Brief description of your trip...'}
                rows={3}
              />
            </div>
          </div>

          {/* Days Navigation */}
          <div className="days-navigation">
            <div className="days-tabs">
              {itinerary.days.map((day, index) => (
                <button
                  key={day.id}
                  className={`day-tab ${currentDay === index ? 'active' : ''}`}
                  onClick={() => setCurrentDay(index)}
                >
                  {day.date ? new Date(day.date).toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  }) : `${translations[lang]?.day || 'Day'} ${index + 1}`}
                  {itinerary.days.length > 1 && (
                    <button
                      className="remove-day-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDay(index);
                      }}
                    >
                      ×
                    </button>
                  )}
                </button>
              ))}
              <button className="add-day-btn" onClick={addNewDay}>
                + {translations[lang]?.addDay || 'Add Day'}
              </button>
            </div>
          </div>

          {/* Current Day Content */}
          {itinerary.days[currentDay] && (
            <div className="day-content">
              <div className="day-header">
                <div className="day-date-section">
                  <label>{translations[lang]?.date || 'Date'}</label>
                  <input
                    type="date"
                    value={itinerary.days[currentDay].date}
                    onChange={(e) => updateDayDate(currentDay, e.target.value)}
                    className="day-date-input"
                  />
                </div>
                <div className="day-title-section">
                  <label>{translations[lang]?.dayTitle || 'Day Title'} ({translations[lang]?.optional || 'optional'})</label>
                  <input
                    type="text"
                    value={itinerary.days[currentDay].title}
                    onChange={(e) => updateDayTitle(currentDay, e.target.value)}
                    placeholder={translations[lang]?.dayTitlePlaceholder || 'e.g., Exploring Downtown, Museums & Culture'}
                    className="day-title-input"
                  />
                </div>
              </div>

              {/* Activities */}
              <div className="activities-section">
                <div className="activities-header">
                  <h3>{translations[lang]?.activities || 'Activities'}</h3>
                  <button className="add-activity-btn" onClick={addActivity}>
                    + {translations[lang]?.addActivity || 'Add Activity'}
                  </button>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="activities">
                    {(provided) => (
                      <div
                        className="activities-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {itinerary.days[currentDay].activities.map((activity, index) => (
                          <Draggable key={activity.id} draggableId={activity.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`activity-item ${snapshot.isDragging ? 'dragging' : ''}`}
                              >
                                <div className="activity-header">
                                  <div {...provided.dragHandleProps} className="drag-handle">
                                    ⋮⋮
                                  </div>
                                  <select
                                    value={activity.category}
                                    onChange={(e) => updateActivity(index, 'category', e.target.value)}
                                    className="activity-category"
                                  >
                                    {activityCategories.map(cat => (
                                      <option key={cat.value} value={cat.value}>
                                        {cat.icon} {cat.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    className="remove-activity-btn"
                                    onClick={() => removeActivity(index)}
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="activity-details">
                                  <div className="activity-row">
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        value={activity.name}
                                        onChange={(e) => updateActivity(index, 'name', e.target.value)}
                                        placeholder={translations[lang]?.activityName || 'Activity name'}
                                      />
                                    </div>
                                    <div className="input-group time-input">
                                      <input
                                        type="time"
                                        value={activity.time || ''}
                                        onChange={(e) => updateActivity(index, 'time', e.target.value || null)}
                                        placeholder={translations[lang]?.optionalTime || 'Optional time'}
                                      />
                                    </div>
                                  </div>

                                  <div className="input-group">
                                    <input
                                      type="text"
                                      value={activity.location}
                                      onChange={(e) => updateActivity(index, 'location', e.target.value)}
                                      placeholder={translations[lang]?.location || 'Location'}
                                    />
                                  </div>

                                  <div className="activity-row">
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        value={activity.website}
                                        onChange={(e) => updateActivity(index, 'website', e.target.value)}
                                        placeholder={translations[lang]?.website || 'Website/Link'}
                                      />
                                    </div>
                                    <div className="input-group cost-input">
                                      <input
                                        type="text"
                                        value={activity.estimatedCost}
                                        onChange={(e) => updateActivity(index, 'estimatedCost', e.target.value)}
                                        placeholder={translations[lang]?.estimatedCost || 'Est. Cost'}
                                      />
                                    </div>
                                  </div>

                                  <div className="input-group">
                                    <textarea
                                      value={activity.notes}
                                      onChange={(e) => updateActivity(index, 'notes', e.target.value)}
                                      placeholder={translations[lang]?.activityNotes || 'Notes (dress code, tickets, tips...)'}
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {itinerary.days[currentDay].activities.length === 0 && (
                          <div className="empty-activities">
                            <p>{translations[lang]?.noActivitiesYet || 'No activities added yet'}</p>
                            <p>{translations[lang]?.clickAddActivity || 'Click "Add Activity" to get started'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          )}
        </div>

        <div className="itinerary-footer">
          <button className="cancel-btn" onClick={onClose}>
            {translations[lang]?.cancel || 'Cancel'}
          </button>
          <button className="save-btn" onClick={handleSave}>
            {translations[lang]?.saveItinerary || 'Save Itinerary'}
          </button>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="share-options-overlay">
            <div className="share-options-modal">
              <h3>{translations[lang]?.shareItinerary || 'Share Your Itinerary'}</h3>
              <p>{translations[lang]?.shareItineraryDescription || 'Would you like to share this itinerary on your social feed?'}</p>
              
              <div className="share-note">
                <div className="note-icon">ℹ️</div>
                <p>{translations[lang]?.shareNote || 'Note: If you share this itinerary, it will also appear in your printed travel journal.'}</p>
              </div>

              <div className="share-options-buttons">
                <button 
                  className="share-private-btn"
                  onClick={() => handleShare(false)}
                >
                  {translations[lang]?.savePrivately || 'Save Privately'}
                </button>
                <button 
                  className="share-public-btn"
                  onClick={() => handleShare(true)}
                >
                  {translations[lang]?.shareToSocial || 'Share to Social Feed'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryModal;
