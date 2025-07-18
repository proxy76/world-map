import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

import { GET_POSTS_ENDPOINT_URL } from '../utils/ApiHost';

function Social() {
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(GET_POSTS_ENDPOINT_URL);
      setPosts(res.data?.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    setShowCreate(false); // hide the form after submitting
    fetchPosts();         // refresh the feed
  };

  return (
    <div className="feed-page">
      <div className="top-bar">
        <button onClick={() => setShowCreate(prev => !prev)}>
          {showCreate ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showCreate && <CreatePost onPostCreated={handlePostCreated} />}

      {posts.length > 0 ? (
        posts.map(post => (
          <Post key={post.id} post={post} onUpdate={fetchPosts} />
        ))
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
}

export default Social;
