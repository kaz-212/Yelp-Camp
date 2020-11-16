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
const helmet = require('helmet') // used for added security (check docs to see exactly what it does)
const MongoDBStore = require('connect-mongo')(session) //npm i connect-mongo. used to save session info in mongo rather than locally

// package prohibits things like '$' or '.' being sent in the url/req.params/req.body to protect you from mongo injections
const mongoSanitize = require('express-mongo-sanitize')

// getting the routers
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const users = require('./routes/users')

// const dbUrl = process.env.DB_URL // pass this in to mongoose.connect in production mode

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
// connect mongoose - arguments stop depreciation warnings
mongoose.connect(dbUrl, {
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

const secret = process.env.SECRET || 'this should be a better secret'

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60 // 24 hours in seconds (updates after this long rather than every time user refreshes)
})

store.on('error', function (e) {
  console.log('session store error', e)
})

const sessionConfig = {
  store,
  name: 'session', // changes name of cookie from default name. makes it harder for people to have automatic code that finds session cookie
  secret,
  resave: false, // stop depr. warnings
  saveUninitialized: true, // stop depr. warnings
  cookie: {
    httpOnly: true, // means cookies not available through js so cannot get cookie through XSS for e.g.
    // secure: true, // means cookies can only be configured over secure connection like https (http secure). wont work on localhost
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // date.now in milliseconds, this makes cookie expire in a week
    maxAge: 1000 * 60 * 60 * 24 * 7 //this does the same (don't need both)
  }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet()) // enables all the helmet middleware except contentSecurityPolicy

// this configuration from helmet says that these are all the sites we are allowed to get stuff from. nothing else.
const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net'
]
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/'
]
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/'
]
const fontSrcUrls = []
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dqyymjqpg/', //SHOULD MATCH MY CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/'
      ],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
)

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

// this will be present on heroku. if not (i.e. we are in dev mode, will default to 3000)
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`You're good on port ${port}`))
