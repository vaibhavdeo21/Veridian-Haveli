import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

const AdminProfile = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showNotification("Passwords do not match", "error");
    }

    try {
      // Hits the PUT route we added to backend/routes/auth.js
      const res = await axios.put('/api/auth/change-password', { 
        newPassword: passwords.newPassword 
      });
      showNotification(res.data.msg, "success");
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification("Failed to update password", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl border border-gray-100">
      <div className="flex items-center mb-8 pb-6 border-b">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mr-6">
          <i className="fas fa-user-shield text-amber-600 text-4xl"></i>
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800">{user?.username}</h2>
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <h3 className="text-lg font-bold text-gray-700 uppercase tracking-tighter">Security: Update Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">New Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Confirm New Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
        >
          Update Admin Security
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;