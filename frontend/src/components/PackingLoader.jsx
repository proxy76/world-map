import React from 'react';
import '../styles/PackingLoader.scss';

const PackingLoader = () => {
  return (
    <div className="packing-loader-container">
      <div className="packing-animation">
        <div className="suitcase">
          <div className="suitcase-body">
            <div className="suitcase-lock"></div>
            <div className="suitcase-handle"></div>
          </div>
          <div className="suitcase-lid"></div>
        </div>

        <div className="packing-items">
          <div className="item camera">
            <div className="camera-body">
              <div className="camera-lens"></div>
              <div className="camera-flash"></div>
            </div>
            <div className="camera-strap"></div>
          </div>
          
          <div className="item journal">
            <div className="journal-cover">
              <div className="journal-lines"></div>
              <div className="journal-bookmark"></div>
            </div>
          </div>
          
          <div className="item passport">
            <div className="passport-cover">
              <div className="passport-text">PASSPORT</div>
              <div className="passport-emblem"></div>
            </div>
          </div>
        </div>

        <div className="floating-icons">
          <div className="float-icon plane">✈️</div>
          <div className="float-icon globe">🌍</div>
          <div className="float-icon compass">🧭</div>
        </div>
      </div>
      
      <div className="loading-text">
        <h2>Preparing your adventure...</h2>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default PackingLoader;
