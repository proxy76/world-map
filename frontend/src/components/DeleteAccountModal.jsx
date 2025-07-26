import React, { useState } from 'react';
import { useLanguage } from "../context/LanguageContext";
import translations from "../utils/translations";
import '../styles/DeleteAccountModal.scss';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const { lang } = useLanguage();
  const [confirmText, setConfirmText] = useState('');
  const expectedText = lang === 'ro' ? 'ȘTERGE' : 'DELETE';
  const isConfirmValid = confirmText === expectedText;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isConfirmValid) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay" onClick={handleClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <h2>{translations[lang]?.deleteAccount || 'Delete Account'}</h2>
          <button 
            className="delete-modal-close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="delete-modal-content">
          <div className="delete-warning">
            <div className="delete-warning-icon">⚠️</div>
            <p>{translations[lang]?.deleteAccountWarning || 'This action will permanently delete your account and all associated data. This action cannot be undone.'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="delete-form">
            <div className="delete-input-group">
              <label htmlFor="confirmText">
                {translations[lang]?.typeToConfirm || 'Type to confirm:'}
              </label>
              <div className="delete-input-wrapper">
                <input
                  type="text"
                  id="confirmText"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expectedText}
                  className={`delete-input ${isConfirmValid ? 'valid' : ''}`}
                  disabled={isLoading}
                  autoComplete="off"
                />
                <div className="delete-input-indicator">
                  {confirmText && (isConfirmValid ? '✓' : '✗')}
                </div>
              </div>
            </div>
            
            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-cancel-btn"
                onClick={handleClose}
                disabled={isLoading}
              >
                {translations[lang]?.cancel || 'Cancel'}
              </button>
              <button
                type="submit"
                className="delete-confirm-btn"
                disabled={!isConfirmValid || isLoading}
              >
                {isLoading ? (
                  <span className="delete-loading">
                    <span className="delete-spinner"></span>
                    {lang === 'ro' ? 'Se șterge...' : 'Deleting...'}
                  </span>
                ) : (
                  translations[lang]?.confirmDelete || 'Confirm Delete'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
