import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationApi } from '../api/notificationApi.js';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000); // Polling for notifications every 25s
    return () => clearInterval(interval);
  }, [user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link className="logo" to="/">
        <span className="logo-icon">▶</span> IMOVIES
      </Link>

      <nav className="desktop-nav">
        <Link to="/" className={location.pathname === '/' ? 'active-link' : ''}>
          Home
        </Link>
        <a href="/#movies">Movies</a>
        <a href="/#about">About</a>
        {isAdmin && (
          <Link to="/admin" className="admin-nav-pill">
            ⚡ Admin Dashboard
          </Link>
        )}
      </nav>

      <div className="navbar-right">
        {user ? (
          <>
            {/* Notifications Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="icon-button notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
                aria-label="View notifications"
              >
                <span>🔔</span>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="mark-read-btn">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p className="empty-notif">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n._id}
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => {
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                        >
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <small>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className="user-profile-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name-text">{user.name?.split(' ')[0]}</span>
                <span className="caret-icon">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <span className="role-tag">{user.role?.toUpperCase()}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 My Dashboard & Bookings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="dropdown-item text-warning"
                      onClick={() => setShowUserMenu(false)}
                    >
                      ⚡ Admin Console
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-buttons-group">
            <Link to="/login" className="nav-login-btn">
              Sign In
            </Link>
            <Link to="/register" className="nav-button">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
