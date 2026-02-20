import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx'; 
import { useAuth } from '../context/AuthContext.jsx'; // Import Auth

const SERVICE_CHARGE_RATE = 0.05;

const Order = () => {
  const { foodMenu, addOrder } = useData(); // Get addOrder from backend context
  const { user } = useAuth(); // Hook into auth
  
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [cart, setCart] = useState({});
  const [guestInfo, setGuestInfo] = useState({ roomNumber: '', guestName: '', specialInstructions: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- HARD BLOCK 1: MUST BE LOGGED IN ---
  if (!user) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border-t-4 border-amber-500">
          <i className="fas fa-lock text-5xl text-amber-600 mb-4"></i>
          <h2 className="text-3xl font-bold font-display text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-8">Please log in to access Room Service.</p>
          <Link to="/login" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-block w-full">
            Log In Now
          </Link>
        </div>
      </main>
    );
  }

  // --- HARD BLOCK 2: MUST HAVE A BOOKING ---
  if (user.role !== 'admin' && !user.activeBooking) {
    return (
      <main className="pt-32 pb-16 text-center min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full border-t-4 border-red-500">
          <i className="fas fa-bed text-5xl text-gray-400 mb-4"></i>
          <h2 className="text-3xl font-bold font-display text-gray-800 mb-2">Active Booking Required</h2>
          <p className="text-gray-600 mb-8">You must have an active room booking to order food to your room. This is a guest-only amenity.</p>
          <Link to="/booking" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition inline-block w-full">
            Book a Room Now
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
      alert('Please enter your Room Number and Guest Name.');
      return;
    }
    if (Object.keys(cart).length === 0) {
      alert('Please add at least one item to your order.');
      return;
    }

    // --- INTEGRATION: Send to Backend ---
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

    addOrder(orderData); // Call context function to hit API
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCart({});
    setGuestInfo({ roomNumber: '', guestName: '', specialInstructions: '' });
  };

  if (!foodMenu) {
    return <div>Loading menu...</div>;
  }

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display text-amber-800">Room Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Order delicious food to be delivered directly to your room</p>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-amber-800 text-sm"><i className="fas fa-info-circle mr-2"></i>Food ordering is available for hotel guests only. Please have your room number ready.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 font-display text-amber-800">Room Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Room Number *" id="roomNumber" value={guestInfo.roomNumber} onChange={setGuestInfo} />
            <FormInput label="Guest Name *" id="guestName" value={guestInfo.guestName} onChange={setGuestInfo} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Special Instructions</label>
            <textarea
              id="specialInstructions"
              value={guestInfo.specialInstructions}
              onChange={(e) => setGuestInfo(prev => ({...prev, specialInstructions: e.target.value}))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
              rows="3"
              placeholder="Any special instructions for delivery..."
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

        <div className="max-w-4xl mx-auto flex justify-between">
          <Link to="/" className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition">
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </Link>
          <button onClick={handlePlaceOrder} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition">
            <i className="fas fa-utensils mr-2"></i>Place Order
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

const FormInput = ({ label, id, value, onChange }) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">{label}</label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={(e) => onChange(prev => ({ ...prev, [id]: e.target.value }))}
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600"
      required
    />
  </div>
);

const FoodCategory = ({ categoryKey, category, isActive, onToggle, cart, onQuantityChange }) => (
  <div className={`food-category mb-8 ${isActive ? 'active' : ''}`}>
    <div className="food-category-header" onClick={() => onToggle(categoryKey)}>
      <h2 className="text-2xl font-bold font-display text-amber-800 flex-grow">{category.name}</h2>
      <span className="text-gray-500">{category.time}</span>
      <i className={`fas ${isActive ? 'fa-chevron-up' : 'fa-chevron-down'} ml-4`}></i>
    </div>
    <div className="food-category-content">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  <div className="food-item bg-white rounded-lg shadow-md overflow-hidden">
    <div className="relative">
      {/* Use backend image URL logic */}
      <img src={item.image && item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt={item.name} className="w-full h-48 object-cover" />
      <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
        ₹{item.price}
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-lg font-bold text-amber-800 mb-2">{item.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{item.description || item.desc}</p>
      <div className="flex justify-between items-center">
        <div className="quantity-control">
          <button onClick={() => onQuantityChange(item, quantity - 1)} className="quantity-btn decrease-food"><i className="fas fa-minus"></i></button>
          <input type="number" value={quantity} readOnly className="quantity-input food-quantity" />
          <button onClick={() => onQuantityChange(item, quantity + 1)} className="quantity-btn increase-food"><i className="fas fa-plus"></i></button>
        </div>
        <span className="text-amber-700 font-semibold">₹{item.price}</span>
      </div>
    </div>
  </div>
);

const OrderSummary = ({ cart, totals }) => (
  <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
    <h2 className="text-2xl font-bold mb-6 font-display text-amber-800">Order Summary</h2>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Quantity</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(cart).length === 0 ? (
            <tr><td colSpan="4" className="py-4 text-center text-gray-500">No items selected</td></tr>
          ) : (
            Object.values(cart).map(item => (
              <tr key={item.id}>
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">₹{item.price.toLocaleString()}</td>
                <td className="py-2 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t font-bold">
            <td colSpan="3" className="py-2 text-right">Food Total:</td>
            <td className="py-2 text-right">₹{totals.foodTotal.toLocaleString()}</td>
          </tr>
          <tr className="border-t">
            <td colSpan="3" className="py-2 text-right">Room Service Charge ({(SERVICE_CHARGE_RATE * 100).toFixed(0)}%):</td>
            <td className="py-2 text-right">₹{totals.serviceCharge.toLocaleString()}</td>
          </tr>
          <tr className="border-t font-bold text-lg">
            <td colSpan="3" className="py-2 text-right">Grand Total:</td>
            <td className="py-2 text-right">₹{totals.grandTotal.toLocaleString()}</td>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h3>
          <p className="text-gray-600 mb-4">Your food order has been placed successfully.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <div className="flex justify-between mb-2"><span className="font-semibold">Room Number:</span><span>{orderData.roomNumber}</span></div>
            <div className="flex justify-between mb-2"><span className="font-semibold">Guest Name:</span><span>{orderData.guestName}</span></div>
            <div className="flex justify-between mb-2"><span className="font-semibold">Estimated Delivery:</span><span>{estimatedTime} minutes</span></div>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
              <span>Total Amount:</span><span className="text-amber-600">₹{orderData.grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            <i className="fas fa-info-circle mr-1"></i>
            Your order will be delivered to room {orderData.roomNumber}. Amount will be charged to your room bill.
          </p>
          <button onClick={onClose} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Order;