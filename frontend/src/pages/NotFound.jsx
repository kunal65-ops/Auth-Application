import React from 'react';
import { Link } from 'react-router-dom';
const NotFound = () => {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-title" style={{ fontSize: '3.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#e2e8f0' }}>
          Page Not Found
        </h2>
        <p className="auth-subtitle">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-submit" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
export default NotFound;