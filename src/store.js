'use strict'

require('debug').enable('*')
var debug = require('debug')('store')
var d3 = require('d3')
var topojson = require('topojson')

var store = {}
var dispatch = d3.dispatch(
    'geoLoading', 'geoUpdate',
    'animalLoading', 'animalUpdate'
)
d3.rebind(store, dispatch, 'on')

store.loadCounty = function () {
  d3.json('/data/twCounty2010.topo.json')
    .on('progress', function () {
      dispatch.geoLoading(d3.event.loaded)
    })
    .get(function (err, data) {
      if (err) {
        debug(err)
        return
      }
      var topo = topojson.feature(data, data.objects.layer1)
      dispatch.geoUpdate(topo.features)
    })
}

store.loadAnimal = function () {
  d3.csv('/data/topic_animal.csv')
    .on('progress', function () {
      dispatch.animalLoading(d3.event.loaded)
    })
    .get(function (err, data) {
      if (err) {
        debug(err)
        return
      }
      dispatch.animalUpdate(data.map(function (d) {
        var date = new Date(d.CollectedDateTime)
        return {
          id: 'tesri-' + date.getTime(),
          date: date,
          lngLat: [+d.Longitude, +d.Latitude],
          latLng: [+d.Latitude, +d.Longitude]
        }
      }))
    })
}

store.load = function () {
  debug('load')
  store.loadCounty()
  store.loadAnimal()
}

module.exports = store
