import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);

  // LOAD USER FROM LOCAL STORAGE
  useEffect(() => {
    const saved = localStorage.getItem("fc_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("fc_user", JSON.stringify(user));
    else localStorage.removeItem("fc_user");
  }, [user]);

  // ✅ LOGIN (FINAL FIXED)
  async function login(email, password) {
    setAuthError("");

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password
        })
      });

      let data;
      try {
        data = await res.json(); // ✅ safe parse
      } catch {
        data = { message: "Invalid response from server" };
      }

      if (!res.ok) {
        setAuthError(data.message || "Please verify your email first");
        return null;
      }

      // 🔥 IMPORTANT FIX (BLOCK UNVERIFIED USERS)
      if (!data.user || !data.user.verified) {
        setAuthError("Please verify your email first");
        return null;
      }

      setUser(data.user); // ✅ FIX
      return data.user;

    } catch (err) {
      setAuthError("Server not connected");
      return null;
    }
  }

  // ✅ REGISTER (UNCHANGED LOGIC, JSON FIX)
  async function register(newUser) {
    setAuthError("");

    try {
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email.toLowerCase(),
          password: newUser.password,
          role: newUser.role
        })
      });

      const data = await res.json(); // ✅ FIX

      if (!res.ok) {
        setAuthError(data.message || "Registration failed");
        return false;
      }

      return true;

    } catch (err) {
      setAuthError("Server not connected");
      return false;
    }
  }

  function logout() {
    setUser(null);
    setAuthError("");
  }

  function clearAuthError() {
    setAuthError("");
  }

  // ✅ UPDATE PROFILE (name, avatarUrl)
  async function updateProfile(data) {
    try {
      const res = await fetch("http://localhost:8080/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, ...data })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update profile");
      }
      const updated = await res.json();
      // Merge updated fields into existing user (avoids losing in-memory password)
      setUser(prev => ({ ...prev, ...updated }));
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      return false;
    }
  }

  // ✅ CHANGE PASSWORD — uses /auth/change-password
  async function changePassword(oldPassword, newPassword) {
    try {
      const res = await fetch("http://localhost:8080/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, oldPassword, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      return { success: true, message: data.message || "Password changed!" };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // ✅ DELETE ACCOUNT
  async function deleteAccount() {
    try {
      const res = await fetch(`http://localhost:8080/users/delete/${user?.email}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete account");
      setUser(null);
      return true;
    } catch (err) {
      console.error("Delete account error:", err);
      return false;
    }
  }

  const value = {
    user,
    authError,
    loading,
    login,
    logout,
    register,
    clearAuthError,
    updateProfile,
    changePassword,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}