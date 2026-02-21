// routes/bookings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const upload = require('../middleware/uploadMiddleware');

// --- MULTER STORAGE CONFIGURATION ---
// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to the uploads folder
  },
  filename: function (req, file, cb) {
    // Rename file to include the booking ID and a timestamp to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `id-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to only accept PDFs and Images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// @route   GET api/bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server Error: Could not fetch bookings' });
  }
});

// @route   POST api/bookings
router.post('/', async (req, res) => {
  try {
    const { roomNumber, checkInDate, checkOutDate } = req.body;
    
    const existingBooking = await Booking.findOne({
      roomNumber,
      $or: [
        { checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkInDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- NEW ROUTE: UPLOAD ID DOCUMENT ---
// @route   POST api/bookings/:id/upload-id
router.post('/:id/upload-id', upload.single('idFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create the relative path to store in the database (e.g., '/uploads/id-12345.pdf')
    const documentPath = `/uploads/${req.file.filename}`;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { idDocumentPath: documentPath },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'File uploaded successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW ROUTE: GENERIC PATCH UPDATE (Status & Payments) ---
// @route   PATCH api/bookings/:id
router.patch('/:id', async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// @route   GET api/bookings/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$totalAmount" },
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales stats' });
  }
});

// @route   GET api/bookings/analytics
router.get('/analytics', async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 7 }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Customer deleted permanently' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

router.post('/:id/upload-id', upload.single('idFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Updated path to reflect the new subfolder
    const documentPath = `/uploads/customer_documents/${req.file.filename}`;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { idDocumentPath: documentPath },
      { returnDocument: 'after' }
    );

    res.json({ message: 'ID archived successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;