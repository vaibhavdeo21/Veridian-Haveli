const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const multer = require('multer');
const path = require('path');

// Configure image storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'room-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FIX: Added upload.single('image') to handle the room photo
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const roomData = {
      roomNumber: req.body.roomNumber,
      type: req.body.type,
      price: req.body.price,
      description: req.body.description,
      // Save image path to the database
      images: req.file ? [`/uploads/${req.file.filename}`] : []
    };

    const room = new Room(roomData);
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;