import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ChangePasswordModal from './ChangePasswordModal.jsx'; // Make sure the path matches where you saved it!

const SidebarLink = ({ to, icon, children }) => {
    return (
        <li>
            <NavLink
                to={to}
                end
                className={({ isActive }) =>
                    `flex items-center px-6 h-12 rounded-xl transition-colors font-medium mb-1 ${
                        isActive 
                        ? 'bg-haveli-bg text-haveli-primary border-l-4 border-haveli-primary' 
                        : 'text-haveli-muted hover:bg-haveli-bg hover:text-haveli-heading border-l-4 border-transparent'
                    }`
                }
            >
                <i className={`far ${icon} w-6 text-center text-lg`}></i>
                <span className="ml-3 whitespace-nowrap">{children}</span>
            </NavLink>
        </li>
    );
};

const Sidebar = ({ isOpen }) => {
    const { logout, user } = useAuth();
    // State to handle the password modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <>
            <aside
                className={`fixed left-0 top-[72px] h-[calc(100vh-4.5rem)] w-64 bg-haveli-card border-r border-haveli-border z-40 transition-transform duration-500 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
                    <div>
                        <div className="flex items-center space-x-4 p-4 mb-8 border border-haveli-border rounded-xl bg-haveli-section">
                            <div className="w-10 h-10 bg-haveli-primary text-white rounded-lg flex items-center justify-center shrink-0">
                                <i className="far fa-user text-lg"></i>
                            </div>
                            <div className="block overflow-hidden">
                                <span className="font-display font-bold text-haveli-heading block truncate">{user?.username || 'Admin User'}</span>
                                <span className="text-xs text-haveli-muted block uppercase tracking-wider">Administrator</span>
                            </div>
                        </div>

                        <nav>
                            <ul>
                                <SidebarLink to="/admin" icon="fa-chart-bar">Dashboard</SidebarLink>
                                <SidebarLink to="/admin/rooms" icon="fa-door-open">Suite Inventory</SidebarLink>
                                <SidebarLink to="/admin/offline-booking" icon="fa-calendar-check">Desk Booking</SidebarLink>
                                <SidebarLink to="/admin/orders" icon="fa-concierge-bell">Room Service</SidebarLink>
                                <SidebarLink to="/admin/customers" icon="fa-address-book">Guest Profiles</SidebarLink>                                
                                <SidebarLink to="/admin/update-menu" icon="fa-utensils">Update Menu</SidebarLink>
                            </ul>
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-haveli-border space-y-2">
                        {/* NEW: Change Password Button */}
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="w-full flex items-center px-6 h-12 text-haveli-muted hover:bg-haveli-bg hover:text-haveli-heading rounded-xl transition-colors font-medium border border-transparent hover:border-haveli-border"
                        >
                            <i className="far fa-key w-6 text-center text-lg"></i>
                            <span className="ml-3">Security</span>
                        </button>

                        <button
                            onClick={logout}
                            className="w-full flex items-center px-6 h-12 text-[#b04a4a] hover:bg-[#b04a4a]/10 rounded-xl transition-colors font-medium"
                        >
                            <i className="far fa-sign-out-alt w-6 text-center text-lg"></i>
                            <span className="ml-3">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Render the modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </>
    );
};

export default Sidebar;