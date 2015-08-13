'use strict'

require('debug').enable('*')
var debug = require('debug')('animalMap')

var d3 = require('d3')
d3.hexbin = require('../lib/d3-plugins/hexbin')

var store = require('./store')

var componentName = 'animal-map'

module.exports = function (name, p) {

  componentName = name

  var state = {
    width: 800,
    height: 600,
    projection: d3.geo.mercator().center([121.05, 24.50]).scale(40000),
    date: (new Date('2006-01-01')).getTime()
  }

  var props = Object.assign(p || {}, {
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  var hexbin = d3.hexbin()
    .size([state.width, state.height])
    .radius(16)
  var colorScale = d3.scale.linear()
    .domain([1, 18])
    .range(['rgb(253, 208, 162, 0.8)', 'rgb(230, 85, 13)'])
    .interpolate(d3.interpolateLab)

  function drawHexbin (selection, data) {
    selection.selectAll('.hexagon')
      .data(hexbin(data.map(function (d) { return state.projection(d.lngLat) })))
    .enter().append('path')
      .attr('class', 'hexagon')
      .attr('d', hexbin.hexagon())
      .attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })
      .style('fill', function (d) { return colorScale(d.length) })
  }

  function draw (selection) {
    var g = selection.append('g')
      .attr('class', componentName + ' tesri hexbin')
      .attr('transform', 'translate(' + props.margin.left + ',' + props.margin.top + ')')
    store.on('animalUpdate', drawHexbin.bind(undefined, g))
  }

  ;['width', 'height', 'projection'].forEach(function (n) {
    draw[n] = function () {
      if (arguments.length === 0) { return state[n] }
      state[n] = arguments[0]
      return draw
    }
  })

  return draw
}
