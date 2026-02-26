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
    <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
      {/* lux-card applied for heritage styling */}
      <div className="bg-white rounded-xl border border-haveli-border shadow-2xl max-w-md w-full p-8 animate-fadeIn relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent opacity-50"></div>

        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-haveli-section rounded-full flex items-center justify-center border border-haveli-border">
              <i className="fas fa-shield-alt text-haveli-accent"></i>
            </div>
            <h3 className="text-2xl font-bold font-display text-haveli-heading tracking-wide">Update Security</h3>
          </div>
          <button onClick={onClose} className="text-haveli-muted hover:text-red-500 transition-colors p-2">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Current Credential</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-60"></i>
              <input
                type="password" id="currentPassword" value={formData.currentPassword} onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-light"
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2 border-t border-haveli-border border-dashed">
            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">New Password</label>
              <div className="relative">
                <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-60"></i>
                <input
                  type="password" id="newPassword" value={formData.newPassword} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-light"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-2">Confirm New Password</label>
              <div className="relative">
                <i className="fas fa-check-double absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs opacity-60"></i>
                <input
                  type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary focus:border-haveli-primary outline-none transition-all font-light"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex space-x-4">
            {/* btn-outline used for secondary action */}
            <button type="button" onClick={onClose} className="btn btn-outline flex-1 h-12">
              Dismiss
            </button>
            {/* btn-primary used for main action */}
            <button type="submit" disabled={isLoading} className="btn btn-primary flex-1 h-12 shadow-md">
              {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync-alt mr-2 text-xs"></i>}
              {isLoading ? 'Verifying...' : 'Update Folio'}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] text-haveli-muted mt-6 uppercase tracking-tighter">
          <i className="fas fa-info-circle mr-1 text-haveli-accent"></i>
          This action will secure your heritage account immediately.
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordModal;