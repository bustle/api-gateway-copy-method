const request = require('./request');
const _ = require('lodash');
const Promise = require('bluebird');

module.exports.list = function(){
  return request({ method: 'GET', path: '/restapis'}).then(normalizeResponse);
};

module.exports.resources = function(id){
  return request({ method: 'GET', path: `/restapis/${id}/resources?embed=methods`}).
    then(clean);
};

module.exports.createResource = function(restApiID, parentId, pathPart){
  return request({ method: 'POST', path: `/restapis/${restapiId}/resources/${parentId}`, body: { pathPart } }).
    then(normalizeResponse);
}

module.exports.putMethod = function(restApiId, resourceId, httpMethod, opts){
  return request({ method: 'PUT', path: `/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}`, body: JSON.stringify(opts) })
}

module.exports.putIntegration = function(restApiId, resourceId, httpMethod, opts){
  return request({ method: 'PUT', path: `/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}/integration`, body: JSON.stringify(opts) })
}

module.exports.putMethodResponse = function(restApiId, resourceId, httpMethod, statusCode, opts){
  return request({ method: 'PUT', path: `/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}/responses/${statusCode}`, body: JSON.stringify(opts) })
}

module.exports.putIntegrationResponse = function(restApiId, resourceId, httpMethod, statusCode, opts){
  return request({ method: 'PUT', path: `/restapis/${restApiId}/resources/${resourceId}/methods/${httpMethod}/integration/responses/${statusCode}`, body: JSON.stringify(opts) })
}


function filterKeys(obj){
  return _.pick(obj, function(value, key) {
    return !_.startsWith(key, '_');
  });
}

function getEmbedded(obj){
  var embedded = obj._embedded;
  if (embedded){
    _.forEach(embedded, function(items, key){
      obj[key.split(':')[1]] = _.map(items, filterKeys);
    });
  }
  return _.pick(obj, function(value, key) {
    return !_.startsWith(key, '_');
  });
}

function makeArray(obj){
  if (_.isArray(obj)) { return obj; }
  return [obj];
}

function normalizeResponse(resp){
  return Promise.resolve(_.get(resp, '_embedded.item')).
    then(makeArray).
    map(getEmbedded).
    map(filterKeys);
}

function clean(obj) {
  return Promise.resolve(_.map(obj._embedded.item, cleanKeys));
}

var cleanKeys = _.flow(cleanLinks, cleanEmbedded);

function cleanLinks(obj) {
  return _.omit(obj, '_links')
}

function cleanEmbedded(obj){
  if (obj._embedded){
    _.map(obj._embedded, function(val, key){
      var newKey = key.split(':')[1]
      obj[newKey] = _.map(makeArray(val), cleanKeys)
    })
  }
  return _.omit(obj, '_embedded')
}
