import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { getIO } from '../socket/socketManager.js';

// Helper to determine seat category & price
const calculateSeatDetails = (seats, screen, pricing) => {
  const vipRows = screen?.seatLayout?.vipRows || ['A', 'B'];
  const premiumRows = screen?.seatLayout?.premiumRows || ['C', 'D', 'E'];

  return seats.map((seatNumber) => {
    const row = seatNumber.charAt(0).toUpperCase();
    let seatType = 'standard';
    let price = pricing.standard || 200;

    if (vipRows.includes(row)) {
      seatType = 'vip';
      price = pricing.vip || 450;
    } else if (premiumRows.includes(row)) {
      seatType = 'premium';
      price = pricing.premium || 320;
    }

    return {
      seatNumber,
      seatType,
      price,
    };
  });
};

// @desc    Create a new booking with atomic concurrency check
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { showId, seats, paymentMethod = 'card' } = req.body;
    const userId = req.user._id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid showId and at least one seat to book.',
      });
    }

    // Find the show and populate theatre/movie
    const show = await Show.findById(showId).populate('theatre').populate('movie');
    if (!show || !show.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Show not found or is no longer active.',
      });
    }

    // ATOMIC CONCURRENCY CHECK:
    // Update show ONLY if none of the requested seats are currently in bookedSeats!
    const bookedEntries = seats.map((seatNumber) => ({
      seatNumber,
      userId,
      bookedAt: new Date(),
    }));

    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        'bookedSeats.seatNumber': { $nin: seats },
      },
      {
        $push: { bookedSeats: { $each: bookedEntries } },
        $pull: { lockedSeats: { seatNumber: { $in: seats } } },
      },
      { new: true }
    );

    if (!updatedShow) {
      return res.status(409).json({
        success: false,
        message:
          'One or more of your selected seats have just been booked by another user. Please select alternative seats.',
      });
    }

    // Find screen info to determine seat pricing tier
    const screen = show.theatre.screens.find(
      (s) => s.screenNumber === show.screenNumber
    );

    const seatDetails = calculateSeatDetails(seats, screen, show.pricing);
    const subtotal = seatDetails.reduce((sum, item) => sum + item.price, 0);
    const convenienceFee = 30;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = subtotal + convenienceFee + tax;

    // Generate unique booking reference
    const timestampPart = Date.now().toString(36).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `IMV-${timestampPart}-${randomPart}`;
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    const qrCodeData = JSON.stringify({
      ref: bookingReference,
      movie: show.movie.title,
      theatre: show.theatre.name,
      date: show.showDate,
      time: show.showTime,
      seats: seats.join(','),
      total: totalAmount,
    });

    // Create booking document
    const booking = await Booking.create({
      bookingReference,
      user: userId,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      screenNumber: show.screenNumber,
      showDate: show.showDate,
      showTime: show.showTime,
      seats,
      seatDetails,
      subtotal,
      convenienceFee,
      tax,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      paymentMethod,
      transactionId,
      qrCodeData,
    });

    // Create Payment record
    await Payment.create({
      booking: booking._id,
      user: userId,
      amount: totalAmount,
      paymentMethod,
      transactionId,
      status: 'success',
      paidAt: new Date(),
    });

    // Create Notification record for user
    await Notification.create({
      user: userId,
      title: 'Booking Confirmed! 🎟️',
      message: `Your booking for "${show.movie.title}" (${seats.join(', ')}) at ${show.theatre.name} is confirmed! Reference: ${bookingReference}`,
      type: 'booking',
      link: `/booking-confirmation/${booking._id}`,
    });

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('user', 'name email phone');

    // Broadcast real-time booking confirmation to all users viewing this show
    try {
      const io = getIO();
      if (io) {
        io.to(`show:${showId}`).emit('seats_booked', {
          seats,
          userId,
        });
      }
    } catch {
      // socket io broadcast error non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of logged in user
// @route   GET /api/bookings/my
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .populate('theatre')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: must be the user who booked or an admin
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and release seats
// @route   POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const booking = await Booking.findById(req.params.id).populate('movie');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this booking.',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    // Release seats atomically from Show
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { bookedSeats: { seatNumber: { $in: booking.seats } } },
    });

    // Update booking status
    const refundAmount = booking.totalAmount; // Full refund for demo
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        status: 'refunded',
        refundedAt: new Date(),
      }
    );

    // Notify user
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking for "${booking.movie?.title || 'Movie'}" has been cancelled. A refund of ₹${refundAmount} has been processed.`,
      type: 'cancellation',
    });

    // Broadcast seat release to active users
    try {
      const io = getIO();
      if (io) {
        io.to(`show:${booking.show}`).emit('seats_released', {
          seats: booking.seats,
        });
      }
    } catch {
      // socket io non-blocking
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('movie', 'title')
      .populate('theatre', 'name city')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
