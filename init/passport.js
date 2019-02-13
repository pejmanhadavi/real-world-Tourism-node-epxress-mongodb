const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../app/dao/user').User;

const jwtExtractor = req => {
	let token = null;
	if (req.headers.authorization)
		token = req.headers.authorization.replace('Bearer ','').replace(' ', '');
	else if (req.body.token)
		token = req.body.token.replace(' ', '');
	if (req.query.token)
		token = req.body.token.replace(' ', '');

	return token;
};

const jwtOptions = {
	jwtFromRequest: jwtExtractor,
	secretOrKey: process.env.JWT_SECRET
};


const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
	User.findById(payload._id)
		.then(result => {
			return !result ? done(null, false) : done(null, result);
		})
		.catch(err => {
			return done(null, false);
		});
});

passport.use(jwtLogin);