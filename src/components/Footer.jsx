// src/components/Footer.jsx
import React from 'react';
import '../css/footer.css';

export default function Footer() {
  return (
    <footer className="subscribe-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Jarvis AI Assistant. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="mailto:support@jarvis.com">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
