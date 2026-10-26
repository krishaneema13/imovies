# IMOVIES — Autonomous Cinema Ticket Booking & Management System 🎬

A modern, full-stack cinema ticket reservation and theatre management platform built with React, Node.js, Express, MongoDB, and Socket.IO.

---

## 🌟 Key Features

### 1. Frontend Experience (React 19 + Vite + Bootstrap)
- **Responsive Movie Catalog**: Real-time browsing with dynamic search and multi-parameter filters (Genre, Language, Location/City, Theatre, and Screening Date).
- **Movie Details & Showtimes**: High-res backdrop, trailer link, synopsis, cast & crew details, and screen format badges (Dolby Cinema, IMAX 3D, 4DX).
- **Interactive Cinema Seat Selection**:
  - Curved screen visual representation ("SCREEN THIS WAY").
  - Tiered seating: VIP Recliner (₹450), Premium Club (₹320), Standard Classic (₹200).
  - Distinct visual states: Available, Selected (purple glow), Reserved by another user (live orange with lock icon), and Booked (disabled).
  - Selection countdown timer (5-minute seat reservation hold).
- **Payment & Booking Confirmation**:
  - Simulated checkout with multiple payment modes (Cards, UPI, Net Banking, Wallet).
  - Printable & downloadable digital admission ticket with QR code.
- **User Dashboard**:
  - Profile management.
  - Active and Past/Cancelled booking history.
  - Instant ticket cancellation with automated refund calculation and seat release.
  - Real-time in-app notification center.
- **Admin Control Panel**:
  - Dashboard analytics: Total revenue, total bookings, active shows, movie catalog count.
  - Full CRUD operations for Movies (title, genre, language, duration, poster theme, trailer).
  - Theatres management with multi-screen configurations.
  - Show scheduling (date, time, auditorium, tier pricing).
  - Live customer bookings monitoring.
- **Design Integrity**: Preserves and elevates the signature dark purple aesthetic (`#0b0a12`, `#8b5cf6`, Space Grotesk, DM Sans).

### 2. Backend Architecture (Node.js + Express + MongoDB)
- **Clean Layered MVC Architecture**:
  - `server/src/models/`: Mongoose schemas for `User`, `Movie`, `Theatre`, `Show`, `Booking`, `Payment`, and `Notification`.
  - `server/src/controllers/`: Business logic, payment simulations, ticket calculations, and cancellation workflows.
  - `server/src/routes/`: Express modular REST routing.
  - `server/src/middleware/`: JWT verification, role-based access control (`user` vs `admin`), express-rate-limit, and centralized error handling.
  - `server/src/socket/`: Real-time Socket.IO room management for live seat reservation and synchronization.
- **Zero-Config Database Fallback**: Automatically connects to `MONGODB_URI` or launches an embedded in-memory MongoDB fallback server if local MongoDB is not running.
- **Database Seeder**: Pre-loads blockbusters (*Interstellar*, *The Dark Knight*, *Dune: Part Two*, *Spider-Man*, *Inside Out 2*, *Avatar*, *Oppenheimer*), 4 premium multiplex theatres across major cities, and 200 scheduled shows.

### 3. Authentication & Security
- Password hashing with `bcryptjs` (salt rounds: 10).
- Stateless JWT authentication (`jsonwebtoken`) with 7-day expiration.
- Role-based authorization: Protected user routes and admin-only management endpoints.
- Rate limiting for general API calls and authentication endpoints.
- Strict CORS configuration and environment variable isolation.

### 4. Concurrency & Real-Time Double-Booking Prevention
- **Real-Time Seat Locking**: When a customer selects a seat, a socket event / REST lock reserves it for 5 minutes. Other viewers immediately see the seat as reserved.
- **Atomic MongoDB Reservation**: Booking checkout uses conditional MongoDB atomic updates (`$nin` verification) guaranteeing that concurrent requests can never book the same seat.
- **Cancellation & Instant Release**: Cancelled tickets atomically release seats back to the pool and broadcast via Socket.IO.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
Dependencies are already installed. If needed:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   npm run server
   ```
   *Runs on `http://localhost:5000` (auto-seeds if database is empty).*

2. **Start the Frontend Client**:
   ```bash
   npm run client
   ```
   *Runs on `http://localhost:5173` with proxy configured for seamless API and Socket.IO routing.*

---

## 🔑 Demo Accounts

Use the 1-click quick fill buttons on the **Sign In** page or use the credentials below:

| Role | Email | Password |
|---|---|---|
| **Customer (User)** | `user@imovies.com` | `UserPassword123!` |
| **Administrator (Admin)** | `admin@imovies.com` | `AdminPassword123!` |

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and obtain JWT
- `GET /api/auth/me` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update profile name and phone (Protected)

### Movies
- `GET /api/movies` - List movies (supports `search`, `genre`, `language`, `theatre`, `location`, `date`)
- `GET /api/movies/filters/options` - Get available filter facets
- `GET /api/movies/:id` - Movie details with upcoming showtimes
- `POST /api/movies` - Create movie (Admin)
- `PUT /api/movies/:id` - Update movie (Admin)
- `DELETE /api/movies/:id` - Delete movie (Admin)

### Theatres & Shows
- `GET /api/theatres` - List theatres by city
- `POST /api/theatres` - Add theatre (Admin)
- `GET /api/shows` - List scheduled shows
- `GET /api/shows/:id` - Get show layout, booked seats, and live locked seats
- `POST /api/shows/:id/lock-seat` - Reserve seat temporarily
- `POST /api/shows/:id/unlock-seat` - Release temporary seat reservation
- `POST /api/shows` - Schedule show (Admin)
- `DELETE /api/shows/:id` - Cancel show (Admin)

### Bookings & Payments
- `POST /api/bookings` - Atomically book seats with simulated payment (Protected)
- `GET /api/bookings/my` - Customer booking history (Protected)
- `GET /api/bookings/:id` - Single booking details with QR data (Protected)
- `POST /api/bookings/:id/cancel` - Cancel booking and process refund (Protected)
- `GET /api/bookings` - All customer bookings across cinemas (Admin)

### Admin Analytics & Notifications
- `GET /api/admin/stats` - Total revenue, booking metrics, occupancy (Admin)
- `GET /api/notifications` - User notifications (Protected)
- `PUT /api/notifications/read-all` - Mark notifications as read (Protected)
- `GET /api/health` - Service health status

---

## 🧪 Testing

To run the automated end-to-end verification suite:
```bash
node server/test-e2e.js
```
*Validates health check, filters, authentication, admin authorization, atomic booking, 409 double-booking prevention, cancellation, and seat release.*
