'use strict';

// const moment = require('moment');
const admin = require('firebase-admin');
const ref = admin.database().ref();

const TravisPayload = require('../../helpers/TravisPayload');
const PubSubHelper = require('../../helpers/PubSubHelper');

function webhook(req, res) {
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  if (req.method !== 'POST') {
    res.send(`Method ${req.method} is not supported`);
    return;
  }

  const entry = createWebhookEntry('travis', req.body.payload);
  return ref.child('raw/travis').push(entry)
    .then(_ => {
      const tp = new TravisPayload(JSON.parse(entry.data));
      console.log('Travis Payload', tp.eventArgs());

      const pubsub = new PubSubHelper();
      pubsub.publishTravisEvent(tp.eventArgs());
    })
    .then(_ => {
      res.send();
    });
}

function createWebhookEntry(type, payload) {
  const result = {};
  result.type = type;
  result.data = payload;
  result.timestamp = (new Date()).toISOString();
  return result;
}

module.exports = {
  webhook: webhook
};
