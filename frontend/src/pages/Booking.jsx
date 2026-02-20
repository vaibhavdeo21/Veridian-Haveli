import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext'; 

const roomConfig = {
  single: { name: 'Single Bed Room', price: 2500 },
  double: { name: 'Double Bed Room', price: 4000 },
  triple: { name: 'Triple Bed Room', price: 5500 },
  dormitory: { name: 'Dormitory Bed', price: 1200 },
};

const TAX_RATE = 0.18;

const getToday = () => new Date().toISOString().split('T')[0];
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const Booking = () => {
  const { addCustomer, rooms } = useData(); 
  const { showNotification } = useNotification();
  const { user, updateActiveBooking } = useAuth(); 

  const [currentStep, setCurrentStep] = useState(1);
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
          baseType: key // Pass base type to easily match later
        };
      }
    }
    return { roomTotal, details };
  }, [selectedRooms, nights]);

  const finalTotals = useMemo(() => {
    const { roomTotal } = roomTotals;
    const tax = roomTotal * TAX_RATE;
    const grandTotal = roomTotal + tax;
    return { roomTotal, tax, grandTotal };
  }, [roomTotals]);

  if (!user) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
          <i className="fas fa-lock text-5xl text-amber-600 mb-4"></i>
          <h2 className="text-3xl font-bold font-display text-amber-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-8">You must have an account and be logged in to book a room at Jhankar Hotel.</p>
          <div className="flex flex-col space-y-3">
            <Link to="/login" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition">
              Log In
            </Link>
            <Link to="/register" className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition">
              Create an Account
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
      showNotification(`Only ${maxAvailable} ${roomType} rooms are currently available.`, 'error');
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
      showNotification('Please select at least one available room and stay dates.', 'error');
      return;
    }
    goToStep(2);
  };

  const handleNextToReview = () => {
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      showNotification('Please fill in all required guest details.', 'error');
      return;
    }
    goToStep(3);
  };

  // --- NEW: Handle Booking Submit with Payment Modes ---
  const handleConfirmBooking = async (paymentMode, amountPaid) => {
    let success = true;
    const finalGuestDetails = {
      ...guestDetails,
      username: user.username,
      checkIn: dates.checkIn,
      checkOut: dates.checkOut
    };

    for (const [key, data] of Object.entries(roomTotals.details)) {
      if (data.quantity > 0) {
        
        // Loop for quantity if they booked multiple rooms of the same type
        for (let i = 0; i < data.quantity; i++) {
            const roomData = {
              baseType: data.baseType, // E.g., 'single'
              type: data.name,
              totalAmount: (data.subtotal / data.quantity) * (1 + TAX_RATE) // Cost per room incl tax
            };

            // Divide the total amount paid across the rooms for the ledger
            const perRoomPaid = amountPaid / (Object.values(roomTotals.details).reduce((sum, d) => sum + d.quantity, 0));

            try {
              await addCustomer(finalGuestDetails, roomData, paymentMode, perRoomPaid);
            } catch (error) {
              success = false;
            }
        }
      }
    }

    if (success) {
      updateActiveBooking('Online');
      showNotification(`Thank you! Your booking is confirmed. Mode: ${paymentMode.replace(/([A-Z])/g, ' $1').trim()}`, 'success');
      setSelectedRooms({ single: 0, double: 0, triple: 0, dormitory: 0 });
      setDates({ checkIn: getToday(), checkOut: getTomorrow() });
      setGuestDetails({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', requests: '' });
      goToStep(1);
    } else {
      showNotification('Some bookings failed. Please contact support.', 'error');
    }
  };

  return (
    <main className="pt-28 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-amber-800">Book Your Stay</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Select from real-time available rooms managed by our front desk</p>
          <p className="text-xs font-bold mt-2 text-amber-700">Check-in: 12:00 PM | Check-out: 11:00 AM</p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>

            {[
              { s: 1, l: "Select Rooms" },
              { s: 2, l: "Guest Details" },
              { s: 3, l: "Review & Pay" }
            ].map((item) => (
              <div key={item.s} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= item.s ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                  {currentStep > item.s ? <i className="fas fa-check"></i> : item.s}
                </div>
                <span className={`mt-2 text-xs md:text-sm font-bold tracking-wide uppercase ${currentStep >= item.s ? 'text-amber-800' : 'text-gray-400'}`}>
                  {item.l}
                </span>
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 font-display text-center text-amber-800">Choose Your Accommodation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 font-display text-amber-800">Select Your Stay Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Check-in Date</label>
                  <input type="date" id="checkIn" value={dates.checkIn} min={getToday()} onChange={handleDateChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Check-out Date</label>
                  <input type="date" id="checkOut" value={dates.checkOut} min={dates.checkIn} onChange={handleDateChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600" />
                </div>
              </div>
              <div className="mt-4 text-sm font-bold text-amber-700 bg-amber-50 py-2 px-4 rounded-lg inline-block">
                Total Nights: {nights}
              </div>
            </div>

            <RoomSummaryTable roomTotals={roomTotals} nights={nights} />

            <div className="flex justify-between mt-8">
              <Link to="/" className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition">
                <i className="fas fa-arrow-left mr-2"></i>Back to Home
              </Link>
              <button
                disabled={roomTotals.roomTotal === 0}
                onClick={handleNextToGuest}
                className={`px-8 py-3 rounded-lg font-bold transition flex items-center ${roomTotals.roomTotal > 0 ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Continue to Guest Details <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 font-display text-center text-amber-800">Guest Information</h2>
            <GuestForm guestDetails={guestDetails} onChange={handleGuestChange} />
            <div className="flex justify-between mt-8">
              <button onClick={() => goToStep(1)} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition">
                <i className="fas fa-arrow-left mr-2"></i>Back to Rooms
              </button>
              <button onClick={handleNextToReview} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-bold transition">
                Review & Payment <i className="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 font-display text-center text-amber-800">Review Your Booking</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BookingReview dates={dates} nights={nights} roomTotals={roomTotals} finalTotals={finalTotals} guest={guestDetails} />
              
              {/* NEW: Updated Payment Form passing data back up */}
              <PaymentForm finalTotals={finalTotals} onConfirm={handleConfirmBooking} />
            </div>
            <div className="flex justify-between mt-8">
              <button onClick={() => goToStep(2)} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition">
                <i className="fas fa-arrow-left mr-2"></i>Back to Guest Details
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
  <div className="room-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-hover duration-300 hover:shadow-2xl">
    <div className="relative">
      <img src={`https://images.unsplash.com/${config.price === 2500 ? 'photo-1631049307264-da0ec9d70304' : config.price === 4000 ? 'photo-1566665797739-1674de7a421a' : config.price === 5500 ? 'photo-1611892440504-42a792e24d32' : 'photo-1590490360182-c33d57733427'}?w=400&h=300&fit=crop`} alt={config.name} className="w-full h-48 object-cover" />
      <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">
        ₹{config.price.toLocaleString()} / night
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 h-12 leading-tight">{config.name}</h3>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-xs font-bold uppercase tracking-tighter ${availableCount > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {availableCount > 0 ? `Available Units: ${availableCount}` : 'Fully Booked'}
        </span>
        <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1 border">
          <button onClick={() => onRoomChange(roomType, quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-amber-600 hover:bg-amber-50 transition">-</button>
          <span className="font-bold text-gray-700 w-4 text-center">{quantity}</span>
          <button onClick={() => onRoomChange(roomType, quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-amber-600 hover:bg-amber-50 transition">+</button>
        </div>
      </div>
      <div className="text-right border-t pt-4">
        <span className="text-amber-800 font-black">Subtotal: ₹{subtotal.toLocaleString()}</span>
      </div>
    </div>
  </div>
);

const RoomSummaryTable = ({ roomTotals, nights }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
    <h3 className="text-xl font-bold mb-6 font-display text-amber-800 flex items-center">
      <i className="fas fa-list-ul mr-3"></i>Room Booking Summary
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b">
            <th className="pb-4">Room Type</th>
            <th className="pb-4 text-center">Quantity</th>
            <th className="pb-4 text-right">Price/Night</th>
            <th className="pb-4 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.keys(roomTotals.details).length > 0 ? (
            Object.entries(roomTotals.details).map(([key, data]) => (
              <tr key={key}>
                <td className="py-4 font-bold text-gray-700">{data.name}</td>
                <td className="py-4 text-center font-semibold">{data.quantity}</td>
                <td className="py-4 text-right text-gray-500">₹{data.price.toLocaleString()}</td>
                <td className="py-4 text-right font-black text-amber-600">₹{data.subtotal.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" className="py-8 text-center text-gray-400 italic">No rooms selected yet. Use the cards above to start.</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-50">
            <td colSpan="3" className="py-4 text-right font-bold text-gray-500">Room Total (per night):</td>
            <td className="py-4 text-right font-black text-amber-800 text-lg">₹{(roomTotals.roomTotal / (nights || 1)).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

const GuestForm = ({ guestDetails, onChange }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
    <h3 className="text-2xl font-bold mb-8 font-display text-amber-800 flex items-center">
      <i className="fas fa-user-edit mr-3"></i>Primary Guest Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
      <FormInput label="First Name" id="firstName" value={guestDetails.firstName} onChange={onChange} required placeholder="Rahul" />
      <FormInput label="Last Name" id="lastName" value={guestDetails.lastName} onChange={onChange} required placeholder="Sharma" />
      <FormInput label="Email Address" id="email" type="email" value={guestDetails.email} onChange={onChange} required placeholder="rahul@example.com" />
      <FormInput label="Phone Number" id="phone" type="tel" value={guestDetails.phone} onChange={onChange} required placeholder="+91 ..." />
    </div>
    <div className="mb-2">
      <label className="block text-sm font-bold text-gray-700 mb-3">Special Requests or Instructions</label>
      <textarea id="requests" value={guestDetails.requests} onChange={onChange} className="w-full px-4 py-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-50 bg-gray-50 transition-all" rows="4" placeholder="Mention any extra needs like extra towels, early check-in, etc."></textarea>
    </div>
  </div>
);

const FormInput = ({ label, id, type = 'text', value, onChange, required = false, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-3">{label}{required && ' *'}</label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-50 bg-gray-50 transition-all"
      required={required}
      placeholder={placeholder}
    />
  </div>
);

const BookingReview = ({ dates, nights, roomTotals, finalTotals, guest }) => (
  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
    <h3 className="text-2xl font-bold mb-8 font-display text-amber-800 border-b pb-4">
      Stay Summary
    </h3>
    <div className="space-y-6">
      <div className="flex justify-between"><span>Guest Name:</span><span className="font-bold">{guest.firstName} {guest.lastName}</span></div>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Check-in</h4>
          <p className="font-bold text-gray-800">{dates.checkIn}</p>
        </div>
        <div className="text-amber-600"><i className="fas fa-long-arrow-alt-right text-2xl"></i></div>
        <div className="text-right">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Check-out</h4>
          <p className="font-bold text-gray-800">{dates.checkOut}</p>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl flex justify-between items-center">
        <span className="text-sm font-bold text-amber-800">Stay Duration</span>
        <span className="font-black text-amber-900">{nights} Nights</span>
      </div>

      <div className="space-y-4 pt-4 border-t">
        {Object.entries(roomTotals.details).map(([key, data]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="font-bold text-gray-700">{data.name} x {data.quantity}</span>
            <span className="font-black text-gray-900">₹{data.subtotal.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 space-y-3">
        <div className="flex justify-between font-black text-2xl text-amber-700 pt-2 border-t border-dashed">
          <span>Total Bill</span>
          <span>₹{finalTotals.grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  </div>
);

// --- NEW: Dynamic Payment Options Component ---
const PaymentForm = ({ finalTotals, onConfirm }) => {
  const [paymentMode, setPaymentMode] = useState('OnlineFull');
  const [method, setMethod] = useState('Credit Card');

  // Calculate amount to process based on selection
  const amountToPay = paymentMode === 'OnlineFull' 
    ? finalTotals.grandTotal 
    : paymentMode === 'OnlinePartial' 
      ? finalTotals.grandTotal / 2 
      : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col h-full">
      <h3 className="text-2xl font-bold mb-6 font-display text-amber-800 border-b pb-4">
        <i className="fas fa-shield-alt mr-3"></i>Choose Payment Mode
      </h3>
      
      <div className="space-y-4 mb-6">
        {/* Full Payment */}
        <div 
          onClick={() => setPaymentMode('OnlineFull')}
          className={`border-2 rounded-xl p-4 cursor-pointer transition ${paymentMode === 'OnlineFull' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'OnlineFull'} readOnly className="text-green-600" />
              <span className="font-bold text-gray-800">Pay Full Amount</span>
            </div>
            <span className="font-black text-green-700">₹{finalTotals.grandTotal.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-7">Room is instantly locked and assigned.</p>
        </div>

        {/* 50% Advance */}
        <div 
          onClick={() => setPaymentMode('OnlinePartial')}
          className={`border-2 rounded-xl p-4 cursor-pointer transition ${paymentMode === 'OnlinePartial' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'OnlinePartial'} readOnly className="text-blue-600" />
              <span className="font-bold text-gray-800">Pay 50% Advance</span>
            </div>
            <span className="font-black text-blue-700">₹{(finalTotals.grandTotal / 2).toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-7">Room is instantly locked and assigned. Pay rest at check-in.</p>
        </div>

        {/* Pay at Hotel */}
        <div 
          onClick={() => setPaymentMode('PayAtHotel')}
          className={`border-2 rounded-xl p-4 cursor-pointer transition ${paymentMode === 'PayAtHotel' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <input type="radio" checked={paymentMode === 'PayAtHotel'} readOnly className="text-amber-600" />
              <span className="font-bold text-gray-800">Pay at Hotel</span>
            </div>
            <span className="font-black text-gray-500">₹0 Now</span>
          </div>
          {paymentMode === 'PayAtHotel' && (
            <div className="mt-3 ml-7 bg-red-100 text-red-800 p-3 rounded-lg text-xs font-bold leading-relaxed border border-red-200">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              You are choosing Pay at Hotel. Room availability is subject to availability at the time of arrival. To confirm and lock your room, please pay an advance now.
            </div>
          )}
        </div>
      </div>

      {paymentMode !== 'PayAtHotel' && (
        <div className="mb-6 animate-fadeIn">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Online Payment Method</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { m: 'Card', i: 'fa-credit-card' },
              { m: 'GPay', i: 'fab fa-google-pay' },
              { m: 'UPI', i: 'fa-mobile-alt' },
              { m: 'Wallet', i: 'fa-wallet' }
            ].map(item => (
              <div
                key={item.m}
                onClick={() => setMethod(item.m)}
                className={`border-2 rounded-lg py-2 text-center cursor-pointer transition-all ${method === item.m ? 'border-green-600 bg-green-50 ring-2 ring-green-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <i className={`fas ${item.i} text-lg mb-1 ${method === item.m ? 'text-green-600' : 'text-gray-400'}`}></i>
                <p className="text-[9px] font-black uppercase">{item.m}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button 
          onClick={() => onConfirm(paymentMode, amountToPay)} 
          className={`w-full text-white py-4 rounded-xl font-black text-lg transition shadow-xl hover:scale-[1.02] active:scale-[0.98] ${paymentMode === 'PayAtHotel' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {paymentMode === 'PayAtHotel' ? (
            <>RESERVE WITHOUT LOCKING</>
          ) : (
            <><i className="fas fa-lock mr-2"></i>CONFIRM & PAY ₹{amountToPay.toLocaleString()}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default Booking;