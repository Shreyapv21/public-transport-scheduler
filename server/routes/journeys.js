const express = require('express');
const {
  getAllJourneys,
  createJourney,
  updateJourney,
  deleteJourney
} = require('../controllers/journeyController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getAllJourneys);
router.post('/', auth, createJourney);
router.put('/:id', auth, updateJourney);
router.delete('/:id', auth, deleteJourney);

module.exports = router;