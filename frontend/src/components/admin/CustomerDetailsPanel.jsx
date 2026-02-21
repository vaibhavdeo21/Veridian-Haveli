import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerDetailsPanel = () => {
  const { customers, rooms, checkInCustomer, checkOutCustomer, deleteCustomer } = useData();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  // --- Modals state for Check-in / Check-out ---
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, customerId: null, requiredType: '' });
  const [checkOutModal, setCheckOutModal] = useState({ isOpen: false, customer: null, lateHours: 0 });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    let filtered = customers.filter(c =>
      (c.guestName && c.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roomNumber && c.roomNumber.toString().includes(searchQuery))
    );

    if (activeTab === 'current') {
      filtered = filtered.filter(c => {
        const status = (c.status || '').replace(/\s/g, "").toLowerCase();
        return status === 'booked' || status === 'checkedin';
      });
    }

    return filtered;
  }, [customers, searchQuery, activeTab]);

  const toggleExpenses = (customerId) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };

  const handleOpenCheckIn = (customer) => {
    setCheckInModal({ isOpen: true, customerId: customer._id || customer.id, requiredType: customer.roomType || 'Single' });
  };

  const submitCheckIn = (physicalRoomNo) => {
    if (!physicalRoomNo) return showNotification('Please select a room', 'error');
    checkInCustomer(checkInModal.customerId, physicalRoomNo);
    setCheckInModal({ isOpen: false, customerId: null, requiredType: '' });
  };

  const handleOpenCheckOut = (customer) => {
    setCheckOutModal({ isOpen: true, customer, lateHours: 0 });
  };

  const submitCheckOut = () => {
    const hours = parseInt(checkOutModal.lateHours) || 0;
    const roomPrice = checkOutModal.customer.totalAmount || 25000; 

    let lateFee = 0;
    if (hours > 0) {
      if (hours >= 4) lateFee = roomPrice;
      else lateFee = hours * 2000; // Adjusted for premium pricing
    }

    checkOutCustomer(checkOutModal.customer._id || checkOutModal.customer.id, lateFee);
    setCheckOutModal({ isOpen: false, customer: null, lateHours: 0 });
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm("WARNING: Permanent removal of heritage guest data. This cannot be undone.")) {
      deleteCustomer(id);
    }
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Veridian Haveli - Guest Report (${activeTab.toUpperCase()})`, 14, 16);

    const tableHead = [
      ["ID", "Name", "Room", "Check-in", "Check-out", "Room (Inc. GST)", "Extras GST", "Total Bill", "Status"]
    ];
    
    const tableBody = filteredCustomers.map(c => {
      const roomCharge = c.totalAmount || 0; 
      const extraCharges = (c.foodCharges || 0) + (c.lateNightFee || 0) + (c.lateFee || 0);
      const extraGST = (c.foodCharges || 0) * 0.18;
      const grandTotal = roomCharge + extraCharges + extraGST;

      return [
        (c._id || c.id).slice(-6),
        c.guestName + (c.isRepeatCustomer ? " (Heritage Member)" : ""),
        c.roomNumber,
        new Date(c.checkInDate).toLocaleDateString(),
        new Date(c.checkOutDate).toLocaleDateString(),
        "Rs. " + roomCharge.toLocaleString(),
        "Rs. " + extraGST.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        "Rs. " + grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        c.paymentStatus,
      ];
    });

    autoTable(doc, {
      startY: 25,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [30, 95, 78] } // Emerald
    });

    doc.save('veridian-haveli-report.pdf');
    showNotification('Heritage guest report generated!', 'success');
  };

  return (
    <div id="customer-details-panel" className="animate-fadeIn">
      <div className="mb-10">
        <p className="text-haveli-accent uppercase tracking-[0.3em] font-bold text-[10px] mb-2">Guest Relations</p>
        <h2 className="text-3xl font-bold text-haveli-heading font-display">Resident Ledger</h2>
      </div>

      <div className="mb-10 flex flex-col lg:row justify-between items-start lg:items-center gap-6">
        <div className="flex space-x-1 bg-haveli-section p-1.5 rounded-xl border border-haveli-border shadow-inner">
          <button 
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-haveli-primary shadow-sm border border-haveli-border' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            Active Residents
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-haveli-primary shadow-sm border border-haveli-border' : 'text-haveli-muted hover:text-haveli-heading'}`}
          >
            Archives
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:flex-grow-0">
            <input
              type="text"
              placeholder="Search by name, suite, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-80 h-12 pl-12 pr-4 bg-white border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-light"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-haveli-accent opacity-60"></i>
          </div>
          <button
            onClick={handleDownloadReport}
            className="btn btn-outline h-12 px-6 shadow-sm whitespace-nowrap"
          >
            <i className="fas fa-file-pdf mr-2 text-red-600"></i> Export Registry
          </button>
        </div>
      </div>

      <div className="lux-card p-0 overflow-hidden border-haveli-border shadow-sm bg-white">
        <div className="p-8 border-b border-haveli-border bg-haveli-section flex justify-between items-center">
          <h3 className="text-sm font-bold text-haveli-heading uppercase tracking-widest font-display">
            {activeTab === 'current' ? 'Current Residency' : 'Heritage Archive Registry'}
          </h3>
          <span className="text-[10px] font-bold text-haveli-muted uppercase tracking-tighter bg-white px-4 py-1.5 rounded-full border border-haveli-border shadow-sm">
            Total Records: <span className="text-haveli-primary ml-1">{filteredCustomers.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-haveli-bg/50 border-b border-haveli-border">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Resident</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Suite No</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Itinerary</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Suite Bill</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Incidentals</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Tax (GST)</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Final Folio</th>
                <th className="px-6 py-5 text-left text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Payment</th>
                <th className="px-6 py-5 text-center text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-center text-[10px] font-bold text-haveli-muted uppercase tracking-widest">Actions</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-haveli-border bg-white">
              {filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer._id || customer.id}
                  customer={customer}
                  isExpanded={expandedCustomerId === (customer._id || customer.id)}
                  onToggleExpand={() => toggleExpenses(customer._id || customer.id)}
                  onCheckIn={() => handleOpenCheckIn(customer)}
                  onCheckOut={() => handleOpenCheckOut(customer)}
                  onDelete={() => handleDeleteCustomer(customer._id || customer.id)}
                  activeTab={activeTab}
                />
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="p-20 text-center text-haveli-muted font-light italic tracking-widest">
              No heritage guest records found in this registry section.
            </div>
          )}
        </div>
      </div>

      {/* --- Check In Modal --- */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl border border-haveli-border shadow-2xl p-10 w-full max-w-sm relative animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-haveli-primary"></div>
            <h3 className="text-2xl font-bold font-display text-haveli-heading mb-4">Assign Suite</h3>
            <p className="text-xs text-haveli-muted mb-8 leading-relaxed">Guest has reserved a <strong>{checkInModal.requiredType}</strong> category. Please allocate a physical suite to finalize check-in.</p>
            <div className="relative mb-8">
              <select
                id="roomSelect"
                className="w-full h-12 px-6 bg-haveli-section border border-haveli-border rounded-xl focus:ring-1 focus:ring-haveli-primary outline-none transition-all font-bold appearance-none"
                defaultValue=""
              >
                <option value="" disabled>Available Physical Rooms</option>
                {rooms && rooms.filter(r => r.availability === 'Available' && r.type.toLowerCase() === (checkInModal.requiredType || 'Single').toLowerCase()).map(r => (
                  <option key={r.roomNumber} value={r.roomNumber}>Suite {r.roomNumber}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-haveli-accent text-xs"></i>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCheckInModal({ isOpen: false, customerId: null, requiredType: '' })} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={() => submitCheckIn(document.getElementById('roomSelect').value)} className="btn btn-primary flex-1 shadow-md">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Check Out Modal --- */}
      {checkOutModal.isOpen && (
        <div className="fixed inset-0 bg-haveli-deep/70 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl border border-haveli-border shadow-2xl p-10 w-full max-w-sm relative animate-fadeIn">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
            <h3 className="text-2xl font-bold font-display text-haveli-heading mb-4">Departing Guest</h3>
            <p className="text-xs text-haveli-muted mb-8 leading-relaxed tracking-wide">Closing folio for {checkOutModal.customer?.guestName} from Suite {checkOutModal.customer?.roomNumber}.</p>

            <div className="mb-8 bg-[#fef2f2] p-6 rounded-xl border border-red-100">
              <label className="block text-[10px] font-bold text-red-800 uppercase tracking-widest mb-3">Late Departure Duration (Hours)</label>
              <input
                type="number"
                min="0"
                value={checkOutModal.lateHours}
                onChange={(e) => setCheckOutModal({ ...checkOutModal, lateHours: e.target.value })}
                className="w-full h-10 px-4 border border-red-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
              />
              <p className="text-[9px] text-red-600 mt-3 font-bold uppercase tracking-tighter italic">Penalty: ₹2000/hr (capped at daily rate after 4h).</p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCheckOutModal({ isOpen: false, customer: null, lateHours: 0 })} className="btn btn-outline flex-1">Back</button>
              <button onClick={submitCheckOut} className="btn bg-red-600 text-white flex-1 shadow-md hover:bg-red-700">Settle Folio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerRow = ({ customer, isExpanded, onToggleExpand, onCheckIn, onCheckOut, onDelete, activeTab }) => {
  const { updateCustomerPaymentStatus } = useData();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const normalizedStatus = (customer.status || "").replace(/\s/g, "").toLowerCase();
  const isCheckedIn = normalizedStatus === 'checkedin';
  const isCheckedOut = normalizedStatus === 'checkedout';
  const isOnlinePlaceholder = customer.roomNumber?.toLowerCase().includes('online');

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    updateCustomerPaymentStatus(customer._id || customer.id, newStatus);
    showNotification(`Folio for ${customer.guestName} set to ${newStatus}`, 'success');
  };

  const getPaymentClasses = (status) => {
    return status === 'Complete' || status === 'Paid'
      ? 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20'
      : 'bg-[#fffbeb] text-haveli-accent border-haveli-accent/20';
  };

  const roomCharge = customer.totalAmount || 0; 
  const extraCharges = (customer.foodCharges || 0) + (customer.lateNightFee || 0) + (customer.lateFee || 0);
  const extraGST = (customer.foodCharges || 0) * 0.18;
  const grandTotal = roomCharge + extraCharges + extraGST;

  return (
    <>
      <tr className={`transition-colors hover:bg-haveli-section/50 group ${isExpanded ? 'bg-haveli-section' : ''}`}>
        <td className="px-8 py-5 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-haveli-bg rounded-full flex items-center justify-center border border-haveli-border text-haveli-accent font-display font-bold shadow-inner">
               {customer.guestName?.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="text-sm font-bold text-haveli-heading flex items-center">
                {customer.guestName}
                {customer.isRepeatCustomer && (
                  <span className="ml-2 bg-haveli-primary text-white text-[8px] px-2 py-0.5 rounded uppercase font-black">Heritage</span>
                )}
              </div>
              <div className="text-[9px] text-haveli-muted font-medium uppercase tracking-tighter">Folio: {(customer._id || customer.id).slice(-10)}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
          <div className={`text-xs font-bold px-3 py-1 rounded-full border inline-block ${isOnlinePlaceholder ? 'border-haveli-accent text-haveli-accent bg-haveli-accent/5 italic' : 'border-haveli-border text-haveli-heading bg-white'}`}>
            Suite {customer.roomNumber || 'Unassigned'}
          </div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
          <div className="text-xs font-medium text-haveli-heading">{new Date(customer.checkInDate).toLocaleDateString()}</div>
          <div className="text-[10px] text-haveli-muted uppercase tracking-tighter">{customer.stayDuration || 1} Night Residency</div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap font-medium text-haveli-heading text-xs">₹{roomCharge.toLocaleString()}</td>
        <td className="px-6 py-5 whitespace-nowrap text-haveli-muted text-xs">₹{extraCharges.toLocaleString()}</td>
        <td className="px-6 py-5 whitespace-nowrap text-haveli-muted text-[10px] font-bold">₹{extraGST.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        <td className="px-6 py-5 whitespace-nowrap">
          <div className="text-sm font-bold font-display text-haveli-primary">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </td>
        <td className="px-6 py-5 whitespace-nowrap">
          <select
            value={customer.paymentStatus}
            onChange={handleStatusChange}
            className={`text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none border border-transparent transition-all cursor-pointer ${getPaymentClasses(customer.paymentStatus)}`}
          >
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Verified</option>
            <option value="Complete">Settled</option>
          </select>
        </td>

        <td className="px-6 py-5 whitespace-nowrap text-center">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isCheckedIn ? 'bg-[#ecfdf5] text-haveli-primary border-haveli-primary/20' :
              isCheckedOut ? 'bg-haveli-section text-haveli-muted border-haveli-border' :
                'bg-[#fffbeb] text-haveli-accent border-haveli-accent/20'
            }`}>
            {customer.status || 'Pending'}
          </span>
        </td>

        <td className="px-6 py-5 whitespace-nowrap text-center space-x-2">
          <button 
            onClick={() => navigate(`/admin/customer/${customer._id || customer.id}`)}
            className="w-10 h-10 rounded-xl bg-haveli-bg border border-haveli-border text-haveli-heading hover:bg-haveli-section transition-all shadow-sm inline-flex items-center justify-center"
            title="View Details"
          >
            <i className="fas fa-eye text-xs"></i>
          </button>
          
          {activeTab === 'all' && (
            <button 
              onClick={onDelete}
              className="w-10 h-10 rounded-xl bg-[#fef2f2] border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm inline-flex items-center justify-center"
              title="Permanently Delete Heritage Record"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          )}
        </td>

        <td className="px-6 py-5 whitespace-nowrap text-right">
          <button onClick={onToggleExpand} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-haveli-accent text-white rotate-180' : 'text-haveli-accent hover:bg-haveli-bg'}`}>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="11" className="p-0 border-none">
            <CustomerExpenseDropdown customer={customer} />
          </td>
        </tr>
      )}
    </>
  );
};

const CustomerExpenseDropdown = ({ customer }) => {
  const { orders } = useData();

  const roomCharge = customer.totalAmount || 0;
  const foodOrders = Array.isArray(orders) ? orders
    .filter(o => String(o.roomNo) === String(customer.roomNumber))
    .map(o => ({
      id: o.id || o._id,
      date: o.date,
      desc: `In-Room Dining #${(o.id || o._id).slice(-4)} (${o.foodItems})`,
      amount: o.totalAmount,
      quantity: o.quantity || 1,
    })) : [];

  const foodTotal = foodOrders.reduce((sum, o) => sum + o.amount, 0);
  const lateFees = (customer.lateFee || 0) + (customer.lateNightFee || 0);
  const subtotal = roomCharge + foodTotal + lateFees;
  const extraGST = foodTotal * 0.18; 
  const grandTotal = subtotal + extraGST;

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    const { guestName, _id, id, roomNumber, checkInDate, checkOutDate, stayDuration, paymentStatus } = customer;

    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text("VERIDIAN HAVELI", 105, 20, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Heritage Hotel & Suites | Riico Industrial Area, Reengus, Rajasthan, India", 105, 26, { align: 'center' });
    doc.text("Concierge: +91 11 1234 5678 | verify@veridianhaveli.com", 105, 30, { align: 'center' });

    doc.setDrawColor(194, 161, 77); // Gold
    doc.line(14, 35, 196, 35);

    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text("GUEST FOLIO SUMMARY", 14, 45);

    doc.setFontSize(10);
    doc.text("Guest Name:", 14, 55); doc.text(guestName || 'Valued Resident', 50, 55);
    doc.text("Folio ID:", 14, 60); doc.text(String(_id || id), 50, 60);
    doc.text("Suite No:", 14, 65); doc.text(String(roomNumber), 50, 65);
    doc.text("Residency:", 14, 70); doc.text(`${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()} (${stayDuration || 1} nights)`, 50, 70);
    doc.text("Bill Status:", 14, 75); doc.text(paymentStatus.toUpperCase(), 50, 75);

    const tableHead = [["Date", "Particulars", "Amount (INR)"]];
    const tableBody = [[new Date(checkInDate).toLocaleDateString(), `Heritage Suite Residency (${stayDuration || 1} nights)`, "Rs. " + roomCharge.toLocaleString()]];

    if (customer.lateNightFee > 0) tableBody.push([new Date(checkInDate).toLocaleDateString(), 'Early Check-In / Late Night Access', "Rs. " + customer.lateNightFee.toLocaleString()]);
    if (customer.lateFee > 0) tableBody.push([new Date(checkOutDate).toLocaleDateString(), 'Late Departure Surcharge', "Rs. " + customer.lateFee.toLocaleString()]);

    foodOrders.forEach(order => {
      tableBody.push([order.date || 'N/A', order.desc, "Rs. " + order.amount.toLocaleString()]);
    });

    autoTable(doc, {
      startY: 85,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [15, 42, 35] }, // Emerald Dark
      foot: [
        ['', 'Base Subtotal', "Rs. " + subtotal.toLocaleString()],
        ['', 'Incidentals GST (18%)', "Rs. " + extraGST.toLocaleString(undefined, { minimumFractionDigits: 2 })],
        ['', { content: 'FINAL SETTLEMENT TOTAL', styles: { fontStyle: 'bold' } }, { content: "Rs. " + grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }],
      ],
      footStyles: { fillColor: [244, 239, 231], textColor: [15, 42, 35] }
    });

    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.text("Thank you for choosing the Veridian Haveli experience.", 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

    doc.save(`folio-${guestName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="bg-haveli-section/50 p-8 border-l-4 border-haveli-accent m-4 rounded-xl shadow-inner">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-haveli-heading font-display text-lg tracking-wide uppercase">Folio Breakdown</h4>
          <p className="text-[10px] text-haveli-muted font-bold tracking-widest">DETAILED ITEMIZATION</p>
        </div>
        <button
          onClick={handleDownloadReceipt}
          className="btn btn-primary h-10 px-6 text-xs shadow-md"
        >
          <i className="fas fa-file-invoice mr-2"></i> Print Guest Folio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="lux-card bg-white p-6 border-haveli-border/50">
            <h5 className="text-[10px] font-black text-haveli-muted uppercase tracking-widest mb-4">Core Accommodations</h5>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm">
                <span className="text-haveli-body font-light">Heritage Suite Charges ({customer.stayDuration || 1} nights)</span>
                <span className="font-bold text-haveli-heading">₹{roomCharge.toLocaleString()}</span>
              </li>
              {customer.lateFee > 0 && (
                <li className="flex justify-between text-xs text-red-600 font-medium">
                  <span>Late Departure Penalty</span>
                  <span>₹{customer.lateFee.toLocaleString()}</span>
                </li>
              )}
              {customer.lateNightFee > 0 && (
                <li className="flex justify-between text-xs text-red-600 font-medium">
                  <span>Early Access Surcharge</span>
                  <span>₹{customer.lateNightFee.toLocaleString()}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="lux-card bg-white p-6 border-haveli-border/50">
            <h5 className="text-[10px] font-black text-haveli-muted uppercase tracking-widest mb-4">Culinary Services</h5>
            <ul className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {foodOrders.length > 0 ? (
                foodOrders.map(order => (
                  <li key={order.id} className="flex justify-between text-xs">
                    <span className="text-haveli-muted font-light truncate mr-4">{order.desc}</span>
                    <span className="font-bold text-haveli-heading whitespace-nowrap">₹{order.amount.toLocaleString()}</span>
                  </li>
                ))
              ) : (
                <li className="text-haveli-muted text-xs font-light italic">No dining records found for this folio.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-haveli-border border-dashed flex flex-col items-end">
        <div className="w-full md:w-80 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-haveli-muted font-bold uppercase tracking-widest">Base Subtotal</span>
            <span className="text-haveli-heading font-medium">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-haveli-muted font-bold uppercase tracking-widest">Incidentals GST (18%)</span>
            <span className="text-haveli-heading font-medium">₹{extraGST.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-haveli-border mt-2">
            <span className="text-sm font-black text-haveli-heading uppercase tracking-[0.2em] font-display">Folio Total</span>
            <span className="text-2xl font-bold font-display text-haveli-primary">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPanel;