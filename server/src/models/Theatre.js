import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    default: 'Screen 1',
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
    default: 'Dolby Cinema',
  },
  soundSystem: {
    type: String,
    default: 'Dolby Atmos 7.1',
  },
  seatLayout: {
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    cols: {
      type: Number,
      default: 10,
    },
    vipRows: {
      type: [String],
      default: ['A', 'B'],
    },
    premiumRows: {
      type: [String],
      default: ['C', 'D', 'E'],
    },
    standardRows: {
      type: [String],
      default: ['F', 'G', 'H'],
    },
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City/Location is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    screens: [screenSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Theatre', theatreSchema);
