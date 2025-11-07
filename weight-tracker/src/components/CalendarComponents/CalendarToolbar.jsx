import { Link } from "react-router-dom";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function CalendarToolbar({
  isAuthenticated, user, showEmailTooltip, setShowEmailTooltip, emailTooltipRef, sending, handleResendVerification, message, logout,
  freeEditMode, setFreeEditMode, handleReset, toggleWeather, setToggleWeather
}) {
  return (
    <header className="calendar-toolbar">
      <div className="header-container">

        {/* LEFT: User or Login */}
        <nav className="left-controls">
          {isAuthenticated ? (
            <div className="user-section">
              <span className="user-info">
                Logged in as <strong>{(user.email).split("@")[0]}</strong>
                {user.verified ? (
                  <CheckCircle
                    className="icon-green verified-inline"
                    title="Email verified"
                  />
                ) : (
                  <div className="unverified-inline">
                    <AlertCircle
                      className="icon-red"
                      title="Email not verified"
                      onClick={() => setShowEmailTooltip((prev) => !prev)}
                    />
                    {showEmailTooltip && (
                      <div ref={emailTooltipRef} className="email-tooltip visible">
                        <div>
                          {sending
                            ? "Sending..."
                            : "Please verify your email to further secure your account"}
                        </div>
                        {!sending && (
                          <button
                            className="verify-button"
                            onClick={handleResendVerification}
                          >
                            Send Verification Link
                          </button>
                        )}
                        {message && <p className="message">{message}</p>}
                      </div>
                    )}
                  </div>
                )}
              </span>

              <button
                onClick={logout}
                title="Logout"
                className="logout-btn"
              >
                ⏻
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">Login / Signup</Link>
          )}
        </nav>

        {/* RIGHT: App Controls */}
        <div className="right-controls">
          <button
            onClick={() => setFreeEditMode(prev => !prev)}                //Using prev is the best practice always, so quick rendering may not affect incorrect values
            title="Toggle Edit Mode"
            className={`settings-btn ${freeEditMode ? "active" : ""}`}
          >
            ✎
          </button>

          <button
            onClick={handleReset}
            title="Reset weights"
            className="reset-btn"
          >
            🗑
          </button>

          <button
            onClick={() => {
              setToggleWeather(prev => !prev)
              //const weather = useWeather(year, month);  //Invalid Hook Call. Hooks shouldn't be called conditionally or in a callback. It should be initialized first.
            }}
            title="Toggle Weather Mode"
            className={`weather-btn ${toggleWeather ? "active" : ""}`}
          >
            🌤
          </button>
        </div>

      </div>
    </header>
  );
}