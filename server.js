'use strict';

require('dotenv').config({ silent: true });
const config = require('./config');
const moment = require('moment');
const chalk = require('chalk');

const firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const ref = firebase.database().ref();

trackMetrics();

function trackMetrics() {
  const commitsRef = ref.child('on/commit');
  const pushRef = ref.child('on/push');
  const maxResults = 1000000;

  ref.child('metrics').remove().then(() => {
    commitsRef.limitToLast(maxResults).on('child_added', onCommit);
    pushRef.limitToLast(maxResults).on('child_added', onPush);
  });
}

function onCommit(snapshot) {
  const commit = snapshot.val();

  getGitHubUser(commit)
    .then((meta) => {
      const timestamp = moment(commit.timestamp);
      const dayKey = timestamp.format('YYYYMMDD');
      const weekKey = timestamp.format('YYYY') + ('0' + timestamp.isoWeek()).slice(-2);
      const monthKey = timestamp.format('YYYYMM');

      const actions = [];

      if (meta && meta.username) {
        const userKey = meta.username;
        console.log('include user', meta);

        if (commit.message) {
          meta.message = commit.message;
        }

        actions.push(incrementScore(`metrics/user/commits_per_day/${dayKey}/${userKey}`, meta));
        actions.push(incrementScore(`metrics/user/commits_per_week/${weekKey}/${userKey}`, meta));
        actions.push(incrementScore(`metrics/user/commits_per_week/${weekKey}/${userKey}`, meta));
      }

      const projectKey = commit.repo;
      actions.push(incrementScore(`metrics/project/commits_per_day/${dayKey}/${projectKey}`));
      actions.push(incrementScore(`metrics/project/commits_per_week/${weekKey}/${projectKey}`));
      actions.push(incrementScore(`metrics/project/commits_per_month/${monthKey}/${projectKey}`));

      return Promise.all(actions).then(() => console.log('done updating', commit.id));
      // return Promise.resolve(true)
      //   .then(() => incrementScore(`metrics/user/commits_per_day/${dayKey}/${userKey}`, meta))
      //   .then(() => incrementScore(`metrics/user/commits_per_week/${weekKey}/${userKey}`, meta))
      //   .then(() => incrementScore(`metrics/user/commits_per_week/${weekKey}/${userKey}`, meta))

      //   .then(() => incrementScore(`metrics/project/commits_per_day/${dayKey}/${projectKey}`))
      //   .then(() => incrementScore(`metrics/project/commits_per_week/${weekKey}/${projectKey}`))
      //   .then(() => incrementScore(`metrics/project/commits_per_month/${monthKey}/${projectKey}`))
      //   ;
    });
}

function onPush(snapshot) {
  getMetaFromCommit(snapshot.val())
    .then((meta) => {
      const timestamp = moment(meta.timestamp);
      const dayKey = timestamp.format('YYYYMMDD');
      const weekKey = timestamp.format('YYYY') + ('0' + timestamp.isoWeek()).slice(-2);
      const monthKey = timestamp.format('YYYYMM');

      return Promise.resolve(true)
        .then(() => incrementScore(`metrics/user/pushes_per_day/${dayKey}/${meta.userKey}`))
        .then(() => incrementScore(`metrics/user/pushes_per_week/${weekKey}/${meta.userKey}`))
        .then(() => incrementScore(`metrics/user/pushes_per_month/${monthKey}/${meta.userKey}`))

        .then(() => incrementScore(`metrics/project/pushes_per_day/${dayKey}/${meta.projectKey}`))
        .then(() => incrementScore(`metrics/project/pushes_per_week/${weekKey}/${meta.projectKey}`))
        .then(() => incrementScore(`metrics/project/pushes_per_month/${monthKey}/${meta.projectKey}`))
        ;
    });
}

function incrementScore(scoreKey, meta) {
  return ref.child(scoreKey).transaction(function (value) {
    if (!value) {
      value = { score: 0 };
    }
    value.score += 1;
    value.orderKey = (1 / value.score);
    value.lastUpdate = new Date().getTime();

    if (meta) {
      if (meta.avatar) value.avatar = meta.avatar;
      if (meta.name) value.name = meta.name;
      if (meta.message) value.message = meta.message;
    };

    return value;
  });
}

function getMetaFromCommit(input) {
  let meta = {};

  // console.log('getMetaFromCommit', input);

  meta.timestamp = input.timestamp;
  meta.userKey = input.author_username || input.author_username || 'onbekend';
  meta.projectKey = input.repo;

  return ref.child(`user_lookup/github_user/by_name/${meta.userKey}`).once('value')
    .then((snapshot) => {
      // console.log(snapshot.ref.toString());
      if (snapshot.val()) {
        meta.userKey = snapshot.val();
        // console.log(snapshot.val());
        return ref.child('users').orderByChild('jira_username').equalTo(snapshot.val()).limitToLast(1).once('value')
          .then((userSnapshot) => {
            // console.log('User snapshot: ', userSnapshot.val(), userSnapshot.key);
            // const user = userSnapshot.val()[Object.keys(userSnapshot.val())];
            // if(user) {
            // meta.userKey = user.name;
            // }
          });
      }
    })
    .then(() => meta);
}

function getGitHubUser(input) {
  const username = input.author_username;

  if (!username || username == 'undefined') return Promise.resolve(null);

  return ref.child(`github_users/${username}`).once('value')
    .then((snapshot) => {
      let profile = {
        name: 'unknown'
      };

      if (snapshot.val()) {
        profile = snapshot.val();
      }

      return Promise.resolve(profile);
    });
}
