import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    document.body.classList.add("dark-mode");
    return () => clearInterval(intervalId);
  }, []);

  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <nav style={isDarkMode ? styles.navbarDark : styles.navbarLight}>
      <div style={styles.leftContainer}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/about" style={styles.link}>About</Link>
        <Link to="/contact" style={styles.link}>Contact</Link>
      </div>
      <h2>Kafka Manager</h2>
      <div className="d-flex align-items-center">
        <p style={styles.time}>{currentTime}</p>
        <button style={styles.button} onClick={handleRefresh} title="Refresh">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
        <button style={styles.button} onClick={handleThemeChange} title="Toggle Theme">
          <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
        </button>
      </div>
    </nav>
  );
};

const styles = {
    navbarLight: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      background: "#f8f9fa",
      color: "#000",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderBottom: "2px solid #ddd",
    },
    navbarDark: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 20px",
      background: "#222",
      color: "#fff",
      boxShadow: "0 4px 6px rgba(255, 255, 255, 0.1)",
      borderBottom: "2px solid #444",
    },
    leftContainer: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
    },
    link: {
      color: "#007bff",
      textDecoration: "none",
      fontWeight: "bold",
      fontSize: "16px",
      transition: "color 0.3s ease",
    },
    linkHover: {
      color: "#0056b3",
    },
    time: {
      marginRight: "10px",
      fontWeight: "bold",
      fontSize: "16px",
    },
    button: {
      marginLeft: "10px",
      padding: "8px 12px",
      border: "none",
      cursor: "pointer",
      background: "transparent",
      color: "inherit",
      fontSize: "16px",
      transition: "transform 0.2s ease",
    },
    buttonHover: {
      transform: "scale(1.1)",
    },
  };
export default Navbar;