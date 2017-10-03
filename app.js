var express          = require('express');
var path             = require('path');
var favicon          = require('serve-favicon');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var app              = express();
var passport         = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth       = require('./config/auth');
var db               = require('./models')
var User             = db.user;
var flash            = require('connect-flash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport and restore authentication state
app.use(passport.initialize());
app.use(passport.session());


//********************// PASSPORT.JS //********************//

// Serialize Sessions
passport.serializeUser(function(user, done) {
  done(null, user);
});

// Deserialize Sessions
passport.deserializeUser(function(obj, done) {
  done(null, obj);
})

// Authentication Purposes

var fbAuth = {
  clientID    : '178205629406652',
  clientSecret: '2aef7dc8368ca804cc0b126fc15894f6',
  callbackURL : 'http://localhost:3000/auth/facebook/callback'
};

var fbCallBack = function(accessToken, refreshToken, profile, done) {
  console.log(accessToken, refreshToken, profile);

  process.nextTick(function() {
    // User.findOne({
    //   where:facebookId: profile.id}, function (err, user) {
    //
    //   if (err)
    //     return done(err);
    //
    //   if (user) {
    //     return(null, user);
    //   } else {
    //
    //     var newUser            = new User();
    //     newUser.facebookId     = profile.id;
    //
    //     newUser.save(function(err) {
    //       if (err)
    //         throw err;
    //
    //       return done(null, newUser);
    //     });
    //   }
    // });
    //
    // User.create({
    //
    // })
    User.findOrCreate({
      where: {
        facebookId: profile.id
        }
      }), function (err, user) {
    return cb(err, user);
  }

  });
};

passport.use(new FacebookStrategy(fbAuth, fbCallBack));


//********************// PASSPORT.JS //********************//

// app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

//********************// PASSPORT.JS //********************//

app.get('/', function(req, res) {
  res.render('index');
});

// route for showing the profile page
app.get('/profile', isLoggedIn, function(req, res) {
  res.render('profile', {user : req.user });
});

// route for facebook authentication and login
app.get('/auth/facebook',
  passport.authenticate('facebook'));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', function(err, user, info){
    // console.log(err, user, info)
    successRedirect : '/profile'
    failureRedirect : '/'
  }));

// route for loggin out
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.use(flash());

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
//********************// PASSPORT.JS //********************//

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
