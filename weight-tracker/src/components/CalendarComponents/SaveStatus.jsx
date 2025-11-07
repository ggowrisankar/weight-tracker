export default function SaveStatus({ saveStatus, loading }) {
  if (loading) return <div className="save-status"><div className="loading-text">Loading data...</div></div>;

  return (
    <div className="save-status">
      {saveStatus === "saving" && <span>💾 Saving...</span>}
      {saveStatus === "saved" && <span className="saved">✅ Saved</span>}
      {saveStatus === "error" && <span className="error">⚠️ Save failed</span>}
    </div>
  );
}