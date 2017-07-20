'use strict';

const moment = require('moment');
const admin = require('firebase-admin');
const ref = admin.database().ref();

const ApiAiApp = require('actions-on-google').ApiAiApp;

const ACTIONS = {
  'tell.joke': {callback: tellJokeHandler},
  'tell.commit.info': {callback: tellCommitInfoHandler}
};

function webhook(request, response) {
  const app = new ApiAiApp({request: request, response: response});
  const intent = app.getIntent();
  app.handleRequest(ACTIONS[intent].callback);
}

// eslint-disable-next-line no-unused-vars
function tellJokeHandler(app) {
  console.log('Came to Tell Joke');
  // const fromFallback = app.getArgument('fromFallback');
  // const timeQuery = app.getArgument('time-query');
  ref.child('quotes')
    .once('value')
    .then(function(snapshot) {
      const quotes = snapshot.val() || [];
      const randomQuote = quotes[Math.floor(Math.random()*quotes.length)];
      app.ask(randomQuote);
    });
}

function tellCommitInfoHandler(app) {
  const timestamp = moment();
  const dayKey = timestamp.format('YYYYMMDD');

  ref.child(`/metrics/user/commits_per_day/${dayKey}`)
    .limitToLast(1)
    .once('value')
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const commit = childSnapshot.val();
        const message = `The last commit is by ${commit.name}. Here's the commit message: ${commit.message}`;
        app.ask(message);
      });
    });
}

module.exports = {
  webhook: webhook
};
