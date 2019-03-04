const express = require('express');
const router = express.Router();
require('../../init/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', {
    session: false
});

const controller = require('../controllers/pay');
const valdiate = require('../validations/pay');



router.post('/:requestId', requireAuth, controller.pay);

router.post('/verify', requireAuth, controller.verifyPay);


module.exports = router;