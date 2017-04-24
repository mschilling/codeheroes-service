'use strict';

const GitHubPayload = require('./helpers/GitHubPayload');
const Scores = require('./helpers/Scores');
const fh = require('./helpers/FirebaseHelper');
const eventTypes = require('./constants/github_event_types');
const FeedHelper = require('./helpers/FeedHelper');
const paths = require('./constants/firebase_paths');

function onQueueItemAdded(evt) {
  const ref = evt.data.adminRef.root;
  const eventData = evt.data.val();

  return ref.child('raw/github').child(evt.data.key).once('value', function(snapshot) {
    const data = snapshot.val();
    data._meta = eventData;
    ref.child(paths.feedData).child(snapshot.key).set(data);
  }).then( () => evt.data.ref.remove());
}

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

module.exports = {
  onQueueItemAdded: onQueueItemAdded,
  onGitHubPushEvent: onGitHubPushEvent,
  processGitHubPayload: processGitHubPayload
};
