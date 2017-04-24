'use strict';

const paths = require('./constants/firebase_paths');

function addHookToQueue(evt) {
  const ref = evt.data.adminRef.root;
  const args = {
    source: evt.params.source,
    timestamp: (new Date()).toISOString()
  };

  const childPath = getChildPath(args.source);
  if(!childPath) {
    console.error('source is null');
    return;
  }
  return ref.child(childPath).child(evt.params.pushId).set(args);
}

function getChildPath(source) {
  if (!source) {
    console.error('source is null');
    return;
  }

  switch (source) {
    case 'github':
      return paths.githubQueue;
    case 'jira':
      return paths.jiraQueue;
    case 'jenkins':
      return paths.jenkinsQueue;
    case 'travis':
      return paths.travisQueue;
  }
  return;
}

module.exports = {
  addHookToQueue: addHookToQueue
};
