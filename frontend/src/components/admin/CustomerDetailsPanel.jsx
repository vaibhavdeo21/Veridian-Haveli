import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerDetailsPanel = () => {
  // Added rooms, checkInCustomer, and checkOutCustomer to destructured useData
  const { customers, rooms, checkInCustomer, checkOutCustomer } = useData();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  // --- NEW: Modals state for Check-in / Check-out ---
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, customerId: null, requiredType: '' });
  const [checkOutModal, setCheckOutModal] = useState({ isOpen: false, customer: null, lateHours: 0 });

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(c =>
      // SYNC FIX: Use guestName to match the Booking schema
      (c.guestName && c.guestName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roomNumber && c.roomNumber.toString().includes(searchQuery))
    );
  }, [customers, searchQuery]);

  const toggleExpenses = (customerId) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
    }
  };

  // --- NEW: Check In Logic ---
  const handleOpenCheckIn = (customer) => {
    setCheckInModal({ isOpen: true, customerId: customer._id || customer.id, requiredType: customer.roomType || 'Single' });
  };

  const submitCheckIn = (physicalRoomNo) => {
    if (!physicalRoomNo) return showNotification('Please select a room', 'error');
    checkInCustomer(checkInModal.customerId, physicalRoomNo);
    setCheckInModal({ isOpen: false, customerId: null, requiredType: '' });
  };

  // --- NEW: Check Out Logic ---
  const handleOpenCheckOut = (customer) => {
    setCheckOutModal({ isOpen: true, customer, lateHours: 0 });
  };

  const submitCheckOut = () => {
    const hours = parseInt(checkOutModal.lateHours) || 0;
    const roomPrice = checkOutModal.customer.totalAmount || 2500; // fallback

    // Fee Logic: < 4 hours = 200/hr. >= 4 hours = full day price.
    let lateFee = 0;
    if (hours > 0) {
      if (hours >= 4) lateFee = roomPrice;
      else lateFee = hours * 200;
    }

    checkOutCustomer(checkOutModal.customer._id || checkOutModal.customer.id, lateFee);
    setCheckOutModal({ isOpen: false, customer: null, lateHours: 0 });
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    doc.text("Customer Report", 14, 16);

    const tableHead = [
      ["ID", "Name", "Room", "Check-in", "Check-out", "Subtotal", "GST", "Total Bill", "Status"]
    ];
    const tableBody = filteredCustomers.map(c => [
      c._id || c.id,
      c.guestName,
      c.roomNumber,
      c.checkInDate,
      c.checkOutDate,
      "Rs. " + (c.totalAmount || 0).toLocaleString(),
      "Rs. " + ((c.totalAmount || 0) * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Rs. " + ((c.totalAmount || 0) * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      c.paymentStatus,
    ]);

    autoTable(doc, {
      startY: 22,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6] }
    });

    doc.save('customer-report.pdf');
    showNotification('Customer report downloaded!', 'success');
  };

  return (
    <div id="customer-details-panel">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Details</h2>

      <div className="mb-6 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, room, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 pl-10"
          />
          <i className="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
        </div>
        <button
          onClick={handleDownloadReport}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <i className="fas fa-file-pdf mr-2"></i> Download PDF Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">All Customer Details</h3>
          <span className="text-gray-600">
            Total Customers: <span className="font-bold">{filteredCustomers.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Charges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Food Charges</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST (18%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer._id || customer.id}
                  customer={customer}
                  isExpanded={expandedCustomerId === (customer._id || customer.id)}
                  onToggleExpand={() => toggleExpenses(customer._id || customer.id)}
                  onCheckIn={() => handleOpenCheckIn(customer)}
                  onCheckOut={() => handleOpenCheckOut(customer)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Check In Modal --- */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Assign Room (Check-in)</h3>
            <p className="text-sm text-gray-600 mb-4">Guest booked a <strong>{checkInModal.requiredType}</strong> room. Please select a physical room to assign.</p>
            <select
              id="roomSelect"
              className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
              defaultValue=""
            >
              <option value="" disabled>Select Available Room</option>
              {rooms && rooms.filter(r => r.availability === 'Available' && r.type.toLowerCase() === (checkInModal.requiredType || 'Single').toLowerCase()).map(r => (
                <option key={r.roomNumber} value={r.roomNumber}>Room {r.roomNumber}</option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setCheckInModal({ isOpen: false, customerId: null, requiredType: '' })} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => submitCheckIn(document.getElementById('roomSelect').value)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">Confirm Check-In</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Check Out Modal --- */}
      {checkOutModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Process Check-Out</h3>
            <p className="text-sm text-gray-600 mb-4">Checking out {checkOutModal.customer?.guestName} from Room {checkOutModal.customer?.roomNumber}.</p>

            <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
              <label className="block text-sm font-semibold text-red-800 mb-2">Hours Late Past Checkout Time?</label>
              <input
                type="number"
                min="0"
                value={checkOutModal.lateHours}
                onChange={(e) => setCheckOutModal({ ...checkOutModal, lateHours: e.target.value })}
                className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-red-600 mt-2">1-3 hours late = ₹200/hr. 4+ hours = Full Day Charge.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setCheckOutModal({ isOpen: false, customer: null, lateHours: 0 })} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={submitCheckOut} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Confirm Check-Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerRow = ({ customer, isExpanded, onToggleExpand, onCheckIn, onCheckOut }) => {
  const { updateCustomerPaymentStatus } = useData();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // NORMALIZATION: Remove spaces and lowercase for reliable matching
  const normalizedStatus = (customer.status || "").replace(/\s/g, "").toLowerCase();
  
  const isCheckedIn = normalizedStatus === 'checkedin';
  const isCheckedOut = normalizedStatus === 'checkedout';
  const isOnlinePlaceholder = customer.roomNumber?.toLowerCase().includes('online');

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    updateCustomerPaymentStatus(customer._id || customer.id, newStatus);
    showNotification(`Status for ${customer.guestName} updated to ${newStatus}`, 'success');
  };

  const getStatusColorClasses = (status) => {
    return status === 'Complete' || status === 'Paid'
      ? 'bg-green-100 text-green-800 ring-green-600/20'
      : 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
  };

  const subtotal = (customer.totalAmount || 0) + (customer.foodCharges || 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">{customer.guestName}</div>
          <div className="text-[10px] text-gray-400">{customer._id || customer.id}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`text-sm ${isOnlinePlaceholder ? 'text-amber-600 font-bold italic' : 'text-gray-900'}`}>
            Room {customer.roomNumber || 'Unassigned'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{new Date(customer.checkInDate).toLocaleDateString()}</div>
          <div className="text-[10px] text-gray-500">Duration: {customer.stayDuration || 1} day(s)</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">₹{(customer.totalAmount || 0).toLocaleString()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">₹{(customer.foodCharges || 0).toLocaleString()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 font-medium">₹{subtotal.toLocaleString()}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-amber-700">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={customer.paymentStatus}
            onChange={handleStatusChange}
            className={`text-sm font-medium rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 border-none ${getStatusColorClasses(customer.paymentStatus)}`}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Complete">Complete</option>
          </select>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${isCheckedIn ? 'bg-green-100 text-green-800' :
              isCheckedOut ? 'bg-gray-200 text-gray-600' :
                'bg-blue-100 text-blue-800'
            }`}>
            {customer.status || 'Booked'}
          </span>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
          {/* View Details Button navigating to dedicated Customer Profile page */}
          <button 
            onClick={() => navigate(`/admin/customer/${customer._id || customer.id}`)}
            className="bg-gray-800 hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            View Details
          </button>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button onClick={onToggleExpand} className="text-amber-600 hover:text-amber-800">
            <i className="fas fa-chevron-down"></i>
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="12" className="p-0">
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
    .filter(o => o.roomNo === customer.roomNumber)
    .map(o => ({
      id: o.id || o._id,
      date: o.date,
      desc: `Food Order #${o.id || o._id} (${o.foodItems})`,
      amount: o.totalAmount,
      quantity: o.quantity || 1,
    })) : [];

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    const { guestName, _id, id, roomNumber, checkInDate, checkOutDate, stayDuration, paymentStatus } = customer;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("Jhankar Hotel", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Riico industrial area, Reengus, Rajasthan, India", 105, 26, { align: 'center' });
    doc.text("Phone: +91 11 1234 5678 | Email: info@Jhankar@gmail.com", 105, 30, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Guest Folio / Receipt", 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Guest Name:", 14, 55);
    doc.text("Customer ID:", 14, 60);
    doc.text("Room No:", 14, 65);
    doc.text("Stay Dates:", 14, 70);
    doc.text("Payment Status:", 14, 75);

    doc.setFont('helvetica', 'normal');
    doc.text(guestName || 'Guest', 50, 55);
    doc.text(String(_id || id), 50, 60);
    doc.text(String(roomNumber), 50, 65);
    doc.text(`${new Date(checkInDate).toLocaleDateString()} to ${new Date(checkOutDate).toLocaleDateString()} (${stayDuration || 1} nights)`, 50, 70);

    doc.setFont('helvetica', 'bold');
    if (paymentStatus === 'Complete' || paymentStatus === 'Paid') {
      doc.setTextColor(0, 128, 0);
      doc.text(paymentStatus, 50, 75);
    } else {
      doc.setTextColor(217, 119, 6);
      doc.text(paymentStatus, 50, 75);
    }
    doc.setTextColor(0, 0, 0);

    const tableHead = [["Date", "Description", "Amount (INR)"]];
    const tableBody = [];

    tableBody.push([
      new Date(checkInDate).toLocaleDateString(),
      `Room Charges (${stayDuration || 1} night(s) @ Rs. ${(roomCharge / (stayDuration || 1)).toLocaleString()})`,
      "Rs. " + roomCharge.toLocaleString()
    ]);

    foodOrders.forEach(order => {
      tableBody.push([
        order.date || 'N/A',
        order.desc,
        "Rs. " + order.amount.toLocaleString()
      ]);
    });

    const subtotal = roomCharge + foodOrders.reduce((sum, o) => sum + o.amount, 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    autoTable(doc, {
      startY: 85,
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [75, 85, 99] },
      foot: [
        ['', 'Subtotal', "Rs. " + subtotal.toLocaleString()],
        ['', 'GST (18%)', "Rs. " + gst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })],
        ['', { content: 'Total Bill', styles: { fontStyle: 'bold' } }, { content: "Rs. " + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold' } }],
      ],
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0] },
      didDrawCell: (data) => {
        if (data.section === 'body' || data.section === 'foot') {
          if (data.column.index === 2) {
            data.cell.styles.halign = 'right';
          }
        }
      }
    });

    doc.setFontSize(10);
    doc.text("Thank you for staying with us!", 105, doc.lastAutoTable.finalY + 15, { align: 'center' });

    doc.save(`receipt-${_id || id}-${guestName}.pdf`);
  };

  return (
    <div className="bg-amber-50 p-4 border-l-4 border-amber-500">
      <h4 className="font-bold text-gray-800 mb-2">Detailed Bill for {customer.guestName} (Room {customer.roomNumber})</h4>
      <div className="max-h-48 overflow-y-auto pr-2">
        <ul className="space-y-1">
          <li className="flex justify-between">
            <span className="text-gray-700">Room Charges ({customer.stayDuration || 1} night(s))</span>
            <span className="font-medium text-gray-800">₹{(customer.totalAmount || 0).toLocaleString()}</span>
          </li>

          {customer.lateFee > 0 && (
            <li className="flex justify-between text-red-600">
              <span>Late Check-Out Penalty</span>
              <span className="font-medium">₹{customer.lateFee.toLocaleString()}</span>
            </li>
          )}

          <li className="font-semibold text-gray-800 pt-2">Food Charges:</li>
          {foodOrders.length > 0 ? (
            foodOrders.map(order => (
              <li key={order.id} className="flex justify-between pl-4">
                <span className="text-gray-600">{order.date || 'N/A'} - {order.desc} (x{order.quantity})</span>
                <span className="font-medium text-gray-700">₹{order.amount.toLocaleString()}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 pl-4">No food orders found.</li>
          )}
        </ul>
      </div>

      <div className="border-t border-amber-300 mt-3 pt-3 space-y-1">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Subtotal</span>
          <span className="font-semibold text-gray-800">₹{((customer.totalAmount || 0) + (customer.foodCharges || 0)).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">GST (18%)</span>
          <span className="font-semibold text-gray-800">₹{(((customer.totalAmount || 0) + (customer.foodCharges || 0)) * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="font-bold text-gray-900">Total Bill</span>
          <span className="font-bold text-amber-700">₹{(((customer.totalAmount || 0) + (customer.foodCharges || 0)) * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="text-right mt-3">
        <button
          onClick={handleDownloadReceipt}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
        >
          <i className="fas fa-file-invoice mr-2"></i>Download Receipt
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsPanel;