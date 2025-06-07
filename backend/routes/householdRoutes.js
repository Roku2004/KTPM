const express = require('express');
const {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  getHouseholdResidents
} = require('../controllers/householdController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getHouseholds)
  .post(authorize('admin'), createHousehold);

router.route('/:id')
  .get(getHouseholdById)
  .put(authorize('admin'), updateHousehold)
  .delete(authorize('admin'), deleteHousehold);

router.route('/:id/residents')
  .get(getHouseholdResidents);

module.exports = router; 