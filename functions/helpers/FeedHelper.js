'use strict';

let feedRef;
const GitHubPayload = require('../helpers/GitHubPayload');
const JiraPayload = require('../helpers/JiraPayload');

class FeedHelper {

  static setTargetRef(targetRef) {
    feedRef = targetRef;
  }

  static addToFeed(snapshot) {
    return addToFeed(snapshot);
  }
}

function addToFeed(snapshot) {
  const obj = snapshot.val();

  const sourceKey = snapshot.ref.parent.key;
  obj._eventArgs = {
    // timestamp: (new Date()).toISOString(),
    source: sourceKey
  };

  switch (sourceKey) {
    case 'github': {
      obj._eventArgs.timestamp = getTimestampFromGithubPayload(obj);
      const github = new GitHubPayload(obj);
      obj._eventArgs.type = github.eventType;
      break;
    }
    case 'jira': {
      obj._eventArgs.timestamp = new Date(obj.timestamp).toISOString();
      const jira = new JiraPayload(obj);
      obj._eventArgs.type = jira.eventType;
      break;
    }
  }
  return feedRef.child(snapshot.key).set(obj);
}

function getTimestampFromGithubPayload(payload) {
  if (payload.head_commit) {
    return payload.head_commit.timestamp;
  }
  return new Date().toISOString();
}

module.exports = FeedHelper;
