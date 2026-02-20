const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  type: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  images: [{ 
    type: String 
  }],
  currentBookings: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  
  // --- ADD THIS LINE ---
  availability: { 
    type: String, 
    default: 'Available' 
  }
  
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);