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

// --- NEW FIX: Add PATCH route to update Room Availability ---
// @route   PATCH api/rooms/:id
router.patch('/:id', async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { returnDocument: 'after' }
    );
    if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error updating room' });
  }
});

// DELETE room (assuming you might need this since DataContext calls it)
router.delete('/:id', async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting room' });
  }
});

module.exports = router;