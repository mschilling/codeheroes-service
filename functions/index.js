'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const user = require('./user');
const github = require('./github');

// const GitHubPayload = require('./helpers/GitHubPayload');
// const Scores = require('./helpers/Scores');
// const fh = require('./helpers/FirebaseHelper');
// const gh = require('./helpers/GitHubHelper');
// const ghEventTypes = require('./constants/github_event_types');

exports.authNewUser = functions.auth.user().onCreate(user.createUser);

// exports.processGitHubInput = functions.database.ref('/raw/github/{pushId}')
//   .onWrite(event => {
//     const ref = event.data.adminRef;
//     const data = event.data.val();

//     const commits = gh.parseCommitsFromPayload(data);
//     return commits.forEach((commit) => {
//       ref.root.child('/on/commit').push(commit);
//     });
//   });

// exports.processGitHubInputPushes = functions.database.ref('/raw/github/{pushId}')
//   .onWrite(event => {
//     const push = gh.parsePush(event.data.val());
//     if (push) {
//       event.data.ref.root.child('/on/push').push(push);
//     }
//   });

exports.onGitHubPushEvent = functions.database.ref('/raw/github/{pushId}')
  .onWrite(github.onGitHubPushEvent);
