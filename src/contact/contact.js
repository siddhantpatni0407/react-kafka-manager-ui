import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-primary shadow-lg rounded-lg">
            <div className="card-header bg-primary text-white text-center">
              <h3>Contact Us</h3>
            </div>
            <div className="card-body text-center">
              <p className="lead">📩 Get in Touch with Us</p>
              <hr />
              <div className="contact-info">
                <p className="mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary me-2" />
                  <strong>Email:</strong> siddhant4patni@gmail.com
                </p>
                <p className="mb-2">
                  <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
                  <strong>Phone:</strong> +91-7588811796
                </p>
                <p className="mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-2" />
                  <strong>Location:</strong> Pune, India
                </p>
              </div>
              <hr />
              <p className="font-italic">"We're here to assist you. Reach out anytime!"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}