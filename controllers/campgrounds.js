// ALL THE CAMPGROUND ROUTING LOGIC

const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')

// mapbox
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    })
    .send()
  const campground = new Campground(req.body.campground)
  campground.geometry = geoData.body.features[0].geometry
  // 'files' obj created by multer. for each file (image) in array, return an object with url and filename (names in our schema)
  campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.author = req.user._id
  await campground.save()
  // console.log(campground)
  req.flash('success', 'Successfully made a new campground!')
  res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: 'reviews', // populate all the reviews and then all the authors of those reviews
      populate: {
        path: 'author' // poprulates the author field which is inside the reviews field which also needs to be populated
      }
    })
    .populate('author') // this is separately populate the one author on for this campground
  // console.log(campground)
  if (!campground) {
    req.flash('error', 'Cannot find campground :(')
    return res.redirect('/campgrounds')
  }
  // console.log(campground)
  res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }

  res.render('campgrounds/edit', { campground })
}

// ======== LECTURE 529 WHEN YOU GET CLOUDINARY WORKING ========
// campground exists as a grouping object because of 'campground[name]' instead of just 'name' in edit.ejs
module.exports.updateCampground = async (req, res) => {
  // console.log(req.body.campground)
  const { id } = req.params
  // console.log(req.body)
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground)
  // req.files.map creates an array so we dont want to push an array into the images array bcus then we'll have nested arrays so spread
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
  campground.images.push(...imgs)
  await campground.save()
  //delete from cloudinary too
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    // console.log(campground)
  }
  req.flash('success', 'Successfully edited campground!')
  res.redirect(`/campgrounds/${id}`)
}

// need to also delete the reviews associated w the campground. do this using middleware in models/campground.js
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  // delete from mongo
  const campground = await Campground.findByIdAndDelete(id)
  // delete from cloudinary
  for (let img of campground.images) {
    await cloudinary.uploader.destroy(img.filename)
  }
  req.flash('success', 'Campground deleted!')
  res.redirect('/campgrounds')
}
