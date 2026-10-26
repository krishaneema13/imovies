import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const lockedSeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lockedUntil: {
    type: Date,
    required: true,
  },
  socketId: {
    type: String,
    default: '',
  },
});

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre is required'],
    },
    screenNumber: {
      type: Number,
      default: 1,
    },
    format: {
      type: String,
      default: 'Dolby Cinema',
    },
    language: {
      type: String,
      default: 'English',
    },
    showDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Show date (YYYY-MM-DD) is required'],
    },
    showTime: {
      type: String, // e.g. '06:00 PM'
      required: [true, 'Show time is required'],
    },
    pricing: {
      standard: {
        type: Number,
        default: 200,
      },
      premium: {
        type: Number,
        default: 320,
      },
      vip: {
        type: Number,
        default: 450,
      },
    },
    totalSeats: {
      type: Number,
      default: 80,
    },
    bookedSeats: [bookedSeatSchema],
    lockedSeats: [lockedSeatSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up shows by date, movie, theatre
showSchema.index({ movie: 1, theatre: 1, showDate: 1 });

export default mongoose.model('Show', showSchema);
