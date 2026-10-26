import express from 'express';
import {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  lockSeatRest,
  unlockSeatRest,
} from '../controllers/showController.js';
import { protect, authorize, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/:id/lock-seat', optionalProtect, lockSeatRest);
router.post('/:id/unlock-seat', optionalProtect, unlockSeatRest);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), createShow);
router.put('/:id', protect, authorize('admin'), updateShow);
router.delete('/:id', protect, authorize('admin'), deleteShow);

export default router;
