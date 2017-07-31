'use strict';

require('dotenv').config({ silent: true });
const config = require('./config');
const chalk = require('chalk');
const firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: config.firebase.serviceAccount,
  databaseURL: config.firebase.databaseURL
});

const ref = firebase.database().ref();
const ghEventTypes = require('./functions/constants/github_event_types');
const GitHubPayload = require('./functions/helpers/GitHubPayload');
const Leaderboard = require('./functions/helpers/Leaderboard');

const fh = require('./functions/helpers/FirebaseHelper');
fh.initialize(ref);

const lb = new Leaderboard();
let currentKey;
let users = [];

const weekId = '-KqKmLP-mW5jzZONFc2K+1';

const query = ref.child('raw/github')
  .orderByKey()
  .startAt(weekId)
  .limitToLast(5000);

query.once('value')
  .then(function(snapshot) {
    console.log('items:', snapshot.numChildren());
    snapshot.forEach((childSnapshot) => {
      currentKey = childSnapshot.key;
      const github = new GitHubPayload(childSnapshot.val());
      const scores = github.getScores();

      lb.addScores(scores);

      if (false) console.log(
        chalk.yellow(github.eventType),
        // chalk.bgRed(github.),
        chalk.yellow(github.distinctCommits.length),
        // chalk.bgRed(github.distinctCommits.length)
        JSON.stringify(scores[0], null, '\t'),
        ''
      );

      // getScore(snapshotItem)
      // Promise.resolve(childData);
      // .then(score => console.log('score:' + score))
    });
  })
  .then(() => {
    return fh.getGitHubUsers().then((allUsers) => {
      users = allUsers;
      return allUsers;
    });
  })
  .then((users) => {
    console.log('users', users);

    let i = lb.items.length;
    while (i--) {
      let item = lb.items[i];
      let user = users[item.key];
      if (!user) {
        lb.items.splice(i, 1);
      } else {
        item.name = user.name;
        item.avatar = user.avatar;
      }
    }
  })
  .then(() => {
    // console.log(JSON.stringify(leaderboard, null, '\t'));

    let printLeaderboard = () => {
      lb.items.forEach(item => {
        console.log(`${item.position} (${item.position_prev}-${item.pos})`, item.key, chalk.yellow(item.totalScore));
        console.log(`count=${item.count}`,
          `push=${item.count_pushes}`,
          `commits=${item.count_commits}`,
          `pr=${item.count_pull_requests}`,
          `issues_opened=${item.count_issues_opened}`,
          `issues_closed=${item.count_issues_closed}`
        );
      });
    };

    // printLeaderboard();
    console.log(lb.items);
    ref.child('leaderboards/user-weekly').set(lb.items);
    console.log('done; now read for updates');
  })
  .then(() => {

    const q = ref.child('raw/github')
      .orderByKey()
      .startAt(currentKey + '*')
      .limitToLast(10);

    q.on('child_added', function (childSnapshot) {


      const github = new GitHubPayload(childSnapshot.val());
      const scores = github.getScores();

      console.log('incoming', scores);

      lb.addScores(scores);

      let i = lb.items.length;
      while (i--) {
        let item = lb.items[i];
        let user = users[item.key];
        if (!user) {
          lb.items.splice(i, 1);
        } else {
          item.name = user.name;
          item.avatar = user.avatar;
        }
      }

      console.log('updating scores');
      ref.child('leaderboards/user-weekly').set(lb.items);
    });
  })
  ;
