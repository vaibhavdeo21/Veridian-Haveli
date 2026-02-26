const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
  // 1. Extract email from the frontend request
  const { username, email, password } = req.body; 
  
  try {
    // 2. Check if a user already exists with that username OR that email
    let user = await User.findOne({ $or: [{ username }, { email }] });
    
    if (user) {
      // Provide a clearer error message so the user knows why it failed
      return res.status(400).json({ msg: 'A user with that username or email already exists' });
    }

    // 3. Save the email to the new User document
    user = new User({ username, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      // 4. Send the email back in the response to match the Google login response
      res.status(201).json({ 
        token, 
        user: { username: user.username, email: user.email, role: user.role } 


        
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user.id, username: user.username, role: user.role } 
      });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});


router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- UPDATED GOOGLE ROUTE ---
router.post('/google', async (req, res) => {
  // We now receive the Google User Info directly from the React frontend
  const { googleProfile } = req.body;

  try {
    if (!googleProfile) {
      return res.status(400).json({ msg: 'Google profile data is required' });
    }

    const { email, name, sub: googleId } = googleProfile;

    let user = await User.findOne({ email });

    if (!user) {
      // REGISTRATION: Create new account
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        username: name,
        email: email, // Google accounts will have an email
        password: hashedPassword,
        role: 'user' 
      });

      await user.save();
    }

    // LOGIN: Generate JWT
    const payloadJwt = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payloadJwt,
      process.env.JWT_SECRET,
      { expiresIn: '5d' }, // Aligned to 5d to match your other login routes
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { _id: user.id, username: user.username, email: user.email, role: user.role } 
        });
      }
    );

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ msg: 'Google Authentication failed on the server' });
  }
});

// --- FIXED ROUTE NAME: Was '/update-profile', now '/update-username' ---
router.put('/update-username', auth, async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the new username is already taken by someone else
    let existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(400).json({ msg: 'Username is already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username } },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/update-fullname', auth, async (req, res) => {
  const { fullName } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { fullName } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;