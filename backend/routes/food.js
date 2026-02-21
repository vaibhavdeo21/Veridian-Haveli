const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/authMiddleware');
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

// @route   POST api/food/:category
// @desc    Add new food item (Admin only)
router.post('/:category', [auth, upload.single('image')], async (req, res) => {
  try {
    const { name, description, price } = req.body;
    
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

// --- NEW ROUTE: EDIT FOOD ITEM ---
// @route   PATCH api/food/:category/:id
// @desc    Update existing food item and move image to correct folder
router.patch('/:category/:id', [auth, upload.single('image')], async (req, res) => {
  try {
    let food = await FoodItem.findById(req.params.id);
    if (!food) return res.status(404).json({ msg: 'Culinary entry not found' });

    const updateData = { ...req.body, category: req.params.category };

    if (req.file) {
      // 1. Purge the old image before saving the new path
      if (food.image) deleteFile(food.image);
      
      updateData.image = `/uploads/menu/${req.params.category}/${req.file.filename}`;
    }

    const updatedFood = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.json(updatedFood);
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

    // 2. Purge image from disk before removing record from DB
    if (food.image) deleteFile(food.image);

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Entry and associated media removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;