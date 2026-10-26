import Show from '../models/Show.js';

export const setupSeatSocket = (io) => {
  io.on('connection', (socket) => {
    // Client joins a specific show room
    socket.on('join_show', async ({ showId }) => {
      if (!showId) return;
      socket.join(`show:${showId}`);

      try {
        // Send current fresh show seat status including lockedSeats that haven't expired
        const now = new Date();
        const show = await Show.findById(showId);
        if (show) {
          // Filter out expired locks
          const validLocks = show.lockedSeats.filter((l) => new Date(l.lockedUntil) > now);
          socket.emit('initial_seat_state', {
            bookedSeats: show.bookedSeats.map((b) => b.seatNumber),
            lockedSeats: validLocks.map((l) => ({
              seatNumber: l.seatNumber,
              userId: l.userId,
            })),
          });
        }
      } catch (err) {
        console.error('Error in join_show:', err.message);
      }
    });

    // Client leaves show room
    socket.on('leave_show', ({ showId }) => {
      if (showId) {
        socket.leave(`show:${showId}`);
      }
    });

    // Request temporary seat lock (concurrency control)
    socket.on('lock_seat', async ({ showId, seatNumber, userId }) => {
      if (!showId || !seatNumber) return;

      try {
        const now = new Date();
        const lockDuration = 5 * 60 * 1000; // 5 minutes lock
        const lockedUntil = new Date(now.getTime() + lockDuration);

        // Atomic update: only lock if not in bookedSeats and not in lockedSeats with unexpired time by someone else
        const show = await Show.findOneAndUpdate(
          {
            _id: showId,
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
            // Remove any stale lock on this seat first, then push new lock
            $pull: { lockedSeats: { seatNumber } },
          },
          { new: true }
        );

        if (!show) {
          socket.emit('seat_lock_failed', {
            seatNumber,
            message: 'Seat is already reserved or booked by another customer.',
          });
          return;
        }

        // Add the fresh lock with socketId
        await Show.findByIdAndUpdate(showId, {
          $push: {
            lockedSeats: {
              seatNumber,
              userId,
              lockedUntil,
              socketId: socket.id,
            },
          },
        });

        // Broadcast to everyone in this show's room
        io.to(`show:${showId}`).emit('seat_locked', {
          seatNumber,
          userId,
          lockedUntil,
        });
      } catch (err) {
        console.error('Error locking seat:', err.message);
        socket.emit('seat_lock_failed', {
          seatNumber,
          message: 'Unable to reserve seat at this moment.',
        });
      }
    });

    // Unlock seat
    socket.on('unlock_seat', async ({ showId, seatNumber, userId }) => {
      if (!showId || !seatNumber) return;

      try {
        await Show.findByIdAndUpdate(showId, {
          $pull: { lockedSeats: { seatNumber, userId } },
        });

        io.to(`show:${showId}`).emit('seat_unlocked', {
          seatNumber,
          userId,
        });
      } catch (err) {
        console.error('Error unlocking seat:', err.message);
      }
    });

    // When a socket disconnects, optionally clean up locks belonging to this socket
    socket.on('disconnect', async () => {
      try {
        // Find shows with locks from this socket
        const shows = await Show.find({ 'lockedSeats.socketId': socket.id });
        for (const show of shows) {
          const removedSeats = show.lockedSeats
            .filter((l) => l.socketId === socket.id)
            .map((l) => l.seatNumber);

          if (removedSeats.length > 0) {
            await Show.findByIdAndUpdate(show._id, {
              $pull: { lockedSeats: { socketId: socket.id } },
            });

            removedSeats.forEach((seatNumber) => {
              io.to(`show:${show._id}`).emit('seat_unlocked', { seatNumber });
            });
          }
        }
      } catch (err) {
        console.error('Error cleaning up socket locks:', err.message);
      }
    });
  });
};
