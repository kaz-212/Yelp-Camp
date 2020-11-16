const { sanitize } = require('express-mongo-sanitize')
const BaseJoi = require('joi') //nmp i joi
const samitizeHtml = require('sanitize-html')
// using joi to validate stuff coming in on the server side. in the object campground which comes in, there must be req. title and price etc.

// defining an extension on joi.string() called escapeHtml. this should protect us from XSS attacks as doesnt allow us to input html into fields
const extension = joi => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        // sanitizeHtml is a package that strips all html from a string
        const clean = sanitizeHtml(value, {
          // not allowing exceptions e.g. h1 tag. No html can get through
          allowedTags: [],
          allowedAttributes: {}
        })
        // if there is difference between input and sanitized output, that means it contained html, so give error msg defined above
        if (clean !== value) return helpers.error('string.escapeHtml', { value })
        return clean
      }
    }
  }
})

const Joi = BaseJoi.extend(extension)

// good to use joi rather than if statements for each thing because less faff and scales better
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML()
  }).required(),
  deleteImages: Joi.array() // can find this on edit.ejs
})

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML()
  }).required()
})
