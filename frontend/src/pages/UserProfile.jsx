import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

const UserProfile = () => {
  usePageTitle("My Stay | VERIDIAN HAVELI");
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
    <main className="pt-32 pb-16 bg-haveli-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header Section */}
        <div className="lux-card border-haveli-border p-10 mb-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-8">
            <div className="w-24 h-24 bg-haveli-section border border-haveli-border rounded-full flex items-center justify-center text-5xl text-haveli-accent shadow-inner">
              <i className="far fa-user"></i>
            </div>
            <div>
              <p className="text-haveli-accent uppercase tracking-widest font-semibold text-xs mb-2">Heritage Club Member</p>
              <h1 className="text-4xl font-display font-bold text-haveli-heading">Welcome, {user.username}</h1>
              <p className="text-haveli-muted font-light mt-1">{user.email || 'Manage your heritage bookings'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-10 border-b border-haveli-border">
          <button
            onClick={() => setActiveTab('stays')}
            className={`pb-4 font-display font-bold text-xl transition-all relative ${activeTab === 'stays' ? 'text-haveli-heading' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            My Stays
            {activeTab === 'stays' && <div className="absolute bottom-0 left-0 w-full h-1 bg-haveli-accent"></div>}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 font-display font-bold text-xl transition-all relative ${activeTab === 'settings' ? 'text-haveli-heading' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            Account Security
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-haveli-accent"></div>}
          </button>
        </div>

        {/* --- STAYS TAB --- */}
        {activeTab === 'stays' && (
          <div className="space-y-16 animate-fadeIn">

            {/* Current Stay */}
            {currentStays.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-display text-haveli-primary mb-6 flex items-center">
                  <i className="far fa-key mr-3"></i> Currently In-Residence
                </h2>
                <div className="grid gap-8">
                  {currentStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="current" />)}
                </div>
              </section>
            )}

            {/* Upcoming Stays */}
            <section>
              <h2 className="text-2xl font-bold font-display text-haveli-heading mb-6 flex items-center">
                <i className="far fa-calendar-alt mr-3"></i> Confirmed Reservations
              </h2>
              {upcomingStays.length > 0 ? (
                <div className="grid gap-8">
                  {upcomingStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="upcoming" />)}
                </div>
              ) : (
                <div className="lux-card p-12 bg-white border-dashed text-center text-haveli-muted font-light italic">
                  No upcoming reservations. <a href="/booking" className="text-haveli-accent font-bold hover:underline ml-1">Reserve a suite.</a>
                </div>
              )}
            </section>

            {/* Past Stays */}
            {pastStays.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-display text-haveli-muted mb-6 flex items-center">
                  <i className="far fa-history mr-3"></i> Heritage Journey (Past Stays)
                </h2>
                <div className="grid gap-6 opacity-80 hover:opacity-100 transition-opacity">
                  {pastStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="past" />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="lux-card p-10 animate-fadeIn max-w-2xl shadow-sm">
            <h2 className="text-2xl font-bold font-display text-haveli-heading mb-8 border-b border-haveli-border pb-4 uppercase tracking-widest text-sm">Security & Privacy</h2>

            <div className="space-y-10">
              <div>
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3">Primary Account</label>
                <div className="text-lg font-medium text-haveli-heading bg-haveli-section px-6 py-4 rounded-xl border border-haveli-border shadow-inner">
                  {user.username}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-4">Credentials Management</label>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="btn btn-secondary h-14 px-8 min-w-[240px] shadow-sm flex items-center justify-center"
                >
                  <i className="far fa-lock mr-3"></i> Update Password
                </button>
                <p className="text-xs text-haveli-muted mt-4 font-light">Regularly updating your password ensures your membership remains secure.</p>
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
    current: 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20',
    upcoming: 'bg-[#fffbeb] text-haveli-accent border-haveli-accent/20',
    past: 'bg-haveli-section text-haveli-muted border-haveli-border'
  };

  const statusText = {
    current: 'Currently In-Residence',
    upcoming: 'Confirmed Arrival',
    past: 'Stay Completed'
  };

  return (
    <div className={`lux-card border-2 overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-md ${type === 'current' ? 'border-haveli-primary' : 'border-haveli-border'}`}>

      {/* Left: Suite Details */}
      <div className="p-8 md:w-1/3 bg-haveli-section flex flex-col justify-center border-r border-haveli-border">
        <span className={`self-start px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border mb-6 ${statusColors[type]}`}>
          {statusText[type]}
        </span>
        <h3 className="text-3xl font-display font-bold text-haveli-heading mb-2">
          {booking.roomNumber?.includes('Online') ? booking.roomNumber.replace('Online-', '') + ' Suite' : `Suite ${booking.roomNumber}`}
        </h3>
        <p className="text-xs text-haveli-muted uppercase tracking-tighter font-medium">Folio ID: {booking._id || booking.id}</p>

        {type === 'upcoming' && booking.paymentMode === 'PayAtHotel' && (
          <div className="mt-6 bg-[#fef2f2] text-[#991b1b] p-4 rounded-xl text-[10px] font-bold border border-[#fee2e2] leading-relaxed uppercase tracking-wider">
            <i className="far fa-exclamation-circle mr-2"></i> Pay at Arrival selected. Allocation subject to availability.
          </div>
        )}
      </div>

      {/* Middle: Itinerary */}
      <div className="p-8 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-haveli-border">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Arrival</p>
            <p className="font-bold text-haveli-heading text-lg">{new Date(booking.checkInDate).toLocaleDateString('en-GB')}</p>
            <p className="text-xs text-haveli-muted mt-1">12:00 PM</p>
          </div>
          {/* FIXED: Switched to fas fa-arrow-right to ensure icon shows */}
          <i className="fas fa-arrow-right text-haveli-accent opacity-30 text-lg mx-4"></i>
          <div className="text-right">
            <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-2">Departure</p>
            <p className="font-bold text-haveli-heading text-lg">{new Date(booking.checkOutDate).toLocaleDateString('en-GB')}</p>
            <p className="text-xs text-haveli-muted mt-1">11:00 AM</p>
          </div>
        </div>
      </div>

      {/* Right: Folio Financials */}
      <div className="p-8 md:w-1/3 bg-white flex flex-col justify-center">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-haveli-muted font-light">Suite Rate (Inc. GST):</span>
            <span className="font-medium text-haveli-heading">₹{roomTotalIncGST.toLocaleString()}</span>
          </div>
          {foodTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-haveli-muted font-light">Dining & Services:</span>
              <span className="font-medium text-haveli-heading">₹{foodTotal.toLocaleString()}</span>
            </div>
          )}
          {lateNightFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-haveli-muted font-light">Late Arrival Fee:</span>
              <span className="font-medium text-haveli-heading">₹{lateNightFee.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t border-haveli-border pt-4 mb-4 space-y-2">
          <div className="flex justify-between font-bold text-haveli-heading">
            <span className="text-[10px] uppercase tracking-widest">Total Bill:</span>
            <span className="font-display font-bold">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-medium text-sm text-haveli-primary italic">
            <span className="text-[10px] uppercase tracking-widest">Settle Advance:</span>
            <span>- ₹{amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl flex justify-between font-bold text-lg border ${balance > 0 ? 'bg-[#fef2f2] text-[#991b1b] border-[#fee2e2]' : 'bg-[#ecfdf5] text-haveli-primary border-[#d1fae5]'}`}>
          <span className="text-[10px] uppercase tracking-widest mt-1">Settle Folio:</span>
          <span className="font-display">₹{Math.max(0, balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;