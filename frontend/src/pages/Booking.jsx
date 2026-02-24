import usePageTitle from "../hooks/usePageTitle";
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const roomConfig = {
  single: { name: 'Classic Single Suite', price: 25000 },
  double: { name: 'Veridian Double Suite', price: 40000 },
  triple: { name: 'Royal Triple Suite', price: 55000 },
  dormitory: { name: 'Heritage Dormitory', price: 12000 },
};

const TAX_RATE = 0.18;

const getToday = () => new Date().toISOString().split('T')[0];
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const Booking = () => {
  usePageTitle("Book Your Stay | VERIDIAN HAVELI");
  const { addCustomer, rooms, customers } = useData();
  const { showNotification } = useNotification();
  const { user, updateActiveBooking } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMode, setPaymentMode] = useState('OnlineFull'); 
  const [dates, setDates] = useState({
    checkIn: getToday(),
    checkOut: getTomorrow(),
  });
  const [selectedRooms, setSelectedRooms] = useState({
    single: 0,
    double: 0,
    triple: 0,
    dormitory: 0,
  });
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    requests: '',
  });

  // --- PERFECT SYNC REPEAT CUSTOMER LOGIC ---
  const isRepeatCustomer = useMemo(() => {
    if (!user || !customers) return false;

    // Use the EXACT SAME logic as UserProfile.jsx to guarantee synchronization
    const userBookings = customers.filter(c =>
      c.email === user.email ||
      c.username === user.username ||
      (c.guestName && c.guestName.toLowerCase().includes(user.username.toLowerCase()))
    );

    return userBookings.length > 0;
  }, [user, customers]);

  const roomAvailability = useMemo(() => {
    const counts = { single: 0, double: 0, triple: 0, dormitory: 0 };
    if (Array.isArray(rooms)) {
      rooms.forEach(room => {
        const isAvailable = !room.availability || room.availability.toLowerCase() === 'available';
        if (isAvailable) {
          const type = (room.type || '').toLowerCase();
          if (type.includes('single')) counts.single++;
          else if (type.includes('double')) counts.double++;
          else if (type.includes('triple')) counts.triple++;
          else if (type.includes('dorm')) counts.dormitory++;
        }
      });
    }
    return counts;
  }, [rooms]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const nights = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    const checkIn = new Date(dates.checkIn);
    const checkOut = new Date(dates.checkOut);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nightsCount = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nightsCount > 0 ? nightsCount : 0;
  }, [dates]);

  const roomTotals = useMemo(() => {
    let roomTotal = 0;
    const details = {};
    for (const [key, quantity] of Object.entries(selectedRooms)) {
      if (quantity > 0) {
        const price = roomConfig[key].price;
        const subtotal = price * quantity * nights;
        roomTotal += subtotal;
        details[key] = {
          ...roomConfig[key],
          quantity,
          subtotal,
          baseType: key 
        };
      }
    }
    return { roomTotal, details };
  }, [selectedRooms, nights]);

  const finalTotals = useMemo(() => {
    const { roomTotal } = roomTotals;
    const discountAmount = isRepeatCustomer ? (roomTotal * 0.05) : 0;
    const discountedRoomTotal = roomTotal - discountAmount;

    const tax = discountedRoomTotal * TAX_RATE;
    const grandTotal = discountedRoomTotal + tax;

    return { roomTotal, discountAmount, discountedRoomTotal, tax, grandTotal };
  }, [roomTotals, isRepeatCustomer]);

  if (!user) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-haveli-bg">
        <div className="bg-haveli-card border border-haveli-border p-8 rounded-xl shadow-sm max-w-lg w-full">
          <i className="fas fa-lock text-5xl text-haveli-accent mb-4"></i>
          <h2 className="text-3xl font-bold font-display text-haveli-heading mb-2">Login Required</h2>
          <p className="text-haveli-muted mb-8 font-light">Please sign in to your account to reserve a suite at Veridian Haveli.</p>
          <div className="flex flex-col space-y-3">
            <Link to="/login" className="bg-haveli-primary hover:bg-haveli-primaryHover text-white h-12 rounded-xl font-medium flex items-center justify-center transition">
              Sign In
            </Link>
            <Link to="/register" className="border border-haveli-border text-haveli-heading hover:bg-haveli-bg h-12 rounded-xl font-medium flex items-center justify-center transition">
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleDateChange = (e) => {
    const { id, value } = e.target;
    const newDates = { ...dates, [id]: value };
    if (id === 'checkIn' && newDates.checkOut < value) {
      newDates.checkOut = value;
    }
    setDates(newDates);
  };

  const handleRoomChange = (roomType, quantity) => {
    const maxAvailable = roomAvailability[roomType];
    if (quantity >= 0 && quantity <= maxAvailable) {
      setSelectedRooms(prev => ({ ...prev, [roomType]: quantity }));
    } else if (quantity > maxAvailable) {
      showNotification(`Only ${maxAvailable} suites are currently available.`, 'error');
    }
  };

  const handleGuestChange = (e) => {
    const { id, value } = e.target;
    setGuestDetails(prev => ({ ...prev, [id]: value }));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleNextToGuest = () => {
    if (roomTotals.roomTotal <= 0) {
      showNotification('Please select at least one suite and valid stay dates.', 'error');
      return;
    }
    goToStep(2);
  };

  const handleNextToReview = () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      showNotification('Please provide all required guest information.', 'error');
      return;
    }
    goToStep(3);
  };

  const handleConfirmBooking = async (paymentModeToSubmit, amountPaid) => {
    let success = true;
    const finalGuestDetails = {
      ...guestDetails,
      username: user.username,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      isRepeatCustomer: isRepeatCustomer
    };

    for (const [key, data] of Object.entries(roomTotals.details)) {
      if (data.quantity > 0) {
        for (let i = 0; i < data.quantity; i++) {
          
          const basePricePerSuite = data.subtotal / data.quantity;
          const discountPerSuite = isRepeatCustomer ? (basePricePerSuite * 0.05) : 0;
          const discountedBasePerSuite = basePricePerSuite - discountPerSuite;
          const taxOnThisSuite = discountedBasePerSuite * TAX_RATE;

          const roomData = {
            baseType: data.baseType, 
            type: data.name,
            baseAmount: discountedBasePerSuite, 
            taxAmount: taxOnThisSuite,          
            totalAmount: discountedBasePerSuite + taxOnThisSuite 
          };

          const perRoomPaid = amountPaid / (Object.values(roomTotals.details).reduce((sum, d) => sum + d.quantity, 0));

          try {
            await addCustomer(finalGuestDetails, roomData, paymentModeToSubmit, perRoomPaid);
          } catch (error) {
            success = false;
          }
        }
      }
    }

    if (success) {
      updateActiveBooking('Online');
      showNotification(`Reservation Confirmed. Welcome to Veridian Haveli!`, 'success');
      setSelectedRooms({ single: 0, double: 0, triple: 0, dormitory: 0 });
      setDates({ checkIn: getToday(), checkOut: getTomorrow() });
      setGuestDetails({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', requests: '' });
      goToStep(1);
    } else {
      showNotification('Reservation failed. Please contact our concierge.', 'error');
    }
  };

  return (
    <main className="pt-32 pb-16 bg-haveli-bg min-h-screen">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-haveli-accent uppercase tracking-widest font-semibold text-sm mb-2">Reservation Portal</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-haveli-heading">Reserve Your Stay</h1>
          <p className="text-haveli-muted max-w-2xl mx-auto font-light">Select from our real-time inventory of heritage suites and rooms</p>
          <p className="text-xs font-bold mt-4 text-haveli-primary uppercase tracking-tighter">Arrival: 12:00 PM | Departure: 11:00 AM</p>
        </div>

        <div className="mb-16">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-haveli-border -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-px bg-haveli-accent -translate-y-1/2 z-0 transition-all duration-700"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>

            {[
              { s: 1, l: "Select Suites" },
              { s: 2, l: "Guest Info" },
              { s: 3, l: "Review & Pay" }
            ].map((item) => (
              <div key={item.s} className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 border ${currentStep >= item.s ? 'bg-haveli-deep text-haveli-accent border-haveli-accent shadow-sm' : 'bg-haveli-card text-haveli-muted border-haveli-border'}`}>
                  {currentStep > item.s ? <i className="fas fa-check"></i> : item.s}
                </div>
                <span className={`mt-3 text-xs font-bold tracking-widest uppercase ${currentStep >= item.s ? 'text-haveli-heading' : 'text-haveli-muted'}`}>
                  {item.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="animate-fadeIn">
            
            {isRepeatCustomer && (
              <div className="bg-[#ecfdf5] border border-haveli-primary/20 text-haveli-primary p-6 rounded-xl mb-10 flex items-center shadow-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <i className="fas fa-award text-xl"></i>
                </div>
                <div>
                  <h4 className="font-bold font-display tracking-widest uppercase text-sm">Welcome Back, Heritage Member</h4>
                  <p className="text-xs font-medium mt-1 tracking-wide">A 5% loyalty discount is active and automatically applied to your suite reservations.</p>
                </div>
              </div>
            )}

            <h2 className="text-3xl font-bold mb-10 font-display text-center text-haveli-heading">Select Accommodations</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {Object.entries(roomConfig).map(([key, config]) => (
                <RoomSelectionCard
                  key={key}
                  roomType={key}
                  config={config}
                  quantity={selectedRooms[key]}
                  onRoomChange={handleRoomChange}
                  subtotal={roomTotals.details[key]?.subtotal || 0}
                  availableCount={roomAvailability[key]}
                />
              ))}
            </div>

            <div className="bg-haveli-card border border-haveli-border rounded-xl p-8 mb-10">
              <h3 className="text-xl font-bold mb-6 font-display text-haveli-heading">Stay Itinerary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-haveli-heading tracking-wide uppercase">Check-in Date</label>
                  <input type="date" id="checkIn" value={dates.checkIn} min={getToday()} onChange={handleDateChange} className="w-full h-12 px-4 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-haveli-heading tracking-wide uppercase">Check-out Date</label>
                  <input type="date" id="checkOut" value={dates.checkOut} min={dates.checkIn} onChange={handleDateChange} className="w-full h-12 px-4 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body" />
                </div>
              </div>
              <div className="mt-6 text-sm font-bold text-haveli-primary bg-haveli-section py-2 px-6 border border-haveli-border rounded-full inline-block uppercase tracking-widest">
                Duration: {nights} Nights
              </div>
            </div>

            <RoomSummaryTable roomTotals={roomTotals} nights={nights} isRepeatCustomer={isRepeatCustomer} finalTotals={finalTotals} />

            <div className="flex justify-between mt-12">
              <Link to="/" className="text-haveli-muted hover:text-haveli-heading h-12 px-8 rounded-xl font-medium transition flex items-center">
                <i className="fas fa-chevron-left mr-2 text-xs"></i>Back to Home
              </Link>
              <button
                disabled={roomTotals.roomTotal === 0}
                onClick={handleNextToGuest}
                className={`h-12 px-10 rounded-xl font-medium transition flex items-center justify-center ${roomTotals.roomTotal > 0 ? 'bg-haveli-primary text-white hover:bg-haveli-primaryHover' : 'bg-haveli-border text-haveli-muted cursor-not-allowed'}`}
              >
                Continue <i className="fas fa-chevron-right ml-2 text-xs"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 font-display text-center text-haveli-heading">Guest Particulars</h2>
            <GuestForm guestDetails={guestDetails} onChange={handleGuestChange} />
            <div className="flex justify-between mt-12">
              <button onClick={() => goToStep(1)} className="text-haveli-muted hover:text-haveli-heading h-12 px-8 font-medium transition flex items-center">
                <i className="fas fa-chevron-left mr-2 text-xs"></i>Suites
              </button>
              <button onClick={handleNextToReview} className="bg-haveli-accent hover:bg-haveli-accentHover text-white h-12 px-10 rounded-xl font-medium transition flex items-center shadow-sm">
                Review & Payment <i className="fas fa-chevron-right ml-2 text-xs"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 font-display text-center text-haveli-heading">Folio Review</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <BookingReview dates={dates} nights={nights} roomTotals={roomTotals} finalTotals={finalTotals} guest={guestDetails} paymentMode={paymentMode} />
              <PaymentForm finalTotals={finalTotals} onConfirm={handleConfirmBooking} paymentMode={paymentMode} setPaymentMode={setPaymentMode} />
            </div>
            <div className="flex justify-between mt-12">
              <button onClick={() => goToStep(2)} className="text-haveli-muted hover:text-haveli-heading h-12 px-8 font-medium transition flex items-center">
                <i className="fas fa-chevron-left mr-2 text-xs"></i>Guest Info
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// --- Sub-Components ---

const RoomSelectionCard = ({ roomType, config, quantity, onRoomChange, subtotal, availableCount }) => (
  <div className="bg-haveli-card border border-haveli-border rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl flex flex-col h-full group">
    <div className="relative">
      <img src={`https://images.unsplash.com/${config.price === 25000 ? 'photo-1631049307264-da0ec9d70304' : config.price === 40000 ? 'photo-1566665797739-1674de7a421a' : config.price === 55000 ? 'photo-1611892440504-42a792e24d32' : 'photo-1590490360182-c33d57733427'}?w=400&h=300&fit=crop`} alt={config.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute top-4 right-4 bg-haveli-card/90 backdrop-blur-sm border border-haveli-accent text-haveli-accent text-xs font-bold px-4 py-1.5 rounded-full">
        ₹{config.price.toLocaleString()} / night
      </div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-haveli-heading mb-4 font-display h-12 leading-tight">{config.name}</h3>
      <div className="flex justify-between items-center mb-6">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${availableCount > 0 ? 'text-haveli-primary' : 'text-red-500'}`}>
          {availableCount > 0 ? `Available: ${availableCount}` : 'Fully Booked'}
        </span>
        <div className="flex items-center space-x-3 bg-haveli-section rounded-lg p-1 border border-haveli-border">
          <button onClick={() => onRoomChange(roomType, quantity - 1)} className="w-8 h-8 flex items-center justify-center text-haveli-primary hover:bg-haveli-bg rounded transition"><i className="fas fa-minus text-xs"></i></button>
          <span className="font-bold text-haveli-heading w-4 text-center">{quantity}</span>
          <button onClick={() => onRoomChange(roomType, quantity + 1)} className="w-8 h-8 flex items-center justify-center text-haveli-primary hover:bg-haveli-bg rounded transition"><i className="fas fa-plus text-xs"></i></button>
        </div>
      </div>
      <div className="text-right border-t border-haveli-border pt-4 mt-auto">
        <span className="text-haveli-accent font-bold">Subtotal: ₹{subtotal.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const RoomSummaryTable = ({ roomTotals, nights, isRepeatCustomer, finalTotals }) => (
  <div className="bg-haveli-card border border-haveli-border rounded-xl p-8 mb-10">
    <h3 className="text-xl font-bold mb-8 font-display text-haveli-heading flex items-center">
      <i className="fas fa-list mr-3 text-haveli-accent"></i>Booking Breakdown
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-haveli-muted uppercase tracking-widest border-b border-haveli-border">
            <th className="pb-4 font-medium">Suite Type</th>
            <th className="pb-4 text-center font-medium">Qty</th>
            <th className="pb-4 text-right font-medium">Rate</th>
            <th className="pb-4 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-haveli-border">
          {Object.keys(roomTotals.details).length > 0 ? (
            Object.entries(roomTotals.details).map(([key, data]) => (
              <tr key={key}>
                <td className="py-4 font-medium text-haveli-heading">{data.name}</td>
                <td className="py-4 text-center font-light">{data.quantity}</td>
                <td className="py-4 text-right font-light">₹{data.price.toLocaleString()}</td>
                <td className="py-4 text-right font-bold text-haveli-primary">₹{data.subtotal.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" className="py-10 text-center text-haveli-muted font-light italic tracking-wide">No suite selections made yet.</td></tr>
          )}
        </tbody>
        <tfoot>
          {isRepeatCustomer && (
            <tr className="border-t border-haveli-border bg-[#ecfdf5]">
              <td colSpan="3" className="py-4 text-right font-bold text-haveli-primary uppercase tracking-widest text-xs">Heritage Member Discount (5%):</td>
              <td className="py-4 text-right font-bold text-haveli-primary text-md">- ₹{finalTotals.discountAmount.toLocaleString()}</td>
            </tr>
          )}
          <tr className={isRepeatCustomer ? '' : 'border-t-2 border-haveli-border'}>
            <td colSpan="3" className="py-6 text-right font-medium text-haveli-muted uppercase tracking-widest text-xs">Total Nightly Rate:</td>
            <td className="py-6 text-right font-bold text-haveli-heading text-lg">₹{(roomTotals.roomTotal / (nights || 1)).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

const GuestForm = ({ guestDetails, onChange }) => (
  <div className="bg-haveli-card border border-haveli-border rounded-xl p-10 mb-10 shadow-sm">
    <h3 className="text-2xl font-bold mb-10 font-display text-haveli-heading flex items-center border-b border-haveli-border pb-4">
      <i className="fas fa-user-edit mr-3 text-haveli-accent"></i>Guest Registry
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <FormInput label="First Name" id="firstName" value={guestDetails.firstName} onChange={onChange} required placeholder="Heritage Guest" />
      <FormInput label="Last Name" id="lastName" value={guestDetails.lastName} onChange={onChange} required placeholder="Verified" />
      <FormInput label="Email Address" id="email" type="email" value={guestDetails.email} onChange={onChange} required placeholder="resident@veridian.com" />
      <FormInput label="Phone Number" id="phone" type="tel" value={guestDetails.phone} onChange={onChange} required placeholder="+91 ..." />
    </div>
    <div>
      <label className="block text-xs font-bold text-haveli-muted uppercase tracking-widest mb-3">Special Preferences</label>
      <textarea id="requests" value={guestDetails.requests} onChange={onChange} className="w-full p-6 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary font-light" rows="4" placeholder="Mention dietary needs, late arrival, or accessibility requests..."></textarea>
    </div>
  </div>
);

const FormInput = ({ label, id, type = 'text', value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label className="block text-xs font-bold text-haveli-muted uppercase tracking-widest mb-3">{label}{required && ' *'}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full h-12 px-6 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary font-light"
      required={required}
      placeholder={placeholder}
    />
  </div>
);

const BookingReview = ({ dates, nights, roomTotals, finalTotals, guest, paymentMode }) => {
  const isPartial = paymentMode === 'OnlinePartial';
  const isPayAtHotel = paymentMode === 'PayAtHotel';
  const displayMultiplier = isPartial ? 0.5 : 1;

  const displayRoomTotal = finalTotals.roomTotal * displayMultiplier;
  const displayDiscount = finalTotals.discountAmount * displayMultiplier;
  const displayTax = finalTotals.tax * displayMultiplier;
  const displayGrandTotal = finalTotals.grandTotal * displayMultiplier;

  return (
    <div className="bg-haveli-card border border-haveli-border rounded-xl p-10 flex flex-col h-full shadow-sm transition-all duration-500">
      <h3 className="text-2xl font-bold mb-10 font-display text-haveli-heading border-b border-haveli-border pb-4">
        Stay Overview
      </h3>
      <div className="space-y-8 flex-grow">
        <div className="flex justify-between items-center"><span className="text-haveli-muted uppercase tracking-widest text-[10px] font-bold">Primary Resident</span><span className="font-bold text-haveli-heading">{guest.firstName} {guest.lastName}</span></div>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-1">Check-in</h4>
            <p className="font-bold text-haveli-heading">{dates.checkIn}</p>
          </div>
          <div className="text-haveli-accent opacity-50"><i className="fas fa-arrow-right text-lg"></i></div>
          <div className="text-right">
            <h4 className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-1">Check-out</h4>
            <p className="font-bold text-haveli-heading">{dates.checkOut}</p>
          </div>
        </div>

        <div className="bg-haveli-section border border-haveli-border p-5 rounded-xl flex justify-between items-center">
          <span className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Confirmed Duration</span>
          <span className="font-display font-bold text-haveli-primary text-xl">{nights} Nights</span>
        </div>

        <div className="space-y-4 pt-6 border-t border-haveli-border">
          {Object.entries(roomTotals.details).map(([key, data]) => (
            <div key={key} className="flex justify-between text-sm items-center">
              <span className="text-haveli-body font-light">
                {data.name} (x{data.quantity})
                {isPartial && <span className="text-[9px] text-haveli-accent font-bold uppercase tracking-widest ml-2 bg-haveli-accent/10 px-2 py-0.5 rounded">50% Advance</span>}
              </span>
              <span className="font-bold text-haveli-heading">₹{(data.subtotal * displayMultiplier).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-haveli-border pt-6 mt-auto space-y-3">
          <div className="flex justify-between text-xs font-medium text-haveli-body px-1">
            <span>{isPartial ? 'Advance Base Total (50%)' : 'Base Room Total'}</span>
            <span>₹{displayRoomTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          
          {displayDiscount > 0 && (
            <div className="flex justify-between text-xs text-haveli-primary font-bold bg-haveli-section p-3 rounded-lg border border-haveli-border shadow-sm">
              <span><i className="fas fa-award mr-2"></i>Heritage Reward (5%)</span>
              <span>- ₹{displayDiscount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-haveli-muted font-bold px-1 pt-2 border-t border-haveli-border/50">
            <span>{isPartial ? 'Advance Heritage Tax (18% GST)' : 'Heritage Tax (18% GST)'}</span>
            <span>+ ₹{displayTax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <div className="flex justify-between items-end font-bold text-2xl text-haveli-heading pt-4 border-t border-dashed border-haveli-border mt-2">
            <div className="flex flex-col">
              <span className="font-display">
                {isPayAtHotel ? 'Due at Arrival' : 'Total Payable Now'}
              </span>
              <span className="text-[9px] font-medium text-haveli-muted uppercase tracking-widest mt-1">
                {isPayAtHotel ? 'No initial deposit required' : 'Inclusive of all taxes'}
              </span>
            </div>
            <span className="text-haveli-accent">₹{displayGrandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ finalTotals, onConfirm, paymentMode, setPaymentMode }) => {
  const [method, setMethod] = useState('Credit Card');

  const amountToPay = paymentMode === 'OnlineFull'
    ? finalTotals.grandTotal
    : paymentMode === 'OnlinePartial'
      ? finalTotals.grandTotal / 2
      : 0;

  return (
    <div className="bg-haveli-card border border-haveli-border rounded-xl p-10 flex flex-col h-full shadow-sm">
      <h3 className="text-2xl font-bold mb-10 font-display text-haveli-heading border-b border-haveli-border pb-4">
        <i className="fas fa-shield-alt mr-3 text-haveli-accent"></i>Secure Settlement
      </h3>

      <div className="space-y-4 mb-8">
        <div
          onClick={() => setPaymentMode('OnlineFull')}
          className={`border h-24 rounded-xl p-6 cursor-pointer transition flex flex-col justify-center ${paymentMode === 'OnlineFull' ? 'border-haveli-primary bg-haveli-section shadow-sm' : 'border-haveli-border bg-white hover:border-haveli-accent'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'OnlineFull'} readOnly className="accent-haveli-primary" />
              <span className="font-bold text-haveli-heading">Full Settle</span>
            </div>
            <span className="font-bold text-haveli-primary text-lg">₹{finalTotals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <p className="text-[10px] text-haveli-muted mt-2 ml-7 uppercase tracking-widest font-medium">Suite inventory is locked immediately.</p>
        </div>

        <div
          onClick={() => setPaymentMode('OnlinePartial')}
          className={`border h-24 rounded-xl p-6 cursor-pointer transition flex flex-col justify-center ${paymentMode === 'OnlinePartial' ? 'border-haveli-primary bg-haveli-section shadow-sm' : 'border-haveli-border bg-white hover:border-haveli-accent'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'OnlinePartial'} readOnly className="accent-haveli-primary" />
              <span className="font-bold text-haveli-heading">50% Advance Deposit</span>
            </div>
            <span className="font-bold text-haveli-primary text-lg">₹{(finalTotals.grandTotal / 2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <p className="text-[10px] text-haveli-muted mt-2 ml-7 uppercase tracking-widest font-medium">Lock suite now. Settle balance at arrival.</p>
        </div>

        <div
          onClick={() => setPaymentMode('PayAtHotel')}
          className={`border rounded-xl p-6 cursor-pointer transition flex flex-col justify-center ${paymentMode === 'PayAtHotel' ? 'border-haveli-accent bg-haveli-section shadow-sm' : 'border-haveli-border bg-white hover:border-haveli-accent'}`}
        >
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'PayAtHotel'} readOnly className="accent-haveli-accent" />
              <span className="font-bold text-haveli-heading">Settle at Arrival</span>
            </div>
            <span className="font-medium text-haveli-muted text-xs italic">No initial deposit</span>
          </div>
          {paymentMode === 'PayAtHotel' && (
            <div className="mt-4 ml-7 bg-[#fef2f2] text-[#991b1b] p-4 rounded-lg text-[10px] font-bold border border-[#fee2e2] leading-relaxed uppercase tracking-widest">
              <i className="fas fa-exclamation-circle mr-2 text-xs"></i>
              Suites are allocated based on availability upon arrival. We recommend an advance for guaranteed booking.
            </div>
          )}
        </div>
      </div>

      {paymentMode !== 'PayAtHotel' && (
        <div className="mb-8 animate-fadeIn">
          <label className="block text-[10px] font-bold text-haveli-muted uppercase tracking-[0.25em] mb-4">Method of Settlement</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { m: 'Card', i: 'fa-credit-card' },
              { m: 'GPay', i: 'fa-google' },
              { m: 'UPI', i: 'fa-mobile' },
              { m: 'Wallet', i: 'fa-wallet' }
            ].map(item => (
              <div
                key={item.m}
                onClick={() => setMethod(item.m)}
                className={`border rounded-xl py-4 text-center cursor-pointer transition ${method === item.m ? 'border-haveli-accent bg-haveli-section text-haveli-accent shadow-inner' : 'border-haveli-border text-haveli-muted hover:border-haveli-accent'}`}
              >
                <i className={`fas ${item.i} text-xl mb-1`}></i>
                <p className="text-[9px] font-bold uppercase tracking-tighter">{item.m}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {paymentMode !== 'PayAtHotel' && (
        <div className="mt-auto mb-6 bg-[#fef2f2] border border-red-200 p-5 rounded-xl flex items-start shadow-inner animate-fadeIn">
          <i className="fas fa-exclamation-triangle mt-0.5 mr-3 text-red-600 text-lg"></i>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 text-red-800">Strict Non-Refundable Policy</h4>
            <p className="text-xs font-medium text-red-700/90 leading-relaxed">
              By proceeding with an online settlement, you acknowledge that all payments are final and <strong className="text-red-800">non-refundable under any circumstances</strong>, including cancellations or no-shows.
            </p>
          </div>
        </div>
      )}

      <div className={paymentMode === 'PayAtHotel' ? 'mt-auto' : ''}>
        <button
          onClick={() => onConfirm(paymentMode, amountToPay)}
          className={`w-full h-14 rounded-xl font-bold text-lg transition shadow-sm hover:shadow-md tracking-wider ${paymentMode === 'PayAtHotel' ? 'border border-haveli-accent text-haveli-accent hover:bg-haveli-bg uppercase text-sm' : 'bg-haveli-primary text-white hover:bg-haveli-primaryHover'}`}
        >
          {paymentMode === 'PayAtHotel' ? (
            <>Finalize Reservation</>
          ) : (
            <><i className="fas fa-lock mr-2 text-sm opacity-80"></i>Settle ₹{amountToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default Booking;