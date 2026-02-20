// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  roomNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalAmount: Number,
  status: { type: String, enum: ['Booked', 'CheckedIn', 'CheckedOut', 'Cancelled'], default: 'Booked' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  
  // --- NEW FIELDS FOR CUSTOMER PROFILE ---
  amountPaid: { type: Number, default: 0 },
  idDocumentPath: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);