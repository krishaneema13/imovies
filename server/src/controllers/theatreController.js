import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';

// @desc    Get all theatres
// @route   GET /api/theatres
export const getTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};
    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }

    const theatres = await Theatre.find(query).sort({ city: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre
// @route   GET /api/theatres/:id
export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    res.status(200).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a theatre (Admin)
// @route   POST /api/theatres
export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      data: theatre,
      message: 'Theatre created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a theatre (Admin)
// @route   PUT /api/theatres/:id
export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    res.status(200).json({
      success: true,
      data: theatre,
      message: 'Theatre updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a theatre (Admin)
// @route   DELETE /api/theatres/:id
export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    await Show.deleteMany({ theatre: theatre._id });

    res.status(200).json({
      success: true,
      message: 'Theatre and associated shows deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
