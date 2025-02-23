# 📌 react-kafka-manager-ui

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Application Flow](#application-flow)
- [Flowchart Diagram](#flowchart-diagram)
- [Backend Application: Kafka Control Service](#backend-application-kafka-control-service)
- [Frontend Application: kafka-controls-ui](#frontend-application-kafka-controls-ui)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Author](#author)

## 🚀 Overview

Kafka Controls UI is a web application built using ReactJS for managing Kafka clusters. It allows users to start and stop Kafka servers, create and delete Kafka topics, get Kafka topic details, and delete Kafka logs through a simple and intuitive interface.

## Features

- **Start Kafka Server:** Start the Kafka server with a click of a button.
- **Stop Kafka Server:** Stop the Kafka server easily.
- **Create Kafka Topic:** Create new Kafka topics by specifying the name and optionally the number of partitions.
- **Delete Kafka Logs:** Delete Kafka logs for cleanup.
- **Get Kafka Topics:** Retrieve and display a list of available Kafka topics.
- **Get Topic Details:** Fetch and display the details of a specific Kafka topic.

## Application Flow

```mermaid
graph TD
    subgraph ReactJS Frontend Application
    A[Kafka Controls UI] -->|Start Kafka Server| B(Start Kafka Component)
    A -->|Stop Kafka Server| C(Stop Kafka Component)
    A -->|Create Kafka Topic| D(Create Topic Component)
    A -->|Get Kafka Topics| E(Get Topics Component)
    A -->|Get Topic Details| F(Get Topic Details Component)
    A -->|Delete Kafka Logs| G(Delete Logs Component)
    end

    subgraph Kafka Backend Application
    H[Kafka Control Service] -->|POST /api/v1/kafka/start| I(Start Kafka Endpoint)
    H -->|POST /api/v1/kafka/stop| J(Stop Kafka Endpoint)
    H -->|POST /api/v1/kafka/topic/create| K(Create Topic Endpoint)
    H -->|GET /api/v1/kafka/topics| L(Get Topics Endpoint)
    H -->|GET /api/v1/kafka/topic/details| M(Get Topic Details Endpoint)
    H -->|DELETE /api/v1/kafka/logs/delete| N(Delete Logs Endpoint)
    end

    B -->|Request to Start| I
    C -->|Request to Stop| J
    D -->|Request to Create Topic| K
    E -->|Request to Get Topics| L
    F -->|Request to Get Topic Details| M
    G -->|Request to Delete Logs| N
```

## Flowchart Diagram

```mermaid
flowchart LR
    A[User] -- Start Kafka Server --> B((Web APP))
    A -- Stop Kafka Server --> B
    A -- Create Topic --> B
    A -- Get Topics --> B
    A -- Get Topic Details --> B
    A -- Delete Kafka Logs --> B
    B -- POST /api/v1/kafka/start --> C{Backend}
    B -- POST /api/v1/kafka/stop --> C
    B -- POST /api/v1/kafka/topic/create --> C
    B -- GET /api/v1/kafka/topics --> C
    B -- GET /api/v1/kafka/topic/details --> C
    B -- DELETE /api/v1/kafka/logs/delete --> C
    C -.->|Manages Kafka| D[Kafka Server]
    D -.->|Provides Kafka Data| C
```

## Sequence Diagram

```mermaid

sequenceDiagram
    participant U as User
    participant C as ReactJS Client
    participant B as Backend Kafka Control Service

    U->>C: Access Kafka Controls UI
    C->>U: Display Interface

    Note over U,C: Start Kafka Server
    U->>C: Clicks "Start Kafka"
    C->>B: POST /api/v1/kafka/start
    B->>C: Return start status
    C->>U: Display start status

    Note over U,C: Stop Kafka Server
    U->>C: Clicks "Stop Kafka"
    C->>B: POST /api/v1/kafka/stop
    B->>C: Return stop status
    C->>U: Display stop status

    Note over U,C: Create Kafka Topic
    U->>C: Enter topic name and partition
    C->>B: POST /api/v1/kafka/topic/create
    B->>C: Return create topic status
    C->>U: Display create topic status

    Note over U,C: Get Kafka Topics
    U->>C: Clicks "Get Topics"
    C->>B: GET /api/v1/kafka/topics
    B->>C: Return list of topics
    C->>U: Display topics

    Note over U,C: Get Topic Details
    U->>C: Clicks "Get Topic Details"
    C->>B: GET /api/v1/kafka/topic/details
    B->>C: Return topic details
    C->>U: Display topic details

    Note over U,C: Delete Kafka Logs
    U->>C: Clicks "Delete Logs"
    C->>B: DELETE /api/v1/kafka/logs/delete
    B->>C: Return delete logs status
    C->>U: Display delete logs status
```

## Backend Application: spring-boot-kafka-storage-service

The backend application, named `spring-boot-kafka-manager-service`, provides the following endpoints:

- App Name - spring-boot-kafka-storage-service
- Platform - Java Spring Boot

- **Start Server** POST `/api/v1/kafka-service/kafka/start-server`
- **Stop Server** POST `/api/v1/kafka-service/kafka/stop-server`
- **Create Topic** POST `/api/v1/kafka-service/kafka/create-topic`
- **Get All Topics** GET `/api/v1/kafka-service/kafka/topic`
- **Get Topic Details** GET `/api/v1/kafka-service/kafka/topic/details`
- **Delete Kafka LOgs** DELETE `/api/v1/kafka-service/kafka/topic`


Backend Code Repository URL:

```bash
git clone https://github.com/siddhantpatni0407/spring-boot-kafka-manager-service.git
```

## Frontend Application: react-file-storage-ui

The frontend application, named `react-kafka-manager-ui`, is built using ReactJS.


## Installation

To run this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/siddhantpatni0407/react-kafka-manager-ui.git
    ```

2. Navigate to the project directory:

    ```bash
    cd file-storage-system
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Install axios for making HTTP requests:

    ```bash
    npm install axios
    ```

5. Install Bootstrap for styling:

    ```bash
    npm install bootstrap@5.3.3
    ```

6. Install Font Awesome for icons:

    ```bash
    npm install @fortawesome/fontawesome-free@6.5.1
    npm install @fortawesome/free-solid-svg-icons@6.5.1
    npm install @fortawesome/react-fontawesome@0.2.0
    ```

7. Start the development server:

    ```bash
    npm start
    ```

8. Open your web browser and go to [http://localhost:3000](http://localhost:3000) to view the app.


## Usage

- **Start Kafka Server:** Click on the "Start Kafka" button to start the Kafka server.
- **Stop Kafka Server:** Click on the "Stop Kafka" button to stop the Kafka server.
- **Create Kafka Topic:** Enter the topic name and optional partition number to create a new Kafka topic.
- **Get Kafka Topics:** Click on "Get Topics" to retrieve and display a list of Kafka topics.
- **Get Topic Details:** Enter the topic name to get details for that specific topic.
- **Delete Kafka Logs:** Click "Delete Logs" to delete Kafka logs.


## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/my-feature`.
3. Make your changes and commit them: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature/my-feature`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [FontAwesome](https://fontawesome.com/)

## Author

Siddhant Patni