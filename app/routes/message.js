const express = require('express');
const router = express.Router();
require('../../init/passport');
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', {
    session: false
});

const validate = require('../validations/message');
const controller = require('../controllers/message');
/*
ROUTES
 */










module.exports = router;