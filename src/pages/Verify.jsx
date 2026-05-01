import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Verify() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://fsad-farmconnect-backend-1.onrender.com/auth/verify?code=${code}`)
      .then(() => {
        alert("Email verified successfully!");
        navigate("/login");
      })
      .catch(() => {
        alert("Verification failed");
      });
  }, []);

  return <h2>Verifying...</h2>;
}