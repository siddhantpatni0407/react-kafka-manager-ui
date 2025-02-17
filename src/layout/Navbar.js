import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'; // Import the refresh icon

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString()); // Initial current time

  useEffect(() => {
    // Update current time every second
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []); // Run effect only once on component mount

  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleRefresh = () => {
    window.location.reload(); // Reload the page to refresh data
  };

  return (
    <nav className={isDarkMode ? 'navbar navbar-expand-lg navbar-dark bg-dark' : 'navbar navbar-expand-lg navbar-light bg-light'}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          File Storage System
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            <p className={`me-2 ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ color: '#ff5733', fontWeight: 'bold' }}>{currentTime}</p> {/* Display current time */}
            <button className="btn btn-outline-primary me-2" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSyncAlt} /> {/* Refresh icon */}
            </button>
            <Form.Check
              type="switch"
              id="theme-switch"
              label={isDarkMode ? 'Dark' : 'Light'}
              checked={isDarkMode}
              onChange={handleThemeChange}
            />
            <Link className={isDarkMode ? 'btn btn-outline-light ms-2' : 'btn btn-outline-primary ms-2'} to="/addFile">
              Upload File
            </Link>
            <button className={isDarkMode ? 'btn btn-outline-light ms-2' : 'btn btn-outline-primary ms-2'} type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
