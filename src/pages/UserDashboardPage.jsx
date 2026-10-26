import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingApi } from '../api/bookingApi.js';
import { notificationApi } from '../api/notificationApi.js';
import TicketReceipt from '../components/TicketReceipt.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function UserDashboardPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [isCancelling, setIsCancelling] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingsRes, notifsRes] = await Promise.all([
          bookingApi.getMyBookings(),
          notificationApi.getMyNotifications(),
        ]);

        if (bookingsRes.success) setBookings(bookingsRes.data);
        if (notifsRes.success) setNotifications(notifsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      const res = await bookingApi.cancelBooking(bookingToCancel._id, cancelReason);
      if (res.success) {
        // Update local booking state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingToCancel._id ? res.data : b))
        );
        setBookingToCancel(null);
        alert('Booking cancelled successfully. Refund initiated!');
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user dashboard..." />;

  const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
  const pastBookings = bookings.filter((b) => b.bookingStatus === 'cancelled');

  return (
    <div className="user-dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-banner">
        <div className="user-banner-profile">
          <div className="profile-large-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1>{user?.name}</h1>
            <p className="user-email-text">{user?.email}</p>
            <span className="user-role-badge">
              {user?.role === 'admin' ? '⚡ Administrator' : '🎟️ IMovies Member'}
            </span>
          </div>
        </div>

        <div className="dashboard-quick-stats">
          <div className="quick-stat-box">
            <strong>{confirmedBookings.length}</strong>
            <small>Active Bookings</small>
          </div>
          <div className="quick-stat-box">
            <strong>{bookings.length}</strong>
            <small>Total Bookings</small>
          </div>
          <div className="quick-stat-box">
            <strong>{notifications.length}</strong>
            <small>Notifications</small>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-nav-tabs">
        <button
          className={`dash-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🎟️ Active Bookings ({confirmedBookings.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Past & Cancelled ({pastBookings.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications ({notifications.length})
        </button>
        <button
          className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ Account Settings
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Content Area */}
      <div className="dashboard-content-area">
        {/* Tab 1: Active Bookings */}
        {activeTab === 'bookings' && (
          <div className="bookings-container">
            {confirmedBookings.length === 0 ? (
              <EmptyState
                title="No active bookings"
                message="You don't have any upcoming shows. Explore now showing blockbusters!"
                icon="🎟️"
              />
            ) : (
              <div className="bookings-grid">
                {confirmedBookings.map((booking) => (
                  <div key={booking._id} className="booking-summary-card">
                    <div className="booking-card-top">
                      <span className="booking-status confirmed">CONFIRMED</span>
                      <span className="booking-ref">{booking.bookingReference}</span>
                    </div>

                    <div className="booking-card-movie">
                      <span className="card-movie-emoji">
                        {booking.movie?.emoji || '🎬'}
                      </span>
                      <div>
                        <h3>{booking.movie?.title || 'Movie'}</h3>
                        <small>{booking.theatre?.name} ({booking.theatre?.city})</small>
                      </div>
                    </div>

                    <div className="booking-card-details">
                      <div>
                        <span>Date & Time:</span>
                        <strong>{booking.showDate} at {booking.showTime}</strong>
                      </div>
                      <div>
                        <span>Seats ({booking.seats?.length}):</span>
                        <div className="mini-seat-pills">
                          {booking.seats?.map((s) => (
                            <span key={s} className="mini-pill">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span>Total Paid:</span>
                        <strong className="text-highlight">₹{booking.totalAmount}</strong>
                      </div>
                    </div>

                    <div className="booking-card-actions">
                      <button
                        className="btn-view-ticket"
                        onClick={() => setSelectedBookingForReceipt(booking)}
                      >
                        🖨️ View & Print Ticket
                      </button>
                      <button
                        className="btn-cancel-booking"
                        onClick={() => setBookingToCancel(booking)}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Past / Cancelled */}
        {activeTab === 'history' && (
          <div className="bookings-container">
            {pastBookings.length === 0 ? (
              <EmptyState
                title="No cancelled bookings"
                message="You have no cancelled tickets in your history."
                icon="📜"
              />
            ) : (
              <div className="bookings-grid">
                {pastBookings.map((booking) => (
                  <div key={booking._id} className="booking-summary-card cancelled-card">
                    <div className="booking-card-top">
                      <span className="booking-status cancelled">CANCELLED & REFUNDED</span>
                      <span className="booking-ref">{booking.bookingReference}</span>
                    </div>

                    <div className="booking-card-movie">
                      <span className="card-movie-emoji">
                        {booking.movie?.emoji || '🎬'}
                      </span>
                      <div>
                        <h3>{booking.movie?.title}</h3>
                        <small>{booking.theatre?.name}</small>
                      </div>
                    </div>

                    <div className="booking-card-details">
                      <div>
                        <span>Show:</span>
                        <strong>{booking.showDate} at {booking.showTime}</strong>
                      </div>
                      <div>
                        <span>Refund Amount:</span>
                        <strong className="text-refunded">₹{booking.totalAmount} (Refunded)</strong>
                      </div>
                    </div>

                    <div className="booking-card-actions">
                      <button
                        className="btn-view-ticket"
                        onClick={() => setSelectedBookingForReceipt(booking)}
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab-content">
            {notifications.length === 0 ? (
              <EmptyState title="No notifications" message="You have no alerts at this time." icon="🔔" />
            ) : (
              <div className="notification-cards-list">
                {notifications.map((n) => (
                  <div key={n._id} className={`notification-full-card ${!n.read ? 'unread' : ''}`}>
                    <div className="notif-card-header">
                      <strong>{n.title}</strong>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    <p>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Account Settings */}
        {activeTab === 'profile' && (
          <div className="profile-settings-card">
            <h3>Personal Information</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled />
                <small className="form-hint">Email address cannot be changed.</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="primary-button">
                Save Profile Changes
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedBookingForReceipt && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedBookingForReceipt(null)}
        >
          <div
            className="ticket-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              onClick={() => setSelectedBookingForReceipt(null)}
            >
              ×
            </button>
            <TicketReceipt
              booking={selectedBookingForReceipt}
              onCancel={(id) => {
                setSelectedBookingForReceipt(null);
                setBookingToCancel(bookings.find((b) => b._id === id));
              }}
            />
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {bookingToCancel && (
        <div className="modal-backdrop" onClick={() => setBookingToCancel(null)}>
          <div
            className="cancellation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-button" onClick={() => setBookingToCancel(null)}>
              ×
            </button>
            <span className="eyebrow text-danger">CONFIRM CANCELLATION</span>
            <h2>Cancel Tickets?</h2>
            <p>
              Are you sure you want to cancel your booking for{' '}
              <strong>"{bookingToCancel.movie?.title}"</strong> (Seats:{' '}
              {bookingToCancel.seats?.join(', ')})?
            </p>

            <div className="cancellation-breakdown">
              <div>
                <span>Original Paid:</span>
                <strong>₹{bookingToCancel.totalAmount}</strong>
              </div>
              <div>
                <span>Refund Amount:</span>
                <strong className="text-success">₹{bookingToCancel.totalAmount} (100% Refund)</strong>
              </div>
            </div>

            <div className="form-group mt-3">
              <label>Reason for cancellation (optional):</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option>Change of schedule</option>
                <option>Booked wrong showtime or date</option>
                <option>Selected wrong seats</option>
                <option>Other reasons</option>
              </select>
            </div>

            <div className="modal-actions-row">
              <button
                className="btn-danger-confirm"
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? 'Processing Refund...' : 'Yes, Cancel & Refund'}
              </button>
              <button
                className="btn-secondary-cancel"
                onClick={() => setBookingToCancel(null)}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
