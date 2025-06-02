import React, { useState, useEffect } from 'react';

/**
 * Toast notification component for displaying temporary messages
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 * @param {boolean} visible - Whether the toast is visible
 * @param {function} onClose - Function to call when the toast is closed
 */
const Toast = ({ message, type = 'success', visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      // Automatically hide the toast after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;