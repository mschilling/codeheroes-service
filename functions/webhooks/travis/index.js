'use strict';

const admin = require('firebase-admin');
const ref = admin.database().ref();

const PubSubHelper = require('../../helpers/PubSubHelper');
const TravisPayload = require('../../helpers/TravisPayload');

const axios = require('axios');

function webhook(req, res) {
  console.log('Request headers: ' + JSON.stringify(req.headers));
  console.log('Request body: ' + JSON.stringify(req.body));

  if (req.method !== 'POST') {
    res.send(`Method ${req.method} is not supported`);
    return;
  }


  if (req.method === 'POST') {
    console.log('Travis: will forward payload');

    const client = axios.create({
      baseURL: 'https://events.codeheroes.move4mobile.io'
    });

    return client.post('/webhooks/travis', payload, {
      headers: req.headers
    }).catch( (error) => {
      console.log('error', error);
    });
  }

  const entry = createWebhookEntry('travis', req.body.payload);
  return ref.child('raw/travis').push(entry)
    .then(_ => {
      const tp = new TravisPayload(JSON.parse(req.body.payload));
      const payload = tp.buildEventArgs();

      const filters = {
        source: 'github',
        name: payload.authorName,
        email: payload.authorEmail
      };
      console.log('filters', filters);
      return findAccount(filters).then(account => {
        console.log('retrieved account', account);
        if (account !== null) {
          payload.user = account.userRef;
        }
        return payload;
      });
    })
    .then(payload => {
      const activity = {
        id: payload.id,
        timestamp: entry.timestamp,
        message: payload.message,
        eventType: 'travis-events',
        eventData: payload
      };

      if (payload.user) {
        activity.user = payload.user;
      }

      if (payload.project) {
        activity.project = payload.project;
      }

      if (payload.repo) {
        activity.repo = payload.repo;
      }

      console.log('payload for pubsub helper', activity);

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
  const {source, username, name, email} = filters;
  let query = admin.firestore().collection('accounts');

  if (source !== undefined) {
    query = query.where('source', '==', source);
  }

  if (username !== undefined) {
    query = query.where('username', '==', username);
  }

  return query.limit(50).get().then(snapshot => {
    if (snapshot.size === 0) {
      return null;
    }

    // extend with additional search
    const docs = [];
    for (const doc of snapshot.docs) {
      docs.push(doc.data());
    }

    if (name) {
      const docsCollection = docs.filter(p => p.displayName === name);
      if (docsCollection.length > 0) {
        return docsCollection[0];
      }
    }

    if (email) {
      const docsCollection = docs.filter(p => p.email === email);
      if (docsCollection.length > 0) {
        return docsCollection[0];
      }
    }

    if (name) {
      const docsCollection = docs.filter(p => p.username === name);
      if (docsCollection.length > 0) {
        return docsCollection[0];
      }
    }

    return null;
  });
}

module.exports = {
  webhook: webhook
};
