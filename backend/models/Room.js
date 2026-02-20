const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory'], required: true },
  price: { type: Number, required: true },
  description: String,
  images: [String], // Array of image URLs
  currentBookings: [{
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    checkIn: Date,
    checkOut: Date
  }]
});

module.exports = mongoose.model('Room', RoomSchema);