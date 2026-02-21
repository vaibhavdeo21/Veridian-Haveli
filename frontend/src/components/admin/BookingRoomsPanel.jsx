import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

const BookingRoomsPanel = () => {
  const { rooms, updateRoom, getRoomStats, addRoom, deleteRoom } = useData(); 
  const { totalRooms, availableRooms, bookedRooms } = getRoomStats();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); 
  const [newRoom, setNewRoom] = useState({ roomNo: '', type: 'Single', price: 25000 });

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setNewRoom({ 
      roomNo: room.roomNumber || room.roomNo, 
      type: room.type, 
      price: room.price 
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom(editingRoom._id || editingRoom.id, 'roomNumber', newRoom.roomNo);
      updateRoom(editingRoom._id || editingRoom.id, 'type', newRoom.type);
      updateRoom(editingRoom._id || editingRoom.id, 'price', newRoom.price);
    } else {
      addRoom(newRoom);
    }
    setIsModalOpen(false);
    setEditingRoom(null);
    setNewRoom({ roomNo: '', type: 'Single', price: 25000 });
  };

  const getRoomsByType = (type) => {
    return Array.isArray(rooms) ? rooms.filter(r => r.type === type) : [];
  };

  const roomTypes = {
    Single: getRoomsByType('Single'),
    Double: getRoomsByType('Double'),
    Triple: getRoomsByType('Triple'),
    Dormitory: getRoomsByType('Dormitory'),
  };

  return (
    <div id="booking-rooms-panel" className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Inventory Control</p>
          <h2 className="text-3xl font-bold text-haveli-heading font-display tracking-tight">Suite Management</h2>
        </div>
        <button 
          onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
          className="btn btn-secondary px-8 h-12 shadow-sm"
        >
          <i className="fas fa-plus mr-2 text-xs"></i> Add New Suite
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <SummaryCard icon="fa-door-closed" title="Total Inventory" value={totalRooms} color="blue" />
        <SummaryCard icon="fa-door-open" title="Vacant Suites" value={availableRooms} color="green" />
        <SummaryCard icon="fa-bed" title="Occupied" value={bookedRooms} color="red" />
      </div>

      <div className="space-y-12">
        {Object.entries(roomTypes).map(([type, roomsOfType]) => (
          <RoomTypeSection 
            key={type}
            title={type}
            rooms={roomsOfType}
            onUpdateRoom={updateRoom}
            onDeleteRoom={deleteRoom}
            onEditRoom={handleOpenEdit}
          />
        ))}
      </div>

      {/* Unified Add/Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl border border-haveli-border shadow-2xl p-10 w-full max-w-md relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent opacity-50"></div>
            
            <h3 className="text-2xl font-bold mb-8 text-haveli-heading font-display tracking-wide border-b border-haveli-border pb-4">
              {editingRoom ? 'Modify Suite Details' : 'Register New Suite'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Suite Number</label>
                <div className="relative">
                  <i className="fas fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-60"></i>
                  <input 
                    required 
                    value={newRoom.roomNo} 
                    onChange={(e) => setNewRoom({...newRoom, roomNo: e.target.value})} 
                    className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-bold text-haveli-heading" 
                    placeholder="e.g. 101" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Suite Category</label>
                <select 
                  value={newRoom.type} 
                  onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} 
                  className="w-full px-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-medium text-haveli-body appearance-none"
                >
                  <option value="Single">Single Bed Suite</option>
                  <option value="Double">Double Bed Suite</option>
                  <option value="Triple">Triple Bed Suite</option>
                  <option value="Dormitory">Dormitory / Shared</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Nightly Rate (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-haveli-heading font-bold text-sm">₹</span>
                  <input 
                    type="number" 
                    value={newRoom.price} 
                    onChange={(e) => setNewRoom({...newRoom, price: Number(e.target.value)})} 
                    className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-bold text-haveli-heading" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingRoom(null); }} className="btn btn-outline flex-1">Dismiss</button>
                <button type="submit" className="btn btn-primary flex-1 shadow-md">
                  {editingRoom ? 'Update Folio' : 'Save Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20',
    red: 'bg-[#fef2f2] text-red-600 border-red-100',
  };
  return (
    <div className="lux-card p-8 transition-transform hover:scale-[1.02] duration-500">
      <div className="flex items-center">
        <div className={`p-4 rounded-xl border ${colorClasses[color]} mr-6 shadow-inner`}>
          <i className={`fas ${icon} text-2xl`}></i>
        </div>
        <div>
          <p className="text-haveli-muted text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-bold font-display text-haveli-heading tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const RoomTypeSection = ({ title, rooms, onUpdateRoom, onDeleteRoom, onEditRoom }) => {
  return (
    <div className="lux-card p-0 overflow-hidden border-haveli-border shadow-sm">
      <div className="p-8 border-b border-haveli-border bg-haveli-section flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-haveli-heading font-display uppercase tracking-wider">{title} Suites</h3>
          <p className="text-[10px] text-haveli-muted mt-1 uppercase font-bold tracking-widest opacity-70">Heritage Inventory Management</p>
        </div>
        <span className="bg-white px-4 py-1.5 rounded-full border border-haveli-border text-[10px] font-bold text-haveli-accent uppercase tracking-tighter shadow-sm">
          {rooms.length} Suites Total
        </span>
      </div>
      
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 bg-white/50">
        {rooms.length > 0 ? rooms.map(room => (
          <RoomStatusCard 
            key={room._id || room.id} 
            room={room} 
            onUpdateRoom={onUpdateRoom} 
            onDeleteRoom={onDeleteRoom}
            onEditRoom={onEditRoom}
          />
        )) : (
          <div className="col-span-full py-10 text-center text-haveli-muted italic font-light tracking-wide">No suites registered in this category.</div>
        )}
      </div>
    </div>
  );
};

const RoomStatusCard = ({ room, onUpdateRoom, onDeleteRoom, onEditRoom }) => {
  const { showNotification } = useNotification();

  const handleAvailabilityChange = (e) => {
    const newAvailability = e.target.value;
    onUpdateRoom(room._id || room.id, 'availability', newAvailability);
    showNotification(`Suite ${room.roomNumber || room.roomNo} set to ${newAvailability}`, 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'border-haveli-primary bg-[#ecfdf5]/40';
      case 'Booked': return 'border-haveli-accent bg-[#fffbeb]/40';
      case 'Maintenance': return 'border-red-400 bg-[#fef2f2]/40';
      default: return 'border-haveli-border bg-haveli-section/40';
    }
  };

  return (
    <div className={`relative group rounded-xl border-2 p-5 transition-all duration-500 hover:shadow-lg ${getStatusColor(room.availability || 'Available')}`}>
      
      {/* MANAGEMENT OVERLAY (Visible on Hover) */}
      <div className="absolute -top-3 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
        <button 
          onClick={() => onEditRoom(room)}
          className="w-8 h-8 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-50 border border-haveli-border flex items-center justify-center transition-colors"
          title="Edit Details"
        >
          <i className="fas fa-edit text-xs"></i>
        </button>
        <button 
          onClick={() => onDeleteRoom(room._id || room.id)}
          className="w-8 h-8 bg-white text-red-600 rounded-full shadow-md hover:bg-red-50 border border-haveli-border flex items-center justify-center transition-colors"
          title="Delete Suite"
        >
          <i className="fas fa-trash text-xs"></i>
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="font-bold text-2xl text-haveli-heading font-display tracking-tighter">#{room.roomNumber || room.roomNo}</span>
      </div>
      <p className="text-[10px] font-bold text-haveli-accent uppercase tracking-widest mb-4">₹{room.price.toLocaleString()} / Night</p>
      
      <select 
        value={room.availability || 'Available'}
        onChange={handleAvailabilityChange}
        className="w-full px-3 py-2 border border-haveli-border rounded-lg text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-haveli-primary bg-white/80 cursor-pointer transition-all"
      >
        <option value="Available">Available</option>
        <option value="Booked">Booked</option>
        <option value="Maintenance">Maintenance</option>
      </select>
    </div>
  );
};

export default BookingRoomsPanel;