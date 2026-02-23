const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

/* CLEANUP: Removed local 'multer' import and storage config.
  We now use the centralized dynamic middleware to handle subfolders.
*/
const upload = require('../middleware/uploadMiddleware');

// @route   GET api/bookings
router.get('/', async (req, res) => {
  try {
    // --- NEW AUTO-CLEANUP LOGIC ---
    // Get today's date and set the time to midnight for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. AUTO-CHECKOUT: If they were checked in and the checkout date passed
    await Booking.updateMany(
      { 
        status: { $regex: /checked\s*in/i }, 
        checkOutDate: { $lt: today } 
      },
      { $set: { status: 'Checked Out' } }
    );

    // 2. AUTO-EXPIRE: If they were booked but never arrived and the date passed
    await Booking.updateMany(
      { 
        status: { $regex: /booked/i }, 
        checkOutDate: { $lt: today } 
      },
      { $set: { status: 'Expired' } } 
    );
    // ------------------------------

    // 3. Fetch the newly cleaned database records
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

/* --- REINFORCED ROUTE: UPLOAD ID DOCUMENT ---
  Uses dynamic 'upload' middleware. 
  The destination subfolder (/uploads/customer_documents/) is now 
  handled automatically by req.originalUrl logic in the middleware.
*/
router.post('/:id/upload-id', upload.single('idFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Relative path used for DB storage
    const documentPath = `/uploads/customer_documents/${req.file.filename}`;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { idDocumentPath: documentPath },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'ID archived successfully', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW ROUTE: GENERIC PATCH UPDATE (Status & Payments) ---
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

module.exports = router;