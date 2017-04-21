'use strict';

let feedRef;
const GitHubPayload = require('../helpers/GitHubPayload');
const JiraPayload = require('../helpers/JiraPayload');
const fh = require('../helpers/FirebaseHelper');

class FeedHelper {

  static setTargetRef(targetRef) {
    feedRef = targetRef;
  }

  static addToFeed(snapshot) {
    return addToFeed(snapshot);
  }
}

function addToFeed(snapshot, timestamp = null) {
  const obj = snapshot.val();

  const sourceKey = snapshot.ref.parent.key;
  obj._eventArgs = {
    // timestamp: (new Date()).toISOString(),
    source: sourceKey
  };

  switch (sourceKey) {
    case 'github': {
      const github = new GitHubPayload(obj);
      if (!timestamp) {
        timestamp = github.timestamp;
      }
      obj._eventArgs.type = github.eventType;
      break;
    }
    case 'jira': {
      const jira = new JiraPayload(obj);
      if (!timestamp) {
        timestamp = new Date(obj.timestamp).toISOString();
      }
      obj._eventArgs.type = jira.eventType;
      break;
    }
  }

  if(!timestamp) {
    timestamp = fh.getTimestampFromKey(snapshot.key);
  }

  obj._eventArgs.timestamp = timestamp;

  return feedRef.child(snapshot.key).set(obj);
}

module.exports = FeedHelper;
