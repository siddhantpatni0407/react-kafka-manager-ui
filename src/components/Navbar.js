import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <h2>Kafka Manager</h2>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/about" style={styles.link}>About</Link>
      </div>
    </nav>
  );
};

const styles = {
  navbar: { display: "flex", justifyContent: "space-between", padding: "10px", background: "#333", color: "#fff" },
  link: { color: "#fff", margin: "0 10px", textDecoration: "none" }
};

export default Navbar;
