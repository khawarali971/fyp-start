var express = require('express');
var router = express.Router();
var passport = require('passport')
var User = require('../models/user')
var multer = require('multer')
var fs = require('fs')

router.get('/profile', isloggedin, function (req, res, next) {

    var successMsg = req.flash('success')[0]
    User.find({
        _id: req.session.user._id
    }, function (err, docs) {
        var userChunks = [];
        var chunkSize = 3
        for (var i = 0; i < docs.length; i += chunkSize) {
            userChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('user/profile', {
            title: 'Profile',
            products: userChunks,
            user: req.user,
            successMsg: successMsg,
            noMessages: !successMsg
        });
    })
})
router.get('/editprofile', isloggedin, function (req, res, next) {

    res.render('user/editprofile')
})
router.post('/editprofile', function (req, res, next) {

        if (req.files) {
            req.files.forEach(function (pic) {
                var filename = (new Date).valueOf() + "-" + pic.originalname
                fs.rename(pic.path, 'public/images/' + filename, function (err) {
                    if (err) throw err;


                    User.findOneAndUpdate({
                        _id: req.session.user._id
                    }, {
                        $set: {
                            blood: req.body.blood,
                            DOB: req.body.DOB,
                            gender: req.body.gender,
                            cnic: req.body.cnic,
                            address: req.body.address,
                            city: req.body.city,
                            province: req.body.province,
                            pic: '/images/' + filename,
                            phone: req.body.phone
                        }
                    }, function (err, doc) {
                        if (err) {
                            res.redirect('/user/editprofile')
                        } else {

                            res.redirect('/user/profile')
                        }

                    });
                })
            })

        }

    }


)
router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/')
})

router.use('/', isnotloggedin, function (res, req, next) {
    next();
})

/* GET users listing. */
router.get('/signup', function (req, res, next) {
    var messages = req.flash('error')
    res.render('user/signup', {

        messages: messages,
        hasErrors: messages.length > 0
    })
})
router.post('/signup', passport.authenticate('registerUser', {
    successRedirect: '/user/editprofile',
    failureRedirect: '/user/signup',
    failureFlash: true
}))

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}))

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error')
    res.render('user/signin', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

module.exports = router;

function isloggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function isnotloggedin(req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}
