import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";       //React hook to read URL query parameters
import { apiFetch } from "../api";
import { useAuth } from "../context/authContext";

export default function VerifyPage() {
  const [status, setStatus] = useState("loading");
  const [params] = useSearchParams();                     //Stores query parameters from the URL
  const { refreshUser } = useAuth();
  const hasRun = useRef(false);                           //Ref to ensure the effect only run once (Strict Mode makes it run twice)

  useEffect(() => {
    if (hasRun.current) return;                           //Skip if already ran
    hasRun.current = true;
    
    const token = params.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    async function verifyToken() {
      try {
        const response = await apiFetch(`/auth/verify/${token}`, {}, false);    //Checking verification doesn't require auth, so requireAuth is set to false
        if (response.message === "Verified!") {
          setStatus("success");
          await refreshUser();
        }
        else if (response.message === "User already verified") {
          setStatus("alreadyVerified");
        }
        else {
          setStatus("invalid");
        }
      }
      catch (err) {
        console.log("Email verification error: ", err);
        setStatus("invalid");
      }
    }

    verifyToken();
  }, []);

  if (status === "loading") return <p>Verifying...</p>;
  if (status === "success") return <p>Email verified successfully!</p>;
  if (status === "alreadyVerified") return <p>Email already verified successfully by the user.</p>;
  if (status === "invalid") return <p>Invalid or expired verification link.</p>;
}