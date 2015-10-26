const https = require('https');
const aws4  = require('aws4');
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = function(opts){
  return new Promise(function(resolve, reject){
    let mergedOpts = _.assign({ service: 'apigateway', region: 'us-east-1' }, opts);
    aws4.sign(mergedOpts, AWS.config.credentials);
    let req = https.request(mergedOpts, function(response) {
      let body = '';
      response.on('data', function(d) { body += d; });
      response.on('end', function() {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(body);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    req.on('error', reject);
    req.end(opts.body || '');
  });
};
