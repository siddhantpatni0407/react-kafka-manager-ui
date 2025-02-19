export const API_ENDPOINTS = {
  SETUP_KAFKA: "http://localhost:8081/api/v1/kafka-service/kafka/setup",
  START_KAFKA_URL: "http://localhost:8081/api/v1/kafka-service/kafka/start-server",
  STOP_KAFKA_URL: "http://localhost:8081/api/v1/kafka-service/kafka/stop-server",
  CREATE_TOPIC_URL: "http://localhost:8081/api/v1/kafka-service/kafka/create-topic", // POST endpoint for creating topic
  DELETE_LOGS_URL: "http://localhost:8081/api/v1/kafka-service/kafka/logs", // DELETE endpoint
  GET_TOPICS_URL: "http://localhost:8081/api/v1/kafka-service/kafka/topic", // Endpoint for getting topics
  GET_TOPIC_DETAILS_URL: "http://localhost:8081/api/v1/kafka-service/kafka/topic/details", // GET endpoint for getting topic details
  KAFKA_PUBLISH_MESSAGE_URL : "http://localhost:8081/api/v1/kafka-service/kafka/publish",
  KAFKA_CONSUME_MESSAGE_URL : "http://localhost:8081/api/v1/kafka-service/kafka/consume"
};