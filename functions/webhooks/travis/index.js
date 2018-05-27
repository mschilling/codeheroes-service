'use strict';

const admin = require('firebase-admin');
const ref = admin.database().ref();

const PubSubHelper = require('../../helpers/PubSubHelper');
const TravisPayload = require('../../helpers/TravisPayload');


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
      const tp = new TravisPayload(JSON.parse(req.body.payload));
      const payload = tp.buildEventArgs();

      const filters = {
        source: 'github',
        name: payload.authorName
      };
      console.log('filters', filters);
      return findAccount(filters).then( account => {
        console.log('retrieved account', account);
        if(account !== null) {
          payload.user = account.userRef;
        }
        return payload;
      });
    })
    .then(payload => {
      console.log('payload for pubsub helper', payload);

      const activity = {
        id: payload.id,
        timestamp: entry.timestamp,
        message: payload.message,
        eventType: 'travis-events',
        eventData: payload
      };

      if(payload.user) {
        activity.user = payload.user;
      }

      if(payload.project) {
        activity.project = payload.project;
      }

      if(payload.repo) {
        activity.repo = payload.repo;
      }

      const pubsub = new PubSubHelper();
      pubsub.publishTravisEvent(activity);
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

function findAccount(filters) {
  const { source, username, name } = filters;
  let query = admin.firestore().collection('accounts');

  if (source !== undefined) {
    query = query.where('source', '==', source);
  }

  if (username !== undefined) {
    query = query.where('username', '==', username);
  }

  if (name !== undefined) {
    query = query.where('displayName', '==', name);
  }

  return query.limit(1).get().then(snapshot => {
    if (snapshot.size === 0) {
      return null;
    }
    return snapshot.docs[0].data();
  });
}

module.exports = {
  webhook: webhook
};
