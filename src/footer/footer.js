import React from "react";

export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Siddhant Patni. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
