'use strict';

require('dotenv/config');

const config = require('./config');
const GitHubPayload = require('./functions/helpers/GitHubPayload');
const ArwinApi = require('./arwin-api');

const admin = require('firebase-admin');
const serviceAccount = require(config.firebase.serviceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.databaseURL
});

const ref = admin.database().ref();
const githubRef = ref.child('raw/github');

const arwinApi = new ArwinApi();

start();

function start() {
  console.log(`${Date()} service started`);

  githubRef
    .orderByKey()
    .limitToLast(2)
    .on('child_added', handleGithubPayload);

}

async function handleGithubPayload(snapshot) {
  await arwinApi.pushGithubPayload(snapshot.val());
}
