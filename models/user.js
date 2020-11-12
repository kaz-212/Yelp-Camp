const mongoose = require('mongoose')
// local mongoose just sets up normal local login if you're using mongoose. there are other options on the passport docs
const passportLocalMongoose = require('passport-local-mongoose') // npm i passport passport-local passport-local-mongoose
const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true // not actually validation
  }
})

// dont need to pass in username and password
// will add in username, field for password, will make sure usernames are unique and give us some additional methods
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
