import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import axios from 'axios';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, rooms, checkInCustomer, checkOutCustomer } = useData();
  const { showNotification } = useNotification();

  const [customer, setCustomer] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [idFile, setIdFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const foundCustomer = customers.find(c => c._id === id || c.id === id || c.id === parseInt(id));
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setAmountPaid(foundCustomer.amountPaid || 0);
      setSelectedRoom(foundCustomer.roomNumber?.includes('Online') ? '' : foundCustomer.roomNumber);
    }
  }, [id, customers]);

  if (!customer) return <div className="p-8 text-center text-gray-500 font-bold mt-10">Loading customer details...</div>;

  // Calculations
  const subtotal = (customer.totalAmount || 0) + (customer.foodCharges || 0);
  const gst = subtotal * 0.18;
  const totalBill = subtotal + gst;
  const balanceLeft = totalBill - amountPaid;

  const normalizedStatus = (customer.status || "").replace(/\s/g, "").toLowerCase();
  const isCheckedIn = normalizedStatus === 'checkedin';
  const isCheckedOut = normalizedStatus === 'checkedout';

  // --- BULLETPROOF ROOM FILTERING LOGIC ---
  
  // 1. Extract the base keyword from the booking (e.g., 'single' from 'Online-SINGLE')
  const getExpectedRoomType = (roomString) => {
    if (!roomString) return null;
    const str = roomString.toLowerCase();
    if (str.includes('single')) return 'single';
    if (str.includes('double')) return 'double';
    if (str.includes('triple')) return 'triple';
    if (str.includes('dorm')) return 'dorm';
    return null;
  };

  const expectedType = getExpectedRoomType(customer.roomNumber);

  // 2. Filter the physical rooms based on availability and matching keyword
  const filteredRooms = rooms?.filter(r => {
    // FIX: Treat undefined/missing availability as 'Available' so DB rooms show up
    const isAvailable = !r.availability || r.availability.toLowerCase() === 'available';
    if (!isAvailable) return false;
    
    // FIX: Keyword matching handles both "Single" and "Single Bed Room"
    if (expectedType && r.type) {
      return r.type.toLowerCase().includes(expectedType);
    }
    
    return true; // Fallback: show all available if expectedType can't be parsed
  }) || [];

  const handleCheckIn = () => {
    if (!selectedRoom) return showNotification("Please assign a physical room first.", "error");
    checkInCustomer(customer._id || customer.id, selectedRoom);
    // Locally update status so buttons shift immediately
    setCustomer(prev => ({ ...prev, status: 'CheckedIn', roomNumber: selectedRoom }));
  };

  const handleCheckOut = () => {
    checkOutCustomer(customer._id || customer.id, 0); 
    setCustomer(prev => ({ ...prev, status: 'CheckedOut' }));
  };

  const handlePaymentUpdate = async () => {
    try {
      const res = await axios.patch(`/api/bookings/${customer._id || customer.id}`, {
        amountPaid: amountPaid
      });
      
      setCustomer(res.data);
      showNotification(`Payment saved. Balance left: ₹${(totalBill - amountPaid).toFixed(2)}`, 'success');
    } catch (err) {
      console.error(err);
      showNotification("Failed to update payment", "error");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!idFile) return showNotification("Please select a PDF or Image", "error");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('idFile', idFile);

    try {
      const res = await axios.post(`/api/bookings/${customer._id || customer.id}/upload-id`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setCustomer(res.data.booking); 
      setIdFile(null); 
      showNotification("ID Document uploaded successfully!", "success");
      
      document.getElementById('idUploadInput').value = '';
    } catch (err) {
      console.error(err);
      showNotification("Failed to upload document", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const documentUrl = customer.idDocumentPath ? `http://localhost:5000${customer.idDocumentPath}` : null;

  return (
    <div className="max-w-5xl mx-auto pb-10 mt-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-amber-600 font-bold transition-colors">
          <i className="fas fa-arrow-left mr-2"></i> Back to List
        </button>
        <div className="space-x-3">
          {(!isCheckedIn && !isCheckedOut) && (
            <button onClick={handleCheckIn} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">
              <i className="fas fa-sign-in-alt mr-2"></i> Confirm Check-In
            </button>
          )}
          {isCheckedIn && (
            <button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">
              <i className="fas fa-sign-out-alt mr-2"></i> Process Check-Out
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{customer.guestName}</h2>
              <p className="text-gray-500 text-sm font-mono mt-1">ID: {customer._id || customer.id}</p>
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-bold uppercase shadow-sm border ${
              isCheckedIn ? 'bg-green-100 text-green-800 border-green-200' : 
              isCheckedOut ? 'bg-gray-100 text-gray-600 border-gray-200' : 
              'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {customer.status || 'Booked'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone</p>
              <p className="font-medium text-gray-800">{customer.phone || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Email</p>
              <p className="font-medium text-gray-800 truncate">{customer.email || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-In Date</p>
              <p className="font-medium text-gray-800">{new Date(customer.checkInDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-Out Date</p>
              <p className="font-medium text-gray-800">{new Date(customer.checkOutDate).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100 col-span-2 flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Current Room</p>
                <p className={`font-bold ${customer.roomNumber?.includes('Online') ? 'text-amber-600' : 'text-gray-800'}`}>
                  {customer.roomNumber || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Room Assignment for Online Bookings */}
          {(!isCheckedIn && !isCheckedOut) && (
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 shadow-sm">
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Assign Physical Room ({expectedType ? expectedType.toUpperCase() : 'Any'}) Before Check-In
              </label>
              <div className="flex gap-3">
                <select 
                  value={selectedRoom} 
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="" disabled>Select Room...</option>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber} ({r.type})</option>
                    ))
                  ) : (
                    <option value="" disabled>No {expectedType || ''} rooms currently available</option>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Financials & ID Upload Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Financials</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Room Total:</span> <span className="font-bold">₹{(customer.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Food Total:</span> <span className="font-bold">₹{(customer.foodCharges || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">GST (18%):</span> <span className="font-bold">₹{gst.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between text-lg font-black border-t pt-3 mt-1"><span className="text-gray-800">Total Bill:</span> <span className="text-amber-700">₹{totalBill.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Payment Received (₹)</label>
              <div className="flex shadow-sm rounded-md">
                <input 
                  type="number" 
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                />
                <button onClick={handlePaymentUpdate} className="bg-green-600 text-white px-4 font-bold rounded-r-md hover:bg-green-700 transition-colors">Save</button>
              </div>
              <div className="flex justify-between mt-3 font-bold text-sm bg-white p-2 rounded border border-red-100">
                <span className="text-red-600">Balance Left:</span>
                <span className="text-red-600 text-base">₹{balanceLeft > 0 ? balanceLeft.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-gray-800">Guest ID / Aadhaar</h3>
            
            {customer.idDocumentPath && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  <span className="text-sm font-bold text-green-800">ID Uploaded</span>
                </div>
                <a 
                  href={documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold shadow-sm"
                >
                  View ID
                </a>
              </div>
            )}

            <form onSubmit={handleFileUpload}>
              <input 
                id="idUploadInput"
                type="file" 
                accept=".pdf, image/*"
                onChange={(e) => setIdFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 mb-4 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-sm flex justify-center items-center ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 text-white'}`}
              >
                {isUploading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Uploading...</> : 'Upload Document'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfile;