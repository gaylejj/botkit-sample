'use strict';

var request = require("request");

let Wit = null;
let interactive = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node search.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  performSearch({context, entities}) {
    return new Promise(function(resolve, reject) {
      var searchTerm = firstEntityValue(entities, 'searchTerm')
      console.log(entities);
      if (searchTerm) {
        context.searchTerm = searchTerm; // we should call a weather API here
        var baseURL = "http://cheetah-service.sea.bowie.getty.im/"
        var pathBase = "search/image/"
        var parameters = "?family=creative&sort=best&imageSize=comp&size=1";
        request(baseURL + pathBase + searchTerm + parameters, function(error, response, body) {
          console.log(body);
          var url = JSON.parse(body)[0];
          context.pics = url;
          return resolve(context);
        });
      }
    });
  },
};

const client = new Wit({accessToken, actions});
interactive(client);
