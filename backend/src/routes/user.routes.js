const express = require('express');
const { getProfile } = require('../controllers/user.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const router = express.Router();
router.use(verifyJWT);
router.get('/profile', getProfile);
module.exports = router;