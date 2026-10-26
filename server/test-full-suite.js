const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runFullSuite() {
  console.log('====================================================');
  console.log('🎬 IMOVIES FULL FUNCTIONAL & SECURITY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // --- 1. USER REGISTRATION ---
  console.log('--- 1. Testing User Registration & Validations ---');
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      phone: '+91 91234 56789',
    }),
  });
  assert(regRes.status === 201, `Registration returned status 201 (got ${regRes.status})`);
  assert(regRes.data.success === true, 'Registration success is true');
  assert(!!regRes.data.token, 'JWT token returned on registration');
  assert(regRes.data.user.email === uniqueEmail.toLowerCase(), 'User email matches registered email');
  assert(!regRes.data.user.password, 'Password is NOT exposed in response');

  // Duplicate registration check
  const dupRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sarah Duplicate',
      email: uniqueEmail,
      password: 'SecurePassword123!',
    }),
  });
  assert(dupRes.status === 400, `Duplicate registration rejected with 400 (got ${dupRes.status})`);

  // Missing fields validation
  const missingRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'incomplete@example.com' }),
  });
  assert(missingRes.status === 400, `Missing required fields rejected with 400 (got ${missingRes.status})`);

  // --- 2. USER LOGIN ---
  console.log('\n--- 2. Testing User Login & Invalid Credentials ---');
  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'SecurePassword123!',
    }),
  });
  assert(loginRes.status === 200, `User login returned status 200 (got ${loginRes.status})`);
  assert(!!loginRes.data.token, 'JWT token returned on user login');
  const userToken = loginRes.data.token;
  const userId = loginRes.data.user.id;

  // Wrong password
  const badPassRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: uniqueEmail, password: 'WrongPassword999!' }),
  });
  assert(badPassRes.status === 401, `Wrong password rejected with 401 (got ${badPassRes.status})`);

  // Non-existent email
  const badUserRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nobody_12345@example.com', password: 'Password123!' }),
  });
  assert(badUserRes.status === 401, `Non-existent user rejected with 401 (got ${badUserRes.status})`);

  // --- 3. ADMIN LOGIN ---
  console.log('\n--- 3. Testing Admin Login ---');
  const adminLoginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@imovies.com',
      password: 'AdminPassword123!',
    }),
  });
  assert(adminLoginRes.status === 200, `Admin login returned 200 (got ${adminLoginRes.status})`);
  assert(adminLoginRes.data.user.role === 'admin', 'Admin user role is verified as "admin"');
  const adminToken = adminLoginRes.data.token;

  // --- 4. ROLE PERMISSIONS & PROTECTED ROUTE GUARDS ---
  console.log('\n--- 4. Testing Protected Routes & Role Permissions ---');
  // Unauthenticated request to /auth/me
  const unauthRes = await req('/auth/me');
  assert(unauthRes.status === 401, `Unauthenticated /auth/me rejected with 401 (got ${unauthRes.status})`);

  // Authenticated request to /auth/me
  const authMeRes = await req('/auth/me', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(authMeRes.status === 200, `/auth/me with Bearer token succeeds with 200`);
  assert(authMeRes.data.user.name === 'Sarah Connor', 'Profile user name matches');

  // Regular user accessing admin-only endpoint /admin/stats
  const forbiddenAdminRes = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(forbiddenAdminRes.status === 403, `Regular user blocked from /admin/stats with 403 Forbidden (got ${forbiddenAdminRes.status})`);

  // Regular user trying to create movie
  const forbiddenCreateMovie = await req('/movies', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ title: 'Hacker Film', description: 'desc', genre: ['Action'] }),
  });
  assert(forbiddenCreateMovie.status === 403, `Regular user blocked from creating movie with 403 (got ${forbiddenCreateMovie.status})`);

  // Admin accessing /admin/stats
  const adminStatsRes = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminStatsRes.status === 200, `Admin successfully accesses /admin/stats with 200`);
  assert(typeof adminStatsRes.data.data.totalMovies === 'number', 'Admin stats contains totalMovies');
  assert(typeof adminStatsRes.data.data.totalRevenue === 'number', 'Admin stats contains totalRevenue');

  // --- 5. MOVIE LISTING, SEARCH & FILTERS ---
  console.log('\n--- 5. Testing Movie Listing, Search & Filters ---');
  const allMoviesRes = await req('/movies');
  assert(allMoviesRes.status === 200, 'GET /movies returns 200');
  assert(allMoviesRes.data.data.length >= 6, `Retrieved ${allMoviesRes.data.data.length} movies (expected >= 6)`);

  // Search by title
  const searchRes = await req('/movies?search=Dark%20Knight');
  assert(searchRes.data.data.length === 1, 'Search for "Dark Knight" returned 1 movie');
  assert(searchRes.data.data[0].title === 'The Dark Knight', 'Correct movie found');

  // Filter by genre
  const genreRes = await req('/movies?genre=Animation');
  assert(genreRes.data.data.length >= 1, `Filter by Animation returned ${genreRes.data.data.length} movie(s)`);
  assert(genreRes.data.data.some(m => m.title.includes('Spider') || m.title.includes('Inside')), 'Found expected animated film');

  // Filter options
  const filterOptionsRes = await req('/movies/filters/options');
  assert(filterOptionsRes.status === 200, 'GET /movies/filters/options returns 200');
  assert(filterOptionsRes.data.data.genres.includes('Action'), 'Filter options include "Action"');
  assert(filterOptionsRes.data.data.cities.includes('Mumbai'), 'Filter options include "Mumbai"');

  // --- 6. SHOWTIMES & SCREEN LAYOUT ---
  console.log('\n--- 6. Testing Showtimes & Seat Layout ---');
  const showsRes = await req('/shows');
  assert(showsRes.status === 200, 'GET /shows returns 200');
  assert(showsRes.data.data.length > 0, `Found ${showsRes.data.data.length} active shows`);

  const testShow = showsRes.data.data[0];
  const showDetailRes = await req(`/shows/${testShow._id}`);
  assert(showDetailRes.status === 200, 'GET /shows/:id returns 200');
  assert(!!showDetailRes.data.data.screen, 'Show contains screen information');
  assert(showDetailRes.data.data.screen.seatLayout.cols === 10, 'Screen layout has 10 columns');
  assert(Array.isArray(showDetailRes.data.data.screen.seatLayout.rows), 'Screen layout has row definitions');
  assert(Array.isArray(showDetailRes.data.data.bookedSeats), 'Show contains bookedSeats array');

  // --- 7. SEAT LOCKING & CONCURRENCY RESERVATION ---
  console.log('\n--- 7. Testing Seat Locking & Concurrency Control ---');
  const lockSeatNumber = 'G7';
  const lockRes = await req(`/shows/${testShow._id}/lock-seat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ seatNumber: lockSeatNumber }),
  });
  assert(lockRes.status === 200, `Seat ${lockSeatNumber} locked successfully (status 200)`);

  // Verify seat shows as locked in show details
  const showAfterLock = await req(`/shows/${testShow._id}`);
  const isLocked = showAfterLock.data.data.lockedSeats.some(l => l.seatNumber === lockSeatNumber);
  assert(isLocked, `Seat ${lockSeatNumber} is tracked in lockedSeats`);

  // Unlock seat
  const unlockRes = await req(`/shows/${testShow._id}/unlock-seat`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ seatNumber: lockSeatNumber }),
  });
  assert(unlockRes.status === 200, `Seat ${lockSeatNumber} unlocked successfully (status 200)`);

  // --- 8. BOOKING CREATION & DOUBLE-BOOKING PREVENTION ---
  console.log('\n--- 8. Testing Booking Creation & Double-Booking Prevention ---');
  const requestedSeats = ['E3', 'E4'];
  const bookRes = await req('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      showId: testShow._id,
      seats: requestedSeats,
      paymentMethod: 'upi',
    }),
  });
  assert(bookRes.status === 201, `Booking created successfully with status 201 (got ${bookRes.status})`);
  assert(!!bookRes.data.data.bookingReference, `Generated reference: ${bookRes.data.data.bookingReference}`);
  assert(bookRes.data.data.paymentStatus === 'paid', 'Payment status is marked as "paid"');
  assert(bookRes.data.data.bookingStatus === 'confirmed', 'Booking status is marked as "confirmed"');
  assert(bookRes.data.data.seats.length === 2, 'Booked 2 seats');
  const createdBookingId = bookRes.data.data._id;

  // ATOMIC CONCURRENCY CHECK: Attempting to double-book Seat E3
  const doubleBookRes = await req('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      showId: testShow._id,
      seats: ['E3', 'E5'], // E3 was already booked!
      paymentMethod: 'card',
    }),
  });
  assert(doubleBookRes.status === 409, `Double-booking attempt rejected with 409 Conflict (got ${doubleBookRes.status})`);
  assert(doubleBookRes.data.success === false, 'Double-booking response success is false');

  // Empty seats validation
  const emptySeatsRes = await req('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      showId: testShow._id,
      seats: [],
    }),
  });
  assert(emptySeatsRes.status === 400, `Empty seats rejected with 400 Bad Request (got ${emptySeatsRes.status})`);

  // --- 9. BOOKING HISTORY & OWNERSHIP ENFORCEMENT ---
  console.log('\n--- 9. Testing Booking History & Authorization ---');
  const myBookingsRes = await req('/bookings/my', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(myBookingsRes.status === 200, 'GET /bookings/my returns 200');
  assert(myBookingsRes.data.data.some(b => b._id === createdBookingId), 'Created booking is listed in user history');

  // Another user trying to access this booking directly by ID
  // Create second user token
  const user2Res = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'User Two',
      email: `usertwo_${Date.now()}@example.com`,
      password: 'Password123!',
    }),
  });
  const user2Token = user2Res.data.token;

  const unauthorizedBookingView = await req(`/bookings/${createdBookingId}`, {
    headers: { Authorization: `Bearer ${user2Token}` },
  });
  assert(unauthorizedBookingView.status === 403, `Unrelated user viewing booking rejected with 403 (got ${unauthorizedBookingView.status})`);

  // Owner viewing booking by ID
  const ownerBookingView = await req(`/bookings/${createdBookingId}`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(ownerBookingView.status === 200, `Owner viewing booking succeeds with 200`);

  // --- 10. BOOKING CANCELLATION & SEAT RELEASE ---
  console.log('\n--- 10. Testing Booking Cancellation & Seat Release ---');
  const cancelRes = await req(`/bookings/${createdBookingId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ reason: 'Trip cancelled' }),
  });
  assert(cancelRes.status === 200, `Cancellation returned 200 OK (got ${cancelRes.status})`);
  assert(cancelRes.data.data.bookingStatus === 'cancelled', 'Booking status updated to "cancelled"');
  assert(cancelRes.data.data.paymentStatus === 'refunded', 'Payment status updated to "refunded"');
  assert(cancelRes.data.data.refundAmount > 0, `Refund calculated: ₹${cancelRes.data.data.refundAmount}`);

  // Verify seats E3, E4 were released from the show
  const showAfterCancel = await req(`/shows/${testShow._id}`);
  const isE3Booked = showAfterCancel.data.data.bookedSeats.includes('E3');
  const isE4Booked = showAfterCancel.data.data.bookedSeats.includes('E4');
  assert(!isE3Booked && !isE4Booked, 'Seats E3 & E4 are released and available again for other users');

  // Attempting to cancel an already cancelled booking
  const doubleCancelRes = await req(`/bookings/${createdBookingId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ reason: 'Second cancel attempt' }),
  });
  assert(doubleCancelRes.status === 400, `Second cancel attempt rejected with 400 (got ${doubleCancelRes.status})`);

  // --- 11. ADMIN MOVIE CRUD MANAGEMENT ---
  console.log('\n--- 11. Testing Admin Movie Management CRUD ---');
  // Create movie
  const newMovieRes = await req('/movies', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Gladiator II',
      description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum.',
      genre: ['Action', 'Adventure', 'Drama'],
      language: ['English'],
      duration: '2h 28m',
      rating: 7.9,
      emoji: '⚔️',
      color: 'dune',
      status: 'now_showing',
      director: 'Ridley Scott',
    }),
  });
  assert(newMovieRes.status === 201, `Admin created movie "Gladiator II" (status 201)`);
  const createdMovieId = newMovieRes.data.data._id;

  // Update movie
  const updateMovieRes = await req(`/movies/${createdMovieId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      rating: 8.3,
      duration: '2h 30m',
    }),
  });
  assert(updateMovieRes.status === 200, `Admin updated movie (status 200)`);
  assert(updateMovieRes.data.data.rating === 8.3, 'Movie rating updated to 8.3');

  // Delete movie
  const deleteMovieRes = await req(`/movies/${createdMovieId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteMovieRes.status === 200, `Admin deleted movie (status 200)`);

  // Verify deletion
  const getDeletedRes = await req(`/movies/${createdMovieId}`);
  assert(getDeletedRes.status === 404, 'Deleted movie lookup returns 404 Not Found');

  // --- 12. ADMIN THEATRE & SHOW MANAGEMENT ---
  console.log('\n--- 12. Testing Admin Theatre & Show Management CRUD ---');
  // Create Theatre
  const newTheatreRes = await req('/theatres', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: 'IMovies Grand Multiplex - Pune',
      city: 'Pune',
      address: 'Phoenix Marketcity, Viman Nagar, Pune 411014',
      screens: [{ screenNumber: 1, name: 'Screen 1', format: 'Dolby Cinema' }],
    }),
  });
  assert(newTheatreRes.status === 201, `Admin created Theatre in Pune (status 201)`);
  const createdTheatreId = newTheatreRes.data.data._id;

  // Schedule a show in this theatre
  const newShowRes = await req('/shows', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      movie: testShow.movie._id,
      theatre: createdTheatreId,
      screenNumber: 1,
      format: 'Dolby Cinema',
      language: 'English',
      showDate: '2026-10-30',
      showTime: '08:00 PM',
      pricing: { standard: 220, premium: 350, vip: 500 },
    }),
  });
  assert(newShowRes.status === 201, `Admin scheduled show in Pune (status 201)`);
  const createdShowId = newShowRes.data.data._id;

  // Delete Show
  const deleteShowRes = await req(`/shows/${createdShowId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteShowRes.status === 200, `Admin cancelled/deleted show (status 200)`);

  // Delete Theatre
  const deleteTheatreRes = await req(`/theatres/${createdTheatreId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteTheatreRes.status === 200, `Admin deleted theatre (status 200)`);

  // --- 13. USER NOTIFICATIONS ---
  console.log('\n--- 13. Testing In-App Notifications ---');
  const notifsRes = await req('/notifications', {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(notifsRes.status === 200, 'GET /notifications returns 200');
  assert(notifsRes.data.data.length >= 2, `User received ${notifsRes.data.data.length} notifications (booking + cancellation)`);

  const unreadNotif = notifsRes.data.data.find(n => !n.read);
  if (unreadNotif) {
    const markReadRes = await req(`/notifications/${unreadNotif._id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(markReadRes.status === 200, 'Single notification marked as read (status 200)');
  }

  const markAllReadRes = await req('/notifications/read-all', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(markAllReadRes.status === 200, 'All notifications marked as read (status 200)');

  // Final Summary
  console.log('\n====================================================');
  console.log(`🏁 TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFullSuite().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
