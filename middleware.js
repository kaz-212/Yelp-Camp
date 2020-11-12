const { campgroundSchema, reviewSchema } = require('./validationSchemas.js') // joi schema
const ExpressError = require('./utilities/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

// req.isAuthenticated() is not on the docs but it is created by serialize user (i think)
module.exports.isLoggedIn = (req, res, next) => {
  // console.log('req.user...', req.user)
  if (!req.isAuthenticated()) {
    // console.log(req.originalUrl)
    req.session.returnTo = req.originalUrl // will return you to the page you were trying to access before redirected to login. saves in session variable
    req.flash('error', 'You must be signed in first!')
    return res.redirect('/login')
  }
  next()
}

// JOI
// use to validate things on server side
module.exports.validateCamground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body) // passes our data through to the schema defined in validationSchemas.js
  // if the post req. doesn;t conform to schema, throw error
  if (error) {
    const msg = error.details.map(el => el.message).join(',') // need to map over the error.details and extract the message
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}
// checks to see if you are authorised (i.e. did you create that campground)
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user.id)) {
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg)
  } else {
    next()
  }
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user.id)) {
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}
