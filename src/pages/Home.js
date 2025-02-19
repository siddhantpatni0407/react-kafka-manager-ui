import React from "react";
import KafkaControls from "../components/KafkaControls";

const Home = () => {
  return (
    <div style={styles.container}>
      <KafkaControls />
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  header: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#007bff",
  },
  subText: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "20px",
  },
};

export default Home;