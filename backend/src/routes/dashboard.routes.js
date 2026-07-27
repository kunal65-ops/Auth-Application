const express = require('express');
const { getDashboard } = require('../controllers/user.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const router = express.Router();
router.use(verifyJWT);
router.get('/', getDashboard);
module.exports = router;