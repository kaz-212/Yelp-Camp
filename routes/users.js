const express = require('express')
const router = express.Router()
const users = require('../controllers/users')
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')

// ======== CREATE ========
// router.get('/register', users.renderRegister)

// new user
// router.post('/register', catchAsync(users.registerUser))

// ======== LOGIN ========

// router.get('/login', async (req, res) => {
//   res.render('users/login')
// })

// pass in the 'strategy' to passport.authenticate (local here but could be twitter for e.g.)
// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

// ======== LOGOUT ========

router.get('/logout', users.logout)

module.exports = router

// ======== FANCY ROUTING ========

router.route('/register').get(users.renderRegister).post(catchAsync(users.registerUser))

router
  .route('/login')
  .get(async (req, res) => res.render('users/login'))
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)
