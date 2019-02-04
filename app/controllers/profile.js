const {isIDGood} = require('./base');
const {buildErrObject, handleError} = require('../services/error_handler');
const {User} = require('../dao/user');


/**************************
    * GET_PROFILE CONTROLLER
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getProfile = async (req, res) => {
    try{
        const id = await isIDGood(req.user._id);
        res.status(200).json(await User.getProfileFromDB(id));
    }catch (err) {
        handleError(res, buildErrObject(err.code, err.message));
    }
};
