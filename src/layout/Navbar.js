import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
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
      <h2 style={styles.title}>Kafka Manager</h2>
      <div style={styles.rightContainer}>
        <p style={styles.dateTime}>
          {currentDateTime.toLocaleDateString()} {currentDateTime.toLocaleTimeString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>
        <button style={styles.iconButton} onClick={handleRefresh} title="Refresh">
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
        <button style={styles.iconButton} onClick={handleThemeChange} title="Toggle Theme">
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
    padding: "15px 25px",
    background: "#f8f9fa",
    color: "#000",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderBottom: "3px solid #ddd",
    borderRadius: "10px",
  },
  navbarDark: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 25px",
    background: "#222",
    color: "#fff",
    boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
    borderBottom: "3px solid #444",
    borderRadius: "10px",
  },
  leftContainer: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "18px",
    transition: "color 0.3s ease, transform 0.2s ease",
  },
  linkHover: {
    color: "#0056b3",
    transform: "scale(1.1)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  rightContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  dateTime: {
    fontWeight: "bold",
    fontSize: "16px",
    color: "#ff5733",
  },
  iconButton: {
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
    background: "transparent",
    color: "inherit",
    fontSize: "18px",
    transition: "transform 0.2s ease, color 0.3s ease",
  },
  iconButtonHover: {
    transform: "scale(1.1)",
    color: "#007bff",
  },
};

export default Navbar;
