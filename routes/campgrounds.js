// ======== CAMPGROUNDS ========

const express = require('express')
const router = express.Router()
const campgrounds = require('../controllers/campgrounds')
const Campground = require('../models/campground')
const { isLoggedIn, validateCamground, isAuthor } = require('../middleware.js')
const multer = require('multer') // needed for parsing image files
const { storage } = require('../cloudinary')
const upload = multer({ storage }) // store using storage object that was configured in that cloudinary/index.js

const catchAsync = require('../utilities/catchAsync') // async error handler

// ======== CREATE ========
// needs to go above /campgrounds:id else, 'new' would be treated as an id
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.post('/', isLoggedIn, validateCamground, catchAsync(campgrounds.createCampground))

// ======== READ ========
// router.get('/', catchAsync(campgrounds.index))

// SHOW
// router.get('/:id', catchAsync(campgrounds.showCampground))

// ======== UPDATE ========

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// router.put('/:id', isLoggedIn, validateCamground, catchAsync(campgrounds.updateCampground))

// ======== DELETE ========

// router.delete('/:id', catchAsync(campgrounds.deleteCampground))

module.exports = router

// ======== FANNCY ROUTING ========

router
  .route('/')
  .get(catchAsync(campgrounds.index))
  // look for the thing with name="image" on the form and parse it. array allows multiple files upload but u can do .single()
  .post(isLoggedIn, upload.array('image'), validateCamground, catchAsync(campgrounds.createCampground))

router
  .route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCamground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
