import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

const BookingRoomsPanel = () => {
  const { rooms, updateRoom, getRoomStats, addRoom, deleteRoom } = useData(); // Added deleteRoom
  const { totalRooms, availableRooms, bookedRooms } = getRoomStats();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // Track if we are editing
  const [newRoom, setNewRoom] = useState({ roomNo: '', type: 'Single', price: 2500 });

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
      // Logic for editing existing room
      updateRoom(editingRoom._id || editingRoom.id, 'roomNumber', newRoom.roomNo);
      updateRoom(editingRoom._id || editingRoom.id, 'type', newRoom.type);
      updateRoom(editingRoom._id || editingRoom.id, 'price', newRoom.price);
    } else {
      addRoom(newRoom);
    }
    setIsModalOpen(false);
    setEditingRoom(null);
    setNewRoom({ roomNo: '', type: 'Single', price: 2500 });
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
    <div id="booking-rooms-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Rooms Management</h2>
        <button 
          onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md"
        >
          <i className="fas fa-plus mr-2"></i> Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard icon="fa-door-closed" title="Total Rooms" value={totalRooms} color="blue" />
        <SummaryCard icon="fa-door-open" title="Available Rooms" value={availableRooms} color="green" />
        <SummaryCard icon="fa-bed" title="Booked Rooms" value={bookedRooms} color="red" />
      </div>

      <div className="space-y-8">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6 text-amber-800 border-b pb-4">
              {editingRoom ? 'Edit Room Details' : 'Add Physical Room'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Room Number</label>
                <input required value={newRoom.roomNo} onChange={(e) => setNewRoom({...newRoom, roomNo: e.target.value})} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. 101" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Room Type</label>
                <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  <option value="Single">Single Bed Room</option>
                  <option value="Double">Double Bed Room</option>
                  <option value="Triple">Triple Bed Room</option>
                  <option value="Dormitory">Dormitory Bed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price per Night (₹)</label>
                <input type="number" value={newRoom.price} onChange={(e) => setNewRoom({...newRoom, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingRoom(null); }} className="px-6 py-2 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold">
                  {editingRoom ? 'Update Room' : 'Save Room'}
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
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} mr-4`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
          <h3 className="text-2xl font-black text-gray-800">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const RoomTypeSection = ({ title, rooms, onUpdateRoom, onDeleteRoom, onEditRoom }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-amber-800">{title} Rooms</h3>
          <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Inventory Management</p>
        </div>
        <span className="bg-white px-3 py-1 rounded-full border text-xs font-bold text-gray-500">{rooms.length} Total</span>
      </div>
      
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.length > 0 ? rooms.map(room => (
          <RoomStatusCard 
            key={room._id || room.id} 
            room={room} 
            onUpdateRoom={onUpdateRoom} 
            onDeleteRoom={onDeleteRoom}
            onEditRoom={onEditRoom}
          />
        )) : (
          <div className="col-span-full py-4 text-center text-gray-400 italic text-sm">No rooms added for this type yet.</div>
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
    showNotification(`Room ${room.roomNumber || room.roomNo} set to ${newAvailability}`, 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'border-green-500 bg-green-50/50';
      case 'Booked': return 'border-red-500 bg-red-50/50';
      case 'Maintenance': return 'border-yellow-500 bg-yellow-50/50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`relative group rounded-xl border-2 p-4 transition-all duration-300 ${getStatusColor(room.availability || 'Available')}`}>
      
      {/* MANAGEMENT OVERLAY (Visible on Hover) */}
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={() => onEditRoom(room)}
          className="p-1.5 bg-white text-blue-600 rounded-md shadow-sm hover:bg-blue-50 border border-gray-100"
          title="Edit Details"
        >
          <i className="fas fa-edit text-[10px]"></i>
        </button>
        <button 
          onClick={() => onDeleteRoom(room._id || room.id)}
          className="p-1.5 bg-white text-red-600 rounded-md shadow-sm hover:bg-red-50 border border-gray-100"
          title="Delete Room"
        >
          <i className="fas fa-trash text-[10px]"></i>
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <span className="font-black text-lg text-gray-800">#{room.roomNumber || room.roomNo}</span>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Price: ₹{room.price}</p>
      
      <select 
        value={room.availability || 'Available'}
        onChange={handleAvailabilityChange}
        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
      >
        <option value="Available">Available</option>
        <option value="Booked">Booked</option>
        <option value="Maintenance">Maintenance</option>
      </select>
    </div>
  );
};

export default BookingRoomsPanel;