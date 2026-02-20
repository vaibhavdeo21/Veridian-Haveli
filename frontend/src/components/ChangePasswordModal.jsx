import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      return showNotification("New passwords do not match!", "error");
    }
    if (formData.newPassword.length < 6) {
      return showNotification("Password must be at least 6 characters.", "error");
    }

    setIsLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        userId: user._id || user.id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      showNotification("Password updated successfully!", "success");
      onClose();
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
            <input 
              type="password" id="currentPassword" value={formData.currentPassword} onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
            <input 
              type="password" id="newPassword" value={formData.newPassword} onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" required 
            />
          </div>
          
          <div className="pt-4 flex space-x-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-bold">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold">
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;