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
  const [sendMessageResponse, setSendMessageResponse] = useState("");
  const [consumeMessageResponse, setConsumeMessageResponse] = useState("");
  const [selectedConsumeTopic, setSelectedConsumeTopic] = useState("");

  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [kafkaHealthStatus, setKafkaHealthStatus] = useState("");

  const checkKafkaHealth = async () => {
    try {
      setIsCheckingHealth(true);
      const response = await fetch(
        API_ENDPOINTS.KAFKA_CONSUME_HEALTH_CHECK_URL
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setKafkaHealthStatus(data?.status || "Kafka is running fine.");
    } catch (error) {
      console.error("Kafka health check failed:", error);
      setKafkaHealthStatus("Kafka health check failed. Please try again.");
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedTopic || !message) {
      setSendMessageResponse("⚠️ Please select a topic and enter a message.");
      return;
    }

    try {
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_PUBLISH_MESSAGE_URL,
        {
          params: { topicName: selectedTopic, message },
        }
      );

      // Update state instead of using alert
      setSendMessageResponse(`✅ ${response.data.status}`);
      setMessage(""); // Clear input field after sending
    } catch (error) {
      setSendMessageResponse("❌ Failed to send message. Please try again.");
    }
  };

  const consumeMessages = async () => {
    if (!selectedTopic) {
      setConsumeMessageResponse("⚠️ Please select a topic.");
      return;
    }

    try {
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_CONSUME_MESSAGE_URL,
        {
          params: { topicName: selectedTopic },
        }
      );

      // Set consumed messages and response message
      setConsumedMessages(response.data.status || "No messages found.");
      setConsumeMessageResponse(
        `✅ Messages fetched successfully from topic: ${selectedTopic}`
      );
    } catch (error) {
      console.error("Error consuming messages:", error);
      setConsumeMessageResponse(
        "❌ Failed to fetch messages. Please try again."
      );
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
          className="img-fluid rounded shadow"
          style={{ maxWidth: "200px", height: "auto" }}
        />
      </div>

      {/* Setup Kafka Section */}
      <div className="card shadow-lg p-4 border-0">
        <h4 className="text-primary text-center mb-4 fw-bold">
          <i className="bi bi-gear-fill fs-6"></i> Setup Kafka
        </h4>

        {/* Checkboxes Row for Auto Setup & User Path */}
        <div className="d-flex flex-column gap-2 mb-3">
          <div className="form-check d-flex align-items-center gap-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoSetup"
              checked={kafkaAutoSetupRequired}
              onChange={() => setKafkaAutoSetupRequired((prev) => !prev)}
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
              onChange={() => setKafkaUserDefinedPathRequired((prev) => !prev)}
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
              aria-describedby="pathHelp"
            />
            {!isValidPath(kafkaUserDefinedPath) && (
              <small id="pathHelp" className="text-danger">
                <i className="bi bi-exclamation-circle me-1"></i> Please enter a
                valid folder path.
              </small>
            )}
          </div>
        )}

        {/* Setup Kafka Button */}
        <button
          className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={handleSetupKafka}
          disabled={
            kafkaUserDefinedPathRequired && !isValidPath(kafkaUserDefinedPath)
          }
        >
          <i className="bi bi-play-fill"></i> Setup Kafka
        </button>

        {/* Response Message */}
        {setupKafkaResponse && (
          <div className="alert alert-info mt-3 text-center fw-bold shadow-sm">
            {setupKafkaResponse}
          </div>
        )}
      </div>

      {/* Check Kafka Health Section */}
      <div className="card shadow-lg p-4 border-0 mb-4">
        <h4 className="text-info text-center mb-3 fw-bold">
          <i className="bi bi-heart-pulse fs-6"></i> Check Kafka Health
        </h4>

        <button
          className="btn btn-info w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
          onClick={checkKafkaHealth}
          disabled={isCheckingHealth}
        >
          {isCheckingHealth ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Checking...
            </>
          ) : (
            <>
              <i className="bi bi-heart-pulse-fill"></i> Check Kafka Health
            </>
          )}
        </button>

        {/* Display Health Check Response */}
        {kafkaHealthStatus && (
          <div
            className={`alert mt-3 text-center fw-bold shadow-sm ${
              kafkaHealthStatus.includes("failed")
                ? "alert-danger"
                : "alert-success"
            }`}
            role="alert"
          >
            {kafkaHealthStatus}
          </div>
        )}
      </div>

      {/* Start Kafka Section */}
      <div className="card shadow-lg p-4 border-0 text-center">
        <h4 className="text-success mb-3 fw-bold">
          <i className="bi bi-play-fill fs-6"></i> Start Kafka Server
        </h4>

        {/* Start Kafka Button */}
        <button
          className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={() => {
            setIsStarting(true);
            handleAction(API_ENDPOINTS.START_KAFKA_URL, "POST", {}, "start");
          }}
          disabled={isStarting || isLoading}
        >
          {isStarting ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Starting...
            </>
          ) : (
            <>
              <i className="bi bi-power"></i> Start Kafka
            </>
          )}
        </button>

        {/* Response Message */}
        {startKafkaResponse && (
          <div className="alert alert-success mt-3 fw-bold shadow-sm">
            {startKafkaResponse}
          </div>
        )}
      </div>

      {/* Stop Kafka Section */}
      <div className="card shadow-lg p-4 border-0 text-center mt-4">
        <h4 className="text-danger mb-3 fw-bold">
          <i className="bi bi-stop-fill fs-6"></i> Stop Kafka Server
        </h4>

        {/* Stop Kafka Button */}
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={() => {
            setIsStopping(true);
            handleAction(API_ENDPOINTS.STOP_KAFKA_URL, "POST", {}, "stop");
          }}
          disabled={isStopping || isLoading}
        >
          {isStopping ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Stopping...
            </>
          ) : (
            <>
              <i className="bi bi-x-circle"></i> Stop Kafka
            </>
          )}
        </button>

        {/* Response Message */}
        {stopKafkaResponse && (
          <div className="alert alert-danger mt-3 fw-bold shadow-sm">
            {stopKafkaResponse}
          </div>
        )}
      </div>

      {/* Create Topic Section */}
      <div className="card shadow-lg p-4 border-0 text-center">
        <h4 className="text-primary mb-3 fw-bold">
          <i className="bi bi-plus-circle fs-6"></i> Create Kafka Topic
        </h4>

        {/* Topic Name Input */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="Enter topic name"
            value={createTopicName}
            onChange={(e) => setCreateTopicName(e.target.value)}
            aria-label="Enter topic name"
          />
        </div>

        {/* Partitions Input */}
        <div className="mb-3">
          <input
            type="number"
            className="form-control shadow-sm"
            placeholder="Enter number of partitions (optional)"
            value={partition}
            onChange={(e) => setPartition(e.target.value)}
            min="1"
            aria-label="Enter number of partitions"
          />
        </div>

        {/* Create Topic Button */}
        <button
          className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={handleCreateTopic}
          disabled={isCreating || isLoading}
        >
          {isCreating ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Creating...
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-plus"></i> Create Topic
            </>
          )}
        </button>

        {/* Response Message */}
        {createTopicResponse && (
          <div className="alert alert-success mt-3 fw-bold shadow-sm">
            {createTopicResponse}
          </div>
        )}
      </div>

      {/* View All Topics Section */}
      <div className="card shadow-lg p-4 border-0">
        <h4 className="text-primary text-center mb-3 fw-bold">
          <i className="bi bi-list-task fs-6"></i> View All Kafka Topics
        </h4>

        {/* Fetch Topics Button */}
        <button
          className="btn btn-success fw-bold w-100 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={getTopics}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Loading...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-repeat"></i> Fetch Topics
            </>
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
                  className="list-group-item d-flex align-items-center gap-2"
                >
                  <span className="badge bg-success">{index + 1}</span>
                  <strong className="text-dark">{topic}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-center fw-semibold">
              <i className="bi bi-exclamation-circle-fill me-2"></i> No topics
              available
            </p>
          )}
        </div>
      </div>

      {/* Get Topic Details Section */}
      <div className="card shadow-lg p-4 border-0">
        <h4 className="text-primary text-center mb-3 fw-bold">
          <i className="bi bi-info-circle fs-6"></i> Get Topic Details
        </h4>

        {/* Topic Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="topic-dropdown" className="form-label fw-semibold">
            Select a Topic:
          </label>
          <select
            id="topic-dropdown"
            className="form-select shadow-sm"
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
          className="btn btn-success w-100 mb-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={handleGetTopicDetails}
          disabled={isLoading || !topicNameForDetails}
        >
          {isLoading ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Loading...
            </>
          ) : (
            <>
              <i className="bi bi-search"></i> Get Topic Details
            </>
          )}
        </button>

        {/* Display Topic Details in a Responsive Table */}
        {topicDetails && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-hover table-striped text-center">
              <thead className="table-dark">
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
                    <td className="fw-semibold text-primary">
                      {topicDetails.name}
                    </td>
                    <td>{partition.partition}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
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
        {/* Publish Kafka Message Section */}
        <div className="card shadow-lg p-4 border-0 mb-2">
          <h4 className="text-primary text-center mb-3 fw-bold">
            <i className="bi bi-envelope-paper fs-6"></i> Publish Kafka Message
          </h4>

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
              aria-label="Select Kafka Topic"
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
              rows={4}
              style={{ fontSize: "16px", padding: "12px", borderRadius: "8px" }}
              aria-label="Kafka Message Input"
            />
          </div>

          {/* Send Message Button */}
          <button
            className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={sendMessage}
            disabled={!selectedTopic || !message.trim()}
          >
            <i className="bi bi-send-fill"></i> Send Message
          </button>

          {/* Display Response Message */}
          {sendMessageResponse && (
            <div className="alert alert-info alert-dismissible fade show mt-3 text-center fw-bold">
              {sendMessageResponse}
            </div>
          )}
        </div>

        {/* Consume Kafka Message Section */}
        <div className="card shadow-lg p-4 border-0 mt-4">
          <h4 className="text-danger text-center mb-3 fw-bold">
            <i className="bi bi-chat-dots-fill fs-6"></i> Consume Messages
          </h4>

          {/* Topic Selection Dropdown */}
          <div className="mb-3">
            <label
              htmlFor="consume-topic-select"
              className="form-label fw-bold"
            >
              Select Topic:
            </label>
            <select
              id="consume-topic-select"
              className="form-select"
              onChange={(e) => setSelectedConsumeTopic(e.target.value)}
              value={selectedConsumeTopic}
              aria-label="Select Kafka Topic to Consume Messages"
            >
              <option value="">-- Select a Topic --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Fetch Messages Button */}
          <button
            className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={consumeMessages}
            disabled={!selectedConsumeTopic}
          >
            <i className="bi bi-arrow-repeat"></i> Fetch Messages
          </button>

          {/* Display Response Message */}
          {consumeMessageResponse && (
            <div className="alert alert-info alert-dismissible fade show mt-3 text-center fw-bold">
              {consumeMessageResponse}
            </div>
          )}

          {/* Display Consumed Messages */}
          {consumedMessages ? (
            <div
              className="border rounded mt-3 p-3 bg-light overflow-auto shadow-sm"
              style={{
                maxHeight: "250px",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
              }}
            >
              <pre className="m-0 text-success fw-bold">{consumedMessages}</pre>
            </div>
          ) : (
            !consumeMessageResponse && (
              <p className="text-muted text-center mt-3">
                <i className="bi bi-exclamation-circle-fill me-2"></i> No
                messages available
              </p>
            )
          )}
        </div>
      </div>

      {/* Delete Logs Section */}
      <div className="card shadow-lg p-4 border-0">
        <h4 className="text-danger text-center mb-3 fw-bold">
          <i className="bi bi-trash-fill fs-6"></i> Delete Kafka Logs
        </h4>

        {/* Delete Button */}
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
          onClick={async () => {
            try {
              setIsDeleting(true);
              const response = await handleAction(
                API_ENDPOINTS.DELETE_LOGS_URL,
                "DELETE",
                {},
                "delete"
              );
              setDeleteLogsResponse(
                response?.message || "Logs deleted successfully."
              );
            } catch (error) {
              setDeleteLogsResponse("Failed to delete logs. Please try again.");
            } finally {
              setIsDeleting(false);
            }
          }}
          disabled={isDeleting || isLoading}
          aria-disabled={isDeleting || isLoading}
        >
          {isDeleting ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Deleting...
            </>
          ) : (
            <>
              <i className="bi bi-trash3"></i> Delete Logs
            </>
          )}
        </button>

        {/* Response Message */}
        {deleteLogsResponse && (
          <div
            className="alert alert-warning mt-3 text-center fw-bold shadow-sm"
            role="alert"
          >
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
