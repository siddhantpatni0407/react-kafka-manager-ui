import React, { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "./constants"; // Importing the updated constants file
import {
  BiPulse,
  BiPlayCircle,
  BiStopCircle,
  BiServer,
  BiCog,
  BiErrorCircle,
  BiPlay,
  BiPlusCircle,
  BiRefresh,
} from "react-icons/bi";
import {
  AiOutlineFileAdd,
  AiOutlineUnorderedList,
  AiOutlineInfoCircle,
  AiOutlineSearch,
  AiOutlineMail,
  AiOutlineSend,
  AiOutlineReload,
  AiOutlineHistory,
  AiFillExclamationCircle,
  AiFillCloseCircle,
} from "react-icons/ai";
import { BsChatDotsFill } from "react-icons/bs";
import { FaTrashAlt, FaRegTrashAlt } from "react-icons/fa";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const KafkaControls = () => {
  const [topics, setTopics] = useState([]); // State to store the list of topics
  const [createTopicName, setCreateTopicName] = useState(""); // State to store the topic name for creating a topic
  const [topicNameForDetails, setTopicNameForDetails] = useState(""); // State to store the topic name for getting details
  const [partition, setPartition] = useState(""); // State to store the partition number (optional)
  const [createTopicResponse, setCreateTopicResponse] = useState(""); // State to store the create topic response
  const [stopKafkaResponse, setStopKafkaResponse] = useState(""); // State to store the stop Kafka response
  const [startKafkaResponse, setStartKafkaResponse] = useState(""); // State to store the start Kafka response
  const [deleteLogsResponse, setDeleteLogsResponse] = useState(""); // State to store the delete logs response
  const [topicDetails, setTopicDetails] = useState({
    topicName: "",
    partitionCount: 0,
    totalMessages: 0,
    totalLag: 0,
  });

  // Separate loading states for each button
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // General loading state
  const [error, setError] = useState(""); // Error message state

  // New states for Kafka Setup
  const [isSettingUp, setIsSettingUp] = useState(false);
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

  const [topicToDelete, setTopicToDelete] = useState("");
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);
  const [deleteTopicResponse, setDeleteTopicResponse] = useState("");

  const [format, setFormat] = useState("plain");
  const [maxMessages, setMaxMessages] = useState(1);
  const [fromBeginning, setFromBeginning] = useState(false);
  const [group, setGroup] = useState("");
  const [timeoutMs, setTimeoutMs] = useState(10000);
  const [responseMessage, setResponseMessage] = useState("");
  const [partitionError, setPartitionError] = useState("");

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
    if (!selectedConsumeTopic) {
      setConsumeMessageResponse("⚠️ Please select a topic.");
      return;
    }

    try {
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_CONSUME_MESSAGE_URL,
        {
          params: { topicName: selectedConsumeTopic },
        }
      );

      if (
        response.data.status &&
        response.data.status.includes("No messages")
      ) {
        setConsumedMessages(""); // Clear any previously fetched messages
        setConsumeMessageResponse(
          "❌ No messages available in this topic. Please ensure messages have been pushed."
        );
      } else {
        setConsumedMessages(response.data.status || "No messages found.");
        setConsumeMessageResponse(
          `✅ Messages fetched successfully from topic: ${selectedConsumeTopic}`
        );
      }
    } catch (error) {
      console.error("Error consuming messages:", error);
      setConsumeMessageResponse(
        "❌ Failed to fetch messages. Please try again."
      );
    }
  };

  const consumeLatestMessage = async () => {
    if (!selectedConsumeTopic) return;

    try {
      // Use the constant API endpoint for the latest message
      const response = await fetch(
        `${API_ENDPOINTS.KAFKA_CONSUME_LATEST_MESSAGE_URL}?topicName=${selectedConsumeTopic}`
      );
      const data = await response.json();

      if (response.ok) {
        setConsumeMessageResponse(
          `Latest message consumed from topic '${selectedConsumeTopic}'`
        );
        setConsumedMessages(data.message);
      } else {
        setConsumeMessageResponse(
          data.status || "Failed to consume latest message"
        );
        setConsumedMessages(null);
      }
    } catch (error) {
      console.error("Error consuming latest message:", error);
      setConsumeMessageResponse("Error consuming latest message");
      setConsumedMessages(null);
    }
  };

  const consumeMessagesWithOptions = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.KAFKA_CONSUME_MESSAGE_WITH_OPTIONS_URL,
        {
          params: {
            topicName: selectedTopic,
            format,
            maxMessages,
            fromBeginning,
            partition: partition || "",
            group: group || "",
            timeoutMs,
          },
        }
      );
      setResponseMessage(response.data.status);
      setConsumedMessages(response.data.messages || "");
    } catch (error) {
      setResponseMessage("Error consuming messages");
      console.error("Error:", error);
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

      //alert(response.data.status); // Display the success message
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
      console.log("Fetched topics:", response.data); // Debugging log
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

  const deleteKafkaTopic = async () => {
    if (!topicToDelete) {
      setDeleteTopicResponse("Please select a topic to delete.");
      return;
    }

    try {
      setIsDeletingTopic(true);

      // Use query parameter instead of request body
      const url = `${
        API_ENDPOINTS.DELETE_KAFKA_TOPIC_URL
      }?topicName=${encodeURIComponent(topicToDelete)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      setDeleteTopicResponse(data?.message || "Topic deleted successfully.");
    } catch (error) {
      console.error("Error deleting topic:", error);
      setDeleteTopicResponse(`Failed to delete topic: ${error.message}`);
    } finally {
      setIsDeletingTopic(false);
    }
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

  // Register the necessary components
  ChartJS.register(ArcElement, Tooltip, Legend);

  // Initialize Pie Chart Data
  const pieData = {
    labels: ["Partitions", "Total Messages", "Total Lag"],
    datasets: [
      {
        data: [0, 0, 0], // Default empty data
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Update Pie Chart Data Dynamically
  if (topicDetails) {
    pieData.datasets[0].data = [
      topicDetails.partitionCount || 0,
      topicDetails.totalMessages || 0,
      topicDetails.totalLag || 0,
    ];
  }

  return (
    <div style={styles.container}>
      {/* Error Message at the Top  - START*/}
      {error && (
        <div
          className="alert alert-danger text-center fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill fs-5"></i> {error}
        </div>
      )}
      {/* Error Message at the Top  - END*/}

      {/* Kafka Logo & Header  - START*/}
      <div className="text-center my-4">
        <img
          src="/icons/kafka-logo.png"
          alt="Kafka Logo"
          className="img-fluid rounded shadow-lg"
          style={{
            maxWidth: "200px",
            height: "auto",
            transition: "transform 0.3s ease-in-out",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>
      {/* Kafka Logo & Header  - END*/}

      {/* Setup Kafka Section - START*/}
      <div className="card shadow-lg p-4 border-0">
        <h4 className="text-primary text-center mb-4 fw-bold d-flex align-items-center justify-content-center gap-2">
          <BiCog size={24} /> Setup Kafka
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
              <small
                id="pathHelp"
                className="text-danger d-flex align-items-center gap-1"
              >
                <BiErrorCircle /> Please enter a valid folder path.
              </small>
            )}
          </div>
        )}

        {/* Setup Kafka Button */}
        <button
          className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm py-3"
          onClick={async () => {
            try {
              setIsSettingUp(true);
              const response = await handleSetupKafka();
              setSetupKafkaResponse(
                response?.message || "Kafka setup successful."
              );
            } catch (error) {
              setSetupKafkaResponse("Failed to setup Kafka. Please try again.");
            } finally {
              setIsSettingUp(false);
            }
          }}
          disabled={
            isSettingUp ||
            (kafkaUserDefinedPathRequired && !isValidPath(kafkaUserDefinedPath))
          }
          aria-disabled={isSettingUp}
        >
          {isSettingUp ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Setting Up...
            </>
          ) : (
            <>
              <BiPlay size={24} /> Setup Kafka
            </>
          )}
        </button>

        {/* Response Message */}
        {setupKafkaResponse && (
          <div className="alert alert-info mt-3 text-center fw-bold shadow-sm">
            {setupKafkaResponse}
          </div>
        )}
      </div>
      {/* Setup Kafka Section - END*/}

      {/* Kafka Server Control Section - START */}
      <div className="card shadow-lg p-4 border-0 mb-4">
        <h4 className="text-primary text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <BiServer size={28} /> Kafka Server Controls
        </h4>

        {/* Buttons Container */}
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {/* Check Kafka Health Button */}
          <button
            className="btn btn-info fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg px-4 py-3"
            onClick={checkKafkaHealth}
            disabled={isCheckingHealth}
            aria-disabled={isCheckingHealth}
          >
            <BiPulse size={30} />
            {isCheckingHealth ? (
              <>
                <i className="spinner-border spinner-border-sm"></i> Checking...
              </>
            ) : (
              <>Check Kafka Health</>
            )}
          </button>

          {/* Start Kafka Button */}
          <button
            className="btn btn-success fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg px-4 py-3"
            onClick={() => {
              setIsStarting(true);
              handleAction(API_ENDPOINTS.START_KAFKA_URL, "POST", {}, "start");
            }}
            disabled={isStarting || isLoading}
            aria-disabled={isStarting || isLoading}
          >
            <BiPlayCircle size={30} />
            {isStarting ? (
              <>
                <i className="spinner-border spinner-border-sm"></i> Starting...
              </>
            ) : (
              <>Start Kafka</>
            )}
          </button>

          {/* Stop Kafka Button */}
          <button
            className="btn btn-danger fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg px-4 py-3"
            onClick={() => {
              setIsStopping(true);
              handleAction(API_ENDPOINTS.STOP_KAFKA_URL, "POST", {}, "stop");
            }}
            disabled={isStopping || isLoading}
            aria-disabled={isStopping || isLoading}
          >
            <BiStopCircle size={30} />
            {isStopping ? (
              <>
                <i className="spinner-border spinner-border-sm"></i> Stopping...
              </>
            ) : (
              <>Stop Kafka</>
            )}
          </button>
        </div>

        {/* Response Messages */}
        <div className="mt-3">
          {kafkaHealthStatus && (
            <div
              className={`alert text-center fw-bold shadow-sm ${
                kafkaHealthStatus.toLowerCase().includes("failed")
                  ? "alert-danger"
                  : "alert-success"
              }`}
              role="alert"
            >
              {kafkaHealthStatus}
            </div>
          )}
          {startKafkaResponse && (
            <div
              className="alert alert-success fw-bold shadow-sm text-center"
              role="alert"
            >
              {startKafkaResponse}
            </div>
          )}
          {stopKafkaResponse && (
            <div
              className="alert alert-danger fw-bold shadow-sm text-center"
              role="alert"
            >
              {stopKafkaResponse}
            </div>
          )}
        </div>
      </div>
      {/* Kafka Server Control Section - END */}

      {/* Create Topic Section - START */}
      <div className="card shadow-lg p-4 border-0 text-center bg-light rounded-4 animate__animated animate__fadeIn">
        <h4 className="text-primary mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <BiPlusCircle size={24} /> Create Kafka Topic
        </h4>

        {/* Topic Name Input */}
        <div className="mb-3 position-relative">
          <input
            type="text"
            className="form-control shadow-sm border-primary rounded-3"
            placeholder="Enter topic name"
            value={createTopicName}
            onChange={(e) => setCreateTopicName(e.target.value)}
            aria-label="Enter topic name"
          />
        </div>

        {/* Partitions Input */}
        <div className="mb-3 position-relative">
          <input
            type="text"
            className="form-control shadow-sm border-primary rounded-3"
            placeholder="Enter number of partitions (optional)"
            value={partition}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d+$/.test(value) || value === "") {
                setPartition(value);
                setPartitionError("");
              } else {
                setPartition(value);
                setPartitionError("Please enter a valid partition value.");
              }
            }}
            min="1"
            aria-label="Enter number of partitions"
          />
          {partitionError && (
            <div className="text-danger mt-1 small">{partitionError}</div>
          )}
        </div>

        {/* Create Topic Button */}
        <button
          className="btn btn-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
          onClick={handleCreateTopic}
          disabled={!createTopicName.trim() || isCreating || isLoading}
        >
          {isCreating ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Creating...
            </>
          ) : (
            <>
              <AiOutlineFileAdd size={24} /> Create Topic
            </>
          )}
        </button>

        {/* Response Message */}
        {createTopicResponse && (
          <div className="alert alert-success mt-3 fw-bold shadow-sm rounded-3 animate__animated animate__fadeInUp">
            {createTopicResponse}
          </div>
        )}
      </div>
      {/* Create Topic Section - END */}

      {/* View All Topics Section - START */}
      <div className="card shadow-lg p-4 border-0 bg-light rounded-4 animate__animated animate__fadeIn">
        <h4 className="text-primary text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <AiOutlineUnorderedList size={24} /> View All Kafka Topics
        </h4>

        {/* Fetch Topics Button */}
        <button
          className="btn btn-success fw-bold w-100 mb-3 d-flex align-items-center justify-content-center gap-2 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
          onClick={getTopics}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Loading...
            </>
          ) : (
            <>
              <BiRefresh size={24} /> Fetch all Topics
            </>
          )}
        </button>

        {/* Topics List Container */}
        <div
          className="border rounded-4 p-3 bg-light overflow-auto shadow-sm animate__animated animate__fadeInUp"
          style={{ maxHeight: "250px" }}
        >
          {topics.length > 0 ? (
            <ul className="list-group list-group-flush">
              {topics.map((topic, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex align-items-center gap-2 rounded-3 shadow-sm animate__animated animate__fadeInUp"
                >
                  <span className="badge bg-success rounded-pill px-3 py-2 fs-6">
                    {index + 1}
                  </span>
                  <strong className="text-dark fs-5">{topic}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-center fw-semibold animate__animated animate__shakeX">
              <BiErrorCircle size={20} className="me-2" /> No topics available
            </p>
          )}
        </div>
      </div>
      {/* View All Topics Section - END */}

      {/* Get Topic Details Section - START */}
      <div className="card shadow-lg p-4 border-0 bg-light rounded-4 animate__animated animate__fadeIn">
        <h4 className="text-primary text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <AiOutlineInfoCircle size={24} /> Get Topic Details
        </h4>

        {/* Topic Selection Dropdown */}
        <div className="mb-3 position-relative">
          <label htmlFor="topic-dropdown" className="form-label fw-semibold">
            Select a Topic:
          </label>
          <select
            id="topic-dropdown"
            className={`form-select shadow-sm rounded-3 ${
              topicNameForDetails ? "border-success" : "border-danger"
            }`}
            value={topicNameForDetails}
            onChange={(e) => setTopicNameForDetails(e.target.value)}
          >
            <option value="">-- Select a Topic --</option>
            {topics.map((topic) => (
              <option key={topic} value={topic} className="fw-semibold">
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Fetch Details Button */}
        <button
          className="btn btn-success w-100 mb-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
          style={{
            transition: "0.3s ease-in-out",
            boxShadow: "0 4px 15px rgba(0, 255, 0, 0.3)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(0, 255, 0, 0.5)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 4px 15px rgba(0, 255, 0, 0.3)")
          }
          onClick={handleGetTopicDetails}
          disabled={isLoading || !topicNameForDetails}
        >
          {isLoading ? (
            <>
              <i className="spinner-border spinner-border-sm"></i> Loading...
            </>
          ) : (
            <>
              <AiOutlineSearch size={24} /> Get Topic Details
            </>
          )}
        </button>

        {/* Display Topic Details and Pie Chart Only If topicDetails Has Data */}
        {topicDetails && topicDetails.topicName && (
          <div className="mt-3 animate__animated animate__fadeInUp">
            {/* Table Section */}
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped text-center rounded-3 shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th className="p-3">Topic Name</th>
                    <th className="p-3">Partitions</th>
                    <th className="p-3">Total Messages</th>
                    <th className="p-3">Total Lag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-middle">
                    <td className="fw-bold text-primary">
                      {topicDetails.topicName}
                    </td>
                    <td className="fw-semibold">
                      {topicDetails.partitionCount}
                    </td>
                    <td className="fw-semibold">
                      {topicDetails.totalMessages}
                    </td>
                    <td className="fw-semibold">{topicDetails.totalLag}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pie Chart Section */}
            <div className="d-flex flex-column align-items-center mt-4">
              <h5 className="text-center mb-3">Topic Overview</h5>
              <div style={{ width: "300px", height: "300px" }}>
                <Pie data={pieData} />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Get Topic Details Section - END */}

      <div>
        {/* Publish Kafka Message Section - START */}
        <div className="card shadow-lg p-4 border-0 mb-2 bg-light rounded-4 animate__animated animate__fadeIn">
          <h4 className="text-primary text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
            <AiOutlineMail size={24} /> Publish Kafka Message
          </h4>

          {/* Topic Selection Dropdown */}
          <div className="mb-3 position-relative">
            <label htmlFor="topic-select" className="form-label fw-bold">
              Select Topic:
            </label>
            <select
              id="topic-select"
              className={`form-select shadow-sm rounded-3 ${
                selectedTopic ? "border-success" : "border-danger"
              }`}
              onChange={(e) => setSelectedTopic(e.target.value)}
              value={selectedTopic}
              aria-label="Select Kafka Topic"
            >
              <option value="">-- Select a Topic --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic} className="fw-semibold">
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Message Input TextArea */}
          <div className="mb-3 position-relative">
            <label htmlFor="message-input" className="form-label fw-bold">
              Enter Message:
            </label>
            <textarea
              id="message-input"
              className={`form-control shadow-sm rounded-3 ${
                message.trim() ? "border-success" : "border-danger"
              }`}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{ fontSize: "16px", padding: "12px", borderRadius: "8px" }}
              aria-label="Kafka Message Input"
            />
          </div>

          {/* Publish Message Button */}
          <button
            className="btn btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
            onClick={sendMessage}
            disabled={!selectedTopic || !message.trim()}
          >
            <AiOutlineSend size={24} /> Publish Message
          </button>

          {/* Display Response Message */}
          {sendMessageResponse && (
            <div className="alert alert-info alert-dismissible fade show mt-3 text-center fw-bold animate__animated animate__fadeInUp">
              {sendMessageResponse}
            </div>
          )}
        </div>
        {/* Publish Kafka Message Section - END */}

        {/* Consume Kafka Message Section - START */}
        <div className="card shadow-lg p-4 border-0 mt-4 bg-light rounded-4 animate__animated animate__fadeIn">
          <h4 className="text-danger text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
            <BsChatDotsFill size={24} /> Consume All Messages
          </h4>

          {/* Topic Selection Dropdown */}
          <div className="mb-3 position-relative">
            <label
              htmlFor="consume-topic-select"
              className="form-label fw-bold"
            >
              Select Topic:
            </label>
            <select
              id="consume-topic-select"
              className={`form-select shadow-sm rounded-3 ${
                selectedConsumeTopic ? "border-success" : "border-danger"
              }`}
              onChange={(e) => setSelectedConsumeTopic(e.target.value)}
              value={selectedConsumeTopic}
              aria-label="Select Kafka Topic to Consume Messages"
            >
              <option value="">-- Select a Topic --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic} className="fw-semibold">
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Fetch Topic Messages Button */}
          <button
            className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
            onClick={consumeMessages}
            disabled={!selectedConsumeTopic}
          >
            <AiOutlineReload size={24} /> Fetch all Messages
          </button>

          {/* Fetch Latest Message Button */}
          <button
            className="btn btn-info w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mt-3 shadow-lg rounded-3 animate__animated animate__pulse animate__infinite"
            onClick={consumeLatestMessage}
            disabled={!selectedConsumeTopic}
          >
            <AiOutlineHistory size={24} /> Fetch latest Message
          </button>

          {/* Display Response Message */}
          {consumeMessageResponse && (
            <div className="alert alert-info alert-dismissible fade show mt-3 text-center fw-bold animate__animated animate__fadeInUp">
              {consumeMessageResponse}
            </div>
          )}

          {/* Display Consumed Messages */}
          {consumedMessages ? (
            <div
              className="border rounded mt-3 p-3 bg-light overflow-auto shadow-sm animate__animated animate__fadeIn"
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
              <p className="text-muted text-center mt-3 animate__animated animate__fadeIn">
                <AiFillExclamationCircle size={20} className="me-2" /> No
                messages available
              </p>
            )
          )}
        </div>
        {/* Consume Kafka Message Section - END */}
      </div>
      {/* Consume Kafka Message Section - END*/}

      {/* Consume Messages with Options - START */}
      <div className="card shadow-lg p-4 border-0 mt-4">
        <h4 className="text-danger text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <BsChatDotsFill size={20} /> Consume Messages with Options
        </h4>

        <form>
          <table className="table table-bordered table-hover text-center">
            <tbody>
              {/* Topic Selection */}
              <tr>
                <td className="fw-bold">Select Topic:</td>
                <td>
                  <select
                    className="form-select shadow-sm"
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
                </td>
              </tr>

              {/* Format Selection */}
              <tr>
                <td className="fw-bold">Select Format:</td>
                <td>
                  <select
                    className="form-select shadow-sm"
                    onChange={(e) => setFormat(e.target.value)}
                    value={format}
                  >
                    <option value="plain">Plain</option>
                    <option value="json">JSON</option>
                  </select>
                </td>
              </tr>

              {/* Max Messages */}
              <tr>
                <td className="fw-bold">Max Messages:</td>
                <td>
                  <input
                    type="number"
                    className="form-control shadow-sm"
                    value={maxMessages}
                    onChange={(e) => setMaxMessages(Number(e.target.value))}
                    min="1"
                  />
                </td>
              </tr>

              {/* From Beginning */}
              <tr>
                <td className="fw-bold">From Beginning:</td>
                <td>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="fromBeginning"
                      value="true"
                      checked={fromBeginning === true}
                      onChange={() => setFromBeginning(true)}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="fromBeginning"
                      value="false"
                      checked={fromBeginning === false}
                      onChange={() => setFromBeginning(false)}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </td>
              </tr>

              {/* Partition */}
              <tr>
                <td className="fw-bold">Partition (optional):</td>
                <td>
                  <input
                    type="number"
                    className="form-control shadow-sm"
                    value={partition || ""}
                    onChange={(e) => setPartition(e.target.value)}
                    min="0"
                  />
                </td>
              </tr>

              {/* Consumer Group */}
              <tr>
                <td className="fw-bold">Consumer Group (optional):</td>
                <td>
                  <input
                    type="text"
                    className="form-control shadow-sm"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                  />
                </td>
              </tr>

              {/* Timeout */}
              <tr>
                <td className="fw-bold">Timeout (ms):</td>
                <td>
                  <input
                    type="number"
                    className="form-control shadow-sm"
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    min="1000"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <button
            className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={(e) => {
              e.preventDefault(); // Prevents the page from refreshing
              consumeMessagesWithOptions();
            }}
            disabled={!selectedTopic}
          >
            <AiOutlineReload size={20} /> Fetch Messages with Options
          </button>
        </form>

        {/* Display Response Message */}
        {responseMessage && (
          <div className="alert alert-info alert-dismissible fade show mt-3 text-center fw-bold">
            {responseMessage}
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
          !responseMessage && (
            <p className="text-muted text-center mt-3">
              <AiFillExclamationCircle size={20} className="me-2" /> No messages
              available
            </p>
          )
        )}
      </div>
      {/* Consume Messages with Options - END */}

      {/* Delete Kafka Topic Section - START */}
      <div className="card shadow-lg p-4 border-0 mt-4">
        <h4 className="text-danger text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <AiFillCloseCircle size={20} /> Delete Kafka Topic
        </h4>

        {/* Topic Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="delete-topic-select" className="form-label fw-bold">
            Select Topic:
          </label>
          <select
            id="delete-topic-select"
            className={`form-select shadow-sm rounded-3 ${
              topicToDelete ? "border-success" : "border-danger"
            }`}
            onChange={(e) => setTopicToDelete(e.target.value)}
            value={topicToDelete}
            aria-label="Select Kafka Topic to Delete"
          >
            <option value="">-- Select a Topic --</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* Delete Topic Button */}
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
          onClick={deleteKafkaTopic}
          disabled={!topicToDelete || isDeletingTopic}
          aria-disabled={!topicToDelete || isDeletingTopic}
        >
          {isDeletingTopic ? (
            <>
              <span className="spinner-border spinner-border-sm"></span>{" "}
              Deleting...
            </>
          ) : (
            <>
              <FaTrashAlt size={18} /> Delete Topic
            </>
          )}
        </button>

        {/* Response Message */}
        {deleteTopicResponse && (
          <div
            className="alert alert-warning mt-3 text-center fw-bold shadow-sm"
            role="alert"
          >
            {deleteTopicResponse}
          </div>
        )}
      </div>
      {/* Delete Kafka Topic Section - END */}

      {/* Delete Logs Section - START */}
      <div className="card shadow-lg p-4 border-0 mt-4">
        <h4 className="text-danger text-center mb-3 fw-bold d-flex align-items-center justify-content-center gap-2">
          <FaTrashAlt size={20} /> Delete Kafka Logs
        </h4>

        {/* Delete Button */}
        <button
          className="btn btn-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
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
              <span className="spinner-border spinner-border-sm"></span>{" "}
              Deleting...
            </>
          ) : (
            <>
              <FaRegTrashAlt size={18} /> Delete Logs
            </>
          )}
        </button>

        {/* Response Message */}
        {deleteLogsResponse && (
          <div className="alert alert-warning mt-3 text-center fw-bold shadow-sm">
            {deleteLogsResponse}
          </div>
        )}
      </div>
      {/* Delete Logs Section - END */}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "30px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
  },
  errorContainer: {
    padding: "14px",
    backgroundColor: "#ffebeb",
    border: "1px solid #dc3545",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorMessage: {
    color: "#dc3545",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "15px",
    flexGrow: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#343a40",
  },
  logo: {
    width: "150px",
    marginBottom: "20px",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  section: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease-in-out",
  },
  sectionHover: {
    transform: "translateY(-5px)",
  },
  sectionHeader: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: "12px",
    borderBottom: "2px solid #007BFF",
    paddingBottom: "5px",
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
    transform: "scale(1.05)",
  },
  input: {
    padding: "12px",
    fontSize: "15px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ced4da",
    width: "100%",
    outline: "none",
    transition: "border-color 0.3s ease-in-out",
  },
  inputFocus: {
    borderColor: "#007BFF",
    boxShadow: "0 0 8px rgba(0, 123, 255, 0.25)",
  },
  responseMessage: {
    color: "#28a745",
    marginTop: "15px",
    fontSize: "15px",
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#e6f9ea",
    padding: "10px",
    borderRadius: "6px",
  },
  topicsContainer: {
    marginTop: "20px",
    backgroundColor: "#ffffff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  topicList: {
    listStyleType: "none",
    paddingLeft: "0",
    fontSize: "16px",
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    borderLeft: "5px solid #007BFF",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "1px solid #dee2e6",
    fontSize: "15px",
    fontWeight: "bold",
  },
  td: {
    padding: "12px",
    border: "1px solid #dee2e6",
    fontSize: "15px",
  },
};

export default KafkaControls;
