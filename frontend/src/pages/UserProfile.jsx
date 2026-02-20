import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

const UserProfile = () => {
  const { user } = useAuth();
  const { customers } = useData();
  
  const [activeTab, setActiveTab] = useState('stays');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- 1. FILTER & CATEGORIZE BOOKINGS ---
  const { currentStays, upcomingStays, pastStays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter bookings belonging to the logged-in user (matching by username or email)
    const userBookings = customers.filter(c => 
      c.email === user.email || 
      c.username === user.username ||
      (c.guestName && c.guestName.toLowerCase().includes(user.username.toLowerCase()))
    );

    const current = [];
    const upcoming = [];
    const past = [];

    userBookings.forEach(booking => {
      const checkOutDate = new Date(booking.checkOutDate);
      const normalizedStatus = (booking.status || 'Booked').replace(/\s/g, "").toLowerCase();

      if (normalizedStatus === 'checkedin') {
        current.push(booking);
      } 
      else if (normalizedStatus === 'checkedout' || normalizedStatus === 'cancelled') {
        past.push(booking);
      } 
      else if (normalizedStatus === 'booked') {
        // If the checkout date has already passed, automatically move to Past
        if (checkOutDate < today) {
          past.push(booking);
        } else {
          upcoming.push(booking);
        }
      }
    });

    // Sort upcoming by soonest first, past by most recent first
    upcoming.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    past.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));

    return { currentStays: current, upcomingStays: upcoming, pastStays: past };
  }, [customers, user]);


  // --- 2. BILLING CALCULATION FIX ---
  // Room totalAmount ALREADY includes GST from the online booking step.
  // We only add GST to food/additional charges, preventing the "Surprise GST" bug.
  const calculateFinancials = (booking) => {
    const roomTotalIncGST = booking.totalAmount || 0; 
    const foodTotal = booking.foodCharges || 0;
    const foodGST = foodTotal * 0.18;
    const lateNightFee = booking.lateNightFee || 0;
    const checkOutLateFee = booking.lateFee || 0;
    
    const grandTotal = roomTotalIncGST + foodTotal + foodGST + lateNightFee + checkOutLateFee;
    const amountPaid = booking.amountPaid || 0;
    const balance = grandTotal - amountPaid;

    return { roomTotalIncGST, foodTotal, foodGST, lateNightFee, checkOutLateFee, grandTotal, amountPaid, balance };
  };

  return (
    <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">Welcome, {user.username}</h1>
              <p className="text-gray-500 font-medium mt-1">{user.email || 'Manage your bookings and account settings'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 border-b-2 border-gray-200">
          <button 
            onClick={() => setActiveTab('stays')}
            className={`px-6 py-3 font-bold text-lg transition-colors border-b-4 ${activeTab === 'stays' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-amber-600'}`}
          >
            <i className="fas fa-bed mr-2"></i> My Stays
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-bold text-lg transition-colors border-b-4 ${activeTab === 'settings' ? 'border-amber-600 text-amber-800' : 'border-transparent text-gray-500 hover:text-amber-600'}`}
          >
            <i className="fas fa-cog mr-2"></i> Account Settings
          </button>
        </div>

        {/* --- STAYS TAB --- */}
        {activeTab === 'stays' && (
          <div className="space-y-12 animate-fadeIn">
            
            {/* Current Stay (Highlighted) */}
            {currentStays.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                  <i className="fas fa-key mr-3"></i> Current Stay
                </h2>
                <div className="grid gap-6">
                  {currentStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="current" />)}
                </div>
              </section>
            )}

            {/* Upcoming Stays */}
            <section>
              <h2 className="text-2xl font-bold text-amber-800 mb-4 flex items-center">
                <i className="fas fa-calendar-alt mr-3"></i> Upcoming Bookings
              </h2>
              {upcomingStays.length > 0 ? (
                <div className="grid gap-6">
                  {upcomingStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="upcoming" />)}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 font-medium">
                  You have no upcoming bookings. <a href="/booking" className="text-amber-600 hover:underline">Book a room now!</a>
                </div>
              )}
            </section>

            {/* Past Stays */}
            {pastStays.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-600 mb-4 flex items-center">
                  <i className="fas fa-history mr-3"></i> Past Bookings
                </h2>
                <div className="grid gap-6 opacity-75 hover:opacity-100 transition-opacity">
                  {pastStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="past" />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 animate-fadeIn max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Security & Authentication</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Username</label>
                <div className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  {user.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Password Management</label>
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-lg font-bold transition-all shadow-sm flex items-center"
                >
                  <i className="fas fa-lock mr-2"></i> Change Password
                </button>
                <p className="text-xs text-gray-500 mt-2">Regularly update your password to keep your account secure.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Reusable Password Modal */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </main>
  );
};

// --- Sub-Component: Stay Card ---
const StayCard = ({ booking, financials, type }) => {
  const { roomTotalIncGST, foodTotal, lateNightFee, grandTotal, amountPaid, balance } = financials;
  
  const statusColors = {
    current: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-amber-100 text-amber-800 border-amber-200',
    past: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const statusText = {
    current: 'CHECKED IN',
    upcoming: 'CONFIRMED',
    past: 'COMPLETED'
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col md:flex-row ${type === 'current' ? 'border-green-400 shadow-md' : 'border-gray-100'}`}>
      
      {/* Left: Room Details */}
      <div className="p-6 md:w-1/3 bg-gray-50 flex flex-col justify-center border-r border-gray-100">
        <span className={`self-start px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border mb-4 ${statusColors[type]}`}>
          {statusText[type]}
        </span>
        <h3 className="text-2xl font-black text-gray-800 mb-1">
          {booking.roomNumber?.includes('Online') ? booking.roomNumber.replace('Online-', '') + ' Room' : `Room ${booking.roomNumber}`}
        </h3>
        <p className="text-sm text-gray-500 font-medium">Booking ID: {booking._id || booking.id}</p>
        
        {type === 'upcoming' && booking.paymentMode === 'PayAtHotel' && (
          <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold border border-red-100">
            <i className="fas fa-exclamation-circle mr-1"></i> Pay at Hotel selected. Room is subject to availability upon arrival.
          </div>
        )}
      </div>

      {/* Middle: Dates */}
      <div className="p-6 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
            <p className="font-bold text-gray-800">{new Date(booking.checkInDate).toLocaleDateString('en-GB')}</p>
            <p className="text-xs text-gray-500">12:00 PM</p>
          </div>
          <i className="fas fa-long-arrow-alt-right text-gray-300 text-xl"></i>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
            <p className="font-bold text-gray-800">{new Date(booking.checkOutDate).toLocaleDateString('en-GB')}</p>
            <p className="text-xs text-gray-500">11:00 AM</p>
          </div>
        </div>
      </div>

      {/* Right: Financials (With Fixed GST Logic) */}
      <div className="p-6 md:w-1/3 bg-white flex flex-col justify-center">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Room (Inc. GST):</span>
            <span className="font-medium">₹{roomTotalIncGST.toLocaleString()}</span>
          </div>
          {foodTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Food/Services:</span>
              <span className="font-medium">₹{foodTotal.toLocaleString()}</span>
            </div>
          )}
          {lateNightFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Late Night Fee:</span>
              <span className="font-medium">₹{lateNightFee.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex justify-between font-black text-gray-800 mb-1">
            <span>Total Bill:</span>
            <span>₹{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="flex justify-between font-medium text-sm text-green-600">
            <span>Amount Paid:</span>
            <span>- ₹{amountPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg flex justify-between font-black text-lg ${balance > 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          <span>Pending Balance:</span>
          <span>₹{Math.max(0, balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;