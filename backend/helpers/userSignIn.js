const User = require("../db").User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = userSignIn = (req, res) => {
    let email = req.body.params.email;
    let password = req.body.params.password;

    User.findOne({ email: email}, (err, user) => {
        console.log(user);
        if(err) {
            return err;
        } else if(!user) {
            res.status(202).send('User Does not exist.');
        } else {
            bcrypt.compare(password, user.password, (err, response) => {
                if(response === true) {
                    jwt.verify(user.token, password, (err, decoded) => {
                        console.log(Object.keys(user.categoryPreference).length)
                        if(user.categoryPreference.preferences.length === 0) {
                            req.session.email = email;
                            res.status(201).send({email:email});
                        } else {
                            req.session.email = email;
                            let userData = {};
                            userData.videoPreference = user.videoPreference;
                            userData.bookmarks = user.bookmarks;
                            userData.categoryPreference = user.categoryPreference.preferences;
                            userData.token = user.token;
                            console.log('This is the user data', userData);
                            
                            res.status(200).send(userData).end();
                            console.log('Authentication successful!');
                        }
                    })
                } else {
                    console.log('Wrong password, try again');
                    res.send(203);
                }
            })
            }
        })
};