const mongoose = require('mongoose');
const {forgotPasswordSchema} = require('../schemas/forgot_password');
const {handleError, buildErrObject} = require('../services/error_handler');

const uuid = require('uuid');
const {getIP, getCountry, getBrowserInfo} = require('../services/get_user_access');


/**************
 * STATICS
 */

//SAVE FORGOT PASSWORD
forgotPasswordSchema.statics.saveForgotPassword = async req => {
	return new Promise((resolve, reject) => {
		const forgot = new ForgotPassword({
			email: req.body.email,
			verification: uuid.v4(),
			ipRequest: getIP(req),
			browserRequest: getBrowserInfo(req),
			countryRequest: getCountry(req)
		});

		forgot.save()
			.then(result => resolve(result))
			.catch(err => reject(buildErrObject(422, err.message)));
	});
};


/**************
 * HELPERS
 */

exports.forgotPasswordResponse = forgotPass => {
	return {
		msg: 'RESET_EMAIL_SENT'
	};
};

/**************
 *CREATE AND EXPORT MODEL
 */
const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema);

exports.ForgotPassword = ForgotPassword;