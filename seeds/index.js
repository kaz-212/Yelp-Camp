// run this file to dlete database and add new random documents to the database (currently 50 but can change that)

const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities.json')
const { places, descriptors } = require('./seedHelpers')

// connect mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('Database 2 connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({}) // clears the database
  for (let i = 0; i < 50; i++) {
    const random231 = Math.floor(Math.random() * 230 + 1)
    const price = Math.floor(Math.random() * 20 + 10)
    const camp = new Campground({
      author: '5fab01e9ed1e7c0dc02dc301',
      // location: `${cities[random231].city}, ${cities[random231].admin}`,
      location: 'Finchley, London',
      geometry: { coordinates: [-0.176467, 51.61378], type: 'Point' },
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi in repellendus temporibus aspernatur alias blanditiis iure! Tempora recusandae et quidem!',
      price,
      images: [
        {
          url: 'https://source.unsplash.com/collection/483251',
          filename: 'Yelp1'
        },
        {
          url: 'https://source.unsplash.com/collection/483251',
          filename: 'Yelp2'
        }
      ]
    })
    await camp.save()
  }
}

// call the function. because its async, it returns a promise. so have to .then() to close the connection
seedDB().then(() => {
  mongoose.connection.close()
  console.log('connection closed')
})
