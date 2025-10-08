import React, { useState } from "react";
//Importing navigation hook and Link component from React Router for routing and navigation
//useNavigate: for programmatic navigation (button clicks). Link: for declarative navigation (like <a> tags, but without page reload)
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { login as apiLogin } from "../utils/userApi";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();                       //Get the navigate function
  const { login, isAuthenticated } = useAuth();         //Get login(), isAuthenticated from context

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //If user is already authenticated, redirect them to the home page.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;      //Using 'replace' (a prop) to prevent going back to the login page via browser back button, by not adding into browser's history
  }

  //Form Validation check
  const validate = () => {
    if (!email || !password) {
      setError("Please fill both fields");
      return false;                                     //Validation failed
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email");
      return false;                                     //Validation failed
    }

    return true;                                        //Validations passed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();                                 //Stops the default browser behavior (like reloading on form submit, following link)
    setError("");                                       //Clear old errors before new validation triggers
    if (!validate()) return;
    setLoading(true);

    try {
      const result = await apiLogin({ email, password });
      //Success expected: { token, user }
      if (result?.token) {
        /*//Store token in localStorage for now (later replace with secure cookie). Optionally store user info as well.
        localStorage.setItem("wt_token", result.token); //Token response is already string so no need to stringify
        localStorage.setItem("wt_user", JSON.stringify(result.user || {}));
        */
        login(result.token, result.user);               //Call AuthContext login()
        navigate("/");                                  //Go back to Calendar
      }
      else {
        setError(result?.error || "Login failed");
      }
    }
    catch (err) {
      console.log("Login error: ", err)
      setError("Network error. Try again");
    }
    finally {
      setLoading(false);                              //Finally runs regardless of try/catch (Cleanup)
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} aria-label="Login form">
        <h2 className="auth-title">Login</h2>

        {error && <div className="auth-error" role="alert">{error}</div>}

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

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}