import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext.jsx';
import { useAuth } from './AuthContext.jsx'; 

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [foodMenu, setFoodMenu] = useState({});
  const [analyticsData, setAnalyticsData] = useState([]);
  const [topSellingFood, setTopSellingFood] = useState([]);

  const { showNotification, addLiveNotification } = useNotification();
  const { updateUserStays } = useAuth(); 

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

  // --- NEW: GUARANTEED ROOM ASSIGNMENT LOGIC ---
  const addCustomer = async (guestDetails, roomData, paymentMode, amountPaid) => {
    try {
      let finalRoomNumber = `Online-${roomData.baseType.toUpperCase()}`;
      let physicalRoomIdToLock = null;

      // If they paid online, we MUST lock a real room right now.
      if (paymentMode !== 'PayAtHotel') {
        const availableRoom = rooms.find(r => 
          r.type.toLowerCase().includes(roomData.baseType.toLowerCase()) && 
          (!r.availability || r.availability === 'Available')
        );

        if (availableRoom) {
          finalRoomNumber = availableRoom.roomNumber;
          physicalRoomIdToLock = availableRoom._id || availableRoom.id;
        } else {
          // Fallback if inventory discrepancy occurs during checkout
          showNotification(`Warning: No physical ${roomData.baseType} rooms left to lock!`, 'error');
        }
      }

      let pStatus = 'Pending';
      if (paymentMode === 'OnlineFull') pStatus = 'Paid';
      if (paymentMode === 'OnlinePartial') pStatus = 'Partial';

      const bookingPayload = {
        guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
        phone: guestDetails.phone,
        email: guestDetails.email,
        roomNumber: finalRoomNumber,
        checkInDate: guestDetails.checkIn || new Date().toISOString(),
        checkOutDate: guestDetails.checkOut || new Date().toISOString(),
        totalAmount: roomData.totalAmount,
        paymentStatus: pStatus,
        paymentMode: paymentMode,
        amountPaid: amountPaid || 0,
        status: 'Booked'
      };

      const res = await axios.post('/api/bookings', bookingPayload);

      if (res.status === 201 || res.status === 200) {
        setCustomers(prev => [res.data, ...prev]);

        addLiveNotification(
          'New Booking',
          `Room ${finalRoomNumber} booked for ${guestDetails.firstName} (${paymentMode})`
        );

        if (updateUserStays) updateUserStays(res.data);

        // LOCK THE INVENTORY IN DB AND STATE
        if (physicalRoomIdToLock) {
          await axios.patch(`/api/rooms/${physicalRoomIdToLock}`, { availability: 'Booked' });
          setRooms(prev => prev.map(r =>
            (r._id === physicalRoomIdToLock || r.id === physicalRoomIdToLock)
              ? { ...r, availability: 'Booked' }
              : r
          ));
        }

        showNotification('Booking Confirmed!', 'success');
      }
    } catch (err) {
      console.error("Booking Error:", err.response?.data || err.message);
      showNotification('Failed to add booking to database', 'error');
      throw err; // Rethrow to handle in Booking.jsx
    }
  };

  const updateCustomerPaymentStatus = (customerId, status) => {
    setCustomers(prev => prev.map(c => (c.id === customerId || c._id === customerId) ? { ...c, paymentStatus: status } : c));
  };

  // --- NEW: LATE NIGHT CHECK-IN LOGIC ---
  const checkInCustomer = async (customerId, physicalRoomNo) => {
    try {
      // Check current time for late night fee (11:00 PM to 6:00 AM)
      const currentHour = new Date().getHours();
      let lateNightFee = 0;
      if (currentHour >= 23 || currentHour < 6) {
        lateNightFee = 249;
      }

      // Update status, roomNumber, AND apply late fee in MongoDB
      await axios.patch(`/api/bookings/${customerId}`, { 
        status: 'CheckedIn',
        roomNumber: physicalRoomNo,
        lateNightFee: lateNightFee
      });

      const assignedRoom = rooms.find(r => String(r.roomNumber) === String(physicalRoomNo));
      if (assignedRoom) {
        await axios.patch(`/api/rooms/${assignedRoom._id || assignedRoom.id}`, { availability: 'Booked' });
      }

      setCustomers(prev => prev.map(c =>
        (c.id === customerId || c._id === customerId) 
          ? { ...c, status: 'CheckedIn', roomNumber: physicalRoomNo, lateNightFee: lateNightFee } 
          : c
      ));

      setRooms(prev => prev.map(r =>
        String(r.roomNumber) === String(physicalRoomNo) ? { ...r, availability: 'Booked' } : r
      ));

      addLiveNotification('Check-In', `Guest checked into Room ${physicalRoomNo}`);
      
      if (lateNightFee > 0) {
        showNotification(`Guest checked in. Late night fee of ₹249 applied.`, 'success');
      } else {
        showNotification(`Guest checked into Room ${physicalRoomNo}`, 'success');
      }
      
    } catch (err) {
      console.error("Check-in error:", err);
      showNotification('Check-in failed: Verify backend PATCH route', 'error');
    }
  };

  const checkOutCustomer = async (customerId, lateFeeAmount = 0) => {
    try {
      const customer = customers.find(c => c._id === customerId || c.id === customerId);

      await axios.patch(`/api/bookings/${customerId}`, { status: 'CheckedOut' });

      if (customer && customer.roomNumber && !customer.roomNumber.includes('Online')) {
        const vacatedRoom = rooms.find(r => String(r.roomNumber) === String(customer.roomNumber));
        if (vacatedRoom) {
          await axios.patch(`/api/rooms/${vacatedRoom._id || vacatedRoom.id}`, { availability: 'Maintenance' });
        }
      }

      setCustomers(prev => prev.map(c => {
        if (c.id === customerId || c._id === customerId) {
          const newTotal = (c.totalAmount || 0) + (customer.foodCharges || 0) + lateFeeAmount + (c.lateNightFee || 0);
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