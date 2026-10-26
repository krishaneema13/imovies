import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

// @desc    Get Admin dashboard overview statistics
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments();

    // Calculate revenue
    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('movie', 'title')
      .populate('theatre', 'name city')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Bookings count grouped by status
    const confirmedCount = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledCount = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalUsers,
        totalBookings,
        totalRevenue,
        confirmedCount,
        cancelledCount,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
