import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification.jsx';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // 1. Popup alert state (Existing)
  const [notification, setNotification] = useState(null);

  // 2. NEW: Persistent live feed state for Admin Dashboard
  const [liveFeed, setLiveFeed] = useState([
    { id: 1, title: 'System Online', message: 'Jhankar Hotel System is active', time: 'Just now' }
  ]);

  // NEW: Sound effect logic for Food Orders
  const playDing = useCallback(() => {
    // Using a reliable public URL for a "Ding/Notification" sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(err => {
      // Browser might block audio until the first user click on the page
      console.log("Audio playback wait for user interaction:", err);
    });
  }, []);

  // Existing function for popup messages
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // NEW: Function to add persistent live feed items
  const addLiveNotification = useCallback((title, message) => {
    const newEntry = {
      id: Date.now(),
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLiveFeed(prev => [newEntry, ...prev].slice(0, 8)); // Keep the most recent 8 items

    // TRIGGER SOUND: Only if the title matches "Food Order"
    if (title === 'Food Order') {
      playDing();
    }
  }, [playDing]);

  // NEW: Function to clear the feed
  const clearFeed = useCallback(() => {
    setLiveFeed([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, liveFeed, addLiveNotification, clearFeed }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};