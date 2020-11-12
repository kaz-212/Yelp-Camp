const Joi = require('joi') //nmp i joi
// using joi to validate stuff coming in on the server side. in the object campground which comes in, there must be req. title and price etc.
// good to use joi rather than if statements for each thing because less faff and scales better
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
  }).required(),
  deleteImages: Joi.array() // can find this on edit.ejs
})

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required()
  }).required()
})
