const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const Story = require('../models/Story');

// Create story (generate content via hints — simulated)
router.post('/', auth, async (req, res) => {
  try {
    const { title, hints, genres } = req.body;
    if (!title || !hints || !genres || !genres.length) {
      return res.status(400).json({ msg: 'Title, hints and at least one genre required' });
    }

    // Simulate generation (replace with AI call if needed)
    const generated = `In a world where ${hints.slice(0, 250)}... (auto-generated story for ${title})`;

    const story = new Story({
      user: req.user.id,
      title,
      hints,
      genres,
      content: generated
    });

    await story.save();
    res.json(story);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user's stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
