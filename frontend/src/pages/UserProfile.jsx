import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import ChangePasswordModal from '../components/ChangePasswordModal.jsx';

const UserProfile = () => {
  usePageTitle("My Stay | VERIDIAN HAVELI");
  // Added updateFullName to context extraction
  const { user, updateUsername, updateFullName } = useAuth(); 
  const { customers } = useData();

  const [activeTab, setActiveTab] = useState('stays');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // --- Edit Username State ---
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(user?.username || '');

  // --- NEW: Edit Full Name State ---
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [editFullNameValue, setEditFullNameValue] = useState(user?.fullName || '');

  // Keep the input values in sync if the user object changes globally
  useEffect(() => {
    if (user) {
      setEditNameValue(user.username);
      setEditFullNameValue(user.fullName || '');
    }
  }, [user]);

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- IDENTITY UPDATE HANDLERS ---
  const handleNameUpdate = async () => {
    if (!editNameValue.trim() || editNameValue === user.username) {
      setIsEditingName(false);
      setEditNameValue(user.username);
      return;
    }
    
    const success = await updateUsername(editNameValue);
    if (success) {
      setIsEditingName(false);
    }
  };

  const handleFullNameUpdate = async () => {
    if (editFullNameValue === user.fullName) {
      setIsEditingFullName(false);
      return;
    }
    
    const success = await updateFullName(editFullNameValue);
    if (success) {
      setIsEditingFullName(false);
    }
  };

  // --- 1. FILTER & CATEGORIZE BOOKINGS ---
  const { currentStays, upcomingStays, pastStays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter bookings belonging to the logged-in user
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
      // UPDATE: Added 'expired' to the past stays array conditions
      else if (normalizedStatus === 'checkedout' || normalizedStatus === 'cancelled' || normalizedStatus === 'expired') {
        past.push(booking);
      }
      else if (normalizedStatus === 'booked') {
        if (checkOutDate < today) {
          past.push(booking);
        } else {
          upcoming.push(booking);
        }
      }
    });

    upcoming.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    past.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));

    return { currentStays: current, upcomingStays: upcoming, pastStays: past };
  }, [customers, user]);


  // --- 2. BILLING CALCULATION FIX: PREVENTS DOUBLE GST ---
  const calculateFinancials = (booking) => {
    // Check if GST is already baked into totalAmount (Online bookings)
    const isPreTaxed = booking.roomNumber?.toLowerCase().includes('online');

    const roomTotalIncGST = booking.totalAmount || 0;
    
    // Back-calculate true base for online bookings to avoid double tax lines
    const trueBaseRoomPrice = isPreTaxed ? (roomTotalIncGST / 1.18) : roomTotalIncGST;
    const roomGST = isPreTaxed ? (roomTotalIncGST - trueBaseRoomPrice) : (trueBaseRoomPrice * 0.18);

    const foodTotal = booking.foodCharges || 0;
    const foodGST = foodTotal * 0.18;
    const lateNightFee = booking.lateNightFee || 0;
    const checkOutLateFee = booking.lateFee || 0;

    // Correct final total logic
    const grandTotal = roomTotalIncGST + foodTotal + foodGST + lateNightFee + checkOutLateFee;
    const amountPaid = booking.amountPaid || 0;
    const balance = grandTotal - amountPaid;

    return { 
        roomTotalIncGST, 
        foodTotalWithGST: foodTotal + foodGST, 
        lateNightFee, 
        checkOutLateFee, 
        grandTotal, 
        amountPaid, 
        balance 
    };
  };

  // Determine what to show in the Welcome Banner
  const displayName = user.fullName ? user.fullName : user.username;

  return (
    <main className="pt-32 pb-16 bg-haveli-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-6">

        {/* --- LUXURIOUS HEADER SECTION --- */}
        <div className="lux-card border-haveli-border p-10 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-sm bg-white">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#C2A14D]"></div>
          <div className="flex items-center space-x-8">
            <div className="w-24 h-24 bg-haveli-section border border-[#C2A14D]/30 rounded-full flex items-center justify-center text-4xl text-[#C2A14D] shadow-inner relative">
              <i className="fas fa-user-tie"></i>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-haveli-primary rounded-full border-4 border-white flex items-center justify-center text-[10px] text-white">
                <i className="fas fa-check"></i>
              </div>
            </div>
            <div>
              <p className="text-[#C2A14D] uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Heritage Club Portfolio</p>
              
              {/* THE LUXURY GOLD NAME DISPLAY */}
              <h1 className="text-3xl md:text-4xl font-display font-bold text-haveli-heading uppercase tracking-tight flex flex-wrap items-baseline gap-2">
                WELCOME, 
                <span className="text-[#C2A14D] font-serif italic capitalize tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {displayName}
                </span>
              </h1>
              
              <p className="text-haveli-muted font-light mt-1 tracking-wide">{user.email || 'Verified Resident Member'}</p>
            </div>
          </div>
          <div className="mt-6 md:mt-0 bg-haveli-section border border-haveli-border px-6 py-3 rounded-xl flex flex-col items-center">
             <span className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-1">Total Stays</span>
             <span className="text-2xl font-bold font-display text-haveli-primary">{currentStays.length + upcomingStays.length + pastStays.length}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-10 mb-12 border-b border-haveli-border">
          <button
            onClick={() => setActiveTab('stays')}
            className={`pb-5 font-display font-bold text-lg uppercase tracking-widest transition-all relative ${activeTab === 'stays' ? 'text-haveli-heading' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            My Residency History
            {activeTab === 'stays' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#C2A14D]"></div>}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-5 font-display font-bold text-lg uppercase tracking-widest transition-all relative ${activeTab === 'settings' ? 'text-haveli-heading' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            Folio Security
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#C2A14D]"></div>}
          </button>
        </div>

        {/* --- STAYS TAB --- */}
        {activeTab === 'stays' && (
          <div className="space-y-16 animate-fadeIn">

            {/* Current Stay */}
            {currentStays.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-display text-haveli-primary mb-8 flex items-center uppercase tracking-widest">
                  <i className="fas fa-key mr-4 text-sm"></i> Currently In-Residence
                </h2>
                <div className="grid gap-10">
                  {currentStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="current" />)}
                </div>
              </section>
            )}

            {/* Upcoming Stays */}
            <section>
              <h2 className="text-xl font-bold font-display text-haveli-heading mb-8 flex items-center uppercase tracking-widest">
                <i className="fas fa-calendar-check mr-4 text-sm"></i> Future Reservations
              </h2>
              {upcomingStays.length > 0 ? (
                <div className="grid gap-10">
                  {upcomingStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="upcoming" />)}
                </div>
              ) : (
                <div className="lux-card p-16 bg-white border-dashed text-center">
                  <i className="fas fa-bed text-haveli-border text-4xl mb-4"></i>
                  <p className="text-haveli-muted font-light italic text-lg">No future reservations currently found.</p>
                  <a href="/booking" className="btn btn-secondary inline-flex mt-6 px-10">Reserve a Heritage Suite</a>
                </div>
              )}
            </section>

            {/* Past Stays */}
            {pastStays.length > 0 && (
              <section>
                <h2 className="text-lg font-bold font-display text-haveli-muted mb-8 flex items-center uppercase tracking-widest opacity-60">
                  <i className="fas fa-history mr-4 text-sm"></i> Previous Journeys
                </h2>
                <div className="grid gap-6 opacity-80 hover:opacity-100 transition-all duration-700">
                  {pastStays.map(booking => <StayCard key={booking._id || booking.id} booking={booking} financials={calculateFinancials(booking)} type="past" />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="lux-card p-12 animate-fadeIn max-w-2xl relative bg-white overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#C2A14D] opacity-30"></div>
            <h2 className="text-sm font-bold font-display text-haveli-heading mb-10 uppercase tracking-[0.3em] flex items-center">
                <i className="fas fa-shield-alt mr-3 text-[#C2A14D]"></i> Identity & Security
            </h2>

            <div className="space-y-12">
              
              {/* --- DISPLAY NAME SECTION --- */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Guest Display Name</label>
                  {!isEditingFullName ? (
                    <button onClick={() => setIsEditingFullName(true)} className="text-[10px] font-black text-[#C2A14D] uppercase tracking-widest hover:underline transition-all">
                      <i className="fas fa-pen mr-1"></i> Edit
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button onClick={handleFullNameUpdate} className="text-[10px] font-black text-haveli-primary uppercase tracking-widest hover:underline transition-all">
                        Save
                      </button>
                      <button 
                        onClick={() => { setIsEditingFullName(false); setEditFullNameValue(user.fullName || ''); }} 
                        className="text-[10px] font-black text-haveli-muted uppercase tracking-widest hover:underline transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={`text-lg font-medium text-[#C2A14D] bg-haveli-section px-8 py-5 rounded-2xl border border-haveli-border shadow-inner flex items-center transition-all ${isEditingFullName ? 'ring-1 ring-[#C2A14D] border-[#C2A14D]' : ''}`}>
                  <i className="fas fa-id-badge mr-4 opacity-50"></i>
                  {!isEditingFullName ? (
                    <span className="font-serif italic capitalize tracking-wide">{user.fullName || 'Add your real name...'}</span>
                  ) : (
                    <input
                      type="text"
                      value={editFullNameValue}
                      onChange={(e) => setEditFullNameValue(e.target.value)}
                      placeholder="e.g. Vaibhav Deo"
                      className="bg-transparent border-b border-[#C2A14D] focus:outline-none w-full font-serif italic transition-colors"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleFullNameUpdate()}
                    />
                  )}
                </div>
              </div>

              {/* --- LOGIN USERNAME SECTION --- */}
              <div className="border-t border-haveli-border pt-8">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Login Username</label>
                  {!isEditingName ? (
                    <button onClick={() => setIsEditingName(true)} className="text-[10px] font-black text-haveli-muted uppercase tracking-widest hover:underline transition-all">
                      <i className="fas fa-pen mr-1"></i> Edit
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button onClick={handleNameUpdate} className="text-[10px] font-black text-haveli-primary uppercase tracking-widest hover:underline transition-all">
                        Save
                      </button>
                      <button 
                        onClick={() => { setIsEditingName(false); setEditNameValue(user.username); }} 
                        className="text-[10px] font-black text-haveli-muted uppercase tracking-widest hover:underline transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className={`text-lg font-medium text-haveli-heading bg-haveli-section px-8 py-5 rounded-2xl border border-haveli-border shadow-inner flex items-center transition-all ${isEditingName ? 'ring-1 ring-haveli-muted border-haveli-muted' : ''}`}>
                  <i className="fas fa-at mr-4 text-haveli-muted opacity-50"></i>
                  {!isEditingName ? (
                    <span>{user.username}</span>
                  ) : (
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="bg-transparent border-b border-haveli-primary focus:outline-none w-full text-haveli-heading font-display transition-colors"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                    />
                  )}
                </div>
              </div>

              {/* --- CREDENTIALS MANAGEMENT --- */}
              <div className="border-t border-haveli-border pt-8">
                <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-4">Credentials Management</label>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="btn btn-secondary h-16 px-10 min-w-[280px] shadow-md flex items-center justify-center group"
                >
                  <i className="fas fa-lock mr-3 group-hover:animate-bounce"></i> Update Member Password
                </button>
                <p className="text-xs text-haveli-muted mt-6 font-light leading-relaxed">Veridian Haveli recommends bi-monthly credential rotation to maintain the highest standard of folio security.</p>
              </div>

            </div>
          </div>
        )}

      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </main>
  );
};

// --- Sub-Component: Stay Card ---
const StayCard = ({ booking, financials, type }) => {
  const { roomTotalIncGST, foodTotalWithGST, lateNightFee, grandTotal, amountPaid, balance } = financials;

  const statusColors = {
    current: 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20',
    upcoming: 'bg-[#fffbeb] text-haveli-accent border-haveli-accent/20',
    past: 'bg-haveli-section text-haveli-muted border-haveli-border'
  };

  // UPDATE: Dynamically set the past status text based on the database status
  const statusText = {
    current: 'In-Residence',
    upcoming: 'Confirmed Registry',
    past: booking.status === 'Expired' ? 'Expired / No-Show' : 'Stay Concluded'
  };

  return (
    <div className={`lux-card border-2 overflow-hidden flex flex-col md:flex-row transition-all duration-700 hover:shadow-xl bg-white ${type === 'current' ? 'border-haveli-primary ring-1 ring-haveli-primary/10' : 'border-haveli-border'}`}>

      {/* Left: Suite Details */}
      <div className="p-10 md:w-1/3 bg-haveli-section flex flex-col justify-center border-r border-haveli-border relative">
        <span className={`self-start px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border mb-8 ${statusColors[type]}`}>
          {statusText[type]}
        </span>
        <h3 className="text-3xl font-display font-bold text-haveli-heading mb-3 tracking-tighter uppercase">
          {booking.roomNumber?.includes('Online') ? booking.roomNumber.replace('Online-', '') : `Suite ${booking.roomNumber}`}
        </h3>
        <p className="text-[10px] text-haveli-muted uppercase tracking-[0.2em] font-bold opacity-60">Folio REF: {(booking._id || booking.id).slice(-12)}</p>

        {type === 'upcoming' && booking.paymentMode === 'PayAtHotel' && (
          <div className="mt-8 bg-[#fef2f2] text-[#991b1b] p-5 rounded-xl text-[9px] font-black border border-[#fee2e2] leading-relaxed uppercase tracking-widest shadow-sm">
            <i className="fas fa-exclamation-circle mr-2 text-xs"></i> 
            Unsecured Folio. Allocation subject to vacancy.
          </div>
        )}
      </div>

      {/* Middle: Itinerary */}
      <div className="p-10 md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-haveli-border bg-white/50">
        <div className="flex justify-between items-center relative">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3 opacity-60">Arrival</p>
            <p className="font-bold text-haveli-heading text-xl font-display">{new Date(booking.checkInDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</p>
            <p className="text-[10px] font-bold text-haveli-primary mt-1 uppercase tracking-tighter">12:00 PM GST</p>
          </div>
          <i className="fas fa-chevron-right text-haveli-accent opacity-30 text-lg mx-4"></i>
          <div className="text-right relative z-10">
            <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-3 opacity-60">Departure</p>
            <p className="font-bold text-haveli-heading text-xl font-display">{new Date(booking.checkOutDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</p>
            <p className="text-[10px] font-bold text-haveli-accent mt-1 uppercase tracking-tighter">11:00 AM GST</p>
          </div>
        </div>
      </div>

      {/* Right: Folio Financials */}
      <div className="p-10 md:w-1/3 bg-white flex flex-col justify-center">
        <h4 className="text-[9px] font-black text-haveli-muted uppercase tracking-[0.25em] mb-6 border-b border-haveli-border pb-2">Financial Breakdown</h4>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-xs">
            <span className="text-haveli-muted font-light tracking-wide">Suite Inventory (Inc. Tax):</span>
            <span className="font-bold text-haveli-heading">₹{roomTotalIncGST.toLocaleString()}</span>
          </div>
          {foodTotalWithGST > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-haveli-muted font-light tracking-wide">Culinary & Incidentals (Inc. Tax):</span>
              <span className="font-bold text-haveli-heading">₹{foodTotalWithGST.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          )}
          {lateNightFee > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-haveli-muted font-light tracking-wide">Service Surcharges:</span>
              <span className="font-bold text-haveli-heading">₹{lateNightFee.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t border-haveli-border pt-6 mb-6 space-y-3">
          <div className="flex justify-between items-center font-bold text-haveli-heading">
            <span className="text-[10px] uppercase tracking-widest opacity-60">Total Bill</span>
            <span className="font-display font-bold text-xl">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center font-medium text-xs text-haveli-primary italic">
            <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Settled Advance</span>
            <span>- ₹{amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className={`p-5 rounded-2xl flex justify-between items-center font-bold border-2 shadow-inner ${balance > 0 ? 'bg-[#fef2f2] text-red-700 border-red-100' : 'bg-[#ecfdf5] text-haveli-primary border-[#d1fae5]'}`}>
          <span className="text-[10px] uppercase tracking-widest mt-0.5">Folio Balance</span>
          <span className="font-display text-2xl tracking-tighter">₹{Math.max(0, balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;