const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'drinks'], 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: {
    type: String
  },
  image: {
    type: String // This will store the file path from your uploads folder
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Ensure the model name is 'FoodItem'
module.exports = mongoose.model('FoodItem', FoodItemSchema);