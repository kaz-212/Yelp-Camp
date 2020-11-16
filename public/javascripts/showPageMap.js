// from the docs
mapboxgl.accessToken = mapToken // maptoken defined in script tag in show.ejs (so we can use the ejs syntax in this js file)
const map = new mapboxgl.Map({
  container: 'show-map',
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: campground.geometry.coordinates, // starting position [lng, lat]. campground vvariable from show.ejs
  zoom: 8 // starting zoom
})

map.addControl(new mapboxgl.NavigationControl())

// from the doxs
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`))
  .addTo(map)
