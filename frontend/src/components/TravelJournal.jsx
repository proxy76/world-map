import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import axios from 'axios';
import { 
  GET_JOURNAL_POSTS_ENDPOINT_URL, 
  GET_REMOVED_JOURNAL_POSTS_ENDPOINT_URL, 
  TOGGLE_POST_JOURNAL_ENDPOINT_URL,
  BACKEND_BASE_URL
} from '../utils/ApiHost';
import '../styles/travelJournal.scss';

const TravelJournal = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('table-of-contents');
  const [journalData, setJournalData] = useState({});
  const [removedPosts, setRemovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const bookRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchJournalData();
    }
  }, [isOpen]);

  const fetchJournalData = async () => {
    try {
      setLoading(true);
      const [journalResponse, removedResponse] = await Promise.all([
        axios.get(GET_JOURNAL_POSTS_ENDPOINT_URL, { withCredentials: true }),
        axios.get(GET_REMOVED_JOURNAL_POSTS_ENDPOINT_URL, { withCredentials: true })
      ]);
      
      setJournalData(journalResponse.data.journal);
      setRemovedPosts(removedResponse.data.posts);
    } catch (error) {
      console.error('Failed to fetch journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    setIsPopping(true);
    
    if (isBookOpen) {
      setTimeout(() => {
        setIsBookOpen(false);
        setIsPopping(false);
        setTimeout(() => {
          setIsBookOpen(true);
          setTimeout(() => setCurrentPage('table-of-contents'), 600);
        }, 300);
      }, 400); 
    } else {
      setTimeout(() => {
        setIsPopping(false);
        setIsBookOpen(true);
        setTimeout(() => setCurrentPage('table-of-contents'), 600);
      }, 400); 
    }
  };

  const flipToPage = (page) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsFlipping(false);
    }, 300);
  };

  const removeFromJournal = async (postId) => {
    try {
      await axios.post(`${TOGGLE_POST_JOURNAL_ENDPOINT_URL}/${postId}/toggle_journal/`, {}, {
        withCredentials: true
      });
      fetchJournalData(); 
    } catch (error) {
      console.error('Failed to remove post from journal:', error);
    }
  };

  const restoreToJournal = async (postId) => {
    try {
      await axios.post(`${TOGGLE_POST_JOURNAL_ENDPOINT_URL}/${postId}/toggle_journal/`, {}, {
        withCredentials: true
      });
      fetchJournalData(); 
    } catch (error) {
      console.error('Failed to restore post to journal:', error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return '/anonymous.png';
    if (typeof image === 'object' && image.url) image = image.url;
    if (typeof image !== 'string') return '/anonymous.png';
    if (image.startsWith('http')) return image;
    return `${BACKEND_BASE_URL}${image}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const countries = Object.keys(journalData);
  const totalPosts = countries.reduce((sum, country) => sum + journalData[country].length, 0);

  const printJournal = () => {
    if (countries.length === 0) {
      alert(translations[lang]?.noContentToPrint || 'Your journal is empty! Add some travel stories first.');
      return;
    }
    
    const printContent = createPrintableJournal();
    
    const printContainer = document.createElement('div');
    printContainer.innerHTML = printContent;
    printContainer.className = 'printable-journal show-print-view';
    document.body.appendChild(printContainer);
    
    setTimeout(() => {
      window.print();
      
      setTimeout(() => {
        document.body.removeChild(printContainer);
      }, 100);
    }, 100);
  };

  const createPrintableJournal = () => {
    const currentDate = new Date().toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let printHTML = `
      <!-- Cover Page -->
      <div class="print-page print-cover">
        <div class="print-cover-content">
          <div class="print-title">
            <h1>${translations[lang]?.myTravelJournal || 'My Travel Journal'}</h1>
          </div>
          <div class="print-subtitle">
            ${translations[lang]?.personalTravelMemories || 'Personal Travel Memories & Stories'}
          </div>
          <div class="print-stats">
            <div class="stat-box">
              <div class="stat-number">${countries.length}</div>
              <div class="stat-label">${translations[lang]?.countries || 'Countries'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${totalPosts}</div>
              <div class="stat-label">${translations[lang]?.stories || 'Stories'}</div>
            </div>
          </div>
          <div class="print-date">${currentDate}</div>
          <div class="print-decorative-border"></div>
        </div>
      </div>

      <!-- Table of Contents -->
      <div class="print-page">
        <h2 class="print-section-title">${translations[lang]?.tableOfContents || 'Table of Contents'}</h2>
        <div class="print-toc">
          ${countries.map((country, index) => `
            <div class="print-toc-item">
              <div class="toc-number">${index + 1}</div>
              <div class="toc-country">${country}</div>
              <div class="toc-dots"></div>
              <div class="toc-pages">${journalData[country].length} ${translations[lang]?.stories || 'stories'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    countries.forEach((country, countryIndex) => {
      const posts = journalData[country];
      let itineraryPost = null;
      const itineraryIndex = posts.findIndex(p => p.post_type === 'itinerariu');
      if (itineraryIndex !== -1) {
        itineraryPost = posts[itineraryIndex];
      }
      const normalPosts = posts.filter((p, idx) => idx !== itineraryIndex);
      let numberedPosts = [];
      if (itineraryPost) {
        numberedPosts.push({ ...itineraryPost, _isItinerary: true });
      }
      numberedPosts = numberedPosts.concat(normalPosts.map(p => ({ ...p, _isItinerary: false })));
      printHTML += `
        <div class="print-page print-country-section">
          <div class="print-country-header">
            <h2 class="print-country-title">
              <span class="country-number">${countryIndex + 1}</span>
              ${country}
            </h2>
            <div class="country-divider"></div>
          </div>
          <div class="print-posts">
            ${numberedPosts.map((post, postIndex) => {
              let imagesHTML = '';
              if (post.images && post.images.length > 0) {
                if (post.images.length === 1) {
                  imagesHTML = `<div class=\"print-image-row\"><img src=\"${getImageUrl(post.images[0])}\" alt=\"${post.title.replace(/\"/g, '&quot;')}\" class=\"print-post-image-row\" /></div>`;
                } else {
                  imagesHTML = `<div class=\"print-image-row\">${post.images.map(img => `<img src=\"${getImageUrl(img)}\" alt=\"${post.title.replace(/\"/g, '&quot;')}\" class=\"print-post-image-row\" />`).join('')}</div>`;
                }
              }
              return `
                <div>
                  <span class=\"print-post-number\">${postIndex + 1}.</span>
                  <span class=\"print-post-title\">${post._isItinerary ? (translations[lang]?.itinerary || 'Itinerary') + ': ' : ''}${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                 
            </span>
                  ${imagesHTML}
                  <div class=\"print-post-content\">
                    ${String(post.content).replace(/\n/g, '<br>')}

                  </div>
                  ${postIndex < numberedPosts.length - 1 ? '<div class=\"print-post-separator\"></div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    printHTML += `
      <div class="print-page print-back-cover">
        <div class="back-cover-content">
          <div class="back-cover-quote">
            <em>${translations[lang]?.travelQuote || 'The world is a book and those who do not travel read only one page.'}</em>
            <div class="quote-author">— Saint Augustine</div>
          </div>
          
          <div class="back-cover-stats">
            <h3>${translations[lang]?.journeyStatistics || 'Journey Statistics'}</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>${translations[lang]?.totalCountries || 'Total Countries'}:</strong> ${countries.length}
              </div>
              <div class="summary-item">
                <strong>${translations[lang]?.totalStories || 'Total Stories'}:</strong> ${totalPosts}
              </div>
              <div class="summary-item">
                <strong>${translations[lang]?.averageStoriesPerCountry || 'Stories per Country'}:</strong> ${countries.length > 0 ? Math.round(totalPosts / countries.length) : 0}
              </div>
              <div class="summary-item">
                <strong>${translations[lang]?.journalCreated || 'Journal Created'}:</strong> ${currentDate}
              </div>
            </div>
          </div>
          
          <div class="back-cover-footer">
            <div class="footer-logo">GlobeTales</div>
            <div class="footer-tagline">${translations[lang]?.discoverExploreShare || 'Discover • Explore • Share'}</div>
          </div>
        </div>
      </div>
    `;

    return printHTML;
  };

  if (!isOpen) return null;

  return (
    <div className="journal-overlay" onClick={onClose}>
      <div className="journal-container" onClick={(e) => e.stopPropagation()}>
        
        {!isBookOpen && (
          <div className={`closed-book ${isPopping ? 'popping' : ''}`} onClick={handleBookClick}>
            <div className="book-spine">
              <div className="spine-text">
                {translations[lang]?.travelJournal || 'Travel Journal'}
              </div>
            </div>
            <div className="book-cover">
              <div className="cover-design">
                <div className="cover-title">
                  {translations[lang]?.myTravelJournal || 'My Travel Journal'}
                </div>
                <div className="cover-subtitle">
                  {countries.length} {translations[lang]?.countries || 'Countries'} • {totalPosts} {translations[lang]?.stories || 'Stories'}
                </div>
                <div className="cover-decoration">🌍✈️📖</div>
              </div>
            </div>
          </div>
        )}

        {isBookOpen && (
          <div className={`open-book ${isFlipping ? 'flipping' : ''}`} ref={bookRef}>
            <button className="close-journal" onClick={onClose}>✕</button>
            
            <div className="book-pages">
              <div className="left-page">
                {currentPage === 'table-of-contents' && (
                  <TableOfContents 
                    countries={countries}
                    journalData={journalData}
                    onPageClick={flipToPage}
                    lang={lang}
                  />
                )}
                {currentPage.startsWith('country-') && (
                  <CountryPage 
                    country={currentPage.replace('country-', '')}
                    posts={journalData[currentPage.replace('country-', '')] || []}
                    onRemovePost={removeFromJournal}
                    onBackToContents={() => flipToPage('table-of-contents')}
                    formatDate={formatDate}
                    getImageUrl={getImageUrl}
                    lang={lang}
                  />
                )}
              </div>
              
              <div className="right-page">
                <div className="page-actions">
                  <button 
                    className="restore-posts-btn"
                    onClick={() => setShowRestoreModal(true)}
                  >
                    {translations[lang]?.addRemovedPosts || 'Add Removed Posts'}
                  </button>
                  
                  <button 
                    className="print-journal-btn"
                    onClick={() => printJournal()}
                  >
                    🖨️ {translations[lang]?.printJournal || 'Print Journal'}
                  </button>
                </div>
                
                <div className="journal-stats">
                  <h3>{translations[lang]?.journalStats || 'Journal Statistics'}</h3>
                  <div className="stat-item">
                    <span className="stat-label">{translations[lang]?.countriesVisited || 'Countries Visited'}:</span>
                    <span className="stat-value">{countries.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{translations[lang]?.totalStories || 'Total Stories'}:</span>
                    <span className="stat-value">{totalPosts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{translations[lang]?.removedPosts || 'Removed Posts'}:</span>
                    <span className="stat-value">{removedPosts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRestoreModal && (
          <RestoreModal 
            posts={removedPosts}
            onRestore={restoreToJournal}
            onClose={() => setShowRestoreModal(false)}
            getImageUrl={getImageUrl}
            formatDate={formatDate}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};

const TableOfContents = ({ countries, journalData, onPageClick, lang }) => (
  <div className="table-of-contents">
    <h1 className="page-title">{translations[lang]?.tableOfContents || 'Table of Contents'}</h1>
    <div className="contents-list">
      {countries.map((country, index) => (
        <div key={country} className="content-item" onClick={() => onPageClick(`country-${country}`)}>
          <span className="chapter-number">{index + 1}</span>
          <span className="chapter-title">{country}</span>
          <span className="chapter-dots">.........................</span>
          <span className="chapter-page">{journalData[country].length} {translations[lang]?.posts || 'posts'}</span>
        </div>
      ))}
    </div>
    {countries.length === 0 && (
      <div className="empty-journal">
        <p>{translations[lang]?.emptyJournal || 'Your journal is empty. Start traveling and posting to create your travel story!'}</p>
      </div>
    )}
  </div>
);

const CountryPage = ({ country, posts, onRemovePost, onBackToContents, formatDate, getImageUrl, lang }) => (
  <div className="country-page">
    <button className="back-btn" onClick={onBackToContents}>
      ← {translations[lang]?.backToContents || 'Back to Contents'}
    </button>
    <h1 className="country-title">{country}</h1>
    <div className="country-posts">
      {posts.map((post) => (
        <div key={post.id} className="journal-post">
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            <button 
              className="remove-post-btn"
              onClick={() => onRemovePost(post.id)}
              title={translations[lang]?.removeFromJournal || 'Remove from journal'}
            >
              ✕
            </button>
          </div>
          <div className="post-date">{formatDate(post.created_at)}</div>
          {post.images && post.images.length > 0 && (
            <img 
              src={getImageUrl(post.images[0])} 
              alt={post.title}
              className="post-image"
            />
          )}
          <p className="post-excerpt">{post.content &&
              post.content
                .split('\n')
                .filter(line => line.trim() !== '')
                .map((line, index) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: line.trim() }} />
            ))}</p>
          <div className="post-meta">
            <span className="post-type">{post.post_type}</span>
            <span className="travel-type">{post.travel_type}</span>
            <span className="theme">{post.theme}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RestoreModal = ({ posts, onRestore, onClose, getImageUrl, formatDate, lang }) => (
  <div className="restore-modal-overlay" onClick={onClose}>
    <div className="restore-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{translations[lang]?.removedPosts || 'Removed Posts'}</h2>
        <button className="close-modal" onClick={onClose}>✕</button>
      </div>
      <div className="modal-content">
        {posts.length === 0 ? (
          <p>{translations[lang]?.noRemovedPosts || 'No removed posts to restore.'}</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="removed-post">
              <div className="post-info">
                <h4>{post.title}</h4>
                <p>{formatDate(post.created_at)}</p>
                <p>{post.content.substring(0, 100)}...</p>
              </div>
              <button 
                className="restore-btn"
                onClick={() => onRestore(post.id)}
              >
                {translations[lang]?.restore || 'Restore'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default TravelJournal;
