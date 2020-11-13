const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [
      {
        url: String,
        filename: String
      }
    ],
    // from mongoose docs
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  opts
) // need to pass in opts (defined above) cus by default, mongoose does not include virtuals when you convert doc to JSON

// create virtual property for the map (clusterMap.js)
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 25)}...</p>` // this is the individial campground
  // return 'Hello matey' // this is the individial campground
})

// to find the correct 'hook' in the docs for what you're doing, go to model. '.findByIdAndDelete()' (for example), and see which middleware it triggers (in this case 'findOneAndDelete')
// we have access to what was just deleted as a param (in this case 'doc')
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  // ONE WAY TO DO IT
  // if(doc) {
  //  const reviews = doc.reviews
  //  for (review of reviews) {
  //    await Review.findByIdAndDelete(review)
  //  }
  // }

  // the reason if doc, because sometimes the delete might not work so no doc etc.
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

module.exports = mongoose.model('Campground', CampgroundSchema)
