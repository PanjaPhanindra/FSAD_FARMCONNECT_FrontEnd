import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleReset() {
    const res = await fetch(
      `https://fsad-farmconnect-backend-1.onrender.com/auth/reset-password?token=${token}&newPassword=${password}`,
      { method: "POST" }
    );

    if (res.ok) {
      alert("Password reset successful!");
      navigate("/login");
    } else {
      alert("Error resetting password");
    }
  }

  return (
    <div>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}