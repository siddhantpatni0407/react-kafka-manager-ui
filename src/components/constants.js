export const API_ENDPOINTS = {
  SETUP_KAFKA: "http://localhost:8081/api/v1/kafka-manager-service/kafka/setup",
  START_KAFKA_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/start-server",
  STOP_KAFKA_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/stop-server",
  CREATE_TOPIC_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/create-topic", // POST endpoint for creating topic
  DELETE_LOGS_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/logs", // DELETE endpoint
  GET_TOPICS_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/topic", // Endpoint for getting topics
  GET_TOPIC_DETAILS_URL: "http://localhost:8081/api/v1/kafka-manager-service/kafka/topic/details", // GET endpoint for getting topic details
  KAFKA_PUBLISH_MESSAGE_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/publish",
  KAFKA_CONSUME_MESSAGE_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/consume",
  KAFKA_CONSUME_LATEST_MESSAGE_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/consume/latest-message",
  KAFKA_CONSUME_MESSAGE_WITH_OPTIONS_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/consume/options",
  KAFKA_CONSUME_HEALTH_CHECK_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/health",
  DELETE_KAFKA_TOPIC_URL : "http://localhost:8081/api/v1/kafka-manager-service/kafka/topic"
};