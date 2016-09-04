var passport = require('passport')
var User = require('../models/user')
var LocalStrategy = require('passport-local').Strategy;
passport.serializeUser(function (user, done) {
    done(null, user.id)
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
passport.use('registerUser', new LocalStrategy({
    fnameField : 'fname',
    lnameField : 'lname',
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req,  email, password, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
     req.checkBody('fname', 'First name required').notEmpty();
     req.checkBody('lname', 'Last name required').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:5});
    var errors = req.validationErrors()
    User.findOne({'email': email.toLowerCase()}, function(err, user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'Email is already in use'});
        }
     var newUser = User()
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password)
        newUser.fname = req.body.fname
        newUser.lname = req.body.lname
            newUser.save(function(err, result){
            if(err){
                return done(err)
            }
            req.session.user = newUser;
            return done(null, newUser)
        })
})}))



passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
},function(req, email, password, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    
    req.checkBody('password', 'Invalid Password').notEmpty();
    var errors = req.validationErrors()
    if(errors){
        var messages = []
        errors.forEach(function(error){
            messages.push(error.msg)
        })
        return done(null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, function(err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'Invalid email'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'Invalid Password'});
        }
        req.session.user = user;
        return done(null, user)
       
    })
}))
