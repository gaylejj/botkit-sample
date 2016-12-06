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

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var os = require('os');
// var Search = require('./search.js')

var controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM();

// controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

//     bot.api.reactions.add({
//         timestamp: message.ts,
//         channel: message.channel,
//         name: 'robot_face',
//     }, function(err, res) {
//         if (err) {
//             bot.botkit.log('Failed to add emoji reaction :(', err);
//         }
//     });


//     controller.storage.users.get(message.user, function(err, user) {
//         if (user && user.name) {
//             bot.reply(message, 'Hello ' + user.name + '!!');
//         } else {
//             bot.reply(message, 'Hello.');
//         }
//     });
// });

// controller.on('direct_message, direct_mention, mention', function(bot, message) {
// 	bot.reply(message, "message received");
//     // carefully examine and
//     // handle the message here!
//     // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
// });

controller.hears(['.*'],'direct_message,direct_mention,mention',function(bot, message) {
        if (message.text) {
            client.message(message.text, {}).then((data) => {
            	var jsonString = JSON.stringify(data)
            	var json = JSON.parse(jsonString)

                console.log(json);
                var entities = json["entities"];
                console.log(entities);
                var searchTerm = firstEntityValue(entities, 'searchTerm');
                console.log(searchTerm);
                if (searchTerm) {
                
                  // bot.reply(message, "searching for " + searchTerm)
        			var baseURL = "https://api.gettyimages.com/v3/"
        			var pathBase = "search/images/creative"
        			var parameters = "?sort_order=best_match&page=1&page_size=1&fields=comp&phrase=";
              //https://api.gettyimages.com/v3/search/images/creative?fields=comp&page=1&page_size=1&phrase=puppies
              var options = {
                  url: baseURL + pathBase + parameters + searchTerm,
                  headers: {
                  'Api-Key': process.env.API_KEY
                  }
                };
                console.log(options)
        			request(options, function(error, response, body) {
         				// console.log(body);
             //    console.log(response);
             //    console.log(error);
         				var json = JSON.parse(body);
                console.log(json);
                var images = json["images"];
                var first = images[0];
                var display_sizes = first["display_sizes"];
                var first_size = display_sizes[0];
                var uri = first_size["uri"];
                		bot.reply(message, uri);
       			 	});
      			}
            }).catch(console.error);
            // wit.message(config.token, message.text, function(err, res) {
            //     if (err) {
            //         next(err);
            //     } else {
            //         // sort in descending order of confidence so the most likely match is first.
            //         console.log(JSON.stringify(res));
            //         message.intents = res.outcomes.sort(function(a,b) {
            //             return b.confidence - a.confidence;
            //         });
            //         next();
            //     }
            // });
        }    // ...
});

const accessToken = (() => {
  // if (process.argv.length !== 3) {
  //   console.log('usage: node search.js <wit-access-token>');
  //   process.exit(1);
  // }
  return process.env.WIT_TOKEN;
})();

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
