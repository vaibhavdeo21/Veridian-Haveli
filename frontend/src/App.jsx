import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Providers
import { NotificationProvider } from './context/NotificationContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Import customer-facing layouts and pages
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Booking from './pages/Booking.jsx';
import Order from './pages/Order.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UserProfile from './pages/UserProfile.jsx'; 

// Import admin layout and panels
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx'; 
import BookingRoomsPanel from './components/admin/BookingRoomsPanel.jsx';
import OfflineBookingPanel from './components/admin/OfflineBookingPanel.jsx';
import OrderFoodPanel from './components/admin/OrderFoodPanel.jsx';
import CustomerDetailsPanel from './components/admin/CustomerDetailsPanel.jsx';
import UpdateMenuPanel from './components/admin/UpdateMenuPanel.jsx';
import CustomerProfile from './components/admin/CustomerProfile.jsx'; 

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* --- Customer Facing Routes (Public) --- */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="booking" element={<Booking />} />
              <Route path="order" element={<Order />} />
              <Route path="profile" element={<UserProfile />} /> 
            </Route>

            {/* --- Admin Panel Routes (Protected) --- */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="rooms" element={<BookingRoomsPanel />} />
              <Route path="offline-booking" element={<OfflineBookingPanel />} />
              <Route path="orders" element={<OrderFoodPanel />} />
              <Route path="customers" element={<CustomerDetailsPanel />} />
              <Route path="update-menu" element={<UpdateMenuPanel />} />
              
              {/* --- NEW: Dynamic Route for Individual Customer Profiles --- */}
              <Route path="customer/:id" element={<CustomerProfile />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;