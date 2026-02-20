const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/authMiddleware'); // Protect add/delete routes

// @route   GET api/food
// @desc    Get all food items (Public)
router.get('/', async (req, res) => {
  try {
    const food = await FoodItem.find();
    res.json(food);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/food
// @desc    Add new food item (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const newFood = new FoodItem(req.body);
    const food = await newFood.save();
    res.json(food);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/food/:id
// @desc    Delete food item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    let food = await FoodItem.findById(req.params.id);
    if (!food) return res.status(404).json({ msg: 'Food item not found' });

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Food item removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;