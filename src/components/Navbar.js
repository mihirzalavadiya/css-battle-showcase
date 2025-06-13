import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated');

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  // Hidden admin controls - accessible via keyboard shortcut (Ctrl/Cmd + Shift + A)
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        navigate('/login');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <FontAwesomeIcon icon={faCode} className="brand-icon" />
          <span className="brand-text">CSS Battle</span>
          <span className="brand-highlight">Showcase</span>
        </Link>
        {/* Admin links are not visible but still functional */}
        {isAuthenticated && (
          <>
            <Link to="/admin" style={{ display: 'none' }}>Admin Panel</Link>
            <button 
              onClick={handleLogout}
              style={{ display: 'none' }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 