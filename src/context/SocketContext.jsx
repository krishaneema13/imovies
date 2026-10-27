import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeShowId, setActiveShowId] = useState(null);
  const [liveLockedSeats, setLiveLockedSeats] = useState([]); // [{ seatNumber, userId }]
  const [liveBookedSeats, setLiveBookedSeats] = useState([]); // [seatNumber]
  const socketRef = useRef(null);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_API_URL;
    const socketUrl = envUrl
      ? envUrl.replace(/\/api\/?$/, '')
      : typeof window !== 'undefined' && window.location.port === '5173'
      ? window.location.origin
      : import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = s;
    setSocket(s);

    s.on('connect', () => {
      // Re-join show room if reconnection happens
      if (activeShowId) {
        s.emit('join_show', { showId: activeShowId });
      }
    });

    s.on('initial_seat_state', ({ bookedSeats, lockedSeats }) => {
      setLiveBookedSeats(bookedSeats || []);
      setLiveLockedSeats(lockedSeats || []);
    });

    s.on('seat_locked', ({ seatNumber, userId }) => {
      setLiveLockedSeats((prev) => {
        const filtered = prev.filter((s) => s.seatNumber !== seatNumber);
        return [...filtered, { seatNumber, userId }];
      });
    });

    s.on('seat_unlocked', ({ seatNumber }) => {
      setLiveLockedSeats((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
    });

    s.on('seats_booked', ({ seats }) => {
      setLiveBookedSeats((prev) => Array.from(new Set([...prev, ...seats])));
      setLiveLockedSeats((prev) => prev.filter((s) => !seats.includes(s.seatNumber)));
    });

    s.on('seats_released', ({ seats }) => {
      setLiveBookedSeats((prev) => prev.filter((s) => !seats.includes(s)));
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const joinShowRoom = (showId) => {
    setActiveShowId(showId);
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_show', { showId });
    }
  };

  const leaveShowRoom = (showId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_show', { showId });
    }
    setActiveShowId(null);
    setLiveLockedSeats([]);
    setLiveBookedSeats([]);
  };

  const lockSeat = (showId, seatNumber) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('lock_seat', {
        showId,
        seatNumber,
        userId: user?._id || user?.id || 'guest',
      });
    }
  };

  const unlockSeat = (showId, seatNumber) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('unlock_seat', {
        showId,
        seatNumber,
        userId: user?._id || user?.id || 'guest',
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        activeShowId,
        liveLockedSeats,
        liveBookedSeats,
        setLiveBookedSeats,
        setLiveLockedSeats,
        joinShowRoom,
        leaveShowRoom,
        lockSeat,
        unlockSeat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
