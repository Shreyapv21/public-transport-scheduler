const express = require('express');
const {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  searchRoutes
} = require('../controllers/routeController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllRoutes);
router.get('/search', searchRoutes);
router.post('/', auth, createRoute);
router.put('/:id', auth, updateRoute);
router.delete('/:id', auth, deleteRoute);

module.exports = router;