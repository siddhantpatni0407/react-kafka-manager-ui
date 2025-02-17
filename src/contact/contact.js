import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

export default function Contact() {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h4>Contact Us</h4>
            </div>
            <div className="card-body">
              <div className="contact-info">
                <p>
                  <FontAwesomeIcon icon={faEnvelope} /> siddhant4patni@gmail.com
                </p>
                <p>
                  <FontAwesomeIcon icon={faPhone} /> +91-7588811796
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
