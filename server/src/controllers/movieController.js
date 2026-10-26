import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// @desc    Get all movies with search and filters (genre, language, theatre, location/city, date)
// @route   GET /api/movies
export const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, theatre, location, date, status } = req.query;

    let movieIds = null;

    // Filter by theatre or location or date requires checking Shows
    const showFilter = {};
    let needsShowLookup = false;

    if (theatre) {
      showFilter.theatre = theatre;
      needsShowLookup = true;
    }

    if (location) {
      const matchingTheatres = await Theatre.find({
        city: { $regex: location, $options: 'i' },
      }).select('_id');
      const theatreIds = matchingTheatres.map((t) => t._id);
      showFilter.theatre = { $in: theatreIds };
      needsShowLookup = true;
    }

    if (date) {
      showFilter.showDate = date;
      needsShowLookup = true;
    }

    if (needsShowLookup) {
      const activeShows = await Show.find(showFilter).distinct('movie');
      movieIds = activeShows;
    }

    // Build Movie query
    const query = {};

    if (movieIds !== null) {
      query._id = { $in: movieIds };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $in: [new RegExp(language, 'i')] };
    }

    if (status) {
      query.status = status;
    }

    const movies = await Movie.find(query).sort({ rating: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie with upcoming shows grouped by theatre and date
// @route   GET /api/movies/:id
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Fetch shows for this movie
    const shows = await Show.find({ movie: movie._id, isActive: true })
      .populate('theatre')
      .sort({ showDate: 1, showTime: 1 });

    res.status(200).json({
      success: true,
      data: {
        movie,
        shows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options (genres, languages, cities, theatres)
// @route   GET /api/movies/filters/options
export const getFilterOptions = async (req, res, next) => {
  try {
    const allMovies = await Movie.find().select('genre language');
    const allTheatres = await Theatre.find().select('name city');

    const genresSet = new Set();
    const languagesSet = new Set();

    allMovies.forEach((m) => {
      m.genre.forEach((g) => genresSet.add(g));
      m.language.forEach((l) => languagesSet.add(l));
    });

    const citiesSet = new Set();
    allTheatres.forEach((t) => citiesSet.add(t.city));

    res.status(200).json({
      success: true,
      data: {
        genres: ['All', ...Array.from(genresSet).sort()],
        languages: ['All', ...Array.from(languagesSet).sort()],
        cities: ['All', ...Array.from(citiesSet).sort()],
        theatres: allTheatres.map((t) => ({ id: t._id, name: t.name, city: t.city })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a movie (Admin)
// @route   POST /api/movies
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      data: movie,
      message: 'Movie created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a movie (Admin)
// @route   PUT /api/movies/:id
export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.status(200).json({
      success: true,
      data: movie,
      message: 'Movie updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a movie (Admin)
// @route   DELETE /api/movies/:id
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Delete associated shows as well
    await Show.deleteMany({ movie: movie._id });

    res.status(200).json({
      success: true,
      message: 'Movie and associated shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
