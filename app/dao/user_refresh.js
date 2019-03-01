const mongoose = require('mongoose');
const randToken = require('rand-token');

const {buildErrObject}= require('../services/error_handler');
const {userRefreshSchema} = require('../schemas/user_refresh');
const {User} = require('../dao/user');
const {getIP, getCountry, getBrowserInfo} = require('../services/get_user_access');
const {generateToken} = require('../services/auth');

/********************
 * STATICS *
 ******************/
//SAVE USER REFRESH TOKEN
userRefreshSchema.statics.saveUserRefreshAndReturnToken = async (req, user) => {
    return new Promise((resolve, reject) => {
        const refreshToken = randToken.uid(256);
        const userRefresh = new UserRefresh({
            userId: user._id,
            refreshToken: refreshToken,
            ip: getIP(req),
            browser: getBrowserInfo(req),
            country: getCountry(req),
        });
        userRefresh.save()
            .then(() => {
                const userInfo = User.setUserInfo(user);
                //RETURN DATA WITH ACCESS TOKEN
                resolve({
                    AccessToken: generateToken(user._id),
                    refreshToken: refreshToken,
                    user: userInfo
                });
            })
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

/***************************************
 * CREATE AND EXPORT MODEL *
 **************************************/
const UserRefresh = mongoose.model('UserRefresh', userRefreshSchema);
exports.UserRefresh = UserRefresh;