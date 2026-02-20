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
      const roomNumToUse = roomData.roomNumber || roomData.roomNo;
      
      const bookingPayload = {
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
        phone: guestDetails.phone,
        email: guestDetails.email,
        roomNumber: roomNumToUse,
        checkInDate: guestDetails.checkIn || new Date().toISOString(),
        checkOutDate: guestDetails.checkOut || new Date().toISOString(),
        totalAmount: roomData.price || roomData.totalAmount,
        paymentStatus: paymentStatus || 'Pending',
        status: 'Booked'
      };

      const res = await axios.post('/api/bookings', bookingPayload);

      if (res.status === 201 || res.status === 200) {
        setCustomers(prev => [res.data, ...prev]);

        // LIVE FEED
        addLiveNotification(
          'New Booking',
          `Room ${roomNumToUse} booked for ${guestDetails.firstName}`
        );

        updateUserStays(res.data);

        // SYNC FIX: If a physical room was assigned, lock it in the DB!
        if (roomNumToUse && !roomNumToUse.includes('Online')) {
          const bookedRoom = rooms.find(r => String(r.roomNumber) === String(roomNumToUse));
          if (bookedRoom) {
            await axios.patch(`/api/rooms/${bookedRoom._id || bookedRoom.id}`, { availability: 'Booked' });
          }
        }

        setRooms(prev => prev.map(r =>
          r.roomNumber === roomNumToUse
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
      // 1. Update status AND roomNumber in MongoDB Bookings
      await axios.patch(`/api/bookings/${customerId}`, { 
        status: 'CheckedIn',
        roomNumber: physicalRoomNo 
      });

      // 2. SYNC FIX: Update the Room availability in MongoDB
      const assignedRoom = rooms.find(r => String(r.roomNumber) === String(physicalRoomNo));
      if (assignedRoom) {
        await axios.patch(`/api/rooms/${assignedRoom._id || assignedRoom.id}`, { availability: 'Booked' });
      }

      // 3. Update local Customer state
      setCustomers(prev => prev.map(c =>
        (c.id === customerId || c._id === customerId) 
          ? { ...c, status: 'CheckedIn', roomNumber: physicalRoomNo } 
          : c
      ));

      // 4. Update local Room state
      setRooms(prev => prev.map(r =>
        String(r.roomNumber) === String(physicalRoomNo) ? { ...r, availability: 'Booked' } : r
      ));

      addLiveNotification('Check-In', `Guest checked into Room ${physicalRoomNo}`);
      showNotification(`Guest checked into Room ${physicalRoomNo}`, 'success');
    } catch (err) {
      console.error("Check-in error:", err);
      showNotification('Check-in failed: Verify backend PATCH route', 'error');
    }
  };

  // --- UPDATED CHECK-OUT FUNCTIONALITY ---
  const checkOutCustomer = async (customerId, lateFeeAmount = 0) => {
    try {
      const customer = customers.find(c => c._id === customerId || c.id === customerId);

      // 1. Update the booking status in the database to CheckedOut
      await axios.patch(`/api/bookings/${customerId}`, { status: 'CheckedOut' });

      // 2. SYNC FIX: Update the Room availability to Maintenance in MongoDB
      if (customer && customer.roomNumber && !customer.roomNumber.includes('Online')) {
        const vacatedRoom = rooms.find(r => String(r.roomNumber) === String(customer.roomNumber));
        if (vacatedRoom) {
          await axios.patch(`/api/rooms/${vacatedRoom._id || vacatedRoom.id}`, { availability: 'Maintenance' });
        }
      }

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId || c._id === customerId) {
          const newTotal = (c.totalAmount || 0) + (customer.foodCharges || 0) + lateFeeAmount;
          return { ...c, status: 'CheckedOut', totalAmount: newTotal, lateFee: lateFeeAmount };
        }
        return c;
      }));

      setRooms(prev => prev.map(r =>
        String(r.roomNumber) === String(customer?.roomNumber) 
          ? { ...r, availability: 'Maintenance' } 
          : r
      ));

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

  // SYNC FIX: Ensure stats accurately reflect the string names used
  const getRoomStats = () => ({
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => !r.availability || r.availability === 'Available').length,
    bookedRooms: rooms.filter(r => r.availability === 'Booked' || r.availability === 'Maintenance').length
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

  // SYNC FIX: Make sure manual dropdown changes on the dashboard save to the database!
  const updateRoom = async (roomId, field, value) => {
    try {
      await axios.patch(`/api/rooms/${roomId}`, { [field]: value });
      setRooms(prev => prev.map(r => (r.id === roomId || r._id === roomId) ? { ...r, [field]: value } : r));
      showNotification(`Room ${field} updated successfully`, 'success');
    } catch (err) {
      console.error("Update room error:", err);
      showNotification('Failed to update room status in database', 'error');
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