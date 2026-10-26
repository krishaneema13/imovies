import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
    },
    language: {
      type: [String],
      default: ['English'],
    },
    duration: {
      type: String,
      default: '2h 15m',
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    emoji: {
      type: String,
      default: '🎬',
    },
    color: {
      type: String,
      default: 'space',
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Movie', movieSchema);
