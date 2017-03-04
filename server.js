'use strict';

require('dotenv').config({ silent: true });
const config = require('./config');
// const moment = require('moment');

const firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const ref = firebase.database().ref();

const PATHS = {
  GitHubRaw: 'raw/github',
  JiraRaw: 'raw/jira',
};

// const EVENT_PATHS = {
//   GitHubPushes: 'events/github/push',
//   JiraRaw: 'raw/jira',
// };

ref.child(PATHS.GitHubRaw).on('child_added', onGitHubPayloadAdded);

function onGitHubPayloadAdded(snapshot) {
  processPayloadFromGitHub(snapshot.val());
}

function processPayloadFromGitHub( payload ) {
  // console.log('process payload from GitHub ', payload);

  // let commits = payload.commits;
  // if(commits) {
  //   console.log(payload.commits.length);
  //   for(let i=0; i< commits.length; i++) {
  //     let commit = commits[i];
  //     let author = commit.author;
  //     let committer = commit.committer;

  //     console.log(commit.timestamp, author.name, committer.name);
  //   }

  // }

}
