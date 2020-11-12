// ======== REVIEWS ========
const express = require('express')
// merge params means that all the params from 'app.use('/campgrounds/:id/reviews', reviews)' in index.js, are available here too (e.g. :id)
const router = express.Router({ mergeParams: true })
const reviews = require('../controllers/reviews')
const Review = require('../models/review')
const Campground = require('../models/campground')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

const catchAsync = require('../utilities/catchAsync') // async error handler

// ======== CREATE ========
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

// ======== READ ========
// avaoilable to read on show page

// ======== DELETE ========
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router
