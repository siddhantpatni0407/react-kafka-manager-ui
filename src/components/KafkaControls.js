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

  // New states for Kafka Setup
  const [kafkaAutoSetupRequired, setKafkaAutoSetupRequired] = useState(false);
  const [kafkaUserDefinedPathRequired, setKafkaUserDefinedPathRequired] =
    useState(false);
  const [kafkaUserDefinedPath, setKafkaUserDefinedPath] = useState("");
  const [setupKafkaResponse, setSetupKafkaResponse] = useState("");

  const [selectedTopic, setSelectedTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consumedMessages, setConsumedMessages] = useState("");

  const sendMessage = async () => {
    if (!selectedTopic || !message) {
      alert("Please select a topic and enter a message.");
      return;
    }
    try {
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_PUBLISH_MESSAGE_URL,
        {
          params: { topicName: selectedTopic, message },
        }
      );
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
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_CONSUME_MESSAGE_URL,
        {
          params: { topicName: selectedTopic },
        }
      );
      setConsumedMessages(response.data.status);
    } catch (error) {
      console.error("Error consuming messages:", error);
      alert("Failed to fetch messages.");
    }
  };

  const handlePathChange = (event) => {
    setKafkaUserDefinedPath(event.target.value.trim()); // Store raw path
  };

  const isValidPath = (path) => {
    // Ensure path is not empty
    if (!path.trim()) return false;

    // Allow Windows (C:\Users\Kafka) and Unix-like (/home/user/kafka) paths
    const pathRegex = /^(?:[A-Za-z]:\\|\/)[\w\s\-.\\/]+$/;

    return pathRegex.test(path);
  };

  const handleSetupKafka = async () => {
    try {
      const params = new URLSearchParams();
      params.append("kafkaAutoSetupRequired", kafkaAutoSetupRequired);
      params.append(
        "kafkaUserDefinedPathRequired",
        kafkaUserDefinedPathRequired
      );

      // ✅ Send raw path without encoding
      if (kafkaUserDefinedPathRequired && kafkaUserDefinedPath) {
        params.append("kafkaUserDefinedPath", kafkaUserDefinedPath);
      }

      const apiUrl = `${API_ENDPOINTS.SETUP_KAFKA}?${params.toString()}`;
      console.log("🔹 API Call URL:", apiUrl);

      const response = await axios.post(
        apiUrl,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSetupKafkaResponse(response.data.status);
      alert(response.data.status);
    } catch (error) {
      console.error("❌ Setup Kafka Error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  // Generalized handleAction function
  const handleAction = async (
    url,
    method = "POST",
    params = {},
    actionType = ""
  ) => {
    console.log("Calling API:", url, method, params); // Debugging log
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
      {/* Error Message at the Top */}
      {error && (
        <div className="alert alert-danger text-center fw-bold" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      )}

      {/* Kafka Logo & Header */}
      <div className="text-center my-4">
        <img
          src="/kafka-logo.png"
          alt="Kafka Logo"
          className="img-fluid"
          style={{ maxWidth: "150px" }}
        />
      </div>

      {/* Setup Kafka Section */}
      <div className="card shadow-lg p-4 border-0">
        <h2 className="text-primary text-center mb-4">
          <i className="bi bi-gear-fill"></i> Setup Kafka
        </h2>

        {/* Checkboxes Row for Auto Setup & User Path */}
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="form-check d-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoSetup"
              checked={kafkaAutoSetupRequired}
              onChange={() =>
                setKafkaAutoSetupRequired(!kafkaAutoSetupRequired)
              }
              style={{ transform: "scale(1.2)" }} // Slightly larger checkbox
            />
            <label className="form-check-label fw-semibold" htmlFor="autoSetup">
              Kafka Auto setup required?
            </label>
          </div>

          <div className="form-check d-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="userPath"
              checked={kafkaUserDefinedPathRequired}
              onChange={() =>
                setKafkaUserDefinedPathRequired(!kafkaUserDefinedPathRequired)
              }
              style={{ transform: "scale(1.2)" }} // Slightly larger checkbox
            />
            <label className="form-check-label fw-semibold" htmlFor="userPath">
              Kafka user defined path required?
            </label>
          </div>
        </div>

        {/* Folder Path Input */}
        {kafkaUserDefinedPathRequired && (
          <div className="mb-3">
            <label htmlFor="folderPath" className="form-label fw-semibold">
              Enter Folder Path:
            </label>
            <input
              type="text"
              id="folderPath"
              className={`form-control shadow-sm ${
                isValidPath(kafkaUserDefinedPath)
                  ? "border-primary"
                  : "border-danger"
              }`}
              placeholder="E.g., C:\Users\YourName\Kafka"
              value={kafkaUserDefinedPath}
              onChange={handlePathChange}
            />
            {!isValidPath(kafkaUserDefinedPath) && (
              <small className="text-danger">
                <i className="bi bi-exclamation-circle me-1"></i> Please enter a
                valid folder path.
              </small>
            )}
          </div>
        )}

        {/* Setup Kafka Button (Disabled when User Path is required but invalid) */}
        <button
          className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
          onClick={handleSetupKafka}
          disabled={
            kafkaUserDefinedPathRequired && !isValidPath(kafkaUserDefinedPath)
          }
        >
          <i className="bi bi-play-fill"></i> Setup Kafka
        </button>

        {/* Response Message */}
        {setupKafkaResponse && (
          <div className="alert alert-info mt-3 text-center">
            {setupKafkaResponse}
          </div>
        )}
      </div>

      {/* Start Kafka Section */}
      <div className="card shadow-sm p-4 text-center">
        <h2 className="text-success mb-3">
          <i className="bi bi-play-fill"></i> Start Kafka Server
        </h2>
        <button
          className="btn btn-success w-100 fw-bold"
          onClick={() => {
            setIsStarting(true);
            handleAction(API_ENDPOINTS.START_KAFKA_URL, "POST", {}, "start");
          }}
          disabled={isStarting || isLoading}
        >
          {isStarting ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Starting...
            </span>
          ) : (
            <span>
              <i className="bi bi-power me-2"></i> Start Kafka
            </span>
          )}
        </button>
        {startKafkaResponse && (
          <p className="mt-3 text-success">{startKafkaResponse}</p>
        )}
      </div>
      {/* Stop Kafka Section */}
      <div className="card shadow-sm p-4 text-center mt-4">
        <h2 className="text-danger mb-3">
          <i className="bi bi-stop-fill"></i> Stop Kafka Server
        </h2>
        <button
          className="btn btn-danger w-100 fw-bold"
          onClick={() => {
            setIsStopping(true);
            handleAction(API_ENDPOINTS.STOP_KAFKA_URL, "POST", {}, "stop");
          }}
          disabled={isStopping || isLoading}
        >
          {isStopping ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Stopping...
            </span>
          ) : (
            <span>
              <i className="bi bi-x-circle me-2"></i> Stop Kafka
            </span>
          )}
        </button>
        {stopKafkaResponse && (
          <p className="mt-3 text-danger">{stopKafkaResponse}</p>
        )}
      </div>
      {/* Create Topic Section */}
      <div className="card shadow-sm p-4 text-center">
        <h2 className="text-primary mb-3">
          <i className="bi bi-plus-circle"></i> Create Kafka Topic
        </h2>

        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter topic name"
            value={createTopicName}
            onChange={(e) => setCreateTopicName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Enter number of partitions (optional)"
            value={partition}
            onChange={(e) => setPartition(e.target.value)}
            min="1"
          />
        </div>

        <button
          className="btn btn-primary w-100 fw-bold"
          onClick={handleCreateTopic}
          disabled={isCreating || isLoading}
        >
          {isCreating ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Creating...
            </span>
          ) : (
            <span>
              <i className="bi bi-file-earmark-plus me-2"></i> Create Topic
            </span>
          )}
        </button>

        {createTopicResponse && (
          <p className="mt-3 text-success">{createTopicResponse}</p>
        )}
      </div>
      {/* Get All Topics Section */}
      <div className="card shadow-lg p-4 border-0">
        <h2 className="text-primary text-center mb-3">
          <i className="bi bi-list-task"></i> Get All Kafka Topics
        </h2>

        {/* Fetch Topics Button */}
        <button
          className="btn btn-success fw-bold w-100 mb-3 d-flex align-items-center justify-content-center"
          onClick={getTopics}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Loading...
            </span>
          ) : (
            <span>
              <i className="bi bi-arrow-repeat me-2"></i> Fetch Topics
            </span>
          )}
        </button>

        {/* Topics List Container */}
        <div
          className="border rounded p-3 bg-light overflow-auto shadow-sm"
          style={{ maxHeight: "250px" }}
        >
          {topics.length > 0 ? (
            <ul className="list-group list-group-flush">
              {topics.map((topic, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex align-items-center"
                >
                  <span className="badge bg-success me-2">{index + 1}</span>
                  <strong className="text-dark">{topic}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-center">
              <i className="bi bi-exclamation-circle-fill me-2"></i> No topics
              available
            </p>
          )}
        </div>
      </div>
      {/* Get Topic Details Section */}
      <div className="card shadow-lg p-4 border-0">
        <h2 className="text-primary text-center mb-3">
          <i className="bi bi-info-circle"></i> Get Topic Details
        </h2>

        {/* Topic Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="topic-dropdown" className="form-label fw-bold">
            Select a Topic:
          </label>
          <select
            id="topic-dropdown"
            className="form-select"
            value={topicNameForDetails}
            onChange={(e) => setTopicNameForDetails(e.target.value)}
          >
            <option value="">-- Select a Topic --</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Fetch Details Button */}
        <button
          className="btn btn-success w-100 mb-3 fw-bold"
          onClick={handleGetTopicDetails}
          disabled={isLoading || !topicNameForDetails}
        >
          {isLoading ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Loading...
            </span>
          ) : (
            <span>
              <i className="bi bi-search me-2"></i> Get Topic Details
            </span>
          )}
        </button>

        {/* Display Topic Details in a Responsive Table */}
        {topicDetails && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-hover">
              <thead className="table-dark text-center">
                <tr>
                  <th>Topic Name</th>
                  <th>Partition</th>
                  <th>Leader</th>
                  <th>Replicas</th>
                  <th>ISR</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {topicDetails.partitions.map((partition, index) => (
                  <tr key={index}>
                    <td className="fw-bold text-primary">
                      {topicDetails.name}
                    </td>
                    <td>{partition.partition}</td>
                    <td>
                      <span
                        className={`badge ${
                          partition.leader.empty ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {partition.leader.empty ? "None" : "Available"}
                      </span>
                    </td>
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
        {/* Push Kafka Message Section */}
        <div className="card shadow-lg p-4 border-0">
          <h2 className="text-primary text-center mb-3">
            <i className="bi bi-envelope-paper"></i> Push Kafka Message
          </h2>

          {/* Topic Selection Dropdown */}
          <div className="mb-3">
            <label htmlFor="topic-select" className="form-label fw-bold">
              Select Topic:
            </label>
            <select
              id="topic-select"
              className="form-select"
              onChange={(e) => setSelectedTopic(e.target.value)}
              value={selectedTopic}
            >
              <option value="">-- Select a Topic --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Message Input TextArea */}
          <div className="mb-3">
            <label htmlFor="message-input" className="form-label fw-bold">
              Enter Message:
            </label>
            <textarea
              id="message-input"
              className="form-control"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5} // Proper height
              style={{
                fontSize: "16px",
                padding: "12px",
                borderRadius: "8px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Send Message Button */}
          <button
            className="btn btn-success w-100 fw-bold"
            onClick={sendMessage}
            disabled={!selectedTopic || !message}
          >
            <i className="bi bi-send-fill me-2"></i> Send Message
          </button>
        </div>

        {/* Consume Kafka Message Section */}
        <div className="card shadow-lg p-4 border-0">
          <h2 className="text-danger text-center mb-3">
            <i className="bi bi-chat-dots-fill"></i> Consume Messages
          </h2>

          {/* Fetch Messages Button */}
          <button
            className="btn btn-warning w-100 fw-bold"
            onClick={consumeMessages}
          >
            <i className="bi bi-arrow-repeat me-2"></i> Fetch Messages
          </button>

          {/* Display Consumed Messages */}
          <div
            className="border rounded mt-3 p-3 bg-light overflow-auto"
            style={{
              maxHeight: "250px",
              whiteSpace: "pre-wrap",
              fontSize: "14px",
            }}
          >
            {consumedMessages ? (
              <pre className="m-0">{consumedMessages}</pre>
            ) : (
              <p className="text-muted text-center">
                <i className="bi bi-exclamation-circle-fill me-2"></i> No
                messages available
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Delete Logs Section */}
      <div className="card shadow-lg p-4 border-0">
        <h2 className="text-danger text-center mb-3">
          <i className="bi bi-trash-fill"></i> Delete Kafka Logs
        </h2>

        {/* Delete Button */}
        <button
          className="btn btn-danger w-100 fw-bold"
          onClick={() => {
            setIsDeleting(true);
            handleAction(API_ENDPOINTS.DELETE_LOGS_URL, "DELETE", {}, "delete");
          }}
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? (
            <span>
              <i className="spinner-border spinner-border-sm me-2"></i>{" "}
              Deleting...
            </span>
          ) : (
            <span>
              <i className="bi bi-trash3 me-2"></i> Delete Logs
            </span>
          )}
        </button>

        {/* Response Message */}
        {deleteLogsResponse && (
          <div className="alert alert-warning mt-3 text-center">
            {deleteLogsResponse}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "25px",
    maxWidth: "750px",
    margin: "auto",
    backgroundColor: "#fefefe",
    borderRadius: "10px",
    boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
  },
  errorContainer: {
    padding: "12px",
    backgroundColor: "#ffe6e6",
    border: "1px solid #ff4d4d",
    borderRadius: "6px",
    marginBottom: "15px",
  },
  errorMessage: {
    color: "#ff0000",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "14px",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "22px",
    fontWeight: "bold",
  },
  logo: {
    width: "140px", // Responsive logo size
    marginBottom: "15px",
  },
  section: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s",
  },
  sectionHeader: {
    fontSize: "17px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
  },
  button: {
    padding: "12px 20px",
    fontSize: "15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s, transform 0.2s",
    width: "100%",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
    transform: "scale(1.02)",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s ease-in-out",
  },
  inputFocus: {
    borderColor: "#007BFF",
  },
  responseMessage: {
    color: "green",
    marginTop: "12px",
    fontSize: "14px",
    fontWeight: "bold",
  },
  topicsContainer: {
    marginTop: "20px",
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "6px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  topicList: {
    listStyleType: "none",
    paddingLeft: "0",
  },
  detailsContainer: {
    backgroundColor: "#f9f9f9",
    padding: "12px",
    borderRadius: "6px",
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    backgroundColor: "#f2f2f2",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
};

export default KafkaControls;
