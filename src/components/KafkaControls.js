import React, { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "./constants"; // Importing the updated constants file

const KafkaControls = () => {
  const [topics, setTopics] = useState([]); // State to store the list of topics
  const [createTopicName, setCreateTopicName] = useState(""); // State to store the topic name for creating a topic
  const [topicNameForDetails, setTopicNameForDetails] = useState(""); // State to store the topic name for getting details
  const [partition, setPartition] = useState(""); // State to store the partition number (optional)
  const [createTopicResponse, setCreateTopicResponse] = useState(""); // State to store the create topic response
  const [stopKafkaResponse, setStopKafkaResponse] = useState(""); // State to store the stop Kafka response
  const [startKafkaResponse, setStartKafkaResponse] = useState(""); // State to store the start Kafka response
  const [deleteLogsResponse, setDeleteLogsResponse] = useState(""); // State to store the delete logs response
  const [topicDetails, setTopicDetails] = useState(null); // State to store the topic details response
  
  // Separate loading states for each button
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [error, setError] = useState(""); // Error message state

  // Generalized handleAction function
  const handleAction = async (url, method = "POST", params = {}, actionType = "") => {
    console.log("Calling API:", url, method, params);  // Debugging log
    try {
      setIsLoading(true);
      setError(""); // Reset any previous error messages

      let response;
      if (method === "DELETE") {
        response = await axios.delete(url, { data: params });
      } else if (method === "POST") {
        response = await axios.post(url, params);
      } else if (method === "GET") {
        response = await axios.get(url, { params });
      }

      // Handle response for each action
      switch (actionType) {
        case "start":
          setStartKafkaResponse(response.data.status);
          break;
        case "stop":
          setStopKafkaResponse(response.data.status);
          break;
        case "create":
          setCreateTopicResponse(response.data.status);
          break;
        case "delete":
          setDeleteLogsResponse(response.data.status);
          break;
        case "getDetails":
          setTopicDetails(response.data);
          break;
        default:
          break;
      }

      alert(response.data.status); // Display the success message
    } catch (error) {
      if (error.response) {
        alert("Error: " + (error.response?.data?.message || error.message));
      } else if (error.request) {
        setError("No response from the server. Please try again later.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
      // Reset specific action loading states
      setIsStarting(false);
      setIsStopping(false);
      setIsCreating(false);
      setIsDeleting(false);
    }
  };

  const getTopics = async () => {
    try {
      setIsLoading(true);
      setError(""); // Reset error message on request

      const response = await axios.get(API_ENDPOINTS.GET_TOPICS_URL);
      setTopics(response.data); // Assuming response is the list of topics
    } catch (error) {
      if (error.response) {
        alert("Error: " + (error.response?.data?.message || error.message));
      } else if (error.request) {
        setError("No response from the server. Please try again later.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopic = () => {
    if (!createTopicName) {
      alert("Please enter both topic name.");
      return;
    }
    
    setIsCreating(true);
    
    // Construct the URL with optional partition query parameter
    let url = `${API_ENDPOINTS.CREATE_TOPIC_URL}?topicName=${createTopicName}`;
    if (partition) {
      url += `&partition=${partition}`;
    }

    handleAction(url, "POST", {}, "create");
  };

  const handleGetTopicDetails = () => {
    if (!topicNameForDetails) {
      alert("Please enter a topic name.");
      return;
    }

    setIsLoading(true);

    const url = `${API_ENDPOINTS.GET_TOPIC_DETAILS_URL}?topicName=${topicNameForDetails}`;
    handleAction(url, "GET", {}, "getDetails");
  };

  return (
    <div style={styles.container}>
      {/* Error Message at the top */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      )}

      <div style={styles.header}>
        {/* Kafka Logo */}
        <img src="/kafka-logo.png" alt="Kafka Logo" style={styles.logo} />
      </div>

      {/* Start Kafka Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Start Kafka Server</h2>
        <button
          style={styles.button}
          onClick={() => {
            setIsStarting(true);
            handleAction(API_ENDPOINTS.START_KAFKA_URL, "POST", {}, "start");
          }}
          disabled={isStarting || isLoading} // Disable if already loading
        >
          {isStarting ? "Starting..." : "Start Kafka"}
        </button>
        {startKafkaResponse && (
          <p style={styles.responseMessage}>{startKafkaResponse}</p>
        )}
      </div>

      {/* Stop Kafka Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Stop Kafka Server</h2>
        <button
          style={styles.button}
          onClick={() => {
            setIsStopping(true);
            handleAction(API_ENDPOINTS.STOP_KAFKA_URL, "POST", {}, "stop");
          }}
          disabled={isStopping || isLoading}
        >
          {isStopping ? "Stopping..." : "Stop Kafka"}
        </button>
        {stopKafkaResponse && (
          <p style={styles.responseMessage}>{stopKafkaResponse}</p>
        )}
      </div>

      {/* Create Topic Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Create Kafka Topic</h2>
        <input
          type="text"
          placeholder="Enter topic name"
          value={createTopicName}
          onChange={(e) => setCreateTopicName(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Enter number of partitions (optional)"
          value={partition}
          onChange={(e) => setPartition(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.button}
          onClick={handleCreateTopic}
          disabled={isCreating || isLoading}
        >
          {isCreating ? "Creating..." : "Create Topic"}
        </button>
        {createTopicResponse && (
          <p style={styles.responseMessage}>{createTopicResponse}</p>
        )}
      </div>

      {/* Get Topic Details Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Get Topic Details</h2>
        <input
          type="text"
          placeholder="Enter topic name"
          value={topicNameForDetails}
          onChange={(e) => setTopicNameForDetails(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.button}
          onClick={handleGetTopicDetails}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Get Topic Details"}
        </button>

        {/* Display Topic Details in a Table */}
        {topicDetails && (
          <div style={styles.detailsContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Topic Name</th>
                  <th>Partition</th>
                  <th>Leader</th>
                  <th>Replicas</th>
                  <th>ISR</th>
                </tr>
              </thead>
              <tbody>
                {topicDetails.partitions.map((partition, index) => (
                  <tr key={index}>
                    <td>{topicDetails.name}</td> {/* Display topic name here */}
                    <td>{partition.partition}</td>
                    <td>{partition.leader.empty ? "None" : "Available"}</td>
                    <td>{partition.replicas.length}</td>
                    <td>{partition.isr.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Logs Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Delete Kafka Logs</h2>
        <button
          style={styles.button}
          onClick={() => {
            setIsDeleting(true);
            handleAction(API_ENDPOINTS.DELETE_LOGS_URL, "DELETE", {}, "delete");
          }}
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? "Deleting..." : "Delete Logs"}
        </button>
        {deleteLogsResponse && (
          <p style={styles.responseMessage}>{deleteLogsResponse}</p>
        )}
      </div>

      {/* Get Topics Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Get Kafka Topics</h2>
        <button
          style={styles.button}
          onClick={getTopics} // Use handleAction
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Get Topics"}
        </button>

        {/* Display the list of topics */}
        <div style={styles.topicsContainer}>
          {topics.length > 0 ? (
            <ul style={styles.topicList}>
              {topics.map((topic, index) => (
                <li key={index}>
                  {index + 1}. {topic}
                </li>
              ))}
            </ul>
          ) : (
            <p>No topics available</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  errorContainer: {
    padding: "10px",
    backgroundColor: "#ffcccc",
    border: "1px solid #ff0000",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  errorMessage: {
    color: "#ff0000",
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  logo: {
    width: "150px",  // Adjust the size of the logo
    marginBottom: "20px", // Space between logo and text
  },
  section: {
    backgroundColor: "#fff",
    padding: "10px 15px", // Reduced padding to decrease box size
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  sectionHeader: {
    fontSize: "18px", // Slightly reduced font size for section header
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 18px", // Reduced padding to decrease button size
    fontSize: "14px", // Slightly reduced font size for button
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "100%",
  },
  input: {
    padding: "8px",
    fontSize: "14px", // Reduced font size for input
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
  },
  responseMessage: {
    color: "green",
    marginTop: "10px",
  },
  topicsContainer: {
    marginTop: "20px",
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  topicList: {
    listStyleType: "none",
    paddingLeft: "0",
  },
  detailsContainer: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "5px",
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    textAlign: "left",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    border: "1px solid #ddd",
  },
  td: {
    padding: "8px",
    border: "1px solid #ddd",
  },
};

export default KafkaControls;
