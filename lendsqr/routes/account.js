var express = require('express');
const accountFund = require('../controllers/account.fund');
const accountTransfer = require('../controllers/account.transfer');
const accountWithdraw = require('../controllers/account.withdraw');
const userCreate = require('../controllers/user.create');
const userLogin = require('../controllers/user.login');
const authentication = require('../middleware/authentication');
var router = express.Router();

// Authenticated requests
router.post('/transfer', authentication, accountTransfer)
router.post('/withdraw', authentication, accountWithdraw)
router.post('/fund', authentication, accountFund)

module.exports = router;
