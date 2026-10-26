import mongoose from 'mongoose';
import User from './models/User.js';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import Notification from './models/Notification.js';

export const seedDatabase = async () => {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial cinema data...');

    // 1. Create Default Users
    const adminUser = await User.create({
      name: 'Cinema Administrator',
      email: 'admin@imovies.com',
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const standardUser = await User.create({
      name: 'Alex Johnson',
      email: 'user@imovies.com',
      password: 'UserPassword123!',
      role: 'user',
      phone: '+91 98123 45678',
    });

    console.log('[Seed] Created default admin & user accounts');

    // 2. Create Movies
    const movies = await Movie.insertMany([
      {
        title: 'Interstellar',
        description:
          'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: ['English', 'Hindi'],
        duration: '2h 49m',
        rating: 8.7,
        releaseDate: new Date('2024-11-07'),
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        emoji: '🚀',
        color: 'space',
        status: 'now_showing',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      },
      {
        title: 'The Dark Knight',
        description:
          'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: ['English', 'Hindi'],
        duration: '2h 32m',
        rating: 9.0,
        releaseDate: new Date('2024-07-18'),
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        emoji: '🦇',
        color: 'night',
        status: 'now_showing',
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      },
      {
        title: 'Dune: Part Two',
        description:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: ['English', 'Hindi'],
        duration: '2h 46m',
        rating: 8.5,
        releaseDate: new Date('2024-03-01'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
        emoji: '🏜️',
        color: 'dune',
        status: 'now_showing',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description:
          'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        genre: ['Action', 'Animation', 'Fantasy'],
        language: ['English', 'Hindi', 'Tamil', 'Telugu'],
        duration: '2h 20m',
        rating: 8.8,
        releaseDate: new Date('2024-06-02'),
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
        emoji: '🕷️',
        color: 'spider',
        status: 'now_showing',
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      },
      {
        title: 'Inside Out 2',
        description:
          'Teenager Riley navigates new emotions including Anxiety, Envy, Ennui, and Embarrassment as she attends high school hockey camp.',
        genre: ['Animation', 'Comedy', 'Adventure'],
        language: ['English', 'Hindi'],
        duration: '1h 36m',
        rating: 7.6,
        releaseDate: new Date('2024-06-14'),
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        emoji: '🌈',
        color: 'inside',
        status: 'now_showing',
        director: 'Kelsey Mann',
        cast: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Liza Lapira'],
        trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
      },
      {
        title: 'Avatar: The Way of Water',
        description:
          'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        genre: ['Fantasy', 'Adventure', 'Action'],
        language: ['English', 'Hindi', 'Telugu'],
        duration: '3h 12m',
        rating: 7.9,
        releaseDate: new Date('2024-12-16'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
        emoji: '🌌',
        color: 'avatar',
        status: 'now_showing',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      },
      {
        title: 'Oppenheimer',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: ['Biography', 'Drama', 'History'],
        language: ['English', 'Hindi'],
        duration: '3h 00m',
        rating: 8.9,
        releaseDate: new Date('2024-07-21'),
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        emoji: '⏳',
        color: 'space',
        status: 'now_showing',
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      },
    ]);

    console.log(`[Seed] Inserted ${movies.length} movies`);

    // 3. Create Theatres
    const theatres = await Theatre.insertMany([
      {
        name: 'IMovies Luxe Cinema - Bandra',
        city: 'Mumbai',
        address: 'Linking Road, Bandra West, Mumbai 400050',
        screens: [
          {
            screenNumber: 1,
            name: 'Screen 1 - Dolby Atmos',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos 7.1',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              cols: 10,
              vipRows: ['A', 'B'],
              premiumRows: ['C', 'D', 'E'],
              standardRows: ['F', 'G', 'H'],
            },
          },
          {
            screenNumber: 2,
            name: 'Screen 2 - Laser 4K',
            format: '3D',
            soundSystem: '7.1 Surround',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              cols: 10,
              vipRows: ['A', 'B'],
              premiumRows: ['C', 'D', 'E'],
              standardRows: ['F', 'G', 'H'],
            },
          },
        ],
      },
      {
        name: 'IMovies IMAX - Cyber Hub',
        city: 'Delhi NCR',
        address: 'DLF Cyber City, Phase 2, Gurugram 122002',
        screens: [
          {
            screenNumber: 1,
            name: 'IMAX Grand Screen',
            format: 'IMAX 3D',
            soundSystem: 'IMAX 12-Track High Fidelity',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              cols: 10,
              vipRows: ['A', 'B'],
              premiumRows: ['C', 'D', 'E'],
              standardRows: ['F', 'G', 'H'],
            },
          },
        ],
      },
      {
        name: 'IMovies Nexus Forum - Koramangala',
        city: 'Bengaluru',
        address: 'Hosur Road, Koramangala 7th Block, Bengaluru 560095',
        screens: [
          {
            screenNumber: 1,
            name: 'Screen 1 - 4DX',
            format: '4DX',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              cols: 10,
              vipRows: ['A', 'B'],
              premiumRows: ['C', 'D', 'E'],
              standardRows: ['F', 'G', 'H'],
            },
          },
        ],
      },
      {
        name: 'IMovies Prism Mall - Gachibowli',
        city: 'Hyderabad',
        address: 'Financial District, Gachibowli, Hyderabad 500032',
        screens: [
          {
            screenNumber: 1,
            name: 'Main Screen',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos',
            seatLayout: {
              rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
              cols: 10,
              vipRows: ['A', 'B'],
              premiumRows: ['C', 'D', 'E'],
              standardRows: ['F', 'G', 'H'],
            },
          },
        ],
      },
    ]);

    console.log(`[Seed] Inserted ${theatres.length} theatres`);

    // 4. Create Shows for Today and Next 4 Days
    const showTimes = ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'];
    const today = new Date();
    const showsToInsert = [];

    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const dateObj = new Date(today);
      dateObj.setDate(today.getDate() + dayOffset);
      const dateString = dateObj.toISOString().split('T')[0];

      theatres.forEach((theatre) => {
        movies.slice(0, 5).forEach((movie, mIdx) => {
          // Schedule 2-3 shows per movie per theatre per day
          const timeSlot = showTimes[(mIdx + dayOffset) % showTimes.length];
          const timeSlot2 = showTimes[(mIdx + dayOffset + 2) % showTimes.length];

          [timeSlot, timeSlot2].forEach((time, slotIdx) => {
            showsToInsert.push({
              movie: movie._id,
              theatre: theatre._id,
              screenNumber: 1,
              format: theatre.screens[0].format,
              language: movie.language[0] || 'English',
              showDate: dateString,
              showTime: time,
              pricing: {
                standard: 200,
                premium: 320,
                vip: 450,
              },
              totalSeats: 80,
              bookedSeats:
                slotIdx === 0
                  ? [
                      { seatNumber: 'C4', userId: standardUser._id, bookedAt: new Date() },
                      { seatNumber: 'C5', userId: standardUser._id, bookedAt: new Date() },
                    ]
                  : [],
              lockedSeats: [],
              isActive: true,
            });
          });
        });
      });
    }

    const createdShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Inserted ${createdShows.length} scheduled shows`);

    // 5. Create a sample Demo Booking for the standard user
    if (createdShows.length > 0) {
      const sampleShow = createdShows[0];
      const sampleMovie = movies.find((m) => m._id.toString() === sampleShow.movie.toString());
      const sampleTheatre = theatres.find(
        (t) => t._id.toString() === sampleShow.theatre.toString()
      );

      const bookingRef = 'IMV-DEMO-8821';
      const sampleBooking = await Booking.create({
        bookingReference: bookingRef,
        user: standardUser._id,
        show: sampleShow._id,
        movie: sampleMovie._id,
        theatre: sampleTheatre._id,
        screenNumber: 1,
        showDate: sampleShow.showDate,
        showTime: sampleShow.showTime,
        seats: ['C4', 'C5'],
        seatDetails: [
          { seatNumber: 'C4', seatType: 'premium', price: 320 },
          { seatNumber: 'C5', seatType: 'premium', price: 320 },
        ],
        subtotal: 640,
        convenienceFee: 30,
        tax: 32,
        totalAmount: 702,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        paymentMethod: 'card',
        transactionId: 'TXN-INIT-99201',
        qrCodeData: JSON.stringify({
          ref: bookingRef,
          movie: sampleMovie.title,
          seats: 'C4,C5',
          total: 702,
        }),
      });

      await Payment.create({
        booking: sampleBooking._id,
        user: standardUser._id,
        amount: 702,
        paymentMethod: 'card',
        transactionId: 'TXN-INIT-99201',
        status: 'success',
      });

      await Notification.create({
        user: standardUser._id,
        title: 'Welcome to IMovies! 🍿',
        message:
          'Your account is ready. Explore now showing blockbusters and book your favorite seats with instant confirmation.',
        type: 'system',
      });

      await Notification.create({
        user: standardUser._id,
        title: 'Demo Booking Confirmed! 🎟️',
        message: `Your booking for "${sampleMovie.title}" (Seats C4, C5) at ${sampleTheatre.name} is confirmed! Reference: ${bookingRef}`,
        type: 'booking',
        link: `/booking-confirmation/${sampleBooking._id}`,
      });
    }

    console.log('[Seed] Database seeding completed successfully! ✨');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};
