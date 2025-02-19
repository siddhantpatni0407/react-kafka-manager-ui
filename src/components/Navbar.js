import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
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
  navbarLight: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#f8f9fa", color: "#000" },
  navbarDark: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#333", color: "#fff" },
  leftContainer: { display: "flex", gap: "15px" },
  link: { color: "#007bff", textDecoration: "none", fontWeight: "bold" },
  time: { marginRight: "10px", fontWeight: "bold" },
  button: { marginLeft: "10px", padding: "5px 10px", border: "none", cursor: "pointer", background: "transparent", color: "inherit" }
};

export default Navbar;