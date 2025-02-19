import React, { useState, useEffect } from "react";
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

  // New states for Kafka Setup
  const [kafkaAutoSetupRequired, setKafkaAutoSetupRequired] = useState(false);
  const [kafkaUserDefinedPathRequired, setKafkaUserDefinedPathRequired] = useState(false);
  const [kafkaUserDefinedPath, setKafkaUserDefinedPath] = useState("");
  const [setupKafkaResponse, setSetupKafkaResponse] = useState("");

  const [selectedTopic, setSelectedTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consumedMessages, setConsumedMessages] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_TOPICS_URL);
      setTopics(response.data);
    } catch (error) {
      setError("Failed to fetch topics");
    }
  };

  const sendMessage = async () => {
    if (!selectedTopic || !message) {
      alert("Please select a topic and enter a message.");
      return;
    }
    try {
      const response = await axios.get(API_ENDPOINTS.KAFKA_PUBLISH_MESSAGE_URL, {
        params: { topicName: selectedTopic, message },
      });
      alert(response.data.status);
    } catch (error) {
      alert("Failed to send message.");
    }
  };

  const consumeMessages = async () => {
    if (!selectedTopic) {
      alert("Please select a topic.");
      return;
    }
    try {
      const response = await axios.get(API_ENDPOINTS.KAFKA_CONSUME_MESSAGE_URL, {
        params: { topicName: selectedTopic },
      });
      setConsumedMessages(response.data.status);
    } catch (error) {
      console.error("Error consuming messages:", error);
      alert("Failed to fetch messages.");
    }
};
  
  const handlePathChange = (event) => {
    setKafkaUserDefinedPath(event.target.value.trim()); // Store raw path
  };
  
  const handleSetupKafka = async () => {
    try {
      const params = new URLSearchParams();
      params.append("kafkaAutoSetupRequired", kafkaAutoSetupRequired);
      params.append("kafkaUserDefinedPathRequired", kafkaUserDefinedPathRequired);
  
      // ✅ Send raw path without encoding
      if (kafkaUserDefinedPathRequired && kafkaUserDefinedPath) {
        params.append("kafkaUserDefinedPath", kafkaUserDefinedPath);
      }
  
      const apiUrl = `${API_ENDPOINTS.SETUP_KAFKA}?${params.toString()}`;
      console.log("🔹 API Call URL:", apiUrl);
  
      const response = await axios.post(apiUrl, {}, {
        headers: { "Content-Type": "application/json" }
      });
  
      setSetupKafkaResponse(response.data.status);
      alert(response.data.status);
    } catch (error) {
      console.error("❌ Setup Kafka Error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

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

      <h2 style={styles.sectionHeader}>Kafka Manager</h2>

      {/* Setup Kafka Section (New Feature) */}
      <div style={styles.container}>
      <h2 style={styles.sectionHeader}>Setup Kafka</h2>

      {/* Auto Setup Checkbox */}
      <label>
        <input
          type="checkbox"
          checked={kafkaAutoSetupRequired}
          onChange={() => setKafkaAutoSetupRequired(!kafkaAutoSetupRequired)}
        />
        Kafka Auto Setup Required
      </label>

      {/* User Defined Path Checkbox */}
      <label>
        <input
          type="checkbox"
          checked={kafkaUserDefinedPathRequired}
          onChange={() => setKafkaUserDefinedPathRequired(!kafkaUserDefinedPathRequired)}
        />
        Kafka User Defined Path Required
      </label>

      {/* Input Field for Folder Path */}
      {kafkaUserDefinedPathRequired && (
        <input
          type="text"
          placeholder="Enter folder path (e.g., C:\Users\YourName\Kafka)"
          value={kafkaUserDefinedPath}
          onChange={handlePathChange}
          style={styles.input}
        />
      )}

      {/* Setup Kafka Button */}
      <button style={styles.button} onClick={handleSetupKafka}>
        Setup Kafka
      </button>

      {/* Response Message */}
      {setupKafkaResponse && <p style={styles.responseMessage}>{setupKafkaResponse}</p>}
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
      <div>
      
      {/* Push Kafka Message */}
      <label>Select Topic:</label>
      <select onChange={(e) => setSelectedTopic(e.target.value)} value={selectedTopic} style={styles.input}>
        <option value="">-- Select a Topic --</option>
        {topics.map((topic) => (
          <option key={topic} value={topic}>{topic}</option>
        ))}
      </select>

      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>Push Message</h3>
        <textarea
          placeholder="Enter message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
        />
        <button style={styles.button} onClick={sendMessage}>Send Message</button>
      </div>    

      {/* Consume Kafka Message */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>Consume Messages</h3>
        <button style={styles.button} onClick={consumeMessages}>Fetch Messages</button>
        <pre style={styles.pre}>{consumedMessages}</pre>
      </div>
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
