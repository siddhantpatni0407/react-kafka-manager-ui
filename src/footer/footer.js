import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={styles.text}>
          &copy; {new Date().getFullYear()} Siddhant Patni. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#222",
    color: "#fff",
    padding: "20px 0",
    textAlign: "center",
    borderTop: "3px solid #444",
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.2)",
    marginTop: "30px",
  },
  container: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "0 20px",
  },
  text: {
    margin: "0",
    fontSize: "16px",
    fontWeight: "500",
    letterSpacing: "0.5px",
  },
};