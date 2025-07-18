import React, { useState } from 'react';
import axios from 'axios';
import { ADD_POSTS_ENDPOINT_URL, ADD_POST_IMAGE_ENDPOINT_URL } from '../utils/ApiHost';
function CreatePost({ onPostCreated }) {
  const [countryName, setCountryName] = useState('');
  const [postText, setPostText] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(ADD_POSTS_ENDPOINT_URL, {
        country_name: countryName,
        post_text: postText,
      });
      const postId = res.data.post_id;

      if (image) {
        const formData = new FormData();
        formData.append('post_id', postId);
        formData.append('image', image);
        await axios.post(ADD_POST_IMAGE_ENDPOINT_URL, formData);
      }

      setCountryName('');
      setPostText('');
      setImage(null);
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Country name"
        value={countryName}
        onChange={(e) => setCountryName(e.target.value)}
      />
      <textarea
        placeholder="What’s on your mind?"
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <button type="submit">Post</button>
    </form>
  );
}

export default CreatePost;
