import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx'; 
import { useAuth } from '../context/AuthContext.jsx'; // Import Auth

const SERVICE_CHARGE_RATE = 0.05;

const Order = () => {
  const { foodMenu, addOrder, customers } = useData(); // Get addOrder and customers from context
  const { user } = useAuth(); // Hook into auth
  
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [cart, setCart] = useState({});
  const [guestInfo, setGuestInfo] = useState({ roomNumber: '', guestName: '', specialInstructions: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NEW FEATURE: AUTO-FILL & ROOM DROPDOWN LOGIC ---
  // Find all rooms currently "Checked In" for this specific user
  const activeRooms = useMemo(() => {
    if (!user || !customers) return [];
    return customers.filter(c => 
      (c.email === user.email || c.username === user.username) && 
      (c.status || '').replace(/\s/g, "").toLowerCase() === 'checkedin'
    );
  }, [user, customers]);

  // Effect to auto-fill details based on active check-ins
  useEffect(() => {
    if (activeRooms.length > 0) {
      // If only one room, auto-select it. If multiple, default to the first but let them change it.
      setGuestInfo(prev => ({
        ...prev,
        guestName: activeRooms[0].guestName || user.username,
        roomNumber: prev.roomNumber || activeRooms[0].roomNumber
      }));
    } else if (user) {
      setGuestInfo(prev => ({ ...prev, guestName: user.username }));
    }
  }, [activeRooms, user]);

  // --- HARD BLOCK 1: MUST BE LOGGED IN ---
  if (!user) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-haveli-bg">
        <div className="lux-card max-w-lg w-full border-t-4 border-haveli-accent">
          <i className="fas fa-lock text-5xl text-haveli-accent mb-6"></i>
          <h2 className="text-3xl font-bold font-display text-haveli-heading mb-3">Login Required</h2>
          <p className="text-haveli-muted mb-10 font-light">Please sign in to access Veridian Haveli's In-Room Dining.</p>
          <Link to="/login" className="btn btn-secondary btn-block h-12">
            Sign In Now
          </Link>
        </div>
      </main>
    );
  }

  // --- HARD BLOCK 2: MUST HAVE A BOOKING ---
  if (user.role !== 'admin' && !user.activeBooking) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-haveli-bg">
        <div className="lux-card max-w-lg w-full border-t-4 border-red-500">
          <i className="fas fa-bed text-5xl text-haveli-muted mb-6"></i>
          <h2 className="text-3xl font-bold font-display text-haveli-heading mb-3">Active Residency Required</h2>
          <p className="text-haveli-muted mb-10 font-light">In-room dining is a guest-exclusive amenity. You must have an active reservation to proceed.</p>
          <Link to="/booking" className="btn btn-secondary btn-block h-12">
            Reserve a Suite
          </Link>
        </div>
      </main>
    );
  }

  const handleCategoryToggle = (key) => {
    setActiveCategory(activeCategory === key ? null : key);
  };

  const handleQuantityChange = (item, quantity) => {
    if (quantity < 0) return;
    setCart(prev => {
      const newCart = { ...prev };
      if (quantity === 0) {
        delete newCart[item.id];
      } else {
        newCart[item.id] = { ...item, quantity };
      }
      return newCart;
    });
  };

  const totals = useMemo(() => {
    let foodTotal = 0;
    for (const item of Object.values(cart)) {
      foodTotal += item.price * item.quantity;
    }
    const serviceCharge = foodTotal * SERVICE_CHARGE_RATE;
    const grandTotal = foodTotal + serviceCharge;
    return { foodTotal, serviceCharge, grandTotal };
  }, [cart]);

  const handlePlaceOrder = () => {
    if (!guestInfo.roomNumber || !guestInfo.guestName) {
      alert('Please select your Suite Number.');
      return;
    }
    if (Object.keys(cart).length === 0) {
      alert('Please add at least one item to your order.');
      return;
    }

    const orderItems = Object.values(cart).map(item => `${item.name} x${item.quantity}`).join(', ');
    const totalQuantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

    const orderData = {
      roomNo: guestInfo.roomNumber,
      customerName: guestInfo.guestName,
      foodItems: orderItems,
      quantity: totalQuantity,
      totalAmount: totals.grandTotal,
      specialInstructions: guestInfo.specialInstructions
    };

    addOrder(orderData); 
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCart({});
    // Reset room selection if user has multiple rooms, otherwise keep the default
    setGuestInfo(prev => ({ ...prev, specialInstructions: '' }));
  };

  if (!foodMenu) {
    return <div className="min-h-screen bg-haveli-bg flex items-center justify-center font-display text-haveli-heading">Preparing Menu...</div>;
  }

  return (
    <main className="pt-32 pb-20 bg-haveli-bg min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-haveli-accent uppercase tracking-widest font-semibold text-sm mb-2">In-Room Dining</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-haveli-heading">Culinary Service</h1>
          <p className="text-haveli-muted max-w-2xl mx-auto font-light">Exquisite flavors delivered to your heritage suite</p>
          <div className="mt-8 bg-haveli-section border border-haveli-border rounded-full py-2 px-8 max-w-2xl mx-auto inline-block">
            <p className="text-haveli-primary text-xs font-medium uppercase tracking-tighter">
                <i className="fas fa-info-circle mr-2"></i>Verified Guest Service for Resident {user.username}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto lux-card mb-12 shadow-sm">
          <h2 className="text-2xl font-bold mb-8 font-display text-haveli-heading border-b border-haveli-border pb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ROOM SELECTION: Input or Dropdown */}
            <div>
              <label className="block text-xs font-bold text-haveli-muted uppercase tracking-widest mb-3">Suite Selection *</label>
              {activeRooms.length > 1 ? (
                <select 
                  value={guestInfo.roomNumber}
                  onChange={(e) => setGuestInfo({...guestInfo, roomNumber: e.target.value})}
                  className="w-full h-12 px-6 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body font-light appearance-none"
                >
                  <option value="">Select a Suite</option>
                  {activeRooms.map(room => (
                    <option key={room._id || room.id} value={room.roomNumber}>Suite {room.roomNumber}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={guestInfo.roomNumber || 'Detecting Room...'}
                  className="w-full h-12 px-6 bg-haveli-section border border-haveli-border rounded-xl text-haveli-body font-bold"
                />
              )}
            </div>

            <FormInput label="Guest Identity" id="guestName" value={guestInfo.guestName} onChange={setGuestInfo} readOnly />
          </div>
          
          <div className="mt-8">
            <label className="block text-xs font-bold text-haveli-muted uppercase tracking-widest mb-3">Chef Instructions</label>
            <textarea
              id="specialInstructions"
              value={guestInfo.specialInstructions}
              onChange={(e) => setGuestInfo(prev => ({...prev, specialInstructions: e.target.value}))}
              className="w-full p-6 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary font-light text-haveli-body transition-all"
              rows="3"
              placeholder="Preferences, allergies, or delivery notes..."
            ></textarea>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {Object.entries(foodMenu).map(([key, category]) => (
            <FoodCategory
              key={key}
              categoryKey={key}
              category={category}
              isActive={activeCategory === key}
              onToggle={handleCategoryToggle}
              cart={cart}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
        
        <OrderSummary cart={cart} totals={totals} />

        <div className="max-w-4xl mx-auto flex justify-between items-center mt-12">
          <Link to="/" className="btn btn-outline">
            <i className="fas fa-chevron-left mr-2 text-xs"></i>Back to Home
          </Link>
          <button onClick={handlePlaceOrder} className="btn btn-secondary px-12 h-14 shadow-md">
            <i className="fas fa-concierge-bell mr-3"></i>Place Order
          </button>
        </div>
      </div>
      
      <OrderConfirmationModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        orderData={{...guestInfo, ...totals}} 
      />
    </main>
  );
};

// --- Sub-Components ---

const FormInput = ({ label, id, value, onChange, readOnly = false }) => (
  <div>
    <label className="block text-xs font-bold text-haveli-muted uppercase tracking-widest mb-3">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      readOnly={readOnly}
      className={`w-full h-12 px-6 bg-haveli-section border border-haveli-border rounded-xl focus:outline-none focus:border-haveli-primary text-haveli-body ${readOnly ? 'opacity-70 font-bold' : 'font-light'}`}
      required
    />
  </div>
);

const FoodCategory = ({ categoryKey, category, isActive, onToggle, cart, onQuantityChange }) => (
  <div className={`food-category mb-10 transition-all duration-500 ${isActive ? 'active' : ''}`}>
    <div 
      className={`lux-card p-8 cursor-pointer flex items-center transition-all ${isActive ? 'border-haveli-accent shadow-md' : 'hover:border-haveli-muted'}`} 
      onClick={() => onToggle(categoryKey)}
    >
      <h2 className="text-2xl font-bold font-display text-haveli-heading flex-grow uppercase tracking-wider">{category.name}</h2>
      <span className="text-haveli-muted text-[10px] font-bold uppercase tracking-widest bg-haveli-section py-1 px-4 border border-haveli-border rounded-full">{category.time}</span>
      <i className={`fas ${isActive ? 'fa-chevron-up' : 'fa-chevron-down'} ml-6 text-haveli-accent`}></i>
    </div>
    <div className={`transition-all duration-500 overflow-hidden ${isActive ? 'max-h-[5000px] mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {category.items.map(item => (
          <FoodItem
            key={item.id}
            item={item}
            quantity={cart[item.id]?.quantity || 0}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </div>
  </div>
);

const FoodItem = ({ item, quantity, onQuantityChange }) => (
  <div className="bg-haveli-card rounded-xl border border-haveli-border overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-500 group">
    <div className="relative">
      <img src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-haveli-accent text-haveli-accent text-xs font-bold px-4 py-1.5 rounded-full">
        ₹{item.price}
      </div>
    </div>
    <div className="p-8 flex flex-col flex-grow">
      <h3 className="text-xl font-bold font-display text-haveli-heading mb-3">{item.name}</h3>
      <p className="text-haveli-body font-light text-sm mb-8 flex-grow leading-relaxed">{item.description || item.desc}</p>
      <div className="flex justify-between items-center pt-6 border-t border-haveli-border">
        <div className="flex items-center space-x-3 bg-haveli-section border border-haveli-border rounded-xl p-1">
          <button onClick={() => onQuantityChange(item, quantity - 1)} className="w-8 h-8 flex items-center justify-center text-haveli-primary hover:bg-haveli-bg rounded transition"><i className="fas fa-minus text-xs"></i></button>
          <input type="number" value={quantity} readOnly className="w-8 text-center bg-transparent text-haveli-heading font-bold focus:outline-none" />
          <button onClick={() => onQuantityChange(item, quantity + 1)} className="w-8 h-8 flex items-center justify-center text-haveli-primary hover:bg-haveli-bg rounded transition"><i className="fas fa-plus text-xs"></i></button>
        </div>
        <span className="text-haveli-accent font-bold text-lg">₹{item.price}</span>
      </div>
    </div>
  </div>
);

const OrderSummary = ({ cart, totals }) => (
  <div className="max-w-4xl mx-auto lux-card p-10 mb-12 shadow-sm">
    <h2 className="text-2xl font-bold mb-8 font-display text-haveli-heading border-b border-haveli-border pb-4">Folio Billing</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-haveli-muted uppercase tracking-widest text-[10px] font-bold border-b border-haveli-border">
            <th className="text-left py-4">Selection</th>
            <th className="text-center py-4">Qty</th>
            <th className="text-right py-4">Rate</th>
            <th className="text-right py-4">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-haveli-border">
          {Object.keys(cart).length === 0 ? (
            <tr><td colSpan="4" className="py-10 text-center text-haveli-muted font-light italic tracking-wide">No items selected for delivery.</td></tr>
          ) : (
            Object.values(cart).map(item => (
              <tr key={item.id}>
                <td className="py-4 font-medium text-haveli-heading">{item.name}</td>
                <td className="py-4 text-center font-light">{item.quantity}</td>
                <td className="py-4 text-right font-light">₹{item.price.toLocaleString()}</td>
                <td className="py-4 text-right font-bold text-haveli-primary">₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot className="border-t-2 border-haveli-border">
          <tr className="text-haveli-muted">
            <td colSpan="3" className="py-6 text-right font-medium">Tray Subtotal:</td>
            <td className="py-6 text-right font-bold text-haveli-heading">₹{totals.foodTotal.toLocaleString()}</td>
          </tr>
          <tr className="text-haveli-muted">
            <td colSpan="3" className="pb-6 text-right font-medium">Service Charge ({(SERVICE_CHARGE_RATE * 100).toFixed(0)}%):</td>
            <td className="pb-6 text-right font-bold text-haveli-heading">₹{totals.serviceCharge.toLocaleString()}</td>
          </tr>
          <tr className="border-t border-dashed border-haveli-border">
            <td colSpan="3" className="py-6 text-right font-bold text-haveli-heading uppercase tracking-widest text-[10px]">Total Settle:</td>
            <td className="py-6 text-right font-bold text-2xl text-haveli-accent font-display">₹{totals.grandTotal.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

const OrderConfirmationModal = ({ isOpen, onClose, orderData }) => {
  if (!isOpen) return null;
  const estimatedTime = Math.floor(Math.random() * 30) + 20;

  return (
    <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-haveli-card border border-haveli-accent rounded-xl shadow-2xl max-w-md w-full p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-haveli-accent"></div>
        <div className="text-center">
          <div className="w-20 h-20 bg-haveli-section border border-haveli-accent/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <i className="fas fa-check text-haveli-primary text-3xl"></i>
          </div>
          <h3 className="text-3xl font-bold font-display text-haveli-heading mb-3">Order Confirmed</h3>
          <p className="text-haveli-muted mb-10 font-light font-display">Your heritage experience is being prepared.</p>
          
          <div className="bg-haveli-section border border-haveli-border rounded-xl p-8 mb-8 text-left space-y-4 shadow-sm">
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold text-haveli-muted tracking-widest">Suite</span><span className="font-bold text-haveli-heading">{orderData.roomNumber}</span></div>
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold text-haveli-muted tracking-widest">Resident</span><span className="font-bold text-haveli-heading">{orderData.guestName}</span></div>
            <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-bold text-haveli-muted tracking-widest">Arrival Est.</span><span className="font-bold text-haveli-accent">{estimatedTime} minutes</span></div>
            <div className="flex justify-between items-center pt-4 border-t border-haveli-border mt-4">
              <span className="text-[10px] uppercase font-bold text-haveli-muted tracking-widest">Total Settle</span>
              <span className="text-xl font-bold text-haveli-primary font-display">₹{orderData.grandTotal.toLocaleString()}</span>
            </div>
          </div>
          
          <p className="text-[10px] text-haveli-muted mb-10 leading-relaxed font-bold uppercase tracking-tighter">
            <i className="fas fa-info-circle mr-2 text-haveli-accent"></i>
            Applied to suite folio for settlement at departure.
          </p>
          <button onClick={onClose} className="btn btn-secondary btn-block h-14">
            Return to Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;