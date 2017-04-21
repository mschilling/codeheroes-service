'use strict';

const GitHubPayload = require('./helpers/GitHubPayload');
const Scores = require('./helpers/Scores');
const fh = require('./helpers/FirebaseHelper');
const eventTypes = require('./constants/github_event_types');
const FeedHelper = require('./helpers/FeedHelper');


function onGitHubPushEvent(evt) {
  const ref = evt.data.adminRef.root;
  const data = evt.data.val();
  let appSettings;

  const github = new GitHubPayload(data);
  fh.initialize(ref);

  fh.getAppSettings()
    .then((settings) => appSettings = settings)
    .then(() => {
      if (appSettings.excludeRepos.indexOf(github.repository.fullName) > -1) {
        return Promise.resolve();
      }
      if (github.eventType == eventTypes.push) {
        const score = new Scores(ref);
        return github.distinctCommits.forEach(c => {
          score.onCommit(c);
        });
      } else {
        Promise.resolve();
      }
    });
}

function processGitHubPayload(evt) {
  const ref = evt.data.adminRef.root;
  FeedHelper.setTargetRef(ref.child('feed'));
  return FeedHelper.addToFeed(evt.data);
}

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

module.exports = {
  onGitHubPushEvent: onGitHubPushEvent,
  processGitHubPayload: processGitHubPayload
};
