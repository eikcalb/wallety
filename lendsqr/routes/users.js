var express = require('express');
const userCreate = require('../controllers/user.create');
const userGet = require('../controllers/user.get');
const userLogin = require('../controllers/user.login');
const authentication = require('../middleware/authentication');
var router = express.Router();

// Unauthenticated requests
router.post('/create', userCreate)
router.post('/login', userLogin)

// Authenticated requests
router.get('/me', authentication, userGet);

module.exports = router;
