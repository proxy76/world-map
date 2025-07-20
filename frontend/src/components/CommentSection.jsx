import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import axios from 'axios';
import { GET_POST_COMMENTS_ENDPOINT_URL, CREATE_COMMENT_ENDPOINT_URL, CREATE_REPLY_ENDPOINT_URL } from '../utils/ApiHost';
import '../styles/commentSection.scss';

const CommentSection = ({ postId, isLogged, isVisible }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${GET_POST_COMMENTS_ENDPOINT_URL}/${postId}/comments/`, {
        withCredentials: true
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isLogged) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${CREATE_COMMENT_ENDPOINT_URL}/${postId}/comments/create/`,
        { content: newComment },
        { withCredentials: true }
      );
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="comments-section">
        <div className="loading">Loading comments...</div>
      </div>
    );
  }

  return (
    <div 
      className="comments-section"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s'
      }}
    >
      <div className="comments-header">
        <h3>💬 Comentarii ({comments.length})</h3>
      </div>

      {isLogged ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Scrie un comentariu..."
            rows={3}
            required
          />
          <button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? 'Se publică...' : 'Publică comentariul'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Trebuie să fii conectat pentru a comenta.</p>
        </div>
      )}

      <div className="comments-list">
        {comments.map(comment => (
          <Comment 
            key={comment.id} 
            comment={comment} 
            formatDate={formatDate}
            isLogged={isLogged}
            onReplySubmit={fetchComments}
          />
        ))}
        {comments.length === 0 && (
          <div className="no-comments">
            <p>Nu există comentarii încă. Fii primul care comentează!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Comment = ({ comment, formatDate, isLogged, onReplySubmit }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await axios.post(
        `${CREATE_REPLY_ENDPOINT_URL}/${comment.id}/reply/`,
        { content: replyText },
        { withCredentials: true }
      );
      setReplyText('');
      setShowReplyForm(false);
      onReplySubmit(); // Refresh comments
    } catch (error) {
      console.error('Failed to create reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment">
      <div className="comment-header">
        <img 
          src={comment.author.avatar} 
          alt={comment.author.username}
          className="comment-avatar"
          onError={(e) => { e.target.src = '/anonymous.png'; }}
        />
        <div className="comment-meta">
          <span className="comment-author">{comment.author.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
      </div>
      
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>

      <div className="comment-actions">
        {isLogged && (
          <button 
            className="reply-btn"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            💬 Răspunde
          </button>
        )}
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Scrie un răspuns..."
            rows={2}
            required
          />
          <div className="reply-actions">
            <button type="button" onClick={() => setShowReplyForm(false)}>
              Anulează
            </button>
            <button type="submit" disabled={isSubmitting || !replyText.trim()}>
              {isSubmitting ? 'Se publică...' : 'Răspunde'}
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              formatDate={formatDate}
              isLogged={isLogged}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;