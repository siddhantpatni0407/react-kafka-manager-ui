import React from 'react';

export default function About() {
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card border-primary shadow-lg rounded-lg">
                        <div className="card-header bg-primary text-white text-center">
                            <h3>About Us</h3>
                        </div>
                        <div className="card-body text-center">
                            <p className="lead">🚀 Welcome to our Kafka Manager Application! 🚀</p>
                            <p className="mb-3">
                                This is a cutting-edge frontend application built in <strong>ReactJS</strong> for managing Kafka systems, seamlessly integrated with a powerful <strong>Spring Boot</strong> backend.
                            </p>
                            <p className="font-italic">"Streamlining Kafka management with ease and efficiency."</p>
                            <hr />
                            <p className="fw-bold">Developed by <span className="text-primary">Siddhant Patni</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}