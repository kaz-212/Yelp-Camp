// from the docs
mapboxgl.accessToken = mapToken // maptoken defined in script tag in show.ejs (so we can use the ejs syntax in this js file)
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
  center: campground.geometry.coordinates, // starting position [lng, lat]. campground vvariable from show.ejs
  zoom: 8 // starting zoom
})

// from the doxs
new mapboxgl.Marker().setLngLat(campground.geometry.coordinates).addTo(map)
