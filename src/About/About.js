import React from 'react';

export default function About() {
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card border-primary">
                        <div className="card-header bg-primary text-white">
                            <h4>About Us</h4>
                        </div>
                        <div className="card-body">
                            <p className="lead">Welcome to our Kafka Manager Application!</p>
                            <p>
                                This is Frontend application built in ReactJS for Kafka Management System and integrated with Sprint boot backend application.
                            </p>
                            <p>Developed by Siddhant Patni</p> {/* Added Developed by Siddhant Patni */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
