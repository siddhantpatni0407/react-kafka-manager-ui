import React from "react";

export default function About() {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-primary shadow-lg rounded-lg">
            <div className="card-header bg-primary text-white text-center">
              <h3>About Kafka Manager</h3>
            </div>
            <div className="card-body">
              <p className="lead text-center">
                🚀 Welcome to our Kafka Manager Application! 🚀
              </p>
              <p className="mb-3 text-center">
                A modern <strong>ReactJS</strong> frontend integrated with a
                powerful <strong>Spring Boot</strong> backend to streamline
                Kafka management.
              </p>

              <hr />

              {/* Feature Descriptions */}
              <h5 className="text-success">
                <i className="bi bi-play-fill me-2"></i> Start & Stop Kafka
                Server
              </h5>
              <p>Easily start and stop the Kafka server with a single click.</p>

              <h5 className="text-primary">
                <i className="bi bi-plus-circle me-2"></i> Create Kafka Topics
              </h5>
              <p>
                Effortlessly create Kafka topics with partition configuration.
              </p>

              <h5 className="text-primary">
                <i className="bi bi-list-task me-2"></i> View All Kafka Topics
              </h5>
              <p>Fetch and display a list of all available Kafka topics.</p>

              <h5 className="text-primary">
                <i className="bi bi-info-circle me-2"></i> Get Topic Details
              </h5>
              <p>Retrieve detailed information about a specific Kafka topic.</p>

              <h5 className="text-warning">
                <i className="bi bi-envelope-paper me-2"></i> Push Kafka
                Messages
              </h5>
              <p>Send messages to a selected Kafka topic in real-time.</p>

              <h5 className="text-danger">
                <i className="bi bi-chat-dots-fill me-2"></i> Consume Kafka
                Messages
              </h5>
              <p>Fetch and display messages from a Kafka topic.</p>

              <h5 className="text-danger">
                <i className="bi bi-trash-fill me-2"></i> Delete Kafka Logs
              </h5>
              <p>Clear Kafka logs to free up space and maintain efficiency.</p>

              <hr />

              <p className="fw-bold text-center">
                Developed by{" "}
                <span className="text-primary">Siddhant Patni</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
