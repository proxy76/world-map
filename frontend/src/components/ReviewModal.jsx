import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ALL_REVIEWS_ENDPOINT_URL, MY_REVIEWS_ENDPOINT_URL, ADD_REVIEW_ENDPOINT_URL } from '../utils/ApiHost';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";

const ReviewModal = ({ reviewsOpened, setReviewsOpened, isLogged }) => {
  const [allReviews, setAllReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const { lang } = useLanguage();

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const allReviewsResponse = await axios.post(ALL_REVIEWS_ENDPOINT_URL, {
        country_name: reviewsOpened,
      }, { withCredentials: true });

      let myReviewsResponse = { data: { reviews: [] } };
      if (isLogged) {
        try {
          myReviewsResponse = await axios.post(MY_REVIEWS_ENDPOINT_URL, {
            country_name: reviewsOpened,
          }, { withCredentials: true });
        } catch (error) {
          console.warn('Could not fetch personal reviews:', error);
        }
      }

      setAllReviews(allReviewsResponse.data.reviews || []);
      setMyReviews(myReviewsResponse.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (reviewsOpened) {
      fetchReviews();
    }
  }, [reviewsOpened, showAddReviewForm]);

  const addReview = async () => {
    try {
      await axios.post(ADD_REVIEW_ENDPOINT_URL, {
        country_name: reviewsOpened,
        review_text: reviewText,
      }, { withCredentials: true });
      setReviewText('');
      setShowAddReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const closeModal = () => {
    setReviewsOpened('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal" onClick={closeModal}>X</button>
        <h2>{translations[lang].reviews} {reviewsOpened}</h2>
        <div className="tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            {translations[lang].allReviews}
          </button>
          <button
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            {translations[lang].myReviews}
          </button>
        </div>
        {activeTab === 'all' && (
          <div className="reviews-section">
            <h3>{translations[lang].allReviews}</h3>
            {isLoading ? (
              <p>{translations[lang].loadingReviews}</p>
            ) : (
              <div className="reviews-list">
                {allReviews.length > 0 ? (
                  allReviews.map((review, index) => (
                    <div key={index} className="review">
                      <strong>{review.username}</strong>
                      <p>{review.review_text}</p>
                      <small>{new Date(review.created_at).toLocaleString()}</small>
                    </div>
                  ))
                ) : (
                  <p>{translations[lang].noReviews}</p>
                )}
              </div>
            )}
          </div>
        )}
        {activeTab === 'my' && (
          <div className="reviews-section">
            <h3>{translations[lang].myReviews}</h3>
            {isLoading ? (
              <p>{translations[lang].loadingYourReviews}</p>
            ) : (
              <div className="reviews-list">
                {myReviews.length > 0 ? (
                  myReviews.map((review, index) => (
                    <div key={index} className="review">
                      <strong>{review.username}</strong>
                      <p>{review.review_text}</p>
                      <small>{new Date(review.created_at).toLocaleString()}</small>
                    </div>
                  ))
                ) : (
                  <p>{translations[lang].noMyReviews}</p>
                )}
              </div>
            )}
          </div>
        )}
        {isLogged && (
          <div className="add-review-toggle">
            <button onClick={() => setShowAddReviewForm(!showAddReviewForm)}>
              {showAddReviewForm ? translations[lang].cancel : translations[lang].addReview}
            </button>
          </div>
        )}
        {showAddReviewForm && (
          <div className="add-review-form">
            <textarea
              placeholder={translations[lang].writeReview}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button onClick={addReview}>{translations[lang].submitReview}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
