import React, { useState } from 'react';
import axios from 'axios';
import CommentSection from './CommentSection';

import { TOGGLE_LIKE_ENDPOINT_URL } from '../utils/ApiHost';
function Post({ post, onUpdate }) {
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      await axios.post(TOGGLE_LIKE_ENDPOINT_URL, { post_id: post.id });
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <h3>{post.country_name}</h3>
        <p>{post.post_text}</p>
        {post.images?.map((img) => (
          <img key={img.id} src={img.image} alt="post" className="post-image" />
        ))}
      </div>
      <div className="post-actions">
        <button onClick={handleLike}>
          {post.user_liked ? '❤️' : '🤍'} {post.like_count} likes
        </button>
        <button onClick={() => setShowComments(!showComments)}>
          💬 {post.comment_count} comments
        </button>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}

export default Post;
