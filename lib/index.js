#! /usr/bin/env node

require('core-js');
const _ = require('lodash');
const { list: listApis, resources: listResources, putMethod, putIntegration, putMethodResponse, putIntegrationResponse } = require('./restapis');

const { _: [ apiName, sourcePath, sourceHTTPMethod, destPath, destHTTPMethod ] } = require('minimist')(process.argv.slice(2));

let api, resources, sourceResource, sourceMethod, destResource

listApis()
  .then(findAPI)
  .then(findSourceMethod)
  .then(findDestResource)
  .then(destMethod)
  .then(destIntegration)
  .then(destMethodResponses)
  .then(destIntegrationResponses)
  .then(()=> { console.log('Method copied succesfully!') })

function findAPI(apis){
  api = apis.find( api => { return api.name === apiName } )
  return api ? Promise.resolve() : Promise.reject(new Error(`${apiName} not found on AWS`))
}

function findSourceMethod(){
  return listResources(api.id)
    .then( resp => {
      resources = resp
      sourceResource = resources.find(matchSourcePath)
      return sourceResource ? Promise.resolve() : Promise.reject(new Error(`${sourcePath} not found for API ${apiName}`))
    })
    .then( () => {
      sourceMethod = sourceResource.methods.find( method => { return method.httpMethod === sourceHTTPMethod })
      return sourceMethod ? Promise.resolve() : Promise.reject(new Error(`${sourceHTTPMethod} not found for resource ${sourcePath} on API ${apiName}`))
    })
}

function findDestResource(){
  destResource = resources.find(matchDestPath)
  return destResource ? Promise.resolve(destResource) : Promise.reject(new Error(`Resource not found for ${destPath} ${sourcePath} on API ${apiName}. Please create it first in the AWS web UI`))
}


function destMethod(){
  return putMethod(api.id, destResource.id, destHTTPMethod, _.pick(sourceMethod, 'authorizationType', 'apiKeyRequired', 'requestParameters', 'requestModels'))
}

function destIntegration(){
  return putIntegration(api.id, destResource.id, destHTTPMethod, _.pick(sourceMethod.integration[0], 'cacheKeyParameters', 'httpMethod', 'requestTemplates', 'type', 'uri', 'credentials', 'requestParameters'))
}

function destMethodResponses(){
  let promises = sourceMethod.responses.map(function(response){
    return putMethodResponse(api.id, destResource.id, destHTTPMethod, response.statusCode, _.pick(response, 'responseParameters', 'responseModels'))
  })
  return Promise.all(promises)
}

function destIntegrationResponses(){
  let promises = sourceMethod.integration[0].responses.map(function(response){
    return putIntegrationResponse(api.id, destResource.id, destHTTPMethod, response.statusCode, _.pick(response, 'responseParameters', 'responseTemplates', 'selectionPattern'))
  })
  return Promise.all(promises)
}

function matchSourcePath(resource){
  return resource.path === sourcePath
}

function matchDestPath(resource){
  return resource.path === destPath
}
