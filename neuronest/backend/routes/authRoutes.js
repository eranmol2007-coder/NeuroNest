const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', auth, getMe);

module.exports = router;
