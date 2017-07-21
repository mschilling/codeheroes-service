'use strict';

// const moment = require('moment');
const admin = require('firebase-admin');
const ref = admin.database().ref();

function webhook(req, res) {
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  if (req.method !== 'POST') {
    res.send(`Method ${req.method} is not supported`);
    return;
  }

  const entry = createWebhookEntry('travis', req.body.payload);
  return ref.child('raw/travis').push(entry).then(_ => {
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
