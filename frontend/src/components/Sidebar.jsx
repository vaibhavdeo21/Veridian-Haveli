import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const SidebarLink = ({ to, icon, children }) => {
    return (
        <li>
            <NavLink
                to={to}
                end
                className={({ isActive }) =>
                    `sidebar-item flex items-center p-3 rounded-lg transition-colors ${
                        isActive ? 'bg-amber-50 text-amber-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-amber-600'
                    }`
                }
            >
                <i className={`fas ${icon} w-6 text-center text-lg`}></i>
                {/* Removed the 'hidden lg:inline' so text stays visible when sliding */}
                <span className="ml-3 whitespace-nowrap">{children}</span>
            </NavLink>
        </li>
    );
};

const Sidebar = ({ isOpen }) => {
    const { logout } = useAuth();

    return (
        <aside 
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-40 transition-transform duration-300 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
                <div>
                    <div className="flex items-center space-x-3 p-2 mb-4 border-b pb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                            <i className="fas fa-user text-amber-600 text-xl"></i>
                        </div>
                        <div className="block">
                            <span className="font-medium text-gray-800 block">Admin User</span>
                            <span className="text-sm text-gray-500 block">Administrator</span>
                        </div>
                    </div>

                    <nav>
                        <ul className="space-y-2">
                            <SidebarLink to="/admin" icon="fa-tachometer-alt">Dashboard</SidebarLink>
                            <SidebarLink to="/admin/rooms" icon="fa-bed">Booking Rooms</SidebarLink>
                            <SidebarLink to="/admin/offline-booking" icon="fa-calendar-plus">Offline Booking</SidebarLink>
                            <SidebarLink to="/admin/orders" icon="fa-utensils">Order Food</SidebarLink>
                            <SidebarLink to="/admin/customers" icon="fa-users">Customer Details</SidebarLink>
                            <SidebarLink to="/admin/update-menu" icon="fa-edit">Update Menu</SidebarLink>
                        </ul>
                    </nav>
                </div>

                <div className="pt-4 border-t">
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center p-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    >
                        <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
                        <span className="ml-3 font-semibold">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;