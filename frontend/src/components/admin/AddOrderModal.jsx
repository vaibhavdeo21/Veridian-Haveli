import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

const AddOrderModal = ({ isOpen, onClose }) => {
  // NEW: Extracted customers from useData to allow searching
  const { addOrder, customers } = useData();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    roomNo: '',
    customerName: '',
    foodItems: '',
    quantity: 1,
    totalAmount: 0,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [id]: value };

      // NEW: Auto-fill logic for Customer Name based on Room Number
      if (id === 'roomNo') {
        const typedRoomNo = String(value).trim();
        
        // Search for a guest who is checked into this specific room
        const matchedCustomer = customers.find(c => 
          String(c.roomNumber) === typedRoomNo && 
          (c.status || "").replace(/\s/g, "").toLowerCase() === 'checkedin'
        );

        if (matchedCustomer) {
          // If found, auto-fill their name
          newData.customerName = matchedCustomer.guestName;
        } else {
          // If no match is found (or room is empty), clear the name field 
          // so the admin doesn't accidentally bill the wrong person
          newData.customerName = '';
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOrder = {
      ...formData,
      quantity: parseInt(formData.quantity, 10),
      totalAmount: parseFloat(formData.totalAmount),
    };
    addOrder(newOrder);
    showNotification('New order added successfully!', 'success');
    onClose();
    // Reset form
    setFormData({
      roomNo: '',
      customerName: '',
      foodItems: '',
      quantity: 1,
      totalAmount: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Add New Food Order</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input type="text" id="roomNo" value={formData.roomNo} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" id="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required placeholder="Auto-fills if room is occupied..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Items</label>
              <input type="text" id="foodItems" value={formData.foodItems} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" id="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
              <input type="number" id="totalAmount" value={formData.totalAmount} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" min="0" step="0.01" required />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Add Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;