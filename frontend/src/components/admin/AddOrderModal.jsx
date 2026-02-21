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
    <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-xl border border-haveli-border shadow-2xl max-w-md w-full p-8 animate-fadeIn relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent opacity-50"></div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-haveli-section rounded-full flex items-center justify-center border border-haveli-border">
              <i className="fas fa-utensils text-haveli-accent"></i>
            </div>
            <h3 className="text-2xl font-bold font-display text-haveli-heading tracking-wide">Add Food Order</h3>
          </div>
          <button onClick={onClose} className="text-haveli-muted hover:text-red-500 transition-colors p-2">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Room Number</label>
              <input 
                type="text" id="roomNo" value={formData.roomNo} onChange={handleChange} 
                className="w-full px-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-bold text-haveli-heading" 
                placeholder="e.g. 101"
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Quantity</label>
              <input 
                type="number" id="quantity" value={formData.quantity} onChange={handleChange} 
                className="w-full px-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-light" 
                min="1" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Customer Name</label>
            <input 
              type="text" id="customerName" value={formData.customerName} onChange={handleChange} 
              className="w-full px-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-medium text-haveli-primary" 
              required 
              placeholder="Auto-fills from room status..." 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Food Selection</label>
            <div className="relative">
               <i className="fas fa-hamburger absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-60"></i>
               <input 
                type="text" id="foodItems" value={formData.foodItems} onChange={handleChange} 
                className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-light" 
                placeholder="Dishes (comma separated)"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Total Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-haveli-heading font-bold text-sm">₹</span>
              <input 
                type="number" id="totalAmount" value={formData.totalAmount} onChange={handleChange} 
                className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-bold text-haveli-heading" 
                min="0" step="0.01" 
                required 
              />
            </div>
          </div>

          <div className="pt-6 flex space-x-4">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 h-12 shadow-sm">
              Dismiss
            </button>
            <button type="submit" className="btn btn-primary flex-1 h-12 shadow-md">
              <i className="fas fa-plus-circle mr-2 text-xs"></i> Add Order
            </button>
          </div>
        </form>
        
        <p className="text-center text-[9px] text-haveli-muted mt-6 uppercase tracking-tighter">
          <i className="fas fa-info-circle mr-1 text-haveli-accent"></i>
          This order will be added to the guest's folio immediately.
        </p>
      </div>
    </div>
  );
};

export default AddOrderModal;