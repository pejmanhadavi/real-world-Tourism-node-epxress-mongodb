const mongoose = require('mongoose');
const dateFns = require('date-fns');
const phoneToken = require('generate-sms-verification-code');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const randomize = require('randomatic');




const userSchema = require('../schemas/user').userSchema;
const {handleError, buildErrObject}= require('../services/error_handler');

const MINUTES_TO_EXPIRE_VERIFICATION = 2;






/*
STATICS
 */


//DELETE NOT VERIFIED USERS
userSchema.statics.deleteNotVerifiedUsers = async () => {
    return new Promise((resolve, reject) => {
        User.deleteMany({
            verified: false,
            verificationExpires : {$lt: new Date()}
        }).then(result => resolve(result))
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

//CHECK USERNAME
userSchema.statics.usernameExists= async username =>{
    return new Promise((resolve, reject)=>{
        User.findOne({
            username: username,
        })
            .then(result => {
                if (result === null)
                    resolve(false);

                reject(buildErrObject(422, 'USERNAME_ALREADY_EXISTS'));
            })
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

//CHECK PHONE_REGISTER
userSchema.statics.phoneExists_register= async phone =>{
    return new Promise((resolve, reject)=>{
        User.findOne({
            phone: phone,
            verified: true
        })
            .then(result => {
                if (result === null)
                    resolve(false);

                reject(buildErrObject(422, 'PHONE_ALREADY_EXISTS'));
            })
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

//CHECK PHONE_FORGOT
userSchema.statics.phoneExists_verified = async phone =>{
    return new Promise((resolve, reject)=>{
        User.findOne({
            phone: phone,
            verified: true
        })
            .then(result => {
                console.log('result '+result);
                if (result !== null)
                    resolve(result);

                resolve(false);
            })
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

//REGISTER
userSchema.statics.registerUser = async req => {
    return new Promise(async (resolve, reject) => {
        const user = new User({
            username: req.username,
            password: req.password,
            phone: req.phone,
            verification: phoneToken(6, {type: 'string'})
        });

        await user.genSalt();
        user.save()
            .then(result => resolve(result))
            .catch(err => reject(buildErrObject(422, err.message)));
    });
};

//SET USER INFO
userSchema.statics.setUserInfo = (req) => {
    const user = {
        _id: req._id,
        username: req.username,
        phone: req.phone
    };
    return user;
};

//VERIFICATION EXISTS
userSchema.statics.verificationExists = async id => {
    return new Promise((resolve, reject) => {
        User.findOne({
            _id: id,
            verified: false
        })
            .then(result => resolve(result))
            .catch(err => reject(buildErrObject(422, err.message)));
    })
};


//EXPIRE VERIFICATION
userSchema.statics.expiresVerification = async (user) => {
    return new Promise((resolve, reject) => {
        user.verificationExpires = dateFns.addMinutes(new Date, MINUTES_TO_EXPIRE_VERIFICATION);
        user.save()
            .then(result => resolve(result))
            .catch(err => reject(buildErrObject(err.code, err.message)));
    });
};


//VERIFY USER
userSchema.statics.verifyUser = async (req, res, user) => {
    return new Promise((resolve, reject) => {
        if (user.verification !== req.verification ){
            handleError(res, buildErrObject(422, 'INVALID_VERIFICATION_CODE'));
            return;
        }
        if(user.verificationExpires <= new Date()){
            handleError(res, buildErrObject(422, 'VERIFICATION_CODE_EXPIRED'));
            return;
        }
        user.verified = true;

        user.save()
            .then(result => resolve({
                phone: result.phone,
                verified: result.verified
            }))
            .catch(err => reject(buildErrObject(422, err.message)));

    });
};

//GENERATE NEW PASSWORD
userSchema.statics.generateNewPassword = async () => {
    return randomize('Aa0', 12);

};


//UPDATE NEW PASSWORD
userSchema.statics.updatePassword = async (res, user, newPassword) => {
    return new Promise(async (resolve, reject) => {
        const salt = await bcrypt.genSalt(10);
        hashPassword = await bcrypt.hash(newPassword, salt);

        await user.update({
            password: hashPassword
        })
            .then(result => resolve(result))
            .catch(err => reject(buildErrObject(422, err.message)));

    });
};

/*
METHODS
 */



//COMPARE PASSWORD
userSchema.methods.comparePassword = function(passwordAttempt, cb) {
    bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
        err ? cb(err) : cb(null, isMatch)
    );
};



//GEN SALT
userSchema.methods.genSalt = async function() {
    const salt = await bcrypt.genSalt(10);
    this.password= await bcrypt.hash(this.password, salt);
};





//RETURN REGISTRATION TOKEN
userSchema.methods.returnRegistrationToken = (userInfo) => {

    return {
        token: generateToken(this._id),
        user: userInfo
    };
};


userSchema.methods.forgotPassResponse = () => {
    return {
        phone: this.phone,
        message: 'NEW_PASSWORD_SENT'
    }
};





/*
HELPERS
 */


//GENERATE TOKEN
const generateToken = id => {
    const obj = {
        _id: id
    };

    return jwt.sign(obj, process.env.JWT_SECRET
        , {expiresIn: process.env.JWT_EXPIRATION}
    );
};


/*
CREATE AND EXPORT MODEL
 */
const User = mongoose.model('User', userSchema);
exports.User = User;


