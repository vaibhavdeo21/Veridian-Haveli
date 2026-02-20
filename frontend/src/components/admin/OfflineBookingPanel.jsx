import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

// Main Component
const OfflineBookingPanel = () => {
  const { rooms, addCustomer } = useData();
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter rooms based on status
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(room => {
      // SYNC FIX: Ensure availability check matches database values
      const availability = room.availability || 'Available'; 
      if (statusFilter === 'All') return true;
      return availability === statusFilter;
    });
  }, [rooms, statusFilter]);

  // Group filtered rooms by type
  const roomTypes = {
    Single: filteredRooms.filter(r => r.type === 'Single'),
    Double: filteredRooms.filter(r => r.type === 'Double'),
    Triple: filteredRooms.filter(r => r.type === 'Triple'),
    Dormitory: filteredRooms.filter(r => r.type === 'Dormitory'),
  };

  const handleBookClick = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div id="offline-booking-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Offline Booking / Walk-in</h2>
        
        <div>
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 mr-2">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Rooms</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(roomTypes).map(([type, roomsOfType]) => (
          <RoomTypeSection 
            key={type}
            title={type}
            rooms={roomsOfType}
            onBookClick={handleBookClick}
          />
        ))}
      </div>

      {isModalOpen && selectedRoom && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          room={selectedRoom}
          onConfirmBooking={addCustomer}
        />
      )}
    </div>
  );
};

// --- Sub-Components ---

const RoomTypeSection = ({ title, rooms, onBookClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">{title} Rooms</h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <RoomCard 
              key={room.id || room._id} 
              room={room} 
              onBookClick={onBookClick} 
            />
          ))
        ) : (
          <p className="text-gray-500 md:col-span-3 lg:col-span-5">No rooms match the current filter.</p>
        )}
      </div>
    </div>
  );
};

const RoomCard = ({ room, onBookClick }) => {
  const getStatusColor = (status) => {
    // SYNC FIX: Default to Available if status is missing in DB
    const currentStatus = status || 'Available';
    switch (currentStatus) {
      case 'Available':
        return 'border-green-500 bg-green-50 hover:bg-green-100';
      case 'Booked':
        return 'border-red-500 bg-red-50';
      case 'Maintenance':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 transition-all ${getStatusColor(room.availability)}`}>
      <div className="flex justify-between items-center mb-2">
        {/* SYNC FIX: Using roomNumber to match MongoDB key */}
        <span className="font-bold text-lg text-gray-800">Room {room.roomNumber || room.roomNo}</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-1">Price: <span className="font-medium">₹{room.price.toLocaleString()}</span></p>
      {/* SYNC FIX: Show 'Available' if field is empty in DB */}
      <p className="text-sm text-gray-600 mb-3">Status: <span className="font-semibold">{room.availability || 'Available'}</span></p>

      <button
        onClick={() => onBookClick(room)}
        // SYNC FIX: Enable button if room is not explicitly 'Booked'
        disabled={room.availability === 'Booked'}
        className="w-full px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium transition
                   disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-amber-700"
      >
        {room.availability === 'Booked' ? 'Booked' : 'Book Now'}
      </button>
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, room, onConfirmBooking }) => {
  const { showNotification } = useNotification();
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
  });
  const [paymentStatus, setPaymentStatus] = useState('Pending');

  const handleChange = (e) => {
    setGuestDetails(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure we pass the room object with the correct roomNumber key
    onConfirmBooking(guestDetails, { ...room, roomNo: room.roomNumber || room.roomNo }, paymentStatus);
    showNotification(`Room ${room.roomNumber || room.roomNo} booked successfully!`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        
        {/* NEW: TOP RIGHT CLOSE BUTTON */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <form onSubmit={handleSubmit}>
          {/* SYNC FIX: Use roomNumber for header display */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">Book Room {room.roomNumber || room.roomNo} ({room.type})</h3>
          <p className="text-gray-600 mb-4">Enter guest details for this walk-in booking.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" id="firstName" value={guestDetails.firstName} onChange={handleChange} required />
              <FormInput label="Last Name" id="lastName" value={guestDetails.lastName} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Email" id="email" type="email" value={guestDetails.email} onChange={handleChange} />
              <FormInput label="Phone" id="phone" type="tel" value={guestDetails.phone} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Check-in Date" id="checkIn" type="date" value={guestDetails.checkIn} onChange={handleChange} required />
              <FormInput label="Check-out Date" id="checkOut" type="date" value={guestDetails.checkOut} onChange={handleChange} required />
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex space-x-3">
              <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium">
                Confirm Booking
              </button>
              
              {/* NEW: CANCEL BUTTON */}
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label 
                htmlFor="paymentStatus" 
                className={`font-medium ${paymentStatus === 'Pending' ? 'text-yellow-600' : 'text-gray-500'}`}
              >
                Pending
              </label>
              <button
                type="button"
                onClick={() => setPaymentStatus(paymentStatus === 'Pending' ? 'Complete' : 'Pending')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${paymentStatus === 'Complete' ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${paymentStatus === 'Complete' ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
              <label 
                htmlFor="paymentStatus" 
                className={`font-medium ${paymentStatus === 'Complete' ? 'text-green-600' : 'text-gray-500'}`}
              >
                Complete
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormInput = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
    />
  </div>
);

export default OfflineBookingPanel;