const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const gh = require('./helpers/GitHubHelper');
const ghEventTypes = require('./constants/github_event_types');

exports.processGitHubInput = functions.database.ref('/raw/github/{pushId}')
  .onWrite(event => {
    const commits = gh.parseCommits(event.data.val());
    return commits.forEach((commit) => {
      event.data.ref.root.child('/on/commit').push(commit);
    });
  });

exports.processGitHubInputPushes = functions.database.ref('/raw/github/{pushId}')
  .onWrite(event => {
    const push = gh.parsePush(event.data.val());
    if (push) {
      event.data.ref.root.child('/on/push').push(push);
    }
  });

// exports.onGitHubPush = functions.database.ref('/raw/github/{pushId}')
//   .onWrite(event => {
//     const data = event.data.val();

//     if (gh.getEventType(data) == ghEventTypes.push) {
//       // const push = gh.parsePush(event.data.val());
//       // if (push) {
//       //   event.data.ref.root.child('/log/onPush').push(push);
//       // }
//       console.log('onGitHubPush', commits);
//     }
//   });

exports.onGitHubCommits = functions.database.ref('/raw/github/{pushId}')
  .onWrite(event => {
    const data = event.data.val();

    if (gh.getEventType(data) == ghEventTypes.push) {
      const commits = gh.parseCommitsFromPayload(data);
      if (commits.length > 0) {
        return event.data.ref.root.child('/log/onCommits').push(commits);
      }
      console.log('onGitHubPush', commits);
    }
  });
