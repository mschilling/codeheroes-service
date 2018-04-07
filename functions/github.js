'use strict';

const GitHubPayload = require('./helpers/GitHubPayload');
const Scores = require('./helpers/Scores');
const fh = require('./helpers/FirebaseHelper');
const eventTypes = require('./constants/github_event_types');
const FeedHelper = require('./helpers/FeedHelper');

function onGitHubPushEvent(snap, context) {
  const ref = snap.ref.root;
  const data = snap.val();
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
        return github.distinctCommits.reduce(function(sequence, commit) {
          return sequence.then(function() {
            return score.onCommit(commit);
          });
        }, Promise.resolve());
      } else {
        Promise.resolve();
      }
    });
}

function processGitHubPayload(snap, context) {
  const ref = snap.ref.root;
  FeedHelper.setTargetRef(ref.child('feed'));
  return FeedHelper.addToFeed(snap.val());
}

module.exports = {
  onGitHubPushEvent: onGitHubPushEvent,
  processGitHubPayload: processGitHubPayload
};
