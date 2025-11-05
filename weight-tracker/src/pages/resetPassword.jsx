import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "../styles/passwordReset.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await apiFetch(`/auth/reset-password/${token}`, { method: "POST", body: JSON.stringify({ email, password }) }, false);
      if (response?.success) {
        setStatus("success");
        setMessage("Password reset successful! Redirecting to login...");

        setTimeout(() => navigate("/login"), 2000);
      }
      else {
        setStatus("error");
        setMessage(response?.message || "Invalid or expired token. Try again.");
      }
    }
    catch (err) {
      console.log("Password reset error: ", err);
      setStatus("error");
      setMessage("Invalid or expired token. Try again.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit} className="reset-password-form">
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="reset-password-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="reset-password-input"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="reset-password-btn"
        >
          {status === "loading" ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && (
        <p className={`reset-password-message ${status === "success" ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
}