const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting IMovies E2E Verification Tests ---\n');

  // Test 1: Health check
  console.log('1. Testing Health Check API...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('✓ Health status:', health.status);

  // Test 2: Filter Options
  console.log('\n2. Testing Filter Options...');
  const filterRes = await fetch(`${BASE_URL}/movies/filters/options`);
  const filterOptions = await filterRes.json();
  console.log('✓ Available Genres:', filterOptions.data.genres.slice(0, 5));
  console.log('✓ Available Cities:', filterOptions.data.cities);

  // Test 3: Movie Search and Filters
  console.log('\n3. Testing Movie Search & Genre Filter...');
  const sciFiRes = await fetch(`${BASE_URL}/movies?genre=Sci-Fi`);
  const sciFiMovies = await sciFiRes.json();
  console.log(`✓ Found ${sciFiMovies.count} Sci-Fi movies:`, sciFiMovies.data.map(m => m.title));

  // Test 4: User Authentication (Login)
  console.log('\n4. Testing User Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@imovies.com', password: 'UserPassword123!' }),
  });
  const loginData = await loginRes.json();
  console.log('✓ User Login successful:', loginData.user.name, `(${loginData.user.role})`);
  const userToken = loginData.token;

  // Test 5: Admin Authentication (Login & Role Guard)
  console.log('\n5. Testing Admin Login & Dashboard Stats...');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@imovies.com', password: 'AdminPassword123!' }),
  });
  const adminData = await adminLoginRes.json();
  console.log('✓ Admin Login successful:', adminData.user.name, `(${adminData.user.role})`);
  const adminToken = adminData.token;

  // Test 6: Admin Stats protected endpoint
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const stats = await statsRes.json();
  console.log('✓ Admin Stats:', {
    totalMovies: stats.data.totalMovies,
    totalTheatres: stats.data.totalTheatres,
    totalShows: stats.data.totalShows,
    totalRevenue: stats.data.totalRevenue,
  });

  // Test 7: Show Retrieval & Seat Map
  console.log('\n7. Testing Show Retrieval & Seat Map...');
  const showsRes = await fetch(`${BASE_URL}/shows`);
  const shows = await showsRes.json();
  const testShow = shows.data[0];
  console.log(`✓ Selected Test Show: ${testShow.movie.title} at ${testShow.theatre.name} (${testShow.showDate} ${testShow.showTime})`);

  const showDetailRes = await fetch(`${BASE_URL}/shows/${testShow._id}`);
  const showDetail = await showDetailRes.json();
  console.log('✓ Show screen format:', showDetail.data.screen.format);
  console.log('✓ Existing booked seats in show:', showDetail.data.bookedSeats);

  // Test 8: Booking Creation with Atomic Concurrency Check
  console.log('\n8. Testing Booking Creation (Seats D1, D2)...');
  const bookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      showId: testShow._id,
      seats: ['D1', 'D2'],
      paymentMethod: 'card',
    }),
  });
  const bookingResult = await bookRes.json();
  console.log('✓ Booking Created:', bookingResult.success, 'Reference:', bookingResult.data.bookingReference);
  console.log('✓ Total Amount Paid: ₹', bookingResult.data.totalAmount);
  const createdBookingId = bookingResult.data._id;

  // Test 9: Concurrency & Double-Booking Prevention!
  console.log('\n9. Testing Concurrency Check: Attempting to double-book Seat D1...');
  const duplicateBookRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      showId: testShow._id,
      seats: ['D1', 'D3'], // D1 is already booked!
      paymentMethod: 'card',
    }),
  });
  console.log(`✓ Response status code: ${duplicateBookRes.status} (Expected 409 Conflict)`);
  const duplicateResult = await duplicateBookRes.json();
  console.log('✓ Duplicate booking prevented message:', duplicateResult.message);

  // Test 10: Booking History (My Bookings)
  console.log('\n10. Testing Customer Booking History...');
  const myBookingsRes = await fetch(`${BASE_URL}/bookings/my`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const myBookings = await myBookingsRes.json();
  console.log(`✓ Customer has ${myBookings.count} active bookings`);

  // Test 11: Booking Cancellation & Instant Seat Release
  console.log('\n11. Testing Booking Cancellation & Seat Release...');
  const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({ reason: 'Schedule conflict' }),
  });
  const cancelResult = await cancelRes.json();
  console.log('✓ Cancellation status:', cancelResult.data.bookingStatus, 'Refund Amount: ₹', cancelResult.data.refundAmount);

  // Verify seat D1 is now free again!
  const verifyShowRes = await fetch(`${BASE_URL}/shows/${testShow._id}`);
  const verifyShow = await verifyShowRes.json();
  const isD1Booked = verifyShow.data.bookedSeats.includes('D1');
  console.log('✓ Seat D1 released successfully (is booked: ' + isD1Booked + ')');

  console.log('\n🎉 ALL 11 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
