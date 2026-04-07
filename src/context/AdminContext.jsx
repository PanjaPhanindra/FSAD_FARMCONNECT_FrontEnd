import React, { createContext, useContext, useEffect, useState } from "react";

// Context & hook for use in other components
export const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

// Demo users: replace with real API/database in production
const initialUsers = [
  {
    name: "Aditi Sharma",
    email: "admin@farmconnect.com",
    password: "admin123",
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    avatarUrl: "/assets/avatar-admin.png",
    profile: {}
  },
  {
    name: "Sana Qureshi",
    email: "buyer@farmconnect.com",
    password: "buyer123",
    role: "buyer",
    status: "active",
    createdAt: new Date().toISOString(),
    avatarUrl: "/assets/avatar-buyer.png",
    profile: {}
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);

  // LocalStorage persistence for demo
  useEffect(() => {
    const saved = window.localStorage.getItem("fc_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);
  useEffect(() => {
    if (user) window.localStorage.setItem("fc_user", JSON.stringify(user));
    else window.localStorage.removeItem("fc_user");
  }, [user]);

  // Login user
  function login(email, password) {
    const u = users.find(
      u => u.email === email && u.password === password && u.status !== "suspended"
    );
    if (u) setUser({ ...u });
    return !!u;
  }

  // Logout user
  function logout() {
    setUser(null);
  }

  // Register new user
  function register(newUser) {
    if (users.find(u => u.email === newUser.email)) return false;
    const userObj = {
      ...newUser,
      role: newUser.role || "buyer",
      status: "active",
      createdAt: new Date().toISOString(),
      avatarUrl: "/assets/avatar-buyer.png",
      profile: {}
    };
    setUsers(u => [...u, userObj]);
    setUser(userObj);
    return true;
  }

  // User management for admin
  function allUsers() {
    return users;
  }
  function suspendUser(email) {
    setUsers(u => u.map(i => i.email === email ? { ...i, status: "suspended" } : i));
    if (user && user.email === email) setUser({ ...user, status: "suspended" });
  }
  function activateUser(email) {
    setUsers(u => u.map(i => i.email === email ? { ...i, status: "active" } : i));
    if (user && user.email === email) setUser({ ...user, status: "active" });
  }

  // Value provided to components
  const value = {
    user, users,
    login, logout, register,
    allUsers, suspendUser, activateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
