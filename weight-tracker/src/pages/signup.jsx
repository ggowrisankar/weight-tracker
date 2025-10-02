import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup as apiSignup } from "../utils/userApi";
import "../styles/auth.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  //Form Validation check
  const validate = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;                                     //Validation failed
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email");
      return false;                                     //Validation failed
    }

    if (password.length < 8) {
      setError("Passwords should be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;                                        //Validations passed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if(!validate()) return;
    setLoading(true);

    try {
      const result = await apiSignup({ email, password });

      if (result?.message) {
        setSuccess("Account created. Please login");
        setTimeout(() => navigate("/login"), 900);      //Small delay then navigate to login
      }
      else {
        setError(result?.error || "Signup failed");
      } 
    }
    catch (err) {
      console.log("Signup error: ", err);
      setError("Network error. Try again");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} aria-label="Signup form">
        <h2 className="auth-title">Sign up</h2>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {success && <div className="auth-success" role="status">{success}</div>}

        <label className="auth-label">
          Email
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required
          />
        </label>

        <label className="auth-label">
          Password
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required
          />
        </label>

        <label className="auth-label">
          Confirm Password
          <input
            className="auth-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-required
          />
        </label>

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}