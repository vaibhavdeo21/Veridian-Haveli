const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/authMiddleware'); // Protect add/delete routes
const upload = require('../middleware/uploadMiddleware');

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


router.post('/:category', [auth, upload.single('image')], async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
    // Create the path relative to the server root for the DB
    const imagePath = req.file 
      ? `/uploads/menu/${req.params.category}/${req.file.filename}` 
      : '';

    const newFood = new FoodItem({
      name,
      description,
      price,
      category: req.params.category,
      image: imagePath
    });

    const food = await newFood.save();
    res.json(food);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;