'use strict';

let ApiAiApp = require('actions-on-google').ApiAiApp;

const ACTIONS = {
  'tell.joke': {callback: tellJokeHandler}
};

function webhook(request, response) {

  const app = new ApiAiApp({request: request, response: response});
  let intent = app.getIntent();
  app.handleRequest(ACTIONS[intent].callback);

}

function getRandomQuote(options) {
   firebase.database()
           .ref('quotes')
           .once('value')
           .then(function(snapshot) {
              const quotes = snapshot.val() || [];
              const randomQuote = quotes[Math.floor(Math.random()*quotes.length)];
              options.onSuccess(randomQuote);
           });
}

function tellJokeHandler(app) {
  console.log('Came to Tell Joke');
  // const fromFallback = app.getArgument('fromFallback');
  // const timeQuery = app.getArgument('time-query');
  let message;

  getGroupInfo({
      onSuccess: function(quote) {
        message = quote;
        console.log(message);
        app.ask(message);
      }
    });
  app.ask('Testing, one two three');
}

module.exports = {
  webhook: webhook
};
