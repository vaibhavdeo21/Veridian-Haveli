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
    <div id="offline-booking-panel" className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Front Desk Operations</p>
          <h2 className="text-3xl font-bold text-haveli-heading font-display tracking-tight uppercase">Offline Booking / Walk-in</h2>
        </div>
        
        <div className="flex items-center space-x-3 bg-haveli-section p-2 rounded-xl border border-haveli-border shadow-inner">
          <label htmlFor="statusFilter" className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest ml-2">Filter Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-2 border border-haveli-border rounded-lg text-xs font-bold text-haveli-primary focus:outline-none focus:ring-1 focus:ring-haveli-primary appearance-none cursor-pointer"
          >
            <option value="All">All Suites</option>
            <option value="Available">Available</option>
            <option value="Booked">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="space-y-12">
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
    <div className="lux-card p-0 overflow-hidden border-haveli-border shadow-sm">
      <div className="p-8 border-b border-haveli-border bg-haveli-section">
        <h3 className="text-xl font-bold text-haveli-heading font-display uppercase tracking-wider">{title} Suites</h3>
        <p className="text-[10px] text-haveli-muted mt-1 uppercase font-bold tracking-widest opacity-70">Physical Inventory Breakdown</p>
      </div>
      
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 bg-white/50">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <RoomCard 
              key={room.id || room._id} 
              room={room} 
              onBookClick={onBookClick} 
            />
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-haveli-muted italic font-light tracking-wide">
            No suites in this category match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

const RoomCard = ({ room, onBookClick }) => {
  const getStatusColor = (status) => {
    const currentStatus = status || 'Available';
    switch (currentStatus) {
      case 'Available':
        return 'border-haveli-primary bg-[#ecfdf5]/40 hover:bg-[#ecfdf5]/70';
      case 'Booked':
        return 'border-haveli-accent bg-[#fffbeb]/40 cursor-not-allowed opacity-80';
      case 'Maintenance':
        return 'border-red-400 bg-[#fef2f2]/40';
      default:
        return 'border-haveli-border bg-haveli-section/40';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-5 transition-all duration-500 hover:shadow-md ${getStatusColor(room.availability)}`}>
      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-2xl text-haveli-heading font-display tracking-tighter">Suite {room.roomNumber || room.roomNo}</span>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Price: <span className="text-haveli-heading">₹{room.price.toLocaleString()}</span></p>
        <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Status: <span className="text-haveli-primary">{room.availability || 'Available'}</span></p>
      </div>

      <button
        onClick={() => onBookClick(room)}
        disabled={room.availability === 'Booked'}
        className={`btn btn-block py-2 text-xs uppercase tracking-widest font-black shadow-sm transition-all ${
            room.availability === 'Booked' 
            ? 'bg-haveli-border text-haveli-muted' 
            : 'btn-secondary'
        }`}
      >
        {room.availability === 'Booked' ? 'In Residence' : 'Reserve Suite'}
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
    onConfirmBooking(guestDetails, { ...room, roomNo: room.roomNumber || room.roomNo }, paymentStatus);
    showNotification(`Suite ${room.roomNumber || room.roomNo} booked successfully!`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl border border-haveli-border shadow-2xl max-w-lg w-full p-10 relative animate-fadeIn">
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent"></div>
        
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-haveli-muted hover:text-red-500 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
             <p className="text-haveli-accent uppercase tracking-[0.2em] font-bold text-[10px] mb-1">Direct Registration</p>
             <h3 className="text-2xl font-bold text-haveli-heading font-display">Book Suite {room.roomNumber || room.roomNo}</h3>
             <p className="text-xs text-haveli-muted tracking-tight mt-1">Classification: {room.type} Bed Suite</p>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="First Name" id="firstName" value={guestDetails.firstName} onChange={handleChange} required placeholder="Guest Name" />
              <FormInput label="Last Name" id="lastName" value={guestDetails.lastName} onChange={handleChange} required placeholder="Surname" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Electronic Mail" id="email" type="email" value={guestDetails.email} onChange={handleChange} placeholder="optional" />
              <FormInput label="Phone Contact" id="phone" type="tel" value={guestDetails.phone} onChange={handleChange} required placeholder="e.g. +91" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-haveli-border border-dashed">
              <FormInput label="Arrival Date" id="checkIn" type="date" value={guestDetails.checkIn} onChange={handleChange} required />
              <FormInput label="Departure Date" id="checkOut" type="date" value={guestDetails.checkOut} onChange={handleChange} required />
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex space-x-3 w-full sm:w-auto">
              <button type="submit" className="btn btn-primary flex-1 sm:px-8 h-12 shadow-md">
                Finalize Registry
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="btn btn-outline flex-1 sm:px-8 h-12 shadow-sm"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center space-x-3 bg-haveli-section px-4 py-2 rounded-xl border border-haveli-border shadow-inner">
              <label 
                className={`text-[10px] font-black uppercase tracking-widest ${paymentStatus === 'Pending' ? 'text-haveli-accent' : 'text-gray-400'}`}
              >
                Pending
              </label>
              <button
                type="button"
                onClick={() => setPaymentStatus(paymentStatus === 'Pending' ? 'Complete' : 'Pending')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${paymentStatus === 'Complete' ? 'bg-haveli-primary' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${paymentStatus === 'Complete' ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
              <label 
                className={`text-[10px] font-black uppercase tracking-widest ${paymentStatus === 'Complete' ? 'text-haveli-primary' : 'text-gray-400'}`}
              >
                Settled
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
    <label htmlFor={id} className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2 ml-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full px-5 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-medium text-haveli-heading placeholder:opacity-40"
    />
  </div>
);

export default OfflineBookingPanel;