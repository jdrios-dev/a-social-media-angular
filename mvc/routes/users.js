const express = require('express');
const router = express.Router();

const usersCtrl = require('../controllers/users');

router.post('/register', usersCtrl.registerUser );

router.post('/login', usersCtrl.loginUser );

module.exports = router;
