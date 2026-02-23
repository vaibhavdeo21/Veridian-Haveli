import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import usePageTitle from '../../hooks/usePageTitle.jsx';
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
  
  // --- NEW: State to toggle Room Change mode ---
  const [isChangingRoom, setIsChangingRoom] = useState(false);

  // Set Dynamic Page Title
  usePageTitle(customer ? `Guest: ${customer.guestName}` : "Guest Profile");

  useEffect(() => {
    const foundCustomer = customers.find(c => c._id === id || c.id === id || c.id === parseInt(id));
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setAmountPaid(foundCustomer.amountPaid || 0);
      
      // --- NEW: Smart Room Pre-selection ---
      const hasPhysicalRoom = foundCustomer.roomNumber && !foundCustomer.roomNumber.toLowerCase().includes('online');
      setSelectedRoom(hasPhysicalRoom ? foundCustomer.roomNumber : '');
      // Only show dropdown by default if no physical room is assigned yet
      setIsChangingRoom(!hasPhysicalRoom);
    }
  }, [id, customers]);

  if (!customer) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-haveli-muted">
        <i className="fas fa-spinner fa-spin text-3xl mb-4 text-haveli-accent"></i>
        <p className="font-display tracking-widest uppercase text-xs">Retrieving Resident Folio...</p>
    </div>
  );

  // --- FIXED BILLING LOGIC: PREVENTS DOUBLE GST ---
  const isPreTaxed = customer.roomNumber?.toLowerCase().includes('online');
  const roomTotalIncGST = customer.totalAmount || 0;
  const trueBaseRoomPrice = isPreTaxed ? (roomTotalIncGST / 1.18) : roomTotalIncGST;
  const roomGST = isPreTaxed ? (roomTotalIncGST - trueBaseRoomPrice) : (trueBaseRoomPrice * 0.18);
  const foodTotal = customer.foodCharges || 0;
  const foodGST = foodTotal * 0.18;
  const finalGST = roomGST + foodGST;
  const totalBill = roomTotalIncGST + foodTotal + foodGST; 
  const balanceLeft = totalBill - amountPaid;

  const normalizedStatus = (customer.status || "").replace(/\s/g, "").toLowerCase();
  const isCheckedIn = normalizedStatus === 'checkedin';
  const isCheckedOut = normalizedStatus === 'checkedout';
  const isExpired = normalizedStatus === 'expired' || normalizedStatus === 'noshow';

  // --- BULLETPROOF ROOM FILTERING LOGIC ---
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

  const filteredRooms = rooms?.filter(r => {
    const isAvailable = !r.availability || r.availability.toLowerCase() === 'available';
    if (!isAvailable) return false;
    if (expectedType && r.type) {
      return r.type.toLowerCase().includes(expectedType);
    }
    return true;
  }) || [];

  const handleCheckIn = () => {
    if (!selectedRoom) return showNotification("Please assign a physical room first.", "error");
    checkInCustomer(customer._id || customer.id, selectedRoom);
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
    <div className="max-w-6xl mx-auto pb-20 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <button onClick={() => navigate(-1)} className="btn btn-outline h-12 px-6 group">
          <i className="fas fa-arrow-left mr-2 transition-transform group-hover:-translate-x-1"></i> 
          Return to Registry
        </button>
        
        <div className="flex flex-wrap gap-4">
          {(!isCheckedIn && !isCheckedOut && !isExpired) && (
            <button onClick={handleCheckIn} className="btn btn-primary h-12 px-8 shadow-md">
              <i className="fas fa-key mr-2 text-xs"></i> Confirm Residency
            </button>
          )}
          {isCheckedIn && (
            <button onClick={handleCheckOut} className="btn bg-red-600 text-white hover:bg-red-700 h-12 px-8 shadow-md">
              <i className="fas fa-sign-out-alt mr-2 text-xs"></i> Finalize Departure
            </button>
          )}
          <span className={`h-12 px-6 rounded-xl flex items-center text-xs font-black uppercase tracking-widest border-2 shadow-inner ${
            isCheckedIn ? 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20' : 
            isCheckedOut ? 'bg-haveli-section text-haveli-muted border-haveli-border' : 
            isExpired ? 'bg-red-50 text-red-500 border-red-100' :
            'bg-[#fffbeb] text-haveli-accent border-haveli-accent/20'
          }`}>
            Status: {customer.status || 'Booked'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Profile Card */}
        <div className="lux-card lg:col-span-2 relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 w-1 h-full bg-haveli-accent"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-haveli-border pb-8 mb-8 gap-4">
            <div>
              <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-1">Resident Particulars</p>
              <h2 className="text-4xl font-bold font-display text-haveli-heading uppercase tracking-tight">{customer.guestName}</h2>
              <p className="text-haveli-muted text-[10px] font-mono mt-1 opacity-60">Folio REF: {customer._id || customer.id}</p>
            </div>
            {customer.isRepeatCustomer && (
                <div className="bg-haveli-deep text-haveli-accent border border-haveli-accent/30 px-4 py-1.5 rounded-full flex items-center shadow-sm">
                    <i className="fas fa-award mr-2 text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Heritage Member</span>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <InfoBox label="Contact Phone" value={customer.phone} icon="fa-phone" />
            <InfoBox label="Electronic Mail" value={customer.email} icon="fa-envelope" />
            <InfoBox label="Arrival Schedule" value={new Date(customer.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon="fa-calendar-check" />
            <InfoBox label="Departure Schedule" value={new Date(customer.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon="fa-calendar-times" />
          </div>

          <div className="bg-haveli-section p-6 rounded-xl border border-haveli-border mb-10 flex justify-between items-center shadow-inner">
             <div>
                <p className="text-[10px] font-bold text-haveli-muted uppercase tracking-widest mb-1">Current Allocation</p>
                <p className={`text-2xl font-bold font-display ${customer.roomNumber?.includes('Online') ? 'text-haveli-accent' : 'text-haveli-heading'}`}>
                  {customer.roomNumber || 'Awaiting Selection'}
                </p>
             </div>
             <i className="fas fa-door-open text-haveli-accent/20 text-4xl"></i>
          </div>

          {/* --- ENHANCED ROOM ASSIGNMENT BLOCK --- */}
          {(!isCheckedIn && !isCheckedOut && !isExpired) && (
            <div className="bg-[#fffbeb] p-8 rounded-xl border border-haveli-accent/20 transition-all">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-bold text-haveli-accent uppercase tracking-widest flex items-center">
                  <i className="fas fa-concierge-bell mr-2"></i>
                  {isChangingRoom ? `Allocate Heritage Suite (${expectedType ? expectedType.toUpperCase() : 'General'})` : 'Assigned Heritage Suite'}
                </label>
                
                {/* Toggle Buttons */}
                {!isChangingRoom && (
                  <button onClick={() => setIsChangingRoom(true)} className="text-[10px] font-black text-haveli-primary uppercase tracking-widest hover:underline flex items-center transition-all">
                    <i className="fas fa-exchange-alt mr-1"></i> Change Room
                  </button>
                )}
                {(isChangingRoom && customer.roomNumber && !customer.roomNumber.toLowerCase().includes('online')) && (
                   <button onClick={() => { setIsChangingRoom(false); setSelectedRoom(customer.roomNumber); }} className="text-[10px] font-black text-haveli-muted uppercase tracking-widest hover:underline flex items-center transition-all">
                    Cancel Change
                  </button>
                )}
              </div>

              {isChangingRoom ? (
                <div className="relative animate-fadeIn">
                  <select 
                    value={selectedRoom} 
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full h-12 px-6 bg-white border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-bold text-haveli-heading appearance-none shadow-sm"
                  >
                    <option value="" disabled>Browse Available Inventory...</option>
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map(r => (
                        <option key={r.roomNumber} value={r.roomNumber}>Suite {r.roomNumber} — {r.type}</option>
                      ))
                    ) : (
                      <option value="" disabled>No vacant {expectedType || ''} suites available</option>
                    )}
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs"></i>
                </div>
              ) : (
                 <div className="w-full h-12 px-6 bg-white border border-haveli-border rounded-xl flex items-center justify-between font-bold text-haveli-heading shadow-sm animate-fadeIn">
                    <span>Suite {selectedRoom}</span>
                    <i className="fas fa-check-circle text-haveli-primary"></i>
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Financials & ID Upload Card */}
        <div className="space-y-8">
          <div className="lux-card bg-white border-haveli-border relative overflow-hidden">
            <h3 className="text-sm font-bold border-b border-haveli-border pb-4 mb-6 text-haveli-heading uppercase tracking-widest font-display flex items-center">
                <i className="fas fa-file-invoice-dollar mr-2 text-haveli-accent"></i>
                Folio Billing
            </h3>
            <div className="space-y-4 mb-8">
              <BillRow label="Suite Total" value={roomTotalIncGST} />
              <BillRow label="Culinary Charges" value={foodTotal} />
              <BillRow label="Heritage Tax (18%)" value={finalGST} isGst />
              <div className="flex justify-between items-center pt-5 border-t border-haveli-border mt-4">
                <span className="text-[10px] font-black text-haveli-heading uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-bold font-display text-haveli-primary">₹{totalBill.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="bg-haveli-section p-6 rounded-xl border border-haveli-border shadow-sm">
              <label className="text-[10px] font-bold text-haveli-muted uppercase tracking-[0.2em] mb-3 block">Payment Recorded (₹)</label>
              <div className="flex mb-4 group">
                <input 
                  type="number" 
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full h-12 px-4 bg-white border border-haveli-border rounded-l-xl focus:outline-none focus:ring-1 focus:ring-haveli-primary font-bold text-haveli-heading"
                />
                <button onClick={handlePaymentUpdate} className="bg-haveli-primary text-white px-6 font-bold rounded-r-xl hover:bg-haveli-primaryHover transition-all flex items-center">
                    <i className="fas fa-save"></i>
                </button>
              </div>
              <div className="flex justify-between items-center bg-white px-4 py-3 rounded-lg border border-red-100">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Outstanding Folio</span>
                <span className="text-lg font-bold font-display text-red-700 tracking-tight">
                    ₹{balanceLeft > 0 ? balanceLeft.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}
                </span>
              </div>
            </div>
          </div>

          <div className="lux-card bg-white border-haveli-border">
            <h3 className="text-sm font-bold border-b border-haveli-border pb-4 mb-6 text-haveli-heading uppercase tracking-widest font-display flex items-center">
                <i className="fas fa-id-card mr-2 text-haveli-accent"></i>
                Guest Registry ID
            </h3>
            
            {customer.idDocumentPath && (
              <div className="mb-6 p-4 bg-[#ecfdf5] border border-haveli-primary/20 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-haveli-primary text-lg mr-3"></i>
                  <span className="text-[10px] font-bold text-haveli-primary uppercase tracking-widest">Document Secured</span>
                </div>
                <a 
                  href={documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary py-1.5 px-4 text-[10px]"
                >
                  View Folio ID
                </a>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="relative group">
                <input 
                  id="idUploadInput"
                  type="file" 
                  accept=".pdf, image/*"
                  onChange={(e) => setIdFile(e.target.files[0])}
                  className="w-full text-[10px] text-haveli-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-haveli-deep file:text-haveli-accent hover:file:bg-haveli-primary hover:file:text-white cursor-pointer transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className={`btn btn-block h-12 shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : 'btn-secondary'}`}
              >
                {isUploading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Security Scaning...</> : 'Archive Identity'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Components for Cleaner Render
const InfoBox = ({ label, value, icon }) => (
    <div className="bg-haveli-section p-4 rounded-xl border border-haveli-border hover:border-haveli-accent/30 transition-colors">
      <div className="flex items-center mb-2">
        <i className={`fas ${icon} text-haveli-accent text-[10px] mr-2 opacity-70`}></i>
        <p className="text-[10px] text-haveli-muted font-bold uppercase tracking-widest">{label}</p>
      </div>
      <p className="font-medium text-haveli-heading truncate">{value || 'Not Recorded'}</p>
    </div>
);

const BillRow = ({ label, value, isGst = false }) => (
    <div className={`flex justify-between items-center ${isGst ? 'text-haveli-accent italic' : 'text-haveli-body'}`}>
      <span className="text-xs font-light tracking-wide">{label}:</span>
      <span className={`text-sm font-bold ${isGst ? '' : 'text-haveli-heading'}`}>
        ₹{value?.toLocaleString(undefined, {minimumFractionDigits: isGst ? 2 : 0})}
      </span>
    </div>
);

export default CustomerProfile;