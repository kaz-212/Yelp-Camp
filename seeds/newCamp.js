const mongoose = require('mongoose')
const Campground = require('../models/campground')

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

const seedDB = async () => {
  const camp = new Campground({
    author: '5fab01e9ed1e7c0dc02dc301',
    location: 'big ting, small ting',
    title: 'yo mamma',
    images: [
      {
        url: 'https://source.unsplash.com/collection/483251',
        filename: 'Yelp1'
      },
      {
        url: 'https://source.unsplash.com/collection/483251',
        filename: 'Yelp2'
      }
    ],
    description:
      'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Excepturi in repellendus temporibus aspernatur alias blanditiis iure! Tempora recusandae et quidem!',
    price: 55
  })
  await camp.save()
  console.log(camp)
}

seedDB()
