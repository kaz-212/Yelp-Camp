const User = require('../models/user')

module.exports.renderRegister = async (req, res) => {
  res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body
    const user = new User({ username, email })
    const registeredUser = await User.register(user, password)
    // will auto login users after they register
    req.login(registeredUser, err => {
      if (err) return next(err)
      req.flash('success', 'Welcome to Yelp Camp')
      res.redirect('/campgrounds')
    })
  } catch (e) {
    req.flash('error', e.message)
    res.redirect('register')
  }
}

// not really logging you in, passport logs you in in the users route
module.exports.login = async (req, res) => {
  //  if we make it here, we know that it has been authenticated successfully
  req.flash('success', `Welcome back ${req.session.passport.user}!`)
  const redirecturl = req.session.returnTo || '/campgrounds' // /campgrounds only if there is no req.session.returnTo
  delete req.session.returnTo // so that its not just sitting in the session (delete key word can be used to delete somethn from obj)
  res.redirect(redirecturl)
}

module.exports.logout = async (req, res) => {
  req.logout()
  req.flash('success', 'Goodbye!')
  res.redirect('/campgrounds')
}
