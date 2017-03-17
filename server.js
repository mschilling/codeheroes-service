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

  ref.child('metrics').remove().then(() => {
    commitsRef.limitToLast(100000).on('child_added', onCommit);
    pushRef.limitToLast(100000).on('child_added', onPush);
  });
}

function onCommit(snapshot) {
  // console.log(snapshot.val());

  getMetaFromCommit(snapshot.val())
    .then((meta) => {
      const timestamp = moment(meta.timestamp);
      const dayKey = timestamp.format('YYYYMMDD');
      const weekKey = timestamp.format('YYYY') + ('0' + timestamp.isoWeek()).slice(-2);
      const monthKey = timestamp.format('YYYYMM');

      // console.log(meta);

      // if(!c.distinct) return Promise.resolve(true);

      return Promise.resolve(true)
        .then(() => incrementScore(`metrics/user/commits_per_day/${dayKey}/${meta.userKey}`))
        .then(() => incrementScore(`metrics/user/commits_per_week/${weekKey}/${meta.userKey}`))
        .then(() => incrementScore(`metrics/user/commits_per_month/${monthKey}/${meta.userKey}`))

        .then(() => incrementScore(`metrics/project/commits_per_day/${dayKey}/${meta.projectKey}`))
        .then(() => incrementScore(`metrics/project/commits_per_week/${weekKey}/${meta.projectKey}`))
        .then(() => incrementScore(`metrics/project/commits_per_month/${monthKey}/${meta.projectKey}`))

        // .then( () => incrementScore(`metrics/user/commits_today/${userKey}`))
        // .then( () => incrementScore(`metrics/project/commits_today/${projectKey}`))
        ;
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

function incrementScore(scoreKey) {
  return ref.child(scoreKey).transaction(function(value) {
    if (!value) {
      value = { score: 0 };
    }
    value.score += 1;
    value.orderKey = (1 / value.score);
    value.lastUpdate = new Date().getTime();
    return value;
  });
}

function getMetaFromCommit(input) {
  let meta = {};

  meta.timestamp = input.timestamp;
  meta.userKey = input.user.name ? input.user.name : input.user;
  meta.projectKey = input.repo;

  return ref.child(`user_lookup/github_user/by_name/${meta.userKey}`).once('value')
    .then( (snapshot) => {
      // console.log(snapshot.ref.toString());
      if(snapshot.val()) {
        meta.userKey = snapshot.val();
            // console.log(snapshot.val());
        return ref.child('users').orderByChild('jira_username').equalTo(snapshot.val()).limitToLast(1).once('value')
          .then( (userSnapshot) => {
            // console.log('User snapshot: ', userSnapshot.val(), userSnapshot.key);
            // const user = userSnapshot.val()[Object.keys(userSnapshot.val())];
            // if(user) {
              // meta.userKey = user.name;
            // }
          });
      }
    })
    .then( () => meta);
}

