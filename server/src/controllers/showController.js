import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// @desc    Get all shows with filters (movie, theatre, date, city)
// @route   GET /api/shows
export const getShows = async (req, res, next) => {
  try {
    const { movie, theatre, date, city } = req.query;
    const query = { isActive: true };

    if (movie) query.movie = movie;
    if (theatre) query.theatre = theatre;
    if (date) query.showDate = date;

    if (city && city !== 'All') {
      const matchingTheatres = await Theatre.find({
        city: { $regex: city, $options: 'i' },
      }).select('_id');
      query.theatre = { $in: matchingTheatres.map((t) => t._id) };
    }

    const shows = await Show.find(query)
      .populate('movie', 'title genre language duration rating posterUrl emoji color')
      .populate('theatre', 'name city address screens')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details including screen seat layout and live booked/locked seats
// @route   GET /api/shows/:id
export const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Filter expired locks
    const now = new Date();
    const validLocks = show.lockedSeats.filter((l) => new Date(l.lockedUntil) > now);

    // Get screen layout from theatre
    const screen = show.theatre.screens.find(
      (s) => s.screenNumber === show.screenNumber
    ) || {
      screenNumber: show.screenNumber,
      format: show.format,
      seatLayout: {
        rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        cols: 10,
        vipRows: ['A', 'B'],
        premiumRows: ['C', 'D', 'E'],
        standardRows: ['F', 'G', 'H'],
      },
    };

    res.status(200).json({
      success: true,
      data: {
        show,
        screen,
        bookedSeats: show.bookedSeats.map((b) => b.seatNumber),
        lockedSeats: validLocks.map((l) => ({
          seatNumber: l.seatNumber,
          userId: l.userId,
          lockedUntil: l.lockedUntil,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lock a seat (REST fallback)
// @route   POST /api/shows/:id/lock-seat
export const lockSeatRest = async (req, res, next) => {
  try {
    const { seatNumber } = req.body;
    const userId = req.user ? req.user._id : null;
    const now = new Date();
    const lockedUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    const show = await Show.findOneAndUpdate(
      {
        _id: req.params.id,
        'bookedSeats.seatNumber': { $ne: seatNumber },
        lockedSeats: {
          $not: {
            $elemMatch: {
              seatNumber,
              lockedUntil: { $gt: now },
              userId: { $ne: userId },
            },
          },
        },
      },
      {
        $pull: { lockedSeats: { seatNumber } },
      },
      { new: true }
    );

    if (!show) {
      return res.status(409).json({
        success: false,
        message: 'Seat is already locked or booked by another customer',
      });
    }

    await Show.findByIdAndUpdate(req.params.id, {
      $push: {
        lockedSeats: {
          seatNumber,
          userId,
          lockedUntil,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Seat reserved for 5 minutes',
      seatNumber,
      lockedUntil,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock a seat (REST fallback)
// @route   POST /api/shows/:id/unlock-seat
export const unlockSeatRest = async (req, res, next) => {
  try {
    const { seatNumber } = req.body;
    const userId = req.user ? req.user._id : null;

    await Show.findByIdAndUpdate(req.params.id, {
      $pull: { lockedSeats: { seatNumber, userId } },
    });

    res.status(200).json({
      success: true,
      message: 'Seat released',
      seatNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show (Admin)
// @route   POST /api/shows
export const createShow = async (req, res, next) => {
  try {
    const show = await Show.create(req.body);
    const populated = await Show.findById(show._id)
      .populate('movie', 'title')
      .populate('theatre', 'name city');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Show created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a show (Admin)
// @route   PUT /api/shows/:id
export const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('movie', 'title')
      .populate('theatre', 'name city');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.status(200).json({
      success: true,
      data: show,
      message: 'Show updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a show (Admin)
// @route   DELETE /api/shows/:id
export const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
