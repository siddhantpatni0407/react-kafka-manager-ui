import React from "react";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Home from "./pages/Home";
import About from "./About/About";
import Contact from "./contact/contact";
import Footer from "./footer/footer";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

const styles = {
  mainContent: {
    minHeight: "calc(100vh - 120px)",
    padding: "20px",
    backgroundColor: "#f8f9fa",
  },
};

export default App;