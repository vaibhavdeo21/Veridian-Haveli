import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext.jsx';
import { useAuth } from './AuthContext.jsx'; // SYNC FIX: Import Auth to update profile

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [foodMenu, setFoodMenu] = useState({});
  const [analyticsData, setAnalyticsData] = useState([]);
  const [topSellingFood, setTopSellingFood] = useState([]);

  // FIX: Destructure addLiveNotification to prevent reference errors
  const { showNotification, addLiveNotification } = useNotification();
  const { updateUserStays } = useAuth(); // SYNC FIX: Access profile update function

  // --- 1. FETCH DATA FROM BACKEND ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, foodRes, bookingsRes, analyticsRes] = await Promise.all([
          axios.get('/api/rooms').catch(() => ({ data: [] })),
          axios.get('/api/food').catch(() => ({ data: [] })),
          axios.get('/api/bookings').catch(() => ({ data: [] })),
          axios.get('/api/bookings/analytics').catch(() => ({ data: [] }))
        ]);

        setRooms(roomsRes.data);
        setFoodMenu(groupFoodByCategory(foodRes.data));
        setCustomers(bookingsRes.data);
        setAnalyticsData(analyticsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, []);

  const groupFoodByCategory = (items) => {
    const menu = {
      breakfast: { name: 'Breakfast', time: 'Until 11 AM', items: [] },
      lunch: { name: 'Lunch', time: '12 PM - 3 PM', items: [] },
      dinner: { name: 'Dinner', time: '7 PM - 11 PM', items: [] },
      drinks: { name: 'Drinks', time: 'All Day', items: [] }
    };
    if (Array.isArray(items)) {
      items.forEach(item => {
        const cat = item.category ? item.category.toLowerCase() : 'drinks';
        if (menu[cat]) menu[cat].items.push(item);
      });
    }
    return menu;
  };

  const addRoom = async (roomDetails) => {
    try {
      const formData = new FormData();
      formData.append('roomNumber', roomDetails.roomNo);
      formData.append('type', roomDetails.type);
      formData.append('price', roomDetails.price);
      if (roomDetails.imageFile) {
        formData.append('image', roomDetails.imageFile);
      }

      const res = await axios.post('/api/rooms', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setRooms(prev => [...prev, res.data]);
      showNotification('Room added successfully!', 'success');
    } catch (err) {
      console.error("Add room error:", err);
      const newRoom = {
        ...roomDetails,
        roomNumber: roomDetails.roomNo,
        _id: Date.now().toString(),
        availability: 'Available'
      };
      setRooms(prev => [...prev, newRoom]);
      showNotification('Room added locally', 'success');
    }
  };

  const addCustomer = async (guestDetails, roomData, paymentStatus) => {
    try {
      const bookingPayload = {
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
        phone: guestDetails.phone,
        email: guestDetails.email,
        roomNumber: roomData.roomNumber || roomData.roomNo,
        checkInDate: guestDetails.checkIn || new Date().toISOString(),
        checkOutDate: guestDetails.checkOut || new Date().toISOString(),
        totalAmount: roomData.price || roomData.totalAmount,
        paymentStatus: paymentStatus || 'Pending',
        status: 'Booked'
      };

      const res = await axios.post('/api/bookings', bookingPayload);

      if (res.status === 201 || res.status === 200) {
        setCustomers(prev => [res.data, ...prev]);

        // LIVE FEED: Broadcast new booking to Admin Dashboard
        addLiveNotification(
          'New Booking',
          `Room ${roomData.roomNumber || roomData.roomNo} booked for ${guestDetails.firstName}`
        );

        // SYNC FIX: Update the user's local profile to show the new active stay
        updateUserStays(res.data);

        setRooms(prev => prev.map(r =>
          r.roomNumber === (roomData.roomNumber || roomData.roomNo)
            ? { ...r, availability: 'Booked' }
            : r
        ));

        showNotification('Booking Confirmed and Added to List!', 'success');
      }
    } catch (err) {
      console.error("Booking Error:", err.response?.data || err.message);
      showNotification('Failed to add booking to database', 'error');
    }
  };

  const updateCustomerPaymentStatus = (customerId, status) => {
    setCustomers(prev => prev.map(c => (c.id === customerId || c._id === customerId) ? { ...c, paymentStatus: status } : c));
  };

  // --- UPDATED CHECK-IN FUNCTIONALITY ---
  const checkInCustomer = async (customerId, physicalRoomNo) => {
    try {
      // 1. Update status AND roomNumber in MongoDB
      // This moves them from "Room Online-SINGLE" to a real room
      await axios.patch(`/api/bookings/${customerId}`, { 
        status: 'CheckedIn',
        roomNumber: physicalRoomNo 
      });

      // 2. Update local Customer state
      setCustomers(prev => prev.map(c =>
        (c.id === customerId || c._id === customerId) 
          ? { ...c, status: 'CheckedIn', roomNumber: physicalRoomNo } 
          : c
      ));

      // 3. Mark physical room as Booked in inventory
      setRooms(prev => prev.map(r =>
        r.roomNumber === physicalRoomNo ? { ...r, availability: 'Booked' } : r
      ));

      addLiveNotification('Check-In', `Guest checked into Room ${physicalRoomNo}`);
      showNotification(`Guest checked into Room ${physicalRoomNo}`, 'success');
    } catch (err) {
      console.error("Check-in error:", err);
      showNotification('Check-in failed: Verify backend PATCH route', 'error');
    }
  };

  // --- UPDATED CHECK-OUT FUNCTIONALITY ---
  // src/context/DataContext.jsx

  const checkOutCustomer = async (customerId, lateFeeAmount = 0) => {
    try {
      // 1. Update the booking status in the database to CheckedOut
      await axios.patch(`/api/bookings/${customerId}`, { status: 'CheckedOut' });

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId || c._id === customerId) {
          const newTotal = (c.totalAmount || 0) + (customer.foodCharges || 0) + lateFeeAmount;

          // 2. Mark room as 'Maintenance' locally for cleaning
          setRooms(roomPrev => roomPrev.map(r =>
            r.roomNumber === c.roomNumber ? { ...r, availability: 'Maintenance' } : r
          ));

          return { ...c, status: 'CheckedOut', totalAmount: newTotal, lateFee: lateFeeAmount };
        }
        return c;
      }));

      // 3. Notify the admin
      addLiveNotification('Housekeeping Required', `Room cleaning needed for checked-out guest.`);
      showNotification('Guest checked out. Room moved to Maintenance.', 'success');
    } catch (err) {
      console.error("Check-out error:", err);
      showNotification('Check-out failed', 'error');
    }
  };

  const addFoodItem = async (categoryKey, itemDetails) => {
    try {
      const formData = new FormData();
      formData.append('name', itemDetails.name);
      formData.append('description', itemDetails.desc);
      formData.append('price', itemDetails.price);
      formData.append('category', categoryKey);
      if (itemDetails.imageFile) {
        formData.append('image', itemDetails.imageFile);
      }

      const res = await axios.post('/api/food', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newItem = res.data;
      setFoodMenu(prev => {
        const cat = newItem.category.toLowerCase();
        return {
          ...prev,
          [cat]: {
            ...prev[cat],
            items: [...prev[cat].items, newItem]
          }
        };
      });
      showNotification('Food item added!', 'success');
    } catch (err) {
      showNotification('Failed to add food item', 'error');
    }
  };

  const deleteFoodItem = async (categoryKey, itemId) => {
    try {
      await axios.delete(`/api/food/${itemId}`);
      setFoodMenu(prev => ({
        ...prev,
        [categoryKey]: {
          ...prev[categoryKey],
          items: prev[categoryKey].items.filter(i => i._id !== itemId && i.id !== itemId)
        }
      }));
    } catch (err) {
      showNotification('Failed to delete item', 'error');
    }
  };

  const addOrder = async (orderData) => {
    try {
      const newOrder = { ...orderData, id: Date.now(), date: new Date().toISOString().split('T')[0] };
      setOrders(prev => [newOrder, ...prev]);

      setCustomers(prev => prev.map(c =>
        c.roomNumber === orderData.roomNo && c.status === 'CheckedIn'
          ? { ...c, totalAmount: (c.totalAmount || 0) + orderData.totalAmount, foodCharges: (c.foodCharges || 0) + orderData.totalAmount }
          : c
      ));

      // LIVE FEED: Broadcast food order to Admin Dashboard
      addLiveNotification(
        'Food Order',
        `Room ${orderData.roomNo}: ${orderData.foodItems}`
      );

      showNotification('Order placed successfully!', 'success');
    } catch (err) {
      showNotification('Failed to place order', 'error');
    }
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const getRoomStats = () => ({
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.availability !== 'Booked').length,
    bookedRooms: rooms.filter(r => r.availability === 'Booked').length
  });

  const getCustomerExpenses = (roomNo) => {
    const customer = customers.find(c => c.roomNumber === roomNo);
    if (!customer) return { foodOrders: [], roomCharge: 0 };

    const roomCharge = customer.totalAmount || 0;
    const foodOrders = orders
      .filter(o => o.roomNo === roomNo)
      .map(o => ({
        ...o,
        desc: `Food Order #${o.id} (${o.foodItems})`,
        amount: o.totalAmount
      }));

    return { foodOrders, roomCharge };
  };

  const updateRoom = async (roomId, field, value) => {
    try {
      setRooms(prev => prev.map(r => (r.id === roomId || r._id === roomId) ? { ...r, [field]: value } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await axios.delete(`/api/rooms/${roomId}`);
      setRooms(prev => prev.filter(r => r._id !== roomId));
      showNotification('Room deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete room', 'error');
    }
  };

  const editFoodItem = () => { };

  const value = {
    rooms,
    orders,
    customers,
    foodMenu,
    analyticsData,
    topSellingFood,
    addRoom,
    addCustomer,
    updateCustomerPaymentStatus,
    checkInCustomer,
    checkOutCustomer,
    addFoodItem,
    editFoodItem,
    deleteFoodItem,
    addOrder,
    deleteOrder,
    getRoomStats,
    updateRoom,
    deleteRoom,
    getCustomerExpenses
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};