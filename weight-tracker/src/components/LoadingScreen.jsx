import React from "react";

export default function LoadingScreen({ message = "Waking up server..." }) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logo}>Keepr</div>
        <div style={styles.message}>{message}</div>
        <div style={styles.spinner}></div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    //background: "#fff",
    zIndex: 9999,
  },
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logo: {
    fontSize: "32px",
    fontWeight: 700,
  },
  message: {
    fontSize: "14px",
    opacity: 0.8,
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "4px solid rgba(0,0,0,0.1)",
    borderTopColor: "#000",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};