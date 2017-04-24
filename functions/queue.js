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

function processHookFromQueue(evt) {
  const ref = evt.data.adminRef.root;
  const source = evt.params.source;
  const eventData = evt.data.val();

  return ref.child('raw').child(source).child(evt.data.key).once('value', function(snapshot) {
    const data = snapshot.val();
    data._meta = eventData;
    ref.child(paths.feedData).child(snapshot.key).set(data);
  }).then( () => evt.data.ref.remove());
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
  addHookToQueue: addHookToQueue,
  processHookFromQueue: processHookFromQueue
};
