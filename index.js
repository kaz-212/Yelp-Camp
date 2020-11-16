// process.env.NODE_ENV is either set to development mode or production mode. below is saying if in dev mode, then dotenv will take the variables defined in .env and add them into 'processs.env' so i can access them while in dev mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate') // npm i ejs-mate
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utilities/ExpressError') // async error handler
const methodOverride = require('method-override')
const passport = require('passport') // just need to require regualar passport not passport-local-mongoose
const localStrategy = require('passport-local')
const User = require('./models/user')

// package prohibits things like '$' or '.' being sent in the url/req.params/req.body to protect you from mongo injections
const mongoSanitize = require('express-mongo-sanitize')

// getting thr routers
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const users = require('./routes/users')

// connect mongoose - arguments stop depreciation warnings
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database connected')
})

// create express app
const app = express()

app.engine('ejs', ejsMate) // use ejsMate as engine to parse ejs instead of default. allows <%layout('boilerplate)-%>
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.set('useFindAndModify', false)

app.use(express.urlencoded({ extended: true })) // parses the post requests
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))) // sets the 'public' directory to be used for our js and stylesheets (static files)
app.use(
  mongoSanitize({
    replaceWith: '_' // replaces prohibited characters with '_' instead of removing request entirely
  })
)

const sessionConfig = {
  secret: 'this should be a better secret',
  resave: false, // stop depr. warnings
  saveUninitialized: true, // stop depr. warnings
  cookie: {
    httpOnly: true, // for added security (docs )
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // date.now in milliseconds, this makes cookie expire in a week
    maxAge: 1000 * 60 * 60 * 24 * 7 //this does the same (don't need both)
  }
}

app.use(session(sessionConfig))
app.use(flash())

// ======== LOGIN / PASSPORT ========
app.use(passport.initialize())
app.use(passport.session()) // need this if you want persistant login sessions (dont wanna log out on every page)
// we would like passport to use the local strategy (could ebe fb or google (check docs)). for that local strat, the authentication method is going to be located on the user model and called authenticate (method created by passport-local-mongoose)
passport.use(new localStrategy(User.authenticate()))
// tells passport how to serialize a user. i.e. how do we store a user in the session
passport.serializeUser(User.serializeUser())
// how do we get a user out of the session
passport.deserializeUser(User.deserializeUser())

// ======== FLASH ========
// for every request, we are going to set the success local variable to be the 'success' flash. since we created the success variable, it will mostly be empty (except when the flash runs when we make a new campsite)
app.use((req, res, next) => {
  res.locals.currentUser = req.user // req.user comes from passport. is undefined if not logged in. can use for show/hide if logged in
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

// ======== ROUTES ========

app.use('/', users)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
  res.render('home')
})

// ======== INVALID URL ========
//for any request method and any route, do this function (i.e. anything that doesnt match the defined routes above)
app.all('*', (req, res, next) => {
  next(new ExpressError("Looks like you're lost!", 404)) // passed to the error handler as "err"
})

// ======== ERROR HANDLING ========
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong!' } = err
  if (!err.message) err.message = 'Oh no, something went wrong :('
  res.status(statusCode).render('error', { err })
})

app.listen(3000, () => console.log("You're good on port 3000"))
