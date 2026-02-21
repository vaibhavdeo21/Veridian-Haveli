import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.jsx';

const AdminProfile = () => {
  usePageTitle("Admin Profile | VERIDIAN HAVELI");
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showNotification("Passwords do not match", "error");
    }

    try {
      // Hits the PUT route added to backend/routes/auth.js
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
    <div className="bg-haveli-bg min-h-[calc(100vh-100px)] p-2 sm:p-6">
      <div className="lux-card max-w-2xl overflow-hidden relative">
        {/* Decorative Golden Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent opacity-50"></div>

        <div className="flex flex-col sm:flex-row items-center mb-10 pb-8 border-b border-haveli-border">
          <div className="w-24 h-24 bg-haveli-deep text-haveli-accent rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-8 border border-haveli-accent/30 shadow-inner">
            <i className="fas fa-user-shield text-4xl"></i>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-1">Authenticated Administrator</p>
            <h2 className="text-4xl font-bold font-display text-haveli-heading mb-2 leading-tight uppercase tracking-tight">
              {user?.username}
            </h2>
            <span className="inline-block bg-haveli-section text-haveli-primary border border-haveli-primary/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-haveli-section rounded-lg flex items-center justify-center border border-haveli-border">
              <i className="fas fa-key text-haveli-accent text-xs"></i>
            </div>
            <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">Security: Update Credential</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3">New Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-50"></i>
                <input 
                  type="password" 
                  required
                  placeholder="Enter new password"
                  className="w-full bg-haveli-section border border-haveli-border rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-haveli-heading focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3">Confirm New Password</label>
              <div className="relative">
                <i className="fas fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-50"></i>
                <input 
                  type="password" 
                  required
                  placeholder="Re-type password"
                  className="w-full bg-haveli-section border border-haveli-border rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-haveli-heading focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-haveli-border border-dashed">
            <button 
              type="submit" 
              className="btn btn-secondary h-12 px-10 shadow-md group"
            >
              <i className="fas fa-shield-alt mr-2 text-xs group-hover:animate-pulse"></i>
              Update Admin Security
            </button>
          </div>
        </form>

        <div className="mt-10 p-6 bg-haveli-section rounded-xl border border-haveli-border">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-haveli-accent mt-1 mr-3"></i>
            <p className="text-[11px] text-haveli-muted leading-relaxed font-medium uppercase tracking-tighter">
              Notice: Changing the administrator password will update your secure entry credentials for the Veridian Haveli management console immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;