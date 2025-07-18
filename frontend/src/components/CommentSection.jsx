import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GET_COMMENTS_ENDPOINT_URL, ADD_COMMENT_ENDPOINT_URL } from '../utils/ApiHost';
function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const fetchComments = async () => {
    try {
      const res = await axios.post(GET_COMMENTS_ENDPOINT_URL, { post_id: postId });
      setComments(res.data.comments);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleComment = async () => {
    if (!text) return;
    try {
      await axios.post(ADD_COMMENT_ENDPOINT_URL, {
        post_id: postId,
        comment_text: text,
      });
      setText('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-input">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleComment}>Post</button>
      </div>
      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <strong>{comment.user.username}:</strong> {comment.comment_text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
