import { useState } from "react";
import { apiFetch } from "../api";
import "../styles/passwordReset.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await apiFetch("/auth/request-password-reset", { method: "POST", body: JSON.stringify({ email }) }, false);
      if (response?.success) {
        setStatus("success");
        setMessage(response.message);
      }
      else {
        setStatus("error");
        setMessage(response?.message || "Something went wrong. Please try again.");
      }
    }
    catch (err) {
      console.log("Request password reset error: ", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit} className="forgot-password-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="email-input"
        />

        <button
          type="submit"
          disabled={status === "loading"}
          className="submit-btn"
        >
          {status === "loading" ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {message && (
        <p className={`message ${status === "success" ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
}