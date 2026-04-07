import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

// Configurable menu options for different roles
const menuItems = [
  { to: '/', label: 'Home', roles: ['guest', 'buyer', 'seller', 'admin'] },
  { to: '/shop', label: 'Marketplace', roles: ['guest', 'buyer'] },
  { to: '/dashboard', label: 'Dashboard', roles: ['buyer', 'seller', 'admin'] },
  { to: '/contact', label: 'Contact', roles: ['guest', 'buyer', 'seller', 'admin'] },
];

// Animations for appearance (motion)
const profileDropdownVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.18 } },
};

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  // Track clicks outside the profile dropdown to close it
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    }
    if (profileDropdown) document.addEventListener('mousedown', handleClick);
    else document.removeEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdown]);

  // Determine which nav links to show
  const currentRole = user ? user.role : 'guest';
  const navLinks = menuItems.filter(item => item.roles.includes(currentRole));

  // Actions
  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    setMenuOpen(false);
    navigate('/');
  };

  const handleMenuToggle = () => setMenuOpen(v => !v);

  // Massive JSX below...
  return (
    <header className="sticky top-0 z-[99] bg-white/80 shadow-xl backdrop-blur-xl transition">
      <nav className="container mx-auto flex items-center justify-between px-4 py-3 relative">
        {/* Logo and site title */}
        <Link to="/" className="flex gap-3 items-center group">
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-orange-200 flex items-center justify-center shadow-lg border-[4px] border-white"
            whileHover={{ scale: 1.09, rotate: 8 }}>
            <span className="text-3xl font-extrabold text-green-900">F</span>
          </motion.div>
          <span className="font-bold text-2xl md:text-3xl text-green-700 tracking-tight group-hover:text-orange-500 transition-colors">
            FarmConnect
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex gap-7 items-center">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-lg font-semibold rounded-xl transition relative
                ${location.pathname === link.to 
                  ? 'bg-green-100 text-green-700 shadow ' 
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-0 right-0 bottom-0 h-1 bg-green-200 rounded-t"
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                />
              )}
            </Link>
          ))}

          {/* Auth/profile/account logic */}
          {!user && (
            <>
              <Link to="/login" className="btn btn-outline-green mr-1">Login</Link>
              <Link to="/register" className="btn btn-filled-orange">Sign Up</Link>
            </>
          )}

          {!!user && (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                className="flex items-center gap-2 p-2 font-semibold text-green-700 rounded-full shadow hover:bg-green-100 transition"
                onClick={() => setProfileDropdown(v => !v)}
                aria-label="User Profile"
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.06 }}
              >
                <img 
                  src={user.avatarUrl || `/assets/avatar-${user.role}.png`} 
                  alt="user avatar"
                  className="w-11 h-11 rounded-full object-cover border-2 border-green-300 bg-white"
                />
                <span className="text-lg hidden md:inline">{user.name?.split(' ')[0]}</span>
                <svg width={17} height={17} fill="green" className="ml-1"><path d="M5 7l3 3 3-3" /></svg>
              </motion.button>
              <AnimatePresence>
                {profileDropdown && (
                  <motion.div 
                    className="absolute right-0 top-full mt-3 bg-white rounded-xl shadow-xl border ring-1 ring-black/10 flex flex-col w-52 z-30"
                    variants={profileDropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="px-5 pt-4 pb-2 border-b">
                      <div className="font-bold text-green-900 mb-1">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs bg-green-100 rounded px-2 py-0.5 mt-1 inline-block">{user.role.toUpperCase()}</div>
                    </div>
                    <Link 
                      to="/profile"
                      className="px-5 py-2 hover:bg-green-50 transition text-left"
                      onClick={() => setProfileDropdown(false)}
                    >My Profile</Link>
                    <Link 
                      to="/dashboard"
                      className="px-5 py-2 hover:bg-green-50 transition text-left"
                      onClick={() => setProfileDropdown(false)}
                    >Dashboard</Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="px-5 py-2 hover:bg-green-50 transition text-left"
                        onClick={() => setProfileDropdown(false)}
                      >Admin Panel</Link>
                    )}
                    <button 
                      className="w-full text-left px-5 py-2 text-red-600 hover:bg-red-50 transition rounded-b-xl"
                      onClick={handleLogout}
                    >Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button 
          className="md:hidden p-2.5 rounded-md border border-green-300 bg-white shadow-lg focus:outline-none"
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          <svg width={30} height={30} viewBox="0 0 28 28" fill="none"><path d="M4 8h20M4 14h20M4 20h20" stroke="#47A55F" strokeWidth="2"/></svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            className="md:hidden absolute w-full left-0 top-[74px] z-40 py-7 px-7 flex flex-col gap-5 bg-white rounded-b-xl shadow-2xl"
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: "spring", duration: 0.55 } }}
            exit={{ y: -70, opacity: 0, transition: { duration: 0.23 } }}
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 text-lg font-semibold rounded-lg transition 
                  ${location.pathname === link.to 
                    ? 'bg-green-100 text-green-800 shadow-sm' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-900'}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-4 pt-4">
                <Link to="/login" className="btn btn-outline-green">Login</Link>
                <Link to="/register" className="btn btn-filled-orange">Sign Up</Link>
              </div>
            )}
            {user && (
              <div className="flex flex-col gap-2 pt-4">
                <Link to="/profile" className="w-full text-left px-4 py-2 hover:bg-green-50" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/dashboard" className="w-full text-left px-4 py-2 hover:bg-green-50" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="w-full text-left px-4 py-2 hover:bg-green-50" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <button 
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b"
                  onClick={handleLogout}
                >Logout</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
